// js/reservas.js — barrel. API publica do fluxo de reservas.
export { salvarOuEditarEvento, deletarEvento, restaurarEvento } from './reservas/crud.js';
export { abrirModalFormulario, fecharModalForm, fecharModal, prepararEdicao, adicionarLinhaData, initReservasWindow } from './reservas/modais.js';
