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
        .lte('end_time', fimMes);

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
        events: async function (info, successCallback, failureCallback) {
            try {
                const { data, error } = await supabase
                    .from('reservas')
                    .select('id, title, start_time, end_time, color, titulopuro, espacos, responsavel, contatowhats, contatoemail, isconflito, groupid, datacriacao, criadopor')
                    .gte('start_time', info.start.toISOString())
                    .lte('end_time', info.end.toISOString());

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
        height: 'auto',
        contentHeight: 'auto',
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
            const conflitoDot = props.isConflito ? '<span class="event-conflito-dot" title="Conflito de horário"></span>' : '';
            return {
                html: `
                    <div class="fc-event-custom">
                        <div class="event-time">${time} ${conflitoDot}</div>
                        <div class="event-title">${escapeHtml(props.tituloPuro || arg.event.title)}</div>
                        <div class="event-loc">${escapeHtml((props.espacos || [props.espaco])[0])}</div>
                    </div>
                `
            };
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
