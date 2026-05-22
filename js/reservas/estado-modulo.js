// js/reservas/estado-modulo.js - estado compartilhado do fluxo de reservas
export const MAX_OCORRENCIAS_RECORRENCIA = 120;

let _salvando = false;
export function getSalvando() { return _salvando; }
export function setSalvando(v) { _salvando = v; }

let _eventoSelecionado = null;
export function getEventoSelecionado() { return _eventoSelecionado; }
export function setEventoSelecionado(v) { _eventoSelecionado = v; }
