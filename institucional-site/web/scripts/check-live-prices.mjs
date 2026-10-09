#!/usr/bin/env node
// Teste read-only da integração comercial: não executa checkout nem pagamentos.
const url = "https://atendente.virtuagil.com.br/api/publico/planos"
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 16000)
try {
  const response = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store",
    redirect: "error", signal: controller.signal })
  if (!response.ok) throw new Error("Catálogo HTTP " + response.status)
  const json = await response.json()
  if (json?.ok !== true || !Array.isArray(json.planos)) throw new Error("Formato de catálogo inválido")
  const codes = new Set()
  for (const plan of json.planos) {
    if (!/^[a-z0-9_]+$/.test(String(plan.codigo || ""))) throw new Error("Código inválido")
    if (!Number.isFinite(Number(plan.valor_total)) || Number(plan.valor_total) <= 0) throw new Error("Preço inválido")
    if (plan.moeda !== "BRL") throw new Error("Moeda inválida")
    codes.add(plan.codigo)
  }
  const required = ["jade_500_semestral","jade_500_agenda_semestral","jade_500_hospedagem_semestral"]
  if (required.some(code => !codes.has(code))) throw new Error("Faltam planos comerciais ativos")
  console.log("CATALOGO_OK: catálogo público respondeu com 3 planos comerciais ativos; nenhuma cobrança realizada.")
} catch (error) {
  console.error("CATALOGO_INDISPONIVEL: " + String(error?.message || error))
  process.exitCode = 1
} finally { clearTimeout(timeout) }
