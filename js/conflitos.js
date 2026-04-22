// js/conflitos.js - Módulo de Gestão de Conflitos Globais
import { supabase } from '../supabaseClient.js';
import { dbParaFrontend } from './db.js';
import { escapeHtml } from './utils.js';
import { getClasseBadge } from './calendar.js';

/**
 * Atualiza o painel de conflitos administrativos
 */
export async function atualizarPainelConflitos() {
    const container = document.getElementById('containerConflitosAdmin');
    if (!container) return;

    try {
        const agora = new Date().toISOString();

        // 1. Buscar todos os agendamentos futuros marcados como conflito e não cancelados
        const { data: conflitos, error: errConflitos } = await supabase
            .from('reservas')
            .select('*')
            .eq('isconflito', true)
            .eq('cancelado', false)
            .gte('start_time', agora)
            .order('start_time', { ascending: true });

        if (errConflitos) throw errConflitos;

        if (!conflitos || conflitos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle" style="color: var(--success-500)"></i>
                    <h3>Tudo limpo!</h3>
                    <p>Não existem conflitos pendentes em agendamentos futuros.</p>
                </div>`;
            return;
        }

        container.innerHTML = ''; // Limpar loading

        // 2. Para cada conflito, buscar os eventos que ocupam o mesmo espaço/tempo
        for (const forcado of conflitos) {
            const { data: ocupantes, error: errOcupantes } = await supabase
                .from('reservas')
                .select('*')
                .eq('cancelado', false)
                .neq('id', forcado.id)
                .overlaps('espacos', forcado.espacos)
                .lt('start_time', forcado.end_time)
                .gt('end_time', forcado.start_time);

            if (errOcupantes) {
                console.error("Erro ao buscar ocupantes para conflito:", forcado.id, errOcupantes);
                continue;
            }

            const html = renderizarParConflito(forcado, ocupantes);
            container.insertAdjacentHTML('beforeend', html);
        }

    } catch (e) {
        console.error("Erro no painel de conflitos:", e);
        container.innerHTML = `<div class="alert alert-danger">Erro ao carregar conflitos: ${e.message}</div>`;
    }
}

/**
 * Renderiza um card de par (Forçado vs Ocupantes)
 */
function renderizarParConflito(forcado, ocupantes) {
    const dataFmt = new Date(forcado.start_time).toLocaleDateString('pt-BR');
    const horaFmt = `${new Date(forcado.start_time).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})} - ${new Date(forcado.end_time).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}`;
    
    const renderInfo = (ev, isForcado) => {
        const espacos = ev.espacos || [];
        return `
            <div class="conflito-side ${isForcado ? 'forced' : 'victim'}">
                <div class="conflito-header">
                    <span class="badge ${isForcado ? 'badge-danger' : 'badge-warning'}">
                        ${isForcado ? '<i class="fas fa-exclamation-triangle"></i> Agendamento Forçado' : '<i class="fas fa-user-shield"></i> Agendamento Original'}
                    </span>
                    <span class="conflito-id">#${ev.id.substring(0, 5)}</span>
                </div>
                <h4 class="mt-2 mb-1">${escapeHtml(ev.titulopuro || ev.title)}</h4>
                <div class="text-sm text-secondary mb-2">
                    <i class="far fa-user"></i> ${escapeHtml(ev.responsavel)}<br>
                    <i class="far fa-envelope"></i> ${escapeHtml(ev.criadopor)}
                </div>
                <div class="locais-mini-grid mb-3">
                    ${espacos.map(e => `<span class="tag-local-mini ${getClasseBadge(e)}">${escapeHtml(e)}</span>`).join('')}
                </div>
                <button class="btn-danger btn-sm w-full" onclick="window.deletarPorId('${ev.id}')">
                    <i class="fas fa-times-circle"></i> Cancelar Este
                </button>
            </div>
        `;
    };

    return `
        <div class="card mb-4 conflito-pair-card-container">
            <div class="conflito-pair-header">
                <i class="fas fa-calendar-day"></i> ${dataFmt} | <i class="far fa-clock"></i> ${horaFmt}
            </div>
            <div class="conflito-pair-card">
                ${renderInfo(forcado, true)}
                <div class="conflito-divider">VS</div>
                <div class="conflito-victims">
                    ${ocupantes.length > 0 
                        ? ocupantes.map(oc => renderInfo(oc, false)).join('<hr class="my-2">') 
                        : '<div class="p-4 text-center text-secondary">Nenhum ocupante encontrado (pode ter sido cancelado recentemente)</div>'}
                </div>
            </div>
        </div>
    `;
}
