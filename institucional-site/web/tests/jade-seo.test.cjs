const test = require("node:test")
const assert = require("node:assert/strict")
const { readFileSync } = require("node:fs")
const { join } = require("node:path")
const read = path => readFileSync(join(__dirname, "..", path), "utf8")
test("Jade é a chamada principal no cabeçalho e na Home", () => {
  const header=read("components/site/site-header.tsx")
  const home=read("components/site/home-page.tsx")
  assert.match(header, /Falar com a Jade/)
  assert.match(home, /Falar com a Jade/)
  assert.match(home, /Ver planos e preços/)
  assert.match(header, /jadeWhatsappUrl\(whatsappUrl\)/)
})
test("CTA mobile aparece fora do checkout e preserva contato", () => {
  const mobile=read("components/site/jade-mobile-contact.tsx")
  assert.match(mobile, /md:hidden/)
  assert.match(mobile, /startsWith\('\/contratar-assistente-ia'\)/)
  assert.match(mobile, /startsWith\('\/pagamento'\)/)
  assert.match(mobile, /aria-label/)
  const helper=read("lib/jade-contact.ts")
  assert.match(helper, /url\.searchParams\.set\('text'/)
  assert.match(helper, /wa\.me/)
})
test("SEO cobre Jornada, Hospedagem e dados reais", () => {
  const layout=read("app/layout.tsx")
  const home=read("app/page.tsx")
  const sitemap=read("app/sitemap.ts")
  assert.match(layout, /Hospedagem/)
  assert.match(home, /Jade/)
  assert.doesNotMatch(sitemap, /lastModified: now/)
  assert.match(sitemap, /new Map/)
})
test("auditor SEO confere canonical, sitemap, noindex e CTA", () => {
  const audit=read("scripts/seo-health.mjs")
  for (const mark of ["canonical","sitemap.xml","robots.txt","noindex","Falar com a Jade","SEO_AUDIT_OK"]) {
    assert.ok(audit.includes(mark), mark)
  }
})

test("canonical da Home aceita URL normalizada e páginas OG têm imagem", () => {
  const audit = read("scripts/seo-health.mjs")
  assert.match(audit, /canonicalUrl\.pathname!==path/)
  for (const path of [
    "app/page.tsx", "app/planos/page.tsx", "app/contato/page.tsx",
    "app/solucoes/page.tsx", "app/contratar-assistente-ia/page.tsx",
    "app/solucoes/[slug]/page.tsx",
  ]) {
    assert.match(read(path), /images:\s*\[\{\s*url: '\/brand\/logomarca.png'/)
  }
})

test("preço da Agenda em todas as seções usa o catálogo ativo", () => {
  const planos = read("app/planos/page.tsx")
  assert.match(planos, /agendaPlan\.total/)
  assert.match(planos, /agendaPlan\.installmentValue/)
  assert.doesNotMatch(planos, /R\$ 2\.394|R\$ 399/)
})
