// js/reservas.js - Gerenciamento de Reservas e Eventos (CRUD)
import flatpickr from 'flatpickr';
import { Portuguese } from 'flatpickr/dist/l10n/pt.js';
import Swal from 'sweetalert2';
import { supabase } from '../supabaseClient.js';
import { calendar, getCorPorEspaco, recarregarDados } from './calendar.js';
import { frontendParaDb } from './db.js';
import {
    showToast,
    showSuccessModal,
    showConflictModal,
    showConfirmModal,
    showCancelMotivModal,
    showSeriesActionModal
} from './utils.js';

const MAX_OCORRENCIAS_RECORRENCIA = 120;

let _salvando = false;
let eventoSelecionadoNoModal = null;

function pad2(n) {
    return String(n).padStart(2, '0');
}

function formatDateYmd(date) {
    return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

function parseYmdToUtcDate(ymd) {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
}

function gerarUuid() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `GRP-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function montarSessao(dataYmd, horaIni, horaFim) {
    return {
        start: `${dataYmd}T${horaIni}:00-03:00`,
        end: `${dataYmd}T${horaFim}:00-03:00`
    };
}

function coletarSessoesDoFormulario() {
    const sessoes = [];
    document.querySelectorAll('.data-row-styled').forEach(row => {
        const dataInput = row.querySelector('.flatpickr');
        const data = dataInput ? dataInput.value : '';
        const times = row.querySelectorAll('.input-time');
        const horaIni = times[0]?.value;
        const horaFim = times[1]?.value;
        if (data && horaIni && horaFim) {
            sessoes.push(montarSessao(data, horaIni, horaFim));
        }
    });
    return sessoes;
}

function validarHorarios(sessoes) {
    for (const sess of sessoes) {
        const ini = new Date(sess.start).getTime();
        const fim = new Date(sess.end).getTime();
        if (fim <= ini) return false;
    }
    return true;
}

function obterConfigRecorrencia() {
    const ativa = Boolean(document.getElementById('recorrenciaAtiva')?.checked);
    const frequencia = document.getElementById('recorrenciaFrequencia')?.value || 'weekly';
    const dataFim = document.getElementById('recorrenciaFim')?.value || '';
    const diasSemana = Array.from(document.querySelectorAll('input[name="recorrenciaDiaSemana"]:checked'))
        .map(cb => Number(cb.value));
    return { ativa, frequencia, dataFim, diasSemana };
}

function atualizarUIRecorrencia() {
    const ativa = Boolean(document.getElementById('recorrenciaAtiva')?.checked);
    const painel = document.getElementById('recorrenciaOpcoes');
    const addBtn = document.getElementById('btnAddDataRow');
    const selectFreq = document.getElementById('recorrenciaFrequencia');
    const boxSemanal = document.getElementById('recorrenciaDiasSemanaBox');
    const inputFim = document.getElementById('recorrenciaFim');
    const dataBase = document.querySelector('.data-row-styled .flatpickr')?.value;

    if (painel) painel.classList.toggle('hidden', !ativa);
    if (addBtn) addBtn.disabled = ativa;
    if (inputFim) {
        inputFim.required = ativa;
        if (dataBase) inputFim.min = dataBase;
    }

    if (ativa) {
        const rows = Array.from(document.querySelectorAll('.data-row-styled'));
        if (rows.length > 1) {
            rows.slice(1).forEach(row => row.remove());
            showToast('Para recorrência, apenas a primeira data é usada como base.', 'warning');
        }
    }

    if (selectFreq && boxSemanal) {
        const semanal = selectFreq.value === 'weekly';
        boxSemanal.classList.toggle('hidden', !semanal);

        if (ativa && semanal) {
            const marcados = document.querySelectorAll('input[name="recorrenciaDiaSemana"]:checked').length;
            if (marcados === 0) {
                const dataBase = document.querySelector('.data-row-styled .flatpickr')?.value;
                if (dataBase) {
                    const dia = parseYmdToUtcDate(dataBase).getUTCDay();
                    const alvo = document.querySelector(`input[name="recorrenciaDiaSemana"][value="${dia}"]`);
                    if (alvo) {
                        alvo.checked = true;
                        alvo.closest('.checkbox-card')?.classList.add('checked');
                    }
                }
            }
        }
    }
}

function resetRecorrenciaFormulario() {
    const chk = document.getElementById('recorrenciaAtiva');
    const freq = document.getElementById('recorrenciaFrequencia');
    const fim = document.getElementById('recorrenciaFim');
    if (chk) chk.checked = false;
    if (freq) freq.value = 'weekly';
    if (fim) fim.value = '';

    document.querySelectorAll('input[name="recorrenciaDiaSemana"]').forEach(cb => {
        cb.checked = false;
        cb.closest('.checkbox-card')?.classList.remove('checked');
    });

    atualizarUIRecorrencia();
}

function gerarSessoesRecorrentes(sessaoBase, config) {
    const dataBase = sessaoBase.start.slice(0, 10);
    const horaIni = sessaoBase.start.slice(11, 16);
    const horaFim = sessaoBase.end.slice(11, 16);
    const iniDate = parseYmdToUtcDate(dataBase);
    const fimDate = parseYmdToUtcDate(config.dataFim);

    if (!config.dataFim || Number.isNaN(fimDate.getTime()) || fimDate < iniDate) {
        throw new Error('Informe uma data de fim de recorrência válida.');
    }

    const ocorrencias = [];

    const pushData = (dateObj) => {
        if (ocorrencias.length >= MAX_OCORRENCIAS_RECORRENCIA) {
            throw new Error(`Limite de ${MAX_OCORRENCIAS_RECORRENCIA} ocorrências por série excedido.`);
        }
        ocorrencias.push(montarSessao(formatDateYmd(dateObj), horaIni, horaFim));
    };

    if (config.frequencia === 'daily') {
        const cursor = new Date(iniDate);
        while (cursor <= fimDate) {
            pushData(cursor);
            cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
        return ocorrencias;
    }

    if (config.frequencia === 'weekly') {
        const dias = config.diasSemana.length
            ? config.diasSemana
            : [iniDate.getUTCDay()];

        const cursor = new Date(iniDate);
        while (cursor <= fimDate) {
            if (dias.includes(cursor.getUTCDay())) pushData(cursor);
            cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
        return ocorrencias;
    }

    if (config.frequencia === 'monthly') {
        const diaBase = iniDate.getUTCDate();
        const cursor = new Date(Date.UTC(iniDate.getUTCFullYear(), iniDate.getUTCMonth(), 1));

        while (cursor <= fimDate) {
            const ultimoDiaMes = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0)).getUTCDate();
            const diaAplicado = Math.min(diaBase, ultimoDiaMes);
            const dataOcorrencia = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), diaAplicado));

            if (dataOcorrencia >= iniDate && dataOcorrencia <= fimDate) {
                pushData(dataOcorrencia);
            }

            cursor.setUTCMonth(cursor.getUTCMonth() + 1);
        }
        return ocorrencias;
    }

    throw new Error('Frequência de recorrência inválida.');
}

async function carregarSeriePorEscopo(groupId, escopo, dataBase) {
    let query = supabase
        .from('reservas')
        .select('id, start_time, end_time, criadopor')
        .eq('groupid', groupId)
        .eq('cancelado', false)
        .order('start_time', { ascending: true });

    if (escopo === 'future' && dataBase) {
        query = query.gte('start_time', dataBase.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

async function carregarEventosConflito(minStart, maxEnd) {
    const queryComFim = supabase
        .from('reservas')
        .select('id, title, start_time, end_time, espacos, responsavel, cancelado')
        .eq('cancelado', false)
        .lte('start_time', maxEnd)
        .not('end_time', 'is', null)
        .gte('end_time', minStart);

    const querySemFim = supabase
        .from('reservas')
        .select('id, title, start_time, end_time, espacos, responsavel, cancelado')
        .eq('cancelado', false)
        .lte('start_time', maxEnd)
        .is('end_time', null);

    const [{ data: dataComFim, error: errorComFim }, { data: dataSemFim, error: errorSemFim }] = await Promise.all([
        queryComFim,
        querySemFim
    ]);

    if (errorComFim) throw errorComFim;
    if (errorSemFim) throw errorSemFim;

    const dedupe = new Map();
    [...(dataComFim || []), ...(dataSemFim || [])].forEach(ev => {
        dedupe.set(String(ev.id), ev);
    });

    return Array.from(dedupe.values()).map(ev => ({
        id: ev.id,
        title: ev.title,
        start: new Date(ev.start_time),
        end: ev.end_time ? new Date(ev.end_time) : null,
        extendedProps: {
            espacos: Array.isArray(ev.espacos) ? ev.espacos : [ev.espacos].filter(Boolean),
            responsavel: ev.responsavel
        }
    }));
}

function detectarConflitos(sessoes, espacosSelecionados, eventos, idsIgnorados = new Set()) {
    const conflitos = [];

    sessoes.forEach(sess => {
        const ini = new Date(sess.start).getTime();
        const fim = new Date(sess.end).getTime();

        eventos.forEach(ev => {
            if (idsIgnorados.has(String(ev.id))) return;
            const evEspacos = ev.extendedProps?.espacos || [];
            const espacoComum = espacosSelecionados.some(esp => evEspacos.includes(esp));
            if (!espacoComum) return;

            const evIni = ev.start.getTime();
            const evFim = ev.end ? ev.end.getTime() : evIni + 3600000;
            if (ini < evFim && fim > evIni) conflitos.push(ev);
        });
    });

    const unicos = new Map();
    conflitos.forEach(ev => {
        if (!unicos.has(ev.id)) unicos.set(ev.id, ev);
    });

    return Array.from(unicos.values());
}

/**
 * Salva um novo agendamento ou atualiza um existente
 */
export async function salvarOuEditarEvento(e, estado, atualizarTodasTelas) {
    if (e) e.preventDefault();
    if (_salvando) return;
    _salvando = true;

    const btn = document.getElementById('btnSalvar');
    if (typeof window.setButtonLoading === 'function') window.setButtonLoading(btn, true);

    try {
        const editId = document.getElementById('editEventId').value;
        const editGroupId = document.getElementById('editGroupId').value;
        const titulo = document.getElementById('titulo').value;
        const responsavel = document.getElementById('responsavel').value;
        const contatoWhats = document.getElementById('contatoWhats').value;
        const contatoEmail = document.getElementById('contatoEmail').value;
        const configRecorrencia = obterConfigRecorrencia();

        if (!estado || !['editor', 'dono'].includes(estado.nivelAcesso)) {
            throw new Error('Acesso negado: apenas editores e donos podem criar ou editar agendamentos.');
        }

        const espacos = Array.from(document.querySelectorAll('input[name="espaco"]:checked')).map(cb => cb.value);
        if (espacos.length === 0) {
            showToast('Selecione pelo menos um espaço', 'error');
            return;
        }

        let sessoes = coletarSessoesDoFormulario();
        if (sessoes.length === 0) {
            showToast('Adicione pelo menos uma data válida', 'error');
            return;
        }

        sessoes = (sessoes || []).filter(sess => {
            if (!sess?.start || !sess?.end) return false;
            const ini = new Date(sess.start).getTime();
            const fim = new Date(sess.end).getTime();
            return Number.isFinite(ini) && Number.isFinite(fim);
        });

        if (sessoes.length === 0) {
            showToast('Nenhuma sessão válida foi gerada para o escopo selecionado.', 'error');
            return;
        }

        if (!validarHorarios(sessoes)) {
            showToast('O horário de término deve ser posterior ao de início', 'error');
            return;
        }

        let escopoEdicao = 'single';
        let eventoBase = null;

        if (editId) {
            eventoBase = calendar.getEventById(editId);
            if (!eventoBase) throw new Error('Agendamento não encontrado.');

            const isDono = estado.nivelAcesso === 'dono';
            const isCriador = eventoBase.extendedProps?.criadoPor === estado.usuarioLogado?.email;
            if (!isDono && !isCriador) {
                throw new Error('Acesso negado: Você não tem permissão para alterar este agendamento.');
            }

            if (editGroupId) {
                escopoEdicao = await showSeriesActionModal('editar');
                if (escopoEdicao === 'cancel') return;
            }
        }

        let eventosSerieEscopo = [];

        if (configRecorrencia.ativa) {
            if (sessoes.length !== 1) {
                throw new Error('Para recorrência, use apenas uma data base no formulário.');
            }
            if (configRecorrencia.frequencia === 'weekly' && configRecorrencia.diasSemana.length === 0) {
                throw new Error('Selecione ao menos um dia da semana para a recorrência semanal.');
            }
            sessoes = gerarSessoesRecorrentes(sessoes[0], configRecorrencia);
        } else if (editId && editGroupId && escopoEdicao !== 'single') {
            eventosSerieEscopo = await carregarSeriePorEscopo(editGroupId, escopoEdicao, eventoBase?.start);
            if (eventosSerieEscopo.length === 0) {
                throw new Error('Não foi possível localizar eventos da série para edição.');
            }

            if (estado.nivelAcesso !== 'dono') {
                const temEventoNaoCriadoPeloUsuario = eventosSerieEscopo.some(
                    ev => ev.criadopor && ev.criadopor !== estado.usuarioLogado?.email
                );
                if (temEventoNaoCriadoPeloUsuario) {
                    throw new Error('Acesso negado: você não pode editar em lote eventos criados por outro usuário.');
                }
            }

            const horaIni = sessoes[0].start.slice(11, 16);
            const horaFim = sessoes[0].end.slice(11, 16);
            sessoes = eventosSerieEscopo.map(ev => montarSessao((ev.start_time || '').slice(0, 10), horaIni, horaFim));
        }

        if (!validarHorarios(sessoes)) {
            showToast('O horário de término deve ser posterior ao de início', 'error');
            return;
        }

        const ordenadas = [...sessoes].sort((a, b) => new Date(a.start) - new Date(b.start));
        const minStart = ordenadas[0].start;
        const maxEnd = ordenadas[ordenadas.length - 1].end;
        const eventosParaConflito = await carregarEventosConflito(minStart, maxEnd);

        const idsIgnorados = new Set();
        if (editId) idsIgnorados.add(String(editId));
        if (editId && editGroupId && escopoEdicao !== 'single') {
            if (eventosSerieEscopo.length === 0) {
                eventosSerieEscopo = await carregarSeriePorEscopo(editGroupId, escopoEdicao, eventoBase?.start);
            }

            if (estado.nivelAcesso !== 'dono') {
                const temEventoNaoCriadoPeloUsuario = eventosSerieEscopo.some(
                    ev => ev.criadopor && ev.criadopor !== estado.usuarioLogado?.email
                );
                if (temEventoNaoCriadoPeloUsuario) {
                    throw new Error('Acesso negado: você não pode alterar em lote eventos criados por outro usuário.');
                }
            }

            eventosSerieEscopo.forEach(ev => idsIgnorados.add(String(ev.id)));
        }

        const conflitos = detectarConflitos(sessoes, espacos, eventosParaConflito, idsIgnorados);

        let forcar = false;
        if (conflitos.length > 0) {
            const forcarConflito = await showConflictModal(conflitos, { titulo, responsavel, espacos, sessoes });
            if (!forcarConflito) return;
            forcar = true;
        }

        const cor = getCorPorEspaco(espacos);
        const groupId = editId
            ? (editGroupId || gerarUuid())
            : (configRecorrencia.ativa ? gerarUuid() : `GRP-${Date.now()}`);

        const timestamp = Date.now();
        const criadoPor = estado.usuarioLogado.email;

        if (editId) {
            if (escopoEdicao === 'single') {
                const { error: delErr } = await supabase.from('reservas').delete().eq('id', editId);
                if (delErr) throw delErr;
            } else {
                let queryDel = supabase.from('reservas').delete().eq('groupid', groupId).eq('cancelado', false);
                if (escopoEdicao === 'future' && eventoBase?.start) {
                    queryDel = queryDel.gte('start_time', eventoBase.start.toISOString());
                }
                const { error: delErr } = await queryDel;
                if (delErr) throw delErr;
            }
        }

        const construirPayload = (isConflitoFlag) => sessoes.map((sess, i) => frontendParaDb({
            title: titulo,
            tituloPuro: titulo,
            start: sess.start,
            end: sess.end,
            espacos,
            responsavel,
            contatoWhats,
            contatoEmail,
            color: cor,
            isConflito: isConflitoFlag,
            groupId,
            dataCriacao: timestamp + i,
            criadoPor
        }));

        let payload = construirPayload(forcar);
        let { error: insertErr } = await supabase.from('reservas').insert(payload);

        if (insertErr?.code === 'P0001' && !forcar) {
            let conflitosAtualizados = [];
            try {
                const eventosAtualizados = await carregarEventosConflito(minStart, maxEnd);
                conflitosAtualizados = detectarConflitos(sessoes, espacos, eventosAtualizados, idsIgnorados);
            } catch {
                conflitosAtualizados = [];
            }

            let deveForcar = false;
            if (conflitosAtualizados.length > 0) {
                deveForcar = await showConflictModal(conflitosAtualizados, { titulo, responsavel, espacos, sessoes });
            } else {
                const { confirmado } = await showConfirmModal(
                    'Conflito detectado no servidor',
                    `${insertErr.message || 'Existe conflito de agendamento.'}\nDeseja forçar mesmo assim?`
                );
                deveForcar = confirmado;
            }

            if (!deveForcar) return;

            payload = construirPayload(true);
            ({ error: insertErr } = await supabase.from('reservas').insert(payload));
        }

        if (insertErr) throw insertErr;

        fecharModalForm();
        if (typeof atualizarTodasTelas === 'function') atualizarTodasTelas();

        showSuccessModal({
            titulo,
            responsavel,
            espacos,
            sessoes,
            modalTitle: editId ? 'Agendamento Atualizado!' : 'Agendamento Confirmado!',
            modalSubtitle: editId
                ? 'As alterações foram salvas com sucesso.'
                : 'Sua reserva foi registrada com sucesso.'
        });
    } catch (error) {
        console.error('Erro ao salvar:', error);
        if (error?.code === 'P0001') {
            showToast(error.message || 'Conflito de agendamento detectado pelo servidor.', 'warning');
            return;
        }
        showToast('Erro ao salvar: ' + (error.message || error), 'error');
    } finally {
        if (typeof window.setButtonLoading === 'function') window.setButtonLoading(btn, false);
        _salvando = false;
    }
}

/**
 * Exclui (soft delete) o evento selecionado
 */
export async function deletarEvento(atualizarTodasTelas) {
    if (!eventoSelecionadoNoModal) return;

    const estado = window.estadoGlobal || null;

    if (estado) {
        const isDono = estado.nivelAcesso === 'dono';
        const isCriador = eventoSelecionadoNoModal.extendedProps?.criadoPor === estado.usuarioLogado?.email;
        if (!isDono && !(estado.nivelAcesso === 'editor' && isCriador)) {
            showToast('Acesso negado: Você só pode excluir seus próprios agendamentos', 'error');
            return;
        }
    }

    const tituloEvento = eventoSelecionadoNoModal.extendedProps?.tituloPuro || eventoSelecionadoNoModal.title || 'este agendamento';
    const { confirmado, motivo } = await showCancelMotivModal(tituloEvento);
    if (!confirmado) return;

    let escopo = 'single';
    const groupId = eventoSelecionadoNoModal.extendedProps?.groupId;
    if (groupId) {
        escopo = await showSeriesActionModal('excluir');
        if (escopo === 'cancel') return;
    }

    try {
        if (groupId && escopo !== 'single' && estado?.nivelAcesso !== 'dono') {
            const eventosSerieEscopo = await carregarSeriePorEscopo(groupId, escopo, eventoSelecionadoNoModal.start);
            const temEventoNaoCriadoPeloUsuario = eventosSerieEscopo.some(
                ev => ev.criadopor && ev.criadopor !== estado?.usuarioLogado?.email
            );
            if (temEventoNaoCriadoPeloUsuario) {
                throw new Error('Acesso negado: você não pode cancelar em lote eventos criados por outro usuário.');
            }
        }

        const agora = new Date();
        const offset = '-03:00';
        const dataCanc = `${agora.getFullYear()}-${pad2(agora.getMonth() + 1)}-${pad2(agora.getDate())}T${pad2(agora.getHours())}:${pad2(agora.getMinutes())}:${pad2(agora.getSeconds())}${offset}`;

        let query = supabase
            .from('reservas')
            .update({
                cancelado: true,
                motivo_cancelamento: motivo,
                datacancelamento: dataCanc
            });

        if (escopo === 'single') {
            query = query.eq('id', eventoSelecionadoNoModal.id);
        } else {
            query = query.eq('groupid', groupId).eq('cancelado', false);
            if (escopo === 'future' && eventoSelecionadoNoModal.start) {
                query = query.gte('start_time', eventoSelecionadoNoModal.start.toISOString());
            }
        }

        const { error } = await query;
        if (error) throw error;

        fecharModal();
        if (typeof atualizarTodasTelas === 'function') atualizarTodasTelas();
        showToast('Agendamento cancelado com sucesso');
    } catch (err) {
        console.error('Erro ao cancelar:', err);
        showToast('Erro ao cancelar: ' + (err.message || err), 'error');
    }
}

/**
 * Restaura um evento cancelado (soft delete)
 */
export async function restaurarEvento(id, atualizarTodasTelas) {
    if (!id) return;

    const { confirmado } = await showConfirmModal(
        'Deseja restaurar este agendamento?',
        'O evento voltará a aparecer no calendário e nas listas de agendamentos ativos.'
    );

    if (!confirmado) return;

    try {
        const { error } = await supabase
            .from('reservas')
            .update({
                cancelado: false,
                motivo_cancelamento: null,
                datacancelamento: null
            })
            .eq('id', id);

        if (error) throw error;

        showToast('Agendamento restaurado com sucesso');
        if (typeof atualizarTodasTelas === 'function') atualizarTodasTelas();
        if (typeof recarregarDados === 'function') recarregarDados();
    } catch (err) {
        console.error('Erro ao restaurar:', err);
        showToast('Erro ao restaurar: ' + (err.message || err), 'error');
    }
}

export function abrirModalFormulario(dataInicial = null) {
    const modal = document.getElementById('modalFormAgendamento');
    const form = document.getElementById('reservaForm');
    if (!modal || !form) return;

    form.reset();
    document.getElementById('editEventId').value = '';
    document.getElementById('editGroupId').value = '';
    document.getElementById('formTitleModal').innerHTML = '<i class="fas fa-plus-circle"></i> Novo Agendamento';
    document.getElementById('btnSalvar').innerHTML = '<i class="fas fa-check"></i> Confirmar Agendamento';

    document.querySelectorAll('input[name="espaco"]').forEach(cb => {
        cb.checked = false;
        cb.closest('.checkbox-card')?.classList.remove('checked');
    });

    resetRecorrenciaFormulario();

    document.getElementById('datasContainer').innerHTML = '';
    adicionarLinhaData(dataInicial);

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

export function fecharModalForm() {
    const modal = document.getElementById('modalFormAgendamento');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

export function fecharModal() {
    const modal = document.getElementById('eventModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

export function prepararEdicao() {
    if (!eventoSelecionadoNoModal) return;
    const ev = eventoSelecionadoNoModal;
    const props = ev.extendedProps;

    if (window.estadoGlobal) {
        const estado = window.estadoGlobal;
        const isDono = estado.nivelAcesso === 'dono';
        const isCriador = props.criadoPor === estado.usuarioLogado?.email;
        if (!isDono && !(estado.nivelAcesso === 'editor' && isCriador)) {
            showToast('Acesso negado: Você só pode editar seus próprios agendamentos', 'error');
            return;
        }
    }

    fecharModal();

    document.getElementById('editEventId').value = ev.id;
    document.getElementById('editGroupId').value = props.groupId || '';
    document.getElementById('formTitleModal').innerHTML = '<i class="fas fa-edit"></i> Editar Agendamento';
    document.getElementById('btnSalvar').innerHTML = '<i class="fas fa-save"></i> Salvar Alterações';
    document.getElementById('titulo').value = props.tituloPuro || ev.title;
    document.getElementById('responsavel').value = props.responsavel || '';
    document.getElementById('contatoWhats').value = props.contatoWhats || '';
    document.getElementById('contatoEmail').value = props.contatoEmail || '';

    document.querySelectorAll('input[name="espaco"]').forEach(cb => {
        cb.checked = (props.espacos || [props.espaco]).includes(cb.value);
        if (cb.checked) cb.closest('.checkbox-card')?.classList.add('checked');
    });

    resetRecorrenciaFormulario();

    document.getElementById('datasContainer').innerHTML = '';
    adicionarLinhaData();

    const row = document.querySelector('.data-row-styled');
    if (row && ev.start) {
        const dataIni = new Date(ev.start.getTime() - (ev.start.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        const horaIni = ev.start.toTimeString().slice(0, 5);
        const horaFim = ev.end ? ev.end.toTimeString().slice(0, 5) : horaIni;

        if (row.querySelector('.flatpickr')._flatpickr) {
            row.querySelector('.flatpickr')._flatpickr.setDate(dataIni);
        } else {
            row.querySelector('.flatpickr').value = dataIni;
        }
        row.querySelectorAll('.input-time')[0].value = horaIni;
        row.querySelectorAll('.input-time')[1].value = horaFim;
    }

    document.getElementById('modalFormAgendamento').classList.add('active');
    document.body.style.overflow = 'hidden';
}

export function adicionarLinhaData(dataEspecifica = null) {
    const container = document.getElementById('datasContainer');
    if (!container) return;

    const id = Date.now() + Math.floor(Math.random() * 1000);
    const row = document.createElement('div');
    row.className = 'data-row-styled';
    row.innerHTML = `
        <div class="date-input-group">
            <label>Data</label>
            <input type="text" class="input-date flatpickr" id="data_${id}" required placeholder="Selecione">
        </div>
        <div class="time-inputs">
            <div class="time-input">
                <label>Início</label>
                <input type="time" class="input-time" value="08:00" required>
            </div>
            <div class="time-input">
                <label>Término</label>
                <input type="time" class="input-time" value="10:00" required>
            </div>
        </div>
        <button type="button" class="btn-remove-data" title="Remover data"><i class="fas fa-times"></i></button>
    `;

    container.appendChild(row);

    if (typeof flatpickr === 'function') {
        flatpickr(`#data_${id}`, {
            locale: Portuguese,
            dateFormat: 'Y-m-d',
            altInput: true,
            altFormat: 'd/m/Y',
            defaultDate: dataEspecifica || 'today',
            disable: [(date) => date.getDay() === 0]
        });
    }

    row.querySelector('.btn-remove-data').addEventListener('click', () => {
        if (container.querySelectorAll('.data-row-styled').length > 1) {
            row.remove();
        } else {
            showToast('O agendamento deve ter pelo menos uma data', 'warning');
        }
    });
}

