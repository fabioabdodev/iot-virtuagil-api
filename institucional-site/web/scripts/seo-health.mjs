#!/usr/bin/env node
// Auditoria de conteúdo PÚBLICO: páginas, indexação, metadados e CTA Jade.
const origin = "https://www.virtuagil.com.br"
const pages = [
  "/", "/planos", "/solucoes", "/solucoes/atendente-ia",
  "/solucoes/iot", "/contratar-assistente-ia", "/contato",
  "/termos-de-contratacao", "/politica-de-privacidade", "/exclusao-de-dados",
]
const abort = () => AbortSignal.timeout(18000)
async function read(path) {
  const res=await fetch(origin+path,{redirect:"follow",signal:abort(),cache:"no-store"})
  if(!res.ok)throw Error("HTTP "+res.status+" "+path)
  return res.text()
}
async function main() {
  const sitemap=await read("/sitemap.xml")
  const robots=await read("/robots.txt")
  if(!robots.includes("Sitemap:") || !sitemap.includes("/planos")) {
    throw Error("Sitemap ou robots.txt incompletos")
  }
  const sUrls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1])
  if(sUrls.length!==new Set(sUrls).size)throw Error("URLs duplicadas no sitemap")
  const issues=[]
  let checked=0
  for(const path of pages){
    const html=await read(path)
    const title=html.match(/<title>([^<]+)<\/title>/i)?.[1]||""
    if(!title.includes("Virtuagil"))issues.push("Title sem marca: "+path+" => "+JSON.stringify(title.slice(0,120)))
    if(!/<meta[^>]+name="description"/i.test(html))issues.push("Description ausente: "+path)
    if(!/<h1[\s>]/i.test(html))throw Error("H1 ausente: "+path)
    const canonical=html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1]||
      html.match(/<link[^>]+href="([^"]+)"[^>]+rel="canonical"/i)?.[1]||""
    if(canonical!==origin+path)issues.push("Canonical diferente: "+path+" => "+canonical)
    checked++
    console.log("SEO_OK "+path+" — title/canonical/description/H1")
  }
  const home=await read("/")
  if(!home.includes("Falar com a Jade") || !home.includes("wa.me/")) {
    issues.push("CTA da Jade não encontrado na Home")
  }
  if(!home.includes("Agenda") || !home.includes("Hospedagem"))issues.push("Módulos faltando na Home")
  for(const path of ["/pagamento/sucesso","/pagamento/pendente","/pagamento/erro"]){
    const html=await read(path)
    if(!/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html) &&
       !/<meta[^>]+content="[^"]*noindex[^"]*"[^>]+name="robots"/i.test(html)) {
      issues.push("Página de pagamento indexável: "+path)
    }
  }
  if(issues.length)throw Error(issues.join(" | "))
  console.log("SEO_AUDIT_OK: "+checked+" páginas, 3 retornos não indexáveis, sitemap único, Jade visível. Sem pagamento/contato enviado.")
}
main().catch(err=>{console.error("SEO_AUDIT_FAILED: "+String(err.message));process.exitCode=1})
