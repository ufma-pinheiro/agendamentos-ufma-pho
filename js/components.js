import { escapeHtml } from './utils.js';
import { mesesAbrev } from './constants.js';
import { getClasseBadge } from './calendar.js';

/**
 * Gera o HTML de um card de evento reutilizável.
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

    const isCancelado = !!ev.extendedProps.cancelado;
    const passado = !isCancelado && (ev.end || ev.start) < agora;

    const horaInicio = inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const horaFim = fim ? fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
    const periodo = horaFim ? `${horaInicio} - ${horaFim}` : `A partir das ${horaInicio}`;

    const espacos = ev.extendedProps.espacos || [ev.extendedProps.espaco] || [];
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

    // Determinar classe do indicador baseada na cor/campus
    const primeiroEspaco = espacos[0] || '';
    const badgeClass = getClasseBadge(primeiroEspaco); // ex: 'badge-eng', 'badge-sau', etc.
    // mapear badge-XXX → ind-XXX para o CSS do indicador
    const indClass = isCancelado ? 'ind-cancelado' : badgeClass.replace('badge-', 'ind-');

    return `
    <div class="evento ${passado ? 'past' : ''} ${isCancelado ? 'enc' : ''}"
         data-event-id="${ev.id}"
         data-event-json="${escapeHtml(JSON.stringify(ev))}">
      <div class="evento__ind ${indClass}"></div>
      <div class="evento__body event-content-clickable"
           data-event-id="${ev.id}"
           data-event-json="${escapeHtml(JSON.stringify(ev))}">
        <div class="evento__title">
          ${escapeHtml(ev.extendedProps.tituloPuro || ev.title)}
          ${badgeConflito}
          ${badgeCancelamento}
        </div>
        <div class="evento__meta">
          <span>${periodo}</span>
          <span class="sep">•</span>
          <span>${escapeHtml(ev.extendedProps.responsavel) || '-'}</span>
        </div>
        <div class="evento__tags">
          ${espacos.map(e => `<span class="tag-evento">${escapeHtml(e)}</span>`).join('')}
        </div>
        ${blocoMotivo}
      </div>
      ${podeAgir ? `
      <div class="evento__acoes">
        <button class="acao-btn" onclick="event.stopPropagation(); window.prepararEdicaoPorId('${ev.id}')" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
        <button class="acao-btn del" onclick="event.stopPropagation(); window.deletarPorId('${ev.id}')" title="Excluir">
          <i class="fas fa-trash"></i>
        </button>
      </div>` : ''}
    </div>`;
}