function bindRecorrenciaListeners() {
    const chk = document.getElementById('recorrenciaAtiva');
    const freq = document.getElementById('recorrenciaFrequencia');

    chk?.addEventListener('change', atualizarUIRecorrencia);
    freq?.addEventListener('change', atualizarUIRecorrencia);

    document.querySelectorAll('input[name="recorrenciaDiaSemana"]').forEach(cb => {
        cb.addEventListener('change', () => {
            cb.closest('.checkbox-card')?.classList.toggle('checked', cb.checked);
        });
    });

    atualizarUIRecorrencia();
}

/**
 * Funções exportadas para o objeto global window
 */
export function initReservasWindow(atualizarTodasTelas) {
    window.abrirModalFormulario = abrirModalFormulario;
    window.adicionarLinhaData = adicionarLinhaData;
    window.fecharModalForm = fecharModalForm;
    window.fecharModal = fecharModal;
    window.prepararEdicao = prepararEdicao;
    window.restaurarEvento = (id) => restaurarEvento(id, atualizarTodasTelas);

    window.prepararEdicaoPorId = (id) => {
        eventoSelecionadoNoModal = calendar.getEventById(id);
        prepararEdicao();
    };

    window.deletarPorId = async (id) => {
        eventoSelecionadoNoModal = calendar.getEventById(id);
        await deletarEvento(atualizarTodasTelas);
    };

    window.setEventoSelecionado = (ev) => {
        eventoSelecionadoNoModal = ev;
    };

    bindRecorrenciaListeners();
}
