// js/telas.js - atualizacao das telas/listagens de eventos
import { supabase } from '../supabaseClient.js';
import { estado } from './estado.js';
import { getCalendar, buscarDadosMensais } from './calendar.js';
import { dbParaFrontend } from './db.js';
import { gerarCardEventoHtml } from './components.js';
import { escapeHtml } from './utils.js';
import { atualizarDashboard } from './dashboard.js';
import { atualizarPainelConflitos } from './conflitos.js';

export function atualizarTodasTelas() {
    atualizarUltimosEventos();
    const abaResumo = document.getElementById('abaResumo');
    const abaDashboard = document.getElementById('abaDashboard');

    if (abaResumo?.classList.contains('active')) atualizarResumoMes();
    if (abaDashboard?.classList.contains('active')) atualizarDashboard(estado);
    if (document.getElementById('abaConflitos')?.classList.contains('active')) atualizarPainelConflitos();
    if (document.getElementById('abaUltimosRegistros')?.classList.contains('active')) atualizarUltimosEventos();
    if (estado.nivelAcesso !== 'leitor') atualizarMeusEventos();
}

// ===== Helpers internos de agrupamento =====

function agruparPorData(eventos) {
    const grupos = new Map();
    eventos.forEach(ev => {
        const d = new Date(ev.start);
        const key = d.toISOString().slice(0, 10);
        if (!grupos.has(key)) grupos.set(key, { data: d, eventos: [] });
        grupos.get(key).eventos.push(ev);
    });
    // ordenar asc (mais próximo primeiro)
    return [...grupos.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([, v]) => v);
}

function headerGrupo(d) {
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = d.toLocaleDateString('pt-BR', { month: 'long' });
    const dow = d.toLocaleDateString('pt-BR', { weekday: 'long' });
    return `<div class="grupo-data reveal">
    <div class="grupo-head">
      <span class="grupo-dia">${dia}</span>
      <span class="grupo-info">de ${mes} (${dow})</span>
    </div>
    <div class="grupo-linha"></div>`;
}

function secaoEncerrados(encerrados, estadoLocal) {
    if (encerrados.length === 0) return '';
    const grupos = agruparPorData(encerrados);
    const itens = grupos.map(g =>
        headerGrupo(g.data) +
        g.eventos.map(ev => gerarCardEventoHtml(ev, estadoLocal)).join('') +
        '</div>'
    ).join('');
    return `
    <div class="encerrados reveal">
      <button class="enc-toggle" aria-expanded="false"
        onclick="const c=this.nextElementSibling; c.hidden=!c.hidden; this.setAttribute('aria-expanded', !c.hidden); this.querySelector('i').className = c.hidden ? 'fas fa-chevron-down' : 'fas fa-chevron-up';">
        <i class="fas fa-chevron-down"></i>
        <b>Encerrados do mês</b>
        <span>(${encerrados.length})</span>
      </button>
      <div class="enc-conteudo" hidden>${itens}</div>
    </div>`;
}

// ===== Função principal =====

export function renderizarCards(eventos, containerId, mensagemVazio) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let lista = eventos;
    if (estado.termoBusca) {
        lista = eventos.filter(ev => (`${ev.extendedProps.tituloPuro} ${ev.extendedProps.responsavel} ${(ev.extendedProps.espacos || []).join(' ')}`.toLowerCase()).includes(estado.termoBusca));
    }

    const agora = new Date();
    const ativos = lista.filter(ev => !ev.extendedProps.cancelado && new Date(ev.end || ev.start) >= agora);
    const encerrados = lista.filter(ev => ev.extendedProps.cancelado || new Date(ev.end || ev.start) < agora);

    if (ativos.length === 0 && encerrados.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-calendar-xmark"></i><h3>${mensagemVazio}</h3><p>Nenhum agendamento encontrado.</p></div>`;
        return;
    }

    const gruposAtivos = agruparPorData(ativos);
    let html = '';
    if (ativos.length > 0) {
        html += '<div class="view-head"><h2>Agendamentos ativos</h2></div>';
        html += gruposAtivos.map(g =>
            headerGrupo(g.data) +
            g.eventos.map(ev => gerarCardEventoHtml(ev, estado)).join('') +
            '</div>'
        ).join('');
    }
    html += secaoEncerrados(encerrados, estado);
    container.innerHTML = html;
}

