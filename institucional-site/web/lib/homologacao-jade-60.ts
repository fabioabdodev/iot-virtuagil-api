import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';

export const HOMOLOGACAO_PLANO = 'jade_500_homologacao_60';
export const HOMOLOGACAO_VALOR = 60;
export const HOMOLOGACAO_PARCELAS = 6;
// 29/10/2026 23:59:59 America/Sao_Paulo. O link para de autorizar novas preferencias.
export const HOMOLOGACAO_EXPIRA_EM = Date.parse('2026-10-30T02:59:59.000Z');
// O token em claro nunca deve ser adicionado ao repositorio nem aos logs.
const TOKEN_SHA256 = '1b5f9911e696196868fc806c83f5e0e5b7b39d28af2315c8dbedce76398284b5';

export function tokenHomologacaoValido(token: unknown, agora = Date.now()): boolean {
  if (agora > HOMOLOGACAO_EXPIRA_EM ||
      typeof token !== 'string' ||
      token.length < 32 || token.length > 128) return false;
  const digest = createHash('sha256').update(token).digest();
  const expected = Buffer.from(TOKEN_SHA256, 'hex');
  return digest.length === expected.length && timingSafeEqual(digest, expected);
}
