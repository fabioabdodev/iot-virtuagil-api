const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, imports, extra = {}) {
  const js = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(js, { exports, require: id => { if (id in imports) return imports[id]; throw Error(id); },
    URL, Date, AbortController, setTimeout, clearTimeout, console: { error() {} }, ...extra });
  return exports;
}
const valid = { nome_empresa: 'Test SA', nome_contato: 'Tester', telefone: '5531999999999',
  email_acesso: 'test@example.test', plano_codigo: 'jade_test', aceite_termos: true, termos_versao: 'v1' };
function route({ allowed = true, checkoutUrl = 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=fixture', total = 1794 } = {}) {
  const calls = [];
  const api = load('app/api/pagamentos/criar-cobranca/route.ts', {
    'next/server': { NextResponse: { json: (body, opts = {}) => ({ body, status: opts.status || 200, headers: opts.headers }) } },
    '@/lib/plans': { defaultCommercialPlanCode: 'jade_test', isCommercialPlanCode: code => code === 'jade_test' },
    '@/lib/legal': { CONTRACT_VERSION: 'v1' },
    '@/lib/checkout-rate-limit': { allowCheckoutAttempt: () => allowed },
    '@/lib/live-plans': { loadCommercialPlans: async () => { calls.push('catalog'); return { jade_test: { code: 'jade_test', total: 1794 } }; } },
  }, { process: { env: { VIRTUAGIL_INTERNAL_KEY: 'fixture-only' } }, fetch: async (url, options) => {
    calls.push('webhook'); assert.equal(options.redirect, 'error'); assert.ok(options.signal);
    return { ok: true, status: 200, text: async () => JSON.stringify({ ok: true, plano_codigo: 'jade_test', valor_total: total, checkout_url: checkoutUrl }) };
  } });
  return { calls, post: payload => api.POST({ json: async () => payload }) };
}
test('null/array/string JSON payloads are rejected without catalog or webhook calls', async () => {
  for (const body of [null, [], 'invalid']) {
    const t = route(); assert.equal((await t.post(body)).status, 400); assert.equal(t.calls.length, 0);
  }
});
test('rate rejection happens before catalog and checkout side effects', async () => {
  const t = route({ allowed: false });
  const r = await t.post(valid); assert.equal(r.status, 429); assert.equal(r.headers['Retry-After'], '60');
  assert.equal(t.calls.length, 0);
});
test('server continues to require approved checkout host, exact plan and total', async () => {
  assert.equal((await route().post(valid)).status, 200);
  assert.equal((await route({ checkoutUrl: 'https://mercadopago.com.br.attacker.test' }).post(valid)).status, 502);
  assert.equal((await route({ total: 1 }).post(valid)).status, 502);
});
test('rate state is bounded, normalized per email, global, and lazily expires', () => {
  const { allowCheckoutAttempt: allow } = load('lib/checkout-rate-limit.ts', { 'node:crypto': require('node:crypto') });
  assert.equal(allow('TEST@example.test', 0), true);
  assert.equal(allow('test@example.test', 0), true);
  assert.equal(allow('test@example.test', 0), true);
  assert.equal(allow('test@example.test', 0), false);
  for (let i = 0; i < 27; i++) assert.equal(allow('person' + i + '@example.test', 0), true);
  assert.equal(allow('another@example.test', 0), false);
  assert.equal(allow('test@example.test', 60_000), true);
});