export async function atualizarUltimosEventos() {
    const cal = getCalendar();
    if (!cal) return;
    const container = document.getElementById('listaUltimosRegistros');
    if (!container) return;

    try {
        const { data, error } = await supabase
            .from('reservas')
            .select('id, title, start_time, end_time, color, titulopuro, espacos, responsavel, contatowhats, contatoemail, isconflito, groupid, datacriacao, criadopor')
            .eq('cancelado', false)
            .order('datacriacao', { ascending: false })
            .limit(30);

        if (error) throw error;
        document.getElementById('listaUltimosRegistros__count').textContent = data.length;
        const eventos = data.map(dbParaFrontend);

        container.innerHTML = eventos.map(ev => gerarCardEventoHtml(ev, estado)).join('');
    } catch (e) { console.error(e); }
}

export async function atualizarMeusEventos() {
    if (!getCalendar() || !estado.usuarioLogado) return;
    const container = document.getElementById('containerMeusEventos');
    if (!container) return;
    try {
        const isCancelados = estado.meusEventosFiltro === 'cancelados';
        const { data, error } = await supabase
            .from('reservas')
            .select('*')
            .eq('criadopor', estado.usuarioLogado.email)
            .eq('cancelado', isCancelados)
            .order(isCancelados ? 'datacancelamento' : 'start_time', { ascending: !isCancelados });

        if (error) throw error;

        if (isCancelados) {
            renderizarCardsCancelados(data.map(dbParaFrontend), 'containerMeusEventos', 'Nenhum cancelamento encontrado');
        } else {
            renderizarCards(data.map(dbParaFrontend), 'containerMeusEventos', 'Você ainda não criou eventos');
        }

        const countEl = document.getElementById('containerMeusEventos__count');
        if (countEl) countEl.textContent = data.length;

    } catch (e) { console.error(e); }
}

window.mudarFiltroMeusEventos = function(filtro) {
    estado.meusEventosFiltro = filtro;
    document.getElementById('btnFiltroMeusAtivos').classList.toggle('active', filtro === 'ativos');
    document.getElementById('btnFiltroMeusCancelados').classList.toggle('active', filtro === 'cancelados');
    atualizarMeusEventos();
};

export async function atualizarCancelamentos() {
    const container = document.getElementById('listaCancelamentosAdmin');
    if (!container) return;

    try {
        const { data, error } = await supabase
            .from('reservas')
            .select('*')
            .eq('cancelado', true)
            .order('datacancelamento', { ascending: false });

        if (error) throw error;

        if (data.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-calendar-check"></i>
                    <span>Nenhum evento cancelado foi encontrado no histórico.</span>
                </div>`;
            return;
        }

        container.innerHTML = data.map(ev => {
            const evento = dbParaFrontend(ev);
            const dataCanc = ev.datacancelamento ? new Date(ev.datacancelamento).toLocaleString('pt-BR') : '-';
            const dataCancSplit = dataCanc.split(', ');
            const dataEvento = new Date(evento.start).toLocaleDateString('pt-BR');

            return `
                <div class="cancelamento-card">
                    <div class="canc-header">
                        <div class="canc-date">
                            <i class="fas fa-clock"></i>
                            <div>
                                <strong>${dataCancSplit[0] || dataCanc}</strong>
                                <span>${dataCancSplit[1] || ''}</span>
                            </div>
                        </div>
                        <span class="badge canc-author">
                            <i class="fas fa-user-times"></i> ${escapeHtml(ev.canceladopor || 'Sistema')}
                        </span>
                    </div>

                    <div class="canc-body">
                        <h4 class="canc-title">${escapeHtml(evento.extendedProps.tituloPuro)}</h4>
                        <div class="canc-info">
                            <span><i class="far fa-calendar-alt"></i> ${dataEvento}</span>
                            <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(evento.extendedProps.espacos.join(', '))}</span>
                        </div>
                        <div class="canc-reason">
                            <i class="fas fa-exclamation-circle"></i>
                            <p>${escapeHtml(ev.motivo_cancelamento || 'Sem motivo informado')}</p>
                        </div>
                    </div>

                    <div class="canc-footer">
                        <button class="btn-restore-mini" onclick="window.restaurarEvento('${evento.id}')" title="Restaurar este agendamento">
                            <i class="fas fa-undo"></i> Restaurar Evento
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (e) {
        console.error(e);
        container.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-danger">Erro ao carregar dados.</td></tr>`;
    }
}

export function renderizarCardsCancelados(eventos, containerId, mensagemVazio) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (eventos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h3>${mensagemVazio}</h3>
            </div>`;
        return;
    }

    container.innerHTML = eventos.map(ev => gerarCardEventoHtml(ev, estado)).join('');
}

export async function atualizarResumoMes() {
    if (!getCalendar()) return;
    const eventos = await buscarDadosMensais(estado.anoFiltro, estado.mesFiltro);
    renderizarCards(eventos, 'listaResumo', 'Nenhum evento neste mês');
}
