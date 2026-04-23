// js/calendar.js - Módulo de Gestão do FullCalendar e Realtime
import { supabase } from '../supabaseClient.js';
import { showToast, escapeHtml, debounce } from './utils.js';
import { dbParaFrontend } from './db.js';
import { feriadosFixos } from './constants.js';

export let calendar;
export function getCalendar() { return calendar; }
export let realtimeChannel = null;

/**
 * Retorna a cor baseada no primeiro espaço da lista
 */
export function getCorPorEspaco(espacos) {
    const esp = (espacos || [])[0] || "";
    if (esp.includes("Licenciaturas")) return "#e67e22";
    if (esp.includes("Saúde")) return "#27ae60";
    if (esp.includes("Engenharia")) return "#8e44ad";
    return "#0056b3";
}

/**
 * Retorna a classe de badge CSS baseada no nome do espaço
 */
export function getClasseBadge(nomeEspaco) {
    const esp = nomeEspaco || "";
    if (esp.includes("Engenharia")) return "badge-eng";
    if (esp.includes("Saúde")) return "badge-sau";
    if (esp.includes("Licenciaturas")) return "badge-lic";
    return "badge-outros";
}

/**
 * Busca dados de reservas para um mês específico
 */
export async function buscarDadosMensais(ano, mes) {
    const inicioMes = new Date(ano, mes, 1).toISOString();
    const fimMes = new Date(ano, mes + 1, 0, 23, 59, 59).toISOString();

    const { data, error } = await supabase
        .from('reservas')
        .select('id, title, start_time, end_time, color, titulopuro, espacos, responsavel, contatowhats, contatoemail, isconflito, groupid, datacriacao, criadopor')
        .gte('start_time', inicioMes)
        .lte('end_time', fimMes)
        .eq('cancelado', false);

    if (error) {
        console.error("Erro ao buscar dados mensais:", error);
        return [];
    }
    return data.map(dbParaFrontend);
}

/**
 * Inicializa o FullCalendar
 */
