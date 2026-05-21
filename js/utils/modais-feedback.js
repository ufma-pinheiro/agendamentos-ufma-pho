// js/utils/modais-feedback.js - modais informativos de sucesso e conflito

import { escapeHtml } from './helpers.js';

/**
 * Exibe modal de sucesso com detalhes do agendamento.
 * @param {Object} dados - { titulo, responsavel, espacos, sessoes }
 */
export function showSuccessModal(dados) {
    const existing = document.getElementById('infoModalOverlay');
    if (existing) existing.remove();

    const title = dados.modalTitle || 'Agendamento Confirmado!';
    const subtitle = dados.modalSubtitle || 'Sua reserva foi registrada com sucesso.';

    const formatDate = (isoStr) => {
        const d = new Date(isoStr);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    const formatTime = (isoStr) => {
        const d = new Date(isoStr);
        return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const getBadgeClass = (nome) => {
        const n = nome || "";
        if (n.includes("Engenharia")) return "badge-eng";
        if (n.includes("Saúde")) return "badge-sau";
        if (n.includes("Licenciaturas")) return "badge-lic";
        return "badge-outros";
    };

    // Sanitiza o nome do local para uso seguro em classes CSS (remove espaços e caracteres especiais)
    const sanitizeClass = (str) => str.replace(/[^a-z0-9_-]/gi, '');

    const espacosHtml = dados.espacos.map(esp => `
        <span class="tag-local tag-local-modal ${sanitizeClass(getBadgeClass(esp))}">
            <i class="fas fa-map-marker-alt"></i> ${escapeHtml(esp)}
        </span>`).join('');

    const sessoesHtml = dados.sessoes.map(s => `
        <div class="info-modal-session">
            <i class="fas fa-calendar-day"></i>
            <span>${escapeHtml(formatDate(s.start))}</span>
            <span class="info-modal-time">${escapeHtml(formatTime(s.start))} – ${escapeHtml(formatTime(s.end))}</span>
        </div>`).join('');

    const overlay = document.createElement('div');
    overlay.id = 'infoModalOverlay';
    overlay.className = 'info-modal-overlay';
    overlay.innerHTML = `
        <div class="info-modal success" role="dialog" aria-modal="true" aria-labelledby="infoModalTitle">
            <div class="info-modal-icon success">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2 class="info-modal-title" id="infoModalTitle">${escapeHtml(title)}</h2>
            <p class="info-modal-subtitle">${escapeHtml(subtitle)}</p>
            <div class="info-modal-details">
                <div class="info-modal-row">
                    <span class="info-modal-label"><i class="fas fa-heading"></i> Evento</span>
                    <span class="info-modal-value">${escapeHtml(dados.titulo)}</span>
                </div>
                <div class="info-modal-row">
                    <span class="info-modal-label"><i class="fas fa-user-tie"></i> Responsável</span>
                    <span class="info-modal-value">${escapeHtml(dados.responsavel)}</span>
                </div>
                <div class="info-modal-row full">
                    <span class="info-modal-label"><i class="fas fa-map-marker-alt"></i> Locais</span>
                    <div class="info-modal-badges">
                        ${espacosHtml}
                    </div>
                </div>
                <div class="info-modal-row full">
                    <span class="info-modal-label"><i class="fas fa-clock"></i> Horários</span>
                    <div class="info-modal-sessions">
                        ${sessoesHtml}
                    </div>
                </div>
            </div>
            <button class="info-modal-btn success" id="btnConfirmSuccess">Entendido</button>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    const close = () => {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 300);
    };
    document.getElementById('btnConfirmSuccess').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}

/**
 * Exibe modal de conflito e retorna Promise<boolean> (true = forçar, false = cancelar).
 * @param {Array} conflitos - lista de eventos FullCalendar em conflito
 * @param {Object} dadosPendentes - { titulo, responsavel, espacos, sessoes }
 */
export function showConflictModal(conflitos, dadosPendentes) {
    return new Promise(resolve => {
        const existing = document.getElementById('infoModalOverlay');
        if (existing) existing.remove();

        const formatDate = (isoStr) => {
            const d = new Date(isoStr);
            return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        };
        const formatTime = (isoStr) => {
            const d = new Date(isoStr);
            return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        };

        const getBadgeClass = (nome) => {
            const n = nome || "";
            if (n.includes("Engenharia")) return "badge-eng";
            if (n.includes("Saúde")) return "badge-sau";
            if (n.includes("Licenciaturas")) return "badge-lic";
            return "badge-outros";
        };

        const espacosHtml = dadosPendentes.espacos.map(esp => `
            <span class="tag-local tag-local-modal ${getBadgeClass(esp)}">
                <i class="fas fa-map-marker-alt"></i> ${escapeHtml(esp)}
            </span>`).join('');

        const conflitosHtml = conflitos.map(c => {
            const locais = c.extendedProps.espacos || [c.extendedProps.espaco];
            const locaisBadges = locais.map(esp => `
                <span class="tag-local tag-local-modal tag-local-conflict ${getBadgeClass(esp)}">
                    <i class="fas fa-map-marker-alt"></i> ${escapeHtml(esp)}
                </span>`).join('');

            return `
            <div class="info-modal-conflict-item">
                <div class="conflict-bar"></div>
                <div class="conflict-info">
                    <div class="conflict-header">
                        <strong class="conflict-title">${escapeHtml(c.extendedProps.tituloPuro || c.title)}</strong>
                        <span class="conflict-time"><i class="far fa-clock"></i> ${formatTime(c.start)} – ${formatTime(c.end)}</span>
                    </div>
                    <div class="conflict-locais">${locaisBadges}</div>
                </div>
            </div>`;
        }).join('');

        const sessoesHtml = dadosPendentes.sessoes.map(s => `
            <div class="info-modal-session">
                <i class="fas fa-calendar-day"></i>
                <span>${escapeHtml(formatDate(s.start))}</span>
                <span class="info-modal-time">${escapeHtml(formatTime(s.start))} – ${escapeHtml(formatTime(s.end))}</span>
            </div>`).join('');

        const overlay = document.createElement('div');
        overlay.id = 'infoModalOverlay';
        overlay.className = 'info-modal-overlay';
        overlay.innerHTML = `
            <div class="info-modal conflict" role="dialog" aria-modal="true" aria-labelledby="infoModalTitle">
                <div class="info-modal-icon conflict">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2 class="info-modal-title" id="infoModalTitle">Conflito Detectado</h2>
                <p class="info-modal-subtitle">O agendamento abaixo conflita com <strong>${conflitos.length}</strong> evento(s) existente(s).</p>

                <div class="info-modal-details">
                    <div class="info-modal-row">
                        <span class="info-modal-label"><i class="fas fa-heading"></i> Seu Evento</span>
                        <span class="info-modal-value">${escapeHtml(dadosPendentes.titulo)}</span>
                    </div>
                    <div class="info-modal-row">
                        <span class="info-modal-label"><i class="fas fa-user-tie"></i> Responsável</span>
                        <span class="info-modal-value">${escapeHtml(dadosPendentes.responsavel)}</span>
                    </div>
                    <div class="info-modal-row full">
                        <span class="info-modal-label"><i class="fas fa-map-marker-alt"></i> Locais Solicitados</span>
                        <div class="info-modal-badges">
                            ${espacosHtml}
                        </div>
                    </div>
                    <div class="info-modal-row full">
                        <span class="info-modal-label"><i class="fas fa-clock"></i> Data(s) Solicitada(s)</span>
                        <div class="info-modal-sessions">${sessoesHtml}</div>
                    </div>
                    <div class="info-modal-row full">
                        <span class="info-modal-label"><i class="fas fa-times-circle"></i> Em Conflito Com</span>
                        <div class="info-modal-conflicts-list">${conflitosHtml}</div>
                    </div>
                </div>

                <div class="info-modal-actions">
                    <button class="info-modal-btn secondary" id="btnCancelConflict">Voltar e Corrigir</button>
                    <button class="info-modal-btn danger" id="btnForceConflict">Forçar Mesmo Assim</button>
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

        document.getElementById('btnCancelConflict').addEventListener('click', () => close(false));
        document.getElementById('btnForceConflict').addEventListener('click', () => close(true));
        overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });
    });
}
