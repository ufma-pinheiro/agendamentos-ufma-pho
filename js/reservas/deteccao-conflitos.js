// js/reservas/deteccao-conflitos.js - carregamento e detecção de conflitos de agendamento
import { supabase } from '../../supabaseClient.js';

export async function carregarSeriePorEscopo(groupId, escopo, dataBase) {
    let query = supabase
        .from('reservas')
        .select('id, start_time, end_time, criadopor')
        .eq('groupid', groupId)
        .eq('cancelado', false)
        .order('start_time', { ascending: true });

    if (escopo === 'future' && dataBase) {
        query = query.gte('start_time', dataBase.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function carregarEventosConflito(minStart, maxEnd) {
    const queryComFim = supabase
        .from('reservas')
        .select('id, title, start_time, end_time, espacos, responsavel, cancelado')
        .eq('cancelado', false)
        .lte('start_time', maxEnd)
        .not('end_time', 'is', null)
        .gte('end_time', minStart);

    const querySemFim = supabase
        .from('reservas')
        .select('id, title, start_time, end_time, espacos, responsavel, cancelado')
        .eq('cancelado', false)
        .lte('start_time', maxEnd)
        .is('end_time', null);

    const [{ data: dataComFim, error: errorComFim }, { data: dataSemFim, error: errorSemFim }] = await Promise.all([
        queryComFim,
        querySemFim
    ]);

    if (errorComFim) throw errorComFim;
    if (errorSemFim) throw errorSemFim;

    const dedupe = new Map();
    [...(dataComFim || []), ...(dataSemFim || [])].forEach(ev => {
        dedupe.set(String(ev.id), ev);
    });

    return Array.from(dedupe.values()).map(ev => ({
        id: ev.id,
        title: ev.title,
        start: new Date(ev.start_time),
        end: ev.end_time ? new Date(ev.end_time) : null,
        extendedProps: {
            espacos: Array.isArray(ev.espacos) ? ev.espacos : [ev.espacos].filter(Boolean),
            responsavel: ev.responsavel
        }
    }));
}

export function detectarConflitos(sessoes, espacosSelecionados, eventos, idsIgnorados = new Set()) {
    const conflitos = [];

    sessoes.forEach(sess => {
        const ini = new Date(sess.start).getTime();
        const fim = new Date(sess.end).getTime();

        eventos.forEach(ev => {
            if (idsIgnorados.has(String(ev.id))) return;
            const evEspacos = ev.extendedProps?.espacos || [];
            const espacoComum = espacosSelecionados.some(esp => evEspacos.includes(esp));
            if (!espacoComum) return;

            const evIni = ev.start.getTime();
            const evFim = ev.end ? ev.end.getTime() : evIni + 3600000;
            if (ini < evFim && fim > evIni) conflitos.push(ev);
        });
    });

    const unicos = new Map();
    conflitos.forEach(ev => {
        if (!unicos.has(ev.id)) unicos.set(ev.id, ev);
    });

    return Array.from(unicos.values());
}
