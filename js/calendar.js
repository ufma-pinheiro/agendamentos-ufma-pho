// js/calendar.js - Módulo de Gestão do FullCalendar e Realtime
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';
import { supabase } from '../supabaseClient.js';
import { showToast, escapeHtml, debounce } from './utils.js';
import { dbParaFrontend } from './db.js';
import { feriadosFixos } from './constants.js';

export let calendar;
export function getCalendar() { return calendar; }
export let realtimeChannel = null;

function normalizeEventId(id) {
    return id != null ? String(id) : null;
}

function removeCalendarEventsById(id) {
    if (!calendar) return;
    const eventId = normalizeEventId(id);
    if (!eventId) return;

    calendar.getEvents()
        .filter(ev => String(ev.id) === eventId)
        .forEach(ev => ev.remove());
}

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

/**
 * Altura gerenciada 100% via CSS flex chain:
 * .content-wrapper → #abaCalendario.active → .calendar-card → #calendar
 * height:'100%' faz o FullCalendar respeitar o tamanho já definido pelo CSS.
 * expandRows:true distribui o espaço igualmente entre as semanas (estilo Google Calendar).
 */

export function iniciarSistema(estado, callbacks) {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    calendar = new Calendar(calendarEl, {
        plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, multiMonthPlugin],
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        buttonText: { today: 'Hoje', month: 'Mês', week: 'Semana', day: 'Dia' },
        eventDisplay: 'block',
        editable: false,
        dayMaxEvents: 4,
        navLinks: true,
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
            hour12: false
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
        dayMaxEventRows: true,
        handleWindowResize: true,
        windowResizeDelay: 0,
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
                    <div class="cal-event-card ${catClass}" title="${escapeHtml(arg.event.title)}">
                        <span class="cal-event-time">${time}</span>
                        <span class="cal-event-title">${escapeHtml(props.tituloPuro || arg.event.title)}</span>
                        ${conflitoIcon}
                    </div>
                `
            };
        },
        moreLinkContent: (arg) => {
            return { html: `+${arg.num}` }; // Estilo minimalista
        }
    });

    calendar.render();

    // Com o novo layout Flexbox 100% vh, o FullCalendar se ajusta automaticamente.
    // Disparamos um updateSize inicial para garantir que o grid preencha o container.
    setTimeout(() => {
        if (calendar) {
            calendar.updateSize();
            window.dispatchEvent(new Event('resize'));
        }
    }, 100);

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
            if (!calendar || payload.new?.cancelado === true) return;
            const evento = dbParaFrontend(payload.new);
            evento.id = normalizeEventId(evento.id);
            removeCalendarEventsById(evento.id);
            calendar.addEvent(evento);
            if (onUpdate) onUpdate();
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reservas' }, (payload) => {
            if (!calendar) return;
            const evento = dbParaFrontend(payload.new);
            const eventId = normalizeEventId(evento.id);
            // Se foi soft-deleted (cancelado), remover do calendário sem re-adicionar
            if (payload.new.cancelado === true) {
                removeCalendarEventsById(eventId);
                if (onUpdate) onUpdate();
                return;
            }

            evento.id = eventId;
            removeCalendarEventsById(eventId);
            calendar.addEvent(evento);
            if (onUpdate) onUpdate();
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'reservas' }, (payload) => {
            if (!calendar) return;
            removeCalendarEventsById(payload.old?.id);
            if (onUpdate) onUpdate();
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
