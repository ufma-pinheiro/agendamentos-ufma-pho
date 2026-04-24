# PRD: FEAT-007 - Agendamentos Recorrentes

## 1. Visão Geral
**Objetivo:** Permitir que editores e donos criem reservas que se repetem automaticamente (ex: toda terça e quinta durante um semestre), facilitando o agendamento de aulas ou reuniões regulares.

## 2. Problema a Resolver
Atualmente, se um professor tem aula toda segunda-feira das 08h às 10h durante 4 meses, ele precisa criar 16 agendamentos individuais no sistema. Isso gera atrito, consome tempo e aumenta a margem de erros (esquecer um dia).

## 3. Escopo e Requisitos

### 3.1. User Stories
- **Como** professor/editor, **quero** poder selecionar uma regra de recorrência (ex: "Semanal") ao criar um evento, **para que** eu não precise cadastrar a mesma aula dezenas de vezes.
- **Como** administrador (dono), **quero** que os conflitos sejam validados para todas as ocorrências de um evento recorrente, **para que** o sistema barre a criação se qualquer uma das datas conflitar com outra reserva.
- **Como** professor/editor, **quero** poder excluir todas as instâncias futuras de um evento recorrente de uma só vez, **para que** se a disciplina for cancelada, eu não tenha que apagar dia por dia.

### 3.2. Regras de Negócio
- **Padrões Suportados:** Diário, Semanal (com seleção de dias da semana), e Mensal.
- **Data Limite:** Toda recorrência DEVE ter uma data de término (`dataFimRecorrencia`). O sistema não deve permitir eventos infinitos.
- **Validação de Conflito em Lote:** Antes de salvar, o sistema deve iterar pelas datas geradas e checar conflitos no banco para cada uma. Se houver *um* conflito, a série inteira deve ser impedida de ser criada, ou o sistema deve avisar exatamente quais dias estão em conflito.
- **Grupo de Ocorrências:** Cada agendamento criado via recorrência compartilhará o mesmo `groupid`.

## 4. Impacto Arquitetural (Frontend & Backend)
- **Banco de Dados:** A tabela `reservas` já possui a coluna `groupid`. Precisamos garantir que esse ID seja preenchido com um UUID único para toda a série. Não são necessárias novas tabelas, apenas lógica no frontend/API de lote.
- **UI de Criação (Modal):** Adicionar um switch "Evento Recorrente". Se ativado, mostra opções (Frequência, Dias da Semana, Data Limite).
- **UI de Exclusão/Edição:** Ao tentar excluir ou editar um evento que possua `groupid`, perguntar: "Deseja alterar apenas este evento ou todos os eventos desta série?".

## 5. Próximos Passos (Plano de Ação)
1. Atualizar o modal de criação (`js/reservas.js`) para suportar os inputs de recorrência.
2. Criar função utilitária para gerar as datas da série.
3. Modificar a lógica de salvamento para realizar inserts múltiplos (array) via Supabase, após checagem de conflito em lote.
4. Ajustar o modal de edição e exclusão para tratar `groupid`.
