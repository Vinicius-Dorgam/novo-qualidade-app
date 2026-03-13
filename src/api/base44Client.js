import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Client Base44 para falar com a API SaaS oficial.
// IMPORTANTE: não sobrescreva `serverUrl` com string vazia, senão em produção
// (ex: Vercel) as chamadas vão bater no próprio domínio do app e retornar 404/405,
// causando erros de tela branca.
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  // Usa o default da SDK (https://base44.app). Se quiser outro backend,
  // defina explicitamente aqui, por exemplo:
  // serverUrl: 'https://seu-backend.base44.com',
  requiresAuth: false,
  appBaseUrl,
});
