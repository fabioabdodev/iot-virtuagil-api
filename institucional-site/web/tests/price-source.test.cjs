const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const read = (p) => readFileSync(join(__dirname, '..', p), 'utf8');

test('catalogo comercial nao guarda precos, limite nem parcelas', () => {
  const plans = read('lib/plans.ts');
  assert.doesNotMatch(plans, /\btotal:\s*1794|\btotal:\s*2394/);
  assert.doesNotMatch(plans, /installmentValue:\s*299|installmentValue:\s*399/);
  assert.match(plans, /CommercialPlanTemplate/);
});
test('checkout recebe preco vigente do servidor e falha se indisponivel', () => {
  const checkout = read('app/api/pagamentos/criar-cobranca/route.ts');
  assert.match(checkout, /await loadCommercialPlans\(\)/);
  assert.match(checkout, /status:\s*503/);
  assert.match(checkout, /responseTotal - requestedPlan\.total/);
  assert.doesNotMatch(checkout, /commercialPlans\[/);
});
test('home, planos, solucoes e formulario nao usam catalogo hardcoded diretamente', () => {
  for (const p of [
    'app/page.tsx', 'app/planos/page.tsx', 'app/solucoes/page.tsx',
    'app/solucoes/[slug]/page.tsx', 'components/site/home-page.tsx',
    'components/payment-form.tsx', 'app/contratar-assistente-ia/page.tsx',
  ]) {
    const src = read(p);
    assert.doesNotMatch(src, /Object\.values\(commercialPlans\)/, p);
  }
  assert.match(read('components/payment-form.tsx'), /Nenhuma cobrança será iniciada/);
});
test('precos chegam do catalogo oficial e sem fallback de valor antigo', () => {
  const src = read('lib/live-plans.ts');
  assert.match(src, /\/api\/publico\/planos/);
  assert.match(src, /cache:\s*'no-store'/);
  assert.match(src, /return null/);
  assert.match(src, /commercialPlans\[item\.codigo\]/);
});
