const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const root = join(__dirname, '..');
const file = path => readFileSync(join(root, path), 'utf8');

test('homologação isolada: token com SHA-256, prazo definido e preço de R$60', () => {
  const lib = file('lib/homologacao-jade-60.ts');
  assert.match(lib, /createHash\('sha256'\)/);
  assert.match(lib, /timingSafeEqual\(/);
  assert.match(lib, /HOMOLOGACAO_VALOR = 60/);
  assert.match(lib, /HOMOLOGACAO_PARCELAS = 6/);
  assert.match(lib, /HOMOLOGACAO_EXPIRA_EM/);
  assert.doesNotMatch(lib, /VIRTUAGIL_INTERNAL_KEY|MERCADOPAGO_ACCESS_TOKEN/);
});

test('checkout de homologação valida preço, plano, termos e destino de pagamento', () => {
  const route = file('app/api/pagamentos/checkout-homologacao/route.ts');
  assert.match(route, /tokenHomologacaoValido\(data\.token\)/);
  assert.match(route, /aceite_termos/);
  assert.match(route, /termos_versao/);
  assert.match(route, /result\.plano_codigo !== HOMOLOGACAO_PLANO/);
  assert.match(route, /Number\(result\.valor_total\) !== HOMOLOGACAO_VALOR/);
  assert.match(route, /checkoutUrlConfiavel\(result\.checkout_url\)/);
  assert.match(route, /Cache-Control': 'no-store'/);
  assert.doesNotMatch(route, /process\.env\.NEXT_PUBLIC_.*KEY/);
});

test('teste não aparece no catálogo público e não muda checkout comercial', () => {
  const page = file('app/homologacao-jade-60/page.tsx');
  const catalog = file('lib/live-plans.ts');
  const normal = file('app/api/pagamentos/criar-cobranca/route.ts');
  assert.match(page, /index: false, follow: false/);
  assert.match(page, /tokenHomologacaoValido\(token\)/);
  assert.doesNotMatch(catalog, /jade_500_homologacao_60/);
  assert.doesNotMatch(normal, /jade_500_homologacao_60/);
});
