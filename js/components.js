import { escapeHtml } from './utils.js';
import { mesesAbrev } from './constants.js';
import { getClasseBadge } from './calendar.js';

/**
 * Gera o HTML de um card de evento (event-row) reutilizável.
 * Centraliza a lógica visual e de permissões para garantir consistência em todo o sistema.
 * 
 * @param {Object} ev - Evento formatado para o frontend (dbParaFrontend)
 * @param {Object} estado - Estado global para checagem de permissões
 * @returns {string} HTML string
 */
export function gerarCardEventoHtml(ev, estado) {
    const agora = new Date();
    const inicio = new Date(ev.start);
    const fim = ev.end ? new Date(ev.end) : null;
    const dia = inicio.getDate().toString().padStart(2, '0');
    const mes = mesesAbrev[inicio.getMonth()];
    
    const isCancelado = !!ev.extendedProps.cancelado;
    const passado = !isCancelado && (ev.end || ev.start) < agora;
    
    const horaInicio = inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const horaFim = fim ? fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
    const periodo = horaFim ? `${horaInicio} - ${horaFim}` : `A partir das ${horaInicio}`;
    
    const espacos = ev.extendedProps.espacos || [ev.extendedProps.espaco] || [];
    const cor = isCancelado ? '#ef4444' : (ev.backgroundColor || ev.color || '#3b82f6');
    const badgeConflito = ev.extendedProps.isConflito ? `<span class="badge-conflito"><i class="fas fa-exclamation"></i> Conflito</span>` : '';
    
    // Badge de cancelamento
    let badgeCancelamento = '';
    let blocoMotivo = '';
    if (isCancelado) {
        const dataCanc = ev.extendedProps.datacancelamento ? new Date(ev.extendedProps.datacancelamento).toLocaleDateString('pt-BR') : '';
        badgeCancelamento = `<span class="badge-cancelado"><i class="fas fa-times-circle"></i> Cancelado em ${dataCanc}</span>`;
        blocoMotivo = `
            <div class="cancel-reason-row">
                <i class="fas fa-comment-slash"></i>
                <span><strong>Motivo:</strong> ${escapeHtml(ev.extendedProps.motivo_cancelamento || 'Não informado')}</span>
            </div>`;
    }

    // Determinando se o usuário pode editar/excluir
    const isDono = estado.nivelAcesso === 'dono';
    const isCriador = ev.extendedProps.criadoPor === estado.usuarioLogado?.email;
    const podeAgir = !isCancelado && !ev.extendedProps.isFeriado && (isDono || (estado.nivelAcesso === 'editor' && isCriador));

    return `
        <div class="event-row ${passado ? 'past' : ''} ${isCancelado ? 'cancelled' : ''}" style="--event-color: ${cor}">
            <div class="event-date-box" style="background: ${cor}15; color: ${cor};">
                <span class="day">${dia}</span>
                <span class="month">${mes}</span>
            </div>
            <div class="event-content" onclick="window.abrirDetalhes(window.getCalendar()?.getEventById('${ev.id}') || ${JSON.stringify(ev).replace(/"/g, '&quot;')})">
                <div class="event-header-row">
                    <h4>${escapeHtml(ev.extendedProps.tituloPuro || ev.title)}</h4>
                    ${badgeConflito}
                    ${badgeCancelamento}
                </div>
                <div class="event-meta">
                    <span><i class="far fa-clock"></i> ${periodo}</span>
                    <span><i class="far fa-user"></i> ${escapeHtml(ev.extendedProps.responsavel) || '-'}</span>
                </div>
                <div class="event-locais">
                    ${espacos.map(e => `<span class="tag-local-mini ${getClasseBadge(e)}">${escapeHtml(e)}</span>`).join('')}
                </div>
                ${blocoMotivo}
            </div>
            ${podeAgir ? `
            <div class="event-actions">
                <button class="btn-icon-sm" onclick="event.stopPropagation(); window.prepararEdicaoPorId('${ev.id}')" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn-icon-sm danger" onclick="event.stopPropagation(); window.deletarPorId('${ev.id}')" title="Excluir"><i class="fas fa-trash"></i></button>
            </div>` : ''}
        </div>`;
}
