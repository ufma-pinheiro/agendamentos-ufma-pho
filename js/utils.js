/**
 * js/utils.js
 * Funções utilitárias puras — sem dependências de estado ou DOM de aplicação.
 * Extraído de app.js como parte da modularização (ARCH-001).
 */

// ==========================================
// UTILITÁRIOS DE UI
// ==========================================

export function showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}"></i>
        </div>
        <div class="toast-content">
            <span>${message}</span>
        </div>
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });
    setTimeout(() => {
        toast.style.transform = 'translateY(20px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

export function setButtonLoading(btn, loading = true) {
    if (loading) {
        btn.dataset.originalHtml = btn.innerHTML;
        btn.innerHTML = '<div class="spinner-inline"></div>';
        btn.disabled = true;
    } else {
        btn.innerHTML = btn.dataset.originalHtml;
        btn.disabled = false;
    }
}

export function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.style.display = 'none', 300);
    }
}

// ==========================================
// UTILITÁRIOS DE LÓGICA
// ==========================================

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => { clearTimeout(timeout); func(...args); };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==========================================
// UTILITÁRIOS DE COR / STRING
// ==========================================

export function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
}

export function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color =>
        ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)
    );
}

/**
 * Sanitiza strings de dados do usuário para uso seguro em innerHTML.
 * Previne XSS convertendo caracteres especiais em entidades HTML.
 */
export function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ==========================================
// MODAIS INFORMATIVOS NATIVOS
// ==========================================

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
                        <strong>${escapeHtml(c.extendedProps.tituloPuro || c.title)}</strong>
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
