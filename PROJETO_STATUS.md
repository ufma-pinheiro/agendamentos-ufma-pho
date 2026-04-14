# Status do Projeto - Sistema de Agendamento UFMA

Este arquivo serve como memória persistente para o Antigravity sobre o estado atual do desenvolvimento.

## 📅 Resumo da Sessão (13/04/2026)

### 1. Importação de Dados (CSV -> Supabase)
- **Arquivo de Origem:** `Qwen_csv_20260413_6yc1nt7ge.txt`
- **O que foi feito:**
    - Criamos um script em Node.js (`parser.js`) para processar os dados.
    - Transformamos eventos de múltiplos dias (ex: 22-24/04) em **registros individuais por dia**. Isso evita a "barra gigante" no calendário e facilita a visualização.
    - Total de registros inseridos: **395 entradas**.
    - Preenchimento automático de campos vazios: Responsável setado como `"-"` onde faltava.
    - Mapeamento de salas: Siglas do CSV foram convertidas para os nomes exatos das salas usados no app (Ex: "Auditório Licenciatura" -> "Licenciaturas - Auditório").

### 2. Correções Técnicas
- **Timezone:** Corrigimos o fuso horário para UTC-3 (Horário de Brasília). Antes, eventos das 08h apareciam às 05h devido ao UTC puro.
- **Falsos Conflitos:** Limpamos a flag `isconflito` de todos os eventos importados. O sistema estava acusando conflito em eventos de salas diferentes porque interpretou o status "BLOQUEADO" do CSV como erro de agenda.
- **Horários:** Eventos sem horário definido foram padronizados para o intervalo das **08:00 às 18:00**.

### 3. Próximos Passos Sugeridos
- [ ] Validar se todos os locais foram mapeados corretamente.
- [ ] Testar a criação de novos agendamentos manuais para ver se o cálculo de conflito automático continua preciso após a carga massiva.
- [ ] Verificar se os eventos de meses distantes (Setembro/Dezembro) estão aparecendo corretamente no seletor de meses.


### 4. Deploy e Visibilidade (14/04/2026)
- **Problema:** Deploy bloqueado no Vercel (Status: Blocked).
- **Causa:** Repositório era privado em uma organização, o que bloqueia o plano Hobby.
- **Solução:** Repositório alterado para **Público**.
- **Ação:** Novo push realizado para gatilhar o deploy automático.

### 5. Otimização de Performance e Lazy Loading (14/04/2026)
- **Problema:** Sistema demorava vários segundos para carregar devido ao alto volume de dados (~400 registros).
- **Causa:** Busca global (`select *`) seguida de inserção individual no calendário via loop.
- **Solução Implementada:**
    - **Lazy Loading no Calendário:** O FullCalendar agora busca apenas os eventos do período visível (ex: mês atual) via Supabase.
    - **Uso de Batching:** Removido o loop `forEach` para inserção de eventos.
    - **Consultas Especializadas:** Dashboard, Resumo Mensal e Lista de Meus Eventos agora fazem buscas independentes e filtradas por período diretamente no banco de dados.
    - **Dashboard Focado:** Conforme decidido, o Dashboard agora inicia focado no mês atual por padrão, reduzindo o tempo de processamento.

---
*Atualizado em: 14/04/2026 às 17:05*