export function iniciarSistema(estado, callbacks) {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        headerToolbar: { 
            left: 'prev,next today', 
            center: 'title', 
            right: 'dayGridMonth,timeGridWeek,timeGridDay' 
        },
        buttonText: { today: 'Hoje', month: 'Mês', week: 'Semana', day: 'Dia' },
        eventDisplay: 'block',
        editable: estado.nivelAcesso !== 'leitor',
        dayMaxEvents: 3,
        navLinks: true, // Permite clicar no número do dia ou "+mais" para ver detalhes
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
            hour12: false
        },
        eventStartEditable: (ev) => {
            const props = ev.extendedProps;
            return estado.nivelAcesso === 'dono' || props.criadoPor === estado.usuarioLogado?.email;
        },
        eventDurationEditable: (ev) => {
            const props = ev.extendedProps;
            return estado.nivelAcesso === 'dono' || props.criadoPor === estado.usuarioLogado?.email;
        },
        eventDrop: async (info) => {
            try {
                const { error } = await supabase
                    .from('reservas')
                    .update({ 
                        start_time: info.event.start.toISOString(),
                        end_time: info.event.end ? info.event.end.toISOString() : info.event.start.toISOString()
                    })
                    .eq('id', info.event.id);
                if (error) throw error;
                showToast("Agendamento movido!");
                if (callbacks.onUpdate) callbacks.onUpdate();
            } catch (e) {
                showToast("Erro ao mover", "error");
                info.revert();
            }
        },
        eventResize: async (info) => {
            try {
                const { error } = await supabase
                    .from('reservas')
                    .update({ 
                        end_time: info.event.end.toISOString()
                    })
                    .eq('id', info.event.id);
                if (error) throw error;
                showToast("Duração ajustada!");
                if (callbacks.onUpdate) callbacks.onUpdate();
            } catch (e) {
                showToast("Erro ao ajustar", "error");
                info.revert();
            }
        },
        events: async function (info, successCallback, failureCallback) {
            try {
                const { data, error } = await supabase
                    .from('reservas')
                    .select('id, title, start_time, end_time, color, titulopuro, espacos, responsavel, contatowhats, contatoemail, isconflito, groupid, datacriacao, criadopor')
                    .gte('start_time', info.start.toISOString())
                    .lte('end_time', info.end.toISOString())
                    .eq('cancelado', false);

                if (error) throw error;

                const eventos = data.map(dbParaFrontend);
                successCallback([...eventos, ...feriadosFixos]);

                if (callbacks.onEventsLoaded) callbacks.onEventsLoaded();
            } catch (error) {
                console.error("Erro ao carregar eventos:", error);
                showToast("Erro ao carregar eventos do calendário", "error");
                failureCallback(error);
            }
        },
        height: '100%',
        expandRows: true,
        handleWindowResize: true,
        windowResizeDelay: 100,
        dateClick: (info) => {
            if (estado.nivelAcesso === 'leitor') { 
                showToast('Modo leitura: Não é possível criar eventos', 'info'); 
                return; 
            }
            if (callbacks.onDateClick) callbacks.onDateClick(info.dateStr);
        },
        eventClick: (info) => {
            if (callbacks.onEventClick) callbacks.onEventClick(info);
        },
        eventContent: function (arg) {
            const props = arg.event.extendedProps;
            const time = arg.event.start ? `${arg.event.start.getHours().toString().padStart(2, '0')}h` : '';
            const conflitoIcon = props.isConflito ? '<i class="fas fa-exclamation-triangle cal-conflict-indicator" title="Conflito Detectado"></i>' : '';
            
            const espaco = (props.espacos || [])[0] || "";
            let catClass = "event-out";
            if (espaco.includes("Engenharia")) catClass = "event-eng";
            if (espaco.includes("Saúde")) catClass = "event-sau";
            if (espaco.includes("Licenciaturas")) catClass = "event-lic";

            return {
                html: `
                    <div class="cal-event-card ${catClass}">
                        <div class="cal-event-top">
                            <span class="cal-event-time">${time}</span>
                            <div class="cal-event-indicators">${conflitoIcon}</div>
                        </div>
                        <div class="cal-event-title">${escapeHtml(props.tituloPuro || arg.event.title)}</div>
                        <div class="cal-event-room">${escapeHtml(espaco)}</div>
                    </div>
                `
            };
        },
        eventDidMount: function(info) {
            if (typeof tippy === 'function') {
                const props = info.event.extendedProps;
                tippy(info.el, {
                    content: `
                        <div style="padding: 10px; min-width: 200px;">
                            <strong style="display:block; font-size: 0.95rem; margin-bottom: 6px; color: var(--text-primary);">${escapeHtml(props.tituloPuro || info.event.title)}</strong>
                            <div style="font-size: 0.8rem; line-height: 1.6; color: var(--text-secondary);">
                                <i class="far fa-clock" style="width: 16px;"></i> ${info.event.start.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})} - ${info.event.end ? info.event.end.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}) : '-'}<br>
                                <i class="fas fa-map-marker-alt" style="width: 16px;"></i> ${escapeHtml((props.espacos || []).join(', '))}<br>
                                <i class="far fa-user" style="width: 16px;"></i> ${escapeHtml(props.responsavel)}
                            </div>
                            ${props.isConflito ? '<div style="margin-top:8px; padding-top:8px; border-top: 1px solid var(--border-color); color: var(--danger-500); font-weight: 700; font-size: 0.75rem;"><i class="fas fa-exclamation-triangle"></i> ATENÇÃO: CONFLITO DETECTADO</div>' : ''}
                        </div>
                    `,
                    allowHTML: true,
                    placement: 'top',
                    interactive: true,
                    appendTo: () => document.body
                });
            }
        }
    });

    calendar.render();
    iniciarRealtime(callbacks.onUpdate);
}

/**
 * Inicializa a escuta em tempo real do Supabase
 */
export function iniciarRealtime(onUpdate) {
    if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
    }

    realtimeChannel = supabase
        .channel('reservas-realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reservas' }, (payload) => {
            const evento = dbParaFrontend(payload.new);
            const existing = calendar.getEventById(String(evento.id));
            if (!existing) {
                calendar.addEvent(evento);
                if (onUpdate) onUpdate();
            }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reservas' }, (payload) => {
            const evento = dbParaFrontend(payload.new);
            const existing = calendar.getEventById(evento.id);
            // Se foi soft-deleted (cancelado), remover do calendário sem re-adicionar
            if (payload.new.cancelado === true) {
                if (existing) {
                    existing.remove();
                    if (onUpdate) onUpdate();
                }
                return;
            }
            if (existing) existing.remove();
            calendar.addEvent(evento);
            if (onUpdate) onUpdate();
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'reservas' }, (payload) => {
            const existing = calendar.getEventById(payload.old.id);
            if (existing) {
                existing.remove();
                if (onUpdate) onUpdate();
            }
        })
        .subscribe();

    window.addEventListener('beforeunload', () => {
        if (realtimeChannel) supabase.removeChannel(realtimeChannel);
    }, { once: true });
}

/**
 * Recarrega os dados do calendário
 */
export function recarregarDados() {
    if (calendar) {
        calendar.refetchEvents();
        showToast('Dados sincronizados com sucesso!');
    }
}
