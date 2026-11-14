import type { CommercialPlanCode } from "@/lib/plans"

export type LaunchCampaign = {
  ativa: boolean
  vagas_restantes: number
  desconto_percentual: number
  precos: Partial<Record<CommercialPlanCode, number>>
}

const URL = "https://atendente.virtuagil.com.br/api/publico/campanha-lancamento"

/** Campaign is OFF by default. Only an authoritative public response enables its display. */
export async function loadLaunchCampaign(): Promise<LaunchCampaign | null> {
  try {
    const response = await fetch(URL, {
      method: "GET",cache:"no-store",redirect:"error",
      signal:AbortSignal.timeout(5000),
      headers:{Accept:"application/json"},
    })
    if (!response.ok) return null
    const v:unknown=await response.json()
    if (!v || typeof v!=="object" || Array.isArray(v)) return null
    const d=v as Record<string,unknown>
    if (d.ok!==true || d.ativa!==true ||
        d.desconto_percentual!==30 ||
        !Number.isInteger(Number(d.vagas_restantes)) ||
        Number(d.vagas_restantes)<=0 || Number(d.vagas_restantes)>10) return null
    const p=(d.precos && typeof d.precos==="object" && !Array.isArray(d.precos)
      ?d.precos:{}) as Record<string,unknown>
    const validCodes=[
      "jade_500_semestral",
      "jade_500_agenda_semestral",
      "jade_500_hospedagem_semestral",
    ] as const
    const prices:LaunchCampaign["precos"]={}
    for(const code of validCodes) {
      const num=Number(p[code])
      if(!Number.isFinite(num) || num<=0 ||
         Math.abs(num*100-Math.round(num*100))>1e-6) return null
      prices[code]=num
    }
    return {ativa:true,vagas_restantes:Number(d.vagas_restantes),
      desconto_percentual:30,precos:prices}
  } catch { return null }
}
