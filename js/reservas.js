// js/reservas.js - Gerenciamento de Reservas e Eventos (CRUD)
import { supabase } from '../supabaseClient.js';
import { calendar, getCorPorEspaco, getClasseBadge, buscarDadosMensais, recarregarDados } from './calendar.js';
import { frontendParaDb, dbParaFrontend } from './db.js';
import { showToast, escapeHtml } from './utils.js';

let _salvando = false;
let eventoSelecionadoNoModal = null;

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
        const titulo = document.getElementById('titulo').value;
        const responsavel = document.getElementById('responsavel').value;
        const contatoWhats = document.getElementById('contatoWhats').value;
        const contatoEmail = document.getElementById('contatoEmail').value;

        const espacos = Array.from(document.querySelectorAll('input[name="espaco"]:checked')).map(cb => cb.value);
        if (espacos.length === 0) { 
            showToast('Selecione pelo menos um espaço', 'error'); 
            if (typeof window.setButtonLoading === 'function') window.setButtonLoading(btn, false); 
            _salvando = false;
            return; 
        }

        const sessoes = [];
        document.querySelectorAll('.data-row-styled').forEach(row => {
            const dataInput = row.querySelector('.flatpickr');
            const data = dataInput ? dataInput.value : '';
            const times = row.querySelectorAll('.input-time');
            const horaIni = times[0]?.value;
            const horaFim = times[1]?.value;
            if (data && horaIni && horaFim) sessoes.push({ start: `${data}T${horaIni}`, end: `${data}T${horaFim}` });
        });

        if (sessoes.length === 0) { 
            showToast('Adicione pelo menos uma data válida', 'error'); 
            if (typeof window.setButtonLoading === 'function') window.setButtonLoading(btn, false); 
            _salvando = false;
            return; 
        }

        // Validação de horário
        for (const sess of sessoes) {
            const ini = new Date(sess.start).getTime();
            const fim = new Date(sess.end).getTime();
            if (fim <= ini) {
                showToast('O horário de término deve ser posterior ao de início', 'error');
                if (typeof window.setButtonLoading === 'function') window.setButtonLoading(btn, false);
                _salvando = false;
                return;
            }
        }

        // Checagem de conflitos
        const conflitos = [];
        sessoes.forEach(sess => {
            const ini = new Date(sess.start).getTime();
            const fim = new Date(sess.end).getTime();
            calendar.getEvents().forEach(ev => {
                if (editId && ev.id === editId) return;
                if (ev.extendedProps.isFeriado) return;
                const evEspacos = ev.extendedProps.espacos || [ev.extendedProps.espaco];
                const comum = espacos.filter(e => evEspacos.includes(e));
                if (comum.length === 0) return;
                const evIni = ev.start.getTime();
                const evFim = ev.end ? ev.end.getTime() : evIni + 3600000;
                if (ini < evFim && fim > evIni) conflitos.push(ev);
            });
        });

        let forcar = false;
        if (conflitos.length > 0) {
            const result = await Swal.fire({
                title: 'Conflitos detectados',
                html: `<p style="margin-bottom:15px">Este agendamento conflita com <b>${conflitos.length}</b> evento(s) existente(s).</p>
                       <div style="text-align:left;max-height:150px;overflow:auto;background:#f8f9fa;padding:10px;border-radius:8px;">
                       ${conflitos.map(c => `<div style="padding:5px;border-left:3px solid #e74c3c;margin:5px 0;padding-left:8px;">
                            <b>${escapeHtml(c.extendedProps.tituloPuro)}</b><br><small>${(c.extendedProps.espacos || [c.extendedProps.espaco]).map(escapeHtml).join(', ')}</small>
                       </div>`).join('')}</div>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Forçar mesmo assim',
                cancelButtonText: 'Voltar e corrigir',
                confirmButtonColor: '#e74c3c'
            });
            if (!result.isConfirmed) { 
                if (typeof window.setButtonLoading === 'function') window.setButtonLoading(btn, false); 
                _salvando = false;
                return; 
            }
            forcar = true;
        }

        const cor = getCorPorEspaco(espacos);
        const groupId = editId ? document.getElementById('editGroupId').value : `GRP-${Date.now()}`;
        const timestamp = Date.now();
        const criadoPor = estado.usuarioLogado.email;

        // Se editando, deletar o antigo antes de inserir os novos (ou atualizar se fosse 1:1, mas aqui pode mudar o número de sessões)
        if (editId) {
            const antigo = calendar.getEventById(editId);
            if (antigo) antigo.remove();
            await supabase.from('reservas').delete().eq('id', editId);
        }

        // Inserir novas sessões
        for (let i = 0; i < sessoes.length; i++) {
            const dadosFrontend = {
                title: titulo,
                tituloPuro: titulo,
                start: sessoes[i].start,
                end: sessoes[i].end,
                espacos: espacos,
                responsavel: responsavel,
                contatoWhats: contatoWhats,
                contatoEmail: contatoEmail,
                color: cor,
                isConflito: forcar,
                groupId: groupId,
                dataCriacao: timestamp + i,
                criadoPor: criadoPor
            };

            const dadosDb = frontendParaDb(dadosFrontend);
            const { error } = await supabase.from('reservas').insert(dadosDb);

            if (error) throw error;
        }

        fecharModalForm();
        if (typeof atualizarTodasTelas === 'function') atualizarTodasTelas();
        showToast(editId ? 'Agendamento atualizado!' : 'Agendamento criado com sucesso!');

    } catch (error) {
        console.error("Erro ao salvar:", error);
        showToast('Erro ao salvar: ' + (error.message || error), 'error');
    } finally {
        if (typeof window.setButtonLoading === 'function') window.setButtonLoading(btn, false);
        _salvando = false;
    }
}

/**
 * Exclui o evento selecionado
 */
export async function deletarEvento(atualizarTodasTelas) {
    if (!eventoSelecionadoNoModal) return;

    if (window.estadoGlobal) {
        const estado = window.estadoGlobal;
        const isDono = estado.nivelAcesso === 'dono';
        const isCriador = eventoSelecionadoNoModal.extendedProps?.criadoPor === estado.usuarioLogado?.email;
        if (!isDono && !(estado.nivelAcesso === 'editor' && isCriador)) {
            showToast('Acesso negado: Você só pode excluir seus próprios agendamentos', 'error');
            return;
        }
    }

    const result = await Swal.fire({
        title: 'Confirmar exclusão?', text: 'Esta ação não pode ser desfeita.', icon: 'warning',
        showCancelButton: true, confirmButtonText: 'Sim, excluir', cancelButtonText: 'Cancelar', confirmButtonColor: '#e74c3c'
    });
    
    if (result.isConfirmed) {
        try {
            const { error } = await supabase.from('reservas').delete().eq('id', eventoSelecionadoNoModal.id);
            if (error) throw error;

            eventoSelecionadoNoModal.remove();
            fecharModal();
            if (typeof atualizarTodasTelas === 'function') atualizarTodasTelas();
            showToast('Evento excluído com sucesso');
        } catch (e) {
            console.error("Erro ao excluir:", e);
            showToast('Erro ao excluir: ' + (e.message || e), 'error');
        }
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
    
    const id = Date.now();
    const row = document.createElement('div');
    row.className = 'data-row-styled';
    row.innerHTML = `
        <div class="date-input-group">
            <label>Data</label>
            <input type="text" class="input-date flatpickr" id="data_${id}" required placeholder="Selecione">
        </div>
        <div class="time-inputs">
            <div class="time-field">
                <label>Início</label>
                <input type="time" class="input-time" value="08:00" required>
            </div>
            <div class="time-field">
                <label>Término</label>
                <input type="time" class="input-time" value="10:00" required>
            </div>
        </div>
        <button type="button" class="btn-remove-row" title="Remover data"><i class="fas fa-times"></i></button>
    `;

    container.appendChild(row);

    if (typeof flatpickr === 'function') {
        flatpickr(`#data_${id}`, {
            locale: 'pt',
            dateFormat: 'Y-m-d',
            defaultDate: dataEspecifica || 'today',
            disable: [(date) => date.getDay() === 0]
        });
    }

    row.querySelector('.btn-remove-row').addEventListener('click', () => {
        if (container.querySelectorAll('.data-row-styled').length > 1) {
            row.remove();
        } else {
            showToast('O agendamento deve ter pelo menos uma data', 'warning');
        }
    });
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
}
