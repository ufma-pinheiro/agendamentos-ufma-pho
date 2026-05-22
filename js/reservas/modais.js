// js/reservas/modais.js - abertura, fechamento e preparação de modais de reserva
import { calendar } from '../calendar.js';
import { showToast } from '../utils.js';
import { resetRecorrenciaFormulario, bindRecorrenciaListeners } from './recorrencia.js';
import { deletarEvento, restaurarEvento } from './crud.js';
import { getEventoSelecionado, setEventoSelecionado } from './estado-modulo.js';
import { fecharModalForm, fecharModal } from './modais-basicos.js';

export { fecharModalForm, fecharModal };

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

export function prepararEdicao() {
    if (!getEventoSelecionado()) return;
    const ev = getEventoSelecionado();
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
            locale: 'pt',
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
        setEventoSelecionado(calendar.getEventById(id));
        prepararEdicao();
    };

    window.deletarPorId = async (id) => {
        setEventoSelecionado(calendar.getEventById(id));
        await deletarEvento(atualizarTodasTelas);
    };

    window.setEventoSelecionado = (ev) => {
        setEventoSelecionado(ev);
    };

    bindRecorrenciaListeners();
}
