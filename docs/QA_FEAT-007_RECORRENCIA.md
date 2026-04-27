# QA Manual - FEAT-007 Agendamentos Recorrentes

## Ambiente
- Executar `npm run dev`
- Abrir sistema no navegador e autenticar como `editor` e `dono`

## Cenarios Principais

### 1) Criacao de serie semanal
1. Abrir modal de novo agendamento.
2. Marcar espaco, titulo e responsavel.
3. Ativar `Evento recorrente`.
4. Frequencia `Semanal`, marcar `Seg` e `Qua`, definir data final.
5. Salvar.

Esperado:
- Serie criada com multiplas ocorrencias.
- Todos os eventos compartilham `groupid`.
- Modal de sucesso exibe datas/horarios gerados.

### 2) Validacao de conflito em lote
1. Criar um agendamento existente que conflite com apenas uma data da serie.
2. Tentar salvar uma nova serie recorrente no mesmo espaco/horario.

Esperado:
- Modal de conflito aparece com os eventos conflitantes.
- Ao cancelar, nada e persistido.

### 3) Edicao de serie por escopo
1. Abrir um evento de serie existente.
2. Clicar editar.
3. Escolher cada opcao em tentativas separadas:
   - apenas este evento
   - este e os proximos
   - toda a serie

Esperado:
- `single`: altera somente 1 ocorrencia.
- `future`: altera ocorrencias a partir da data atual.
- `all`: altera toda a serie.

### 4) Cancelamento de serie por escopo (soft delete)
1. Abrir um evento de serie existente.
2. Clicar excluir e informar motivo.
3. Escolher cada escopo em tentativas separadas.

Esperado:
- Operacao respeita o escopo selecionado.
- Eventos afetados ficam `cancelado=true`.
- Eventos nao afetados permanecem visiveis.

### 5) Permissao de editor em lote
1. Com usuario `editor`, abrir serie criada por outro usuario.
2. Tentar editar/excluir em lote (`future`/`all`).

Esperado:
- Sistema bloqueia com mensagem de acesso negado.

### 6) Regressao de agendamento simples
1. Criar agendamento sem recorrencia.
2. Editar e excluir agendamento simples.

Esperado:
- Fluxo simples continua funcionando sem mudancas indevidas.

## Criterio de Aprovacao
- Todos os cenarios acima aprovados sem erro JS no console.
- Sem regressao visual no modal e no calendario.
