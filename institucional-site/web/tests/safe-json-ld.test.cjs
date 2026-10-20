const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const source = readFileSync(join(__dirname, '../lib/safe-json-ld.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const api = {};
new Function('exports', compiled)(api);

test('JSON-LD keeps the exact original values but neutralizes HTML/script breakout', () => {
  const payload = {
    title: '</script><script>alert("XSS")</script>',
    text: '<div>&</div>',
    line: '\u2028\u2029',
    value: 42,
    list: ['safe', '=>', { nested: '<img src=x onerror=alert(1)>' }],
  };
  const html = api.serializeSafeJsonLd(payload);
  assert.deepEqual(JSON.parse(html), payload);
  assert.equal(html.includes('<'), false);
  assert.equal(html.includes('>'), false);
  assert.equal(html.includes('&'), false);
  assert.equal(html.includes('\u2028'), false);
  assert.equal(html.includes('\u2029'), false);
  assert.match(html, /\\u003c/);
});

test('every dynamic JSON-LD page delegates to the approved safe sink', () => {
  for (const path of [
    '../app/guias/[slug]/page.tsx',
    '../app/segmentos/[slug]/page.tsx',
    '../app/solucoes/[slug]/page.tsx',
  ]) {
    const source = readFileSync(join(__dirname, path), 'utf8');
    assert.match(source, /<SafeJsonLd data=/);
    assert.doesNotMatch(source, /dangerouslySetInnerHTML/);
  }
});
