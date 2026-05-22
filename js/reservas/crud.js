// js/reservas/crud.js - operações CRUD de reservas (salvar, deletar, restaurar)
import { supabase } from '../../supabaseClient.js';
import { calendar, getCorPorEspaco, recarregarDados } from '../calendar.js';
import { frontendParaDb } from '../db.js';
import {
    showToast,
    showSuccessModal,
    showConflictModal,
    showConfirmModal,
    showCancelMotivModal,
    showSeriesActionModal
} from '../utils.js';
import { gerarUuid, montarSessao, pad2 } from './datas.js';
import {
    coletarSessoesDoFormulario,
    validarHorarios,
    obterConfigRecorrencia,
    gerarSessoesRecorrentes
} from './recorrencia.js';
import { carregarSeriePorEscopo, carregarEventosConflito, detectarConflitos } from './deteccao-conflitos.js';
import { getSalvando, setSalvando, getEventoSelecionado } from './estado-modulo.js';
import { fecharModalForm, fecharModal } from './modais-basicos.js';

/**
 * Salva um novo agendamento ou atualiza um existente
 */
export async function salvarOuEditarEvento(e, estado, atualizarTodasTelas) {
    if (e) e.preventDefault();
    if (getSalvando()) return;
    setSalvando(true);

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
        setSalvando(false);
    }
}

/**
 * Exclui (soft delete) o evento selecionado
 */
export async function deletarEvento(atualizarTodasTelas) {
    if (!getEventoSelecionado()) return;

    const estado = window.estadoGlobal || null;

    if (estado) {
        const isDono = estado.nivelAcesso === 'dono';
        const isCriador = getEventoSelecionado().extendedProps?.criadoPor === estado.usuarioLogado?.email;
        if (!isDono && !(estado.nivelAcesso === 'editor' && isCriador)) {
            showToast('Acesso negado: Você só pode excluir seus próprios agendamentos', 'error');
            return;
        }
    }

    const tituloEvento = getEventoSelecionado().extendedProps?.tituloPuro || getEventoSelecionado().title || 'este agendamento';
    const { confirmado, motivo } = await showCancelMotivModal(tituloEvento);
    if (!confirmado) return;

    let escopo = 'single';
    const groupId = getEventoSelecionado().extendedProps?.groupId;
    if (groupId) {
        escopo = await showSeriesActionModal('excluir');
        if (escopo === 'cancel') return;
    }

    try {
        if (groupId && escopo !== 'single' && estado?.nivelAcesso !== 'dono') {
            const eventosSerieEscopo = await carregarSeriePorEscopo(groupId, escopo, getEventoSelecionado().start);
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
                datacancelamento: dataCanc,
                canceladopor: estado?.usuarioLogado?.email
            });

        if (escopo === 'single') {
            query = query.eq('id', getEventoSelecionado().id);
        } else {
            query = query.eq('groupid', groupId).eq('cancelado', false);
            if (escopo === 'future' && getEventoSelecionado().start) {
                query = query.gte('start_time', getEventoSelecionado().start.toISOString());
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
