# FEAT-002: Painel de Conflitos Global

## 📝 Descrição
Implementação de um painel administrativo para gestão de agendamentos em conflito. O sistema já marca agendamentos com `isconflito = true` quando são forçados, mas não há uma visão consolidada para o Administrador resolver essas colisões.

## 🎯 Objetivos
- Centralizar a visualização de todos os conflitos futuros em um único lugar.
- Facilitar a resolução de colisões permitindo o cancelamento rápido de um dos eventos conflitantes.
- Manter a integridade da agenda institucional.

## 🛠️ Requisitos Funcionais
1. **Localização:** Sub-aba dentro de "Gestão Administrativa" (Aba Admin), ao lado do Histórico de Cancelamentos.
2. **Filtro Temporal:** Exibir apenas agendamentos com data de início `>=` data/hora atual.
3. **Visão em Pares:**
   - Para cada evento com `isconflito=true`, o sistema deve buscar no banco os eventos que ocupam o mesmo espaço no mesmo horário (os "vítimas" da colisão).
   - Exibir lado a lado: [Evento Forçado] vs [Evento(s) Ocupante(s)].
4. **Resolução de Conflitos:**
   - Botão "Cancelar" disponível para qualquer um dos eventos do par.
   - Ao cancelar, deve abrir o modal de soft-delete padrão (exigindo motivo).
5. **Atualização em Tempo Real:** O painel deve se atualizar automaticamente quando um conflito for resolvido.

## 🎨 Especificações de UI/UX
- **Componente:** Tabela ou Grid de cards comparativos.
- **Destaque Visual:** Usar cores de alerta (ex: borda vermelha ou badge "EM CONFLITO").
- **Badges de Local:** Reutilizar os badges coloridos já implementados nos modais e cards.

## 🔒 Segurança e Regras de Negócio
- Apenas usuários com role `dono` podem acessar o painel e realizar cancelamentos globais.
- O cancelamento deve preencher `cancelado=true` e os campos de auditoria (`motivo_cancelamento`, `canceladopor`, `datacancelamento`).

## 📊 Estimativa de Esforço
- **Complexidade:** Baixa
- **Esforço Estimado:** 2-4 horas (Quick Win)
