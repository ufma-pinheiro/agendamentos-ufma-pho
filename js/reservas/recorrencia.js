// js/reservas/recorrencia.js - lógica de recorrência e coleta de sessões do formulário
import { montarSessao, pad2, formatDateYmd, parseYmdToUtcDate } from './datas.js';
import { MAX_OCORRENCIAS_RECORRENCIA } from './estado-modulo.js';
import { showToast } from '../utils.js';

export function coletarSessoesDoFormulario() {
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

export function validarHorarios(sessoes) {
    for (const sess of sessoes) {
        const ini = new Date(sess.start).getTime();
        const fim = new Date(sess.end).getTime();
        if (fim <= ini) return false;
    }
    return true;
}

export function obterConfigRecorrencia() {
    const ativa = Boolean(document.getElementById('recorrenciaAtiva')?.checked);
    const frequencia = document.getElementById('recorrenciaFrequencia')?.value || 'weekly';
    const dataFim = document.getElementById('recorrenciaFim')?.value || '';
    const diasSemana = Array.from(document.querySelectorAll('input[name="recorrenciaDiaSemana"]:checked'))
        .map(cb => Number(cb.value));
    return { ativa, frequencia, dataFim, diasSemana };
}

export function atualizarUIRecorrencia() {
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

export function resetRecorrenciaFormulario() {
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

export function gerarSessoesRecorrentes(sessaoBase, config) {
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

export function bindRecorrenciaListeners() {
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
