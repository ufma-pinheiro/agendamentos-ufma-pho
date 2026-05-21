// js/utils/modais-prompt.js - modais de confirmacao e entrada de usuario

import { escapeHtml } from './helpers.js';

/**
 * Exibe modal de confirmação genérico.
 * @param {string} titulo
 * @param {string} mensagem
 * @returns {Promise<boolean>}
 */
export function showConfirmModal(titulo, mensagem) {
    return new Promise(resolve => {
        const existing = document.getElementById('infoModalOverlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'infoModalOverlay';
        overlay.className = 'info-modal-overlay';
        overlay.innerHTML = `
            <div class="info-modal conflict" role="dialog" aria-modal="true">
                <div class="info-modal-icon conflict">
                    <i class="fas fa-question-circle"></i>
                </div>
                <h2 class="info-modal-title">${escapeHtml(titulo)}</h2>
                <p class="info-modal-subtitle">${escapeHtml(mensagem)}</p>
                <div class="info-modal-actions" style="margin-top: 1.5rem;">
                    <button class="info-modal-btn secondary" id="btnCancelConfirm">Cancelar</button>
                    <button class="info-modal-btn danger" id="btnConfirmAction">Sim, Confirmar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('visible'));

        const close = (result) => {
            overlay.classList.remove('visible');
            setTimeout(() => {
                overlay.remove();
                resolve(result);
            }, 300);
        };

        document.getElementById('btnCancelConfirm').addEventListener('click', () => close(false));
        document.getElementById('btnConfirmAction').addEventListener('click', () => close(true));
        overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });
    });
}

/**
 * Exibe modal para escolher escopo de operacao em serie.
 * @param {'editar'|'excluir'} acao
 * @returns {Promise<'single'|'future'|'all'|'cancel'>}
 */
export function showSeriesActionModal(acao = 'excluir') {
    const titulo = acao === 'editar' ? 'Editar Série de Agendamentos' : 'Excluir Série de Agendamentos';
    const mensagem = acao === 'editar'
        ? 'Este evento faz parte de uma série recorrente. Escolha o escopo da alteração:'
        : 'Este evento faz parte de uma série recorrente. Escolha o escopo do cancelamento:';

    const ctaSingle = acao === 'editar' ? 'Editar apenas este evento' : 'Cancelar apenas este evento';
    const ctaFuture = acao === 'editar' ? 'Editar este e os próximos' : 'Cancelar este e os próximos';
    const ctaAll = acao === 'editar' ? 'Editar toda a série' : 'Cancelar toda a série';

    return new Promise(resolve => {
        const existing = document.getElementById('infoModalOverlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'infoModalOverlay';
        overlay.className = 'info-modal-overlay';
        overlay.innerHTML = `
            <div class="info-modal conflict" role="dialog" aria-modal="true">
                <div class="info-modal-icon conflict">
                    <i class="fas fa-layer-group"></i>
                </div>
                <h2 class="info-modal-title">${escapeHtml(titulo)}</h2>
                <p class="info-modal-subtitle">${escapeHtml(mensagem)}</p>
                <div class="info-modal-actions" style="display:grid; gap:0.625rem; margin-top:1rem;">
                    <button class="info-modal-btn secondary" id="btnSeriesSingle">${escapeHtml(ctaSingle)}</button>
                    <button class="info-modal-btn secondary" id="btnSeriesFuture">${escapeHtml(ctaFuture)}</button>
                    <button class="info-modal-btn danger" id="btnSeriesAll">${escapeHtml(ctaAll)}</button>
                    <button class="info-modal-btn secondary" id="btnSeriesCancel">Voltar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('visible'));

        const close = (result) => {
            overlay.classList.remove('visible');
            setTimeout(() => {
                overlay.remove();
                resolve(result);
            }, 300);
        };

        document.getElementById('btnSeriesSingle').addEventListener('click', () => close('single'));
        document.getElementById('btnSeriesFuture').addEventListener('click', () => close('future'));
        document.getElementById('btnSeriesAll').addEventListener('click', () => close('all'));
        document.getElementById('btnSeriesCancel').addEventListener('click', () => close('cancel'));
        overlay.addEventListener('click', e => { if (e.target === overlay) close('cancel'); });
    });
}

/**
 * Exibe modal de cancelamento com campo de motivo obrigatório.
 * @param {string} tituloEvento - Nome do agendamento a ser cancelado
 * @returns {Promise<{confirmado: boolean, motivo: string}>}
 */
export function showCancelMotivModal(tituloEvento) {
    return new Promise(resolve => {
        const existing = document.getElementById('infoModalOverlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'infoModalOverlay';
        overlay.className = 'info-modal-overlay';
        overlay.innerHTML = `
            <div class="info-modal cancel-modal" role="dialog" aria-modal="true" aria-labelledby="cancelModalTitle">
                <div class="info-modal-icon conflict">
                    <i class="fas fa-trash-alt"></i>
                </div>
                <h2 class="info-modal-title" id="cancelModalTitle">Cancelar Agendamento</h2>
                <p class="info-modal-subtitle">
                    Você está prestes a cancelar <strong>${escapeHtml(tituloEvento)}</strong>.<br>
                    Esta ação não pode ser desfeita.
                </p>
                <div class="cancel-motiv-field">
                    <label for="cancelMotivoInput" class="cancel-motiv-label">
                        <i class="fas fa-comment-alt"></i> Motivo do Cancelamento <span class="required-star">*</span>
                    </label>
                    <textarea
                        id="cancelMotivoInput"
                        class="cancel-motiv-textarea"
                        placeholder="Descreva o motivo do cancelamento (mínimo 10 caracteres)..."
                        maxlength="200"
                        rows="3"
                    ></textarea>
                    <div class="cancel-motiv-counter">
                        <span id="cancelMotivoCounter">0</span>/200 caracteres
                        <span id="cancelMotivoHint" class="cancel-motiv-hint">Mínimo 10 caracteres</span>
                    </div>
                </div>
                <div class="info-modal-actions" style="margin-top: 1rem;">
                    <button class="info-modal-btn secondary" id="btnCancelMotivCancel">Voltar</button>
                    <button class="info-modal-btn danger" id="btnCancelMotivConfirm" disabled>
                        <i class="fas fa-trash-alt"></i> Confirmar Exclusão
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('visible'));

        const textarea = document.getElementById('cancelMotivoInput');
        const btnConfirm = document.getElementById('btnCancelMotivConfirm');
        const counter = document.getElementById('cancelMotivoCounter');
        const hint = document.getElementById('cancelMotivoHint');

        textarea.addEventListener('input', () => {
            const len = textarea.value.trim().length;
            counter.textContent = textarea.value.length;
            if (len >= 10) {
                btnConfirm.disabled = false;
                hint.textContent = '✓ Motivo válido';
                hint.classList.add('valid');
            } else {
                btnConfirm.disabled = true;
                hint.textContent = `Mínimo 10 caracteres (${10 - len} restantes)`;
                hint.classList.remove('valid');
            }
        });

        const close = (confirmado, motivo = '') => {
            overlay.classList.remove('visible');
            setTimeout(() => {
                overlay.remove();
                resolve({ confirmado, motivo });
            }, 300);
        };

        document.getElementById('btnCancelMotivCancel').addEventListener('click', () => close(false));
        btnConfirm.addEventListener('click', () => close(true, textarea.value.trim()));
        overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });

        // Foco automático no textarea
        setTimeout(() => textarea.focus(), 350);
    });
}
