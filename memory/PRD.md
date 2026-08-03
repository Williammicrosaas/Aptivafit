# Aptivafit — PRD

## Visão geral
Aplicativo mobile (Expo/React Native) de planos de treino de academia personalizados por IA, no estilo Befit/BeStrong. Fluxo: onboarding tipo quiz → paywall → app principal com plano do dia, tracker de treino ao vivo, biblioteca de exercícios, progresso e perfil.

## Estado atual (MVP 1)
### Implementado
- **Onboarding completo (17 passos)** com barra de progresso e voltar em todas as telas:
  gender, goal, experience, frequency, location, comparison, injuries (multi-seleção), muscle-focus, health-connect, body-data (IMC ao vivo), weight-goal, projection, duration, setup-mode, organization, weekly-frequency (slider), social-proof, notifications, motivational, testimonials, review, loading (percentual com textos rotativos), plan-ready (prévia com blur).
- **Paywall** com 3 planos, badge de 72% OFF, benefícios, modal de exit-intent (aumenta para 83% na 2ª saída), restaurar compras, código promocional.
- **Autenticação** email/senha (JWT + bcrypt) e Google via Emergent Auth (`/api/auth/session`).
- **Geração de plano por IA (Claude Sonnet 4.6)** — regras determinísticas para split de dias/exercícios + mensagem motivacional gerada pela LLM.
- **App principal (5 tabs)**: Plano, Treinos, Progresso, Exercícios, Perfil.
- **Treino ativo** com timer ao vivo, sets/reps/peso editáveis, checkbox por série, timer de descanso, cálculo de volume e calorias em tempo real, haptics.
- **Tela de conclusão** com stats, watermark, opções de share (visual).
- **Biblioteca de exercícios** com busca e agrupamento por músculo.
- **Progresso** com calendário semanal, streak, PRs, gráficos bloqueados atrás do paywall.

### MOCKED / A completar (não impacta MVP)
- **Stripe (assinatura real):** paywall visual completo, mas `setPremium(true)` é local. Próximo passo: integrar checkout Stripe via API existente na plataforma.
- **Apple Saúde / Google Fit:** toggles no perfil marcados como MOCKED — requerem build nativo (HealthKit/GoogleFit não funcionam em Expo Go).
- **Strava OAuth:** toggle apenas — requer Client ID/Secret do usuário para integração completa.
- **Publicação em Strava** ao finalizar treino: botão visual, sem integração real.

## Backend
FastAPI + MongoDB. Rotas com prefixo `/api`:
- `POST /api/auth/register|login|session|logout`
- `GET /api/auth/me`
- `POST /api/onboarding/save`
- `POST /api/plan/generate`
- `GET /api/plan/current`
- `GET /api/exercises`
- `POST /api/workouts/log`, `GET /api/workouts/history`

## Design
Paleta: navy/preto (#090C12) + neon-green (#CCFF00). Fontes: Bebas Neue para números/títulos, Manrope para corpo. Todos os cards com bordas arredondadas, sombra suave e Estados vazios/erro tratados nas telas principais.

## Próximos passos sugeridos
1. Integração real do Stripe (checkout de assinatura)
2. Detalhe de exercício (modal com abas: músculo, instruções, equipamento, analytics)
3. Modal "Adicionar exercício" e reordenação
4. Distribuição muscular real no Progresso (gráfico)
5. Notificações locais (lembretes de treino)
6. Strava OAuth quando cliente prover credenciais
