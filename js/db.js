/**
 * js/db.js
 * Funções de mapeamento entre o esquema do banco de dados (Supabase/PostgREST)
 * e os objetos do frontend (FullCalendar extendedProps).
 * Extraído de app.js como parte da modularização (ARCH-001).
 */

// ==========================================
// MAPEAMENTO DE COLUNAS (Frontend ↔ DB)
// ==========================================

/**
 * Converte uma linha do banco de dados para o formato de evento do FullCalendar.
 * @param {Object} row - Objeto retornado pelo Supabase (colunas em lowercase)
 * @returns {Object|null} Evento no formato esperado pelo FullCalendar
 */
export function dbParaFrontend(row) {
    if (!row) return null;
    const start = row.start_time ? new Date(row.start_time) : null;
    const end   = row.end_time   ? new Date(row.end_time)   : null;

    return {
        id: row.id,
        title: row.title,
        start,
        end,
        allDay: false,
        color: row.color,
        backgroundColor: row.color,
        borderColor: row.color,
        textColor: '#fff',
        display: 'block',
        extendedProps: {
            id:           row.id,
            title:        row.title,
            tituloPuro:   row.titulopuro,
            espacos:      row.espacos,
            responsavel:  row.responsavel,
            contatoWhats: row.contatowhats,
            contatoEmail: row.contatoemail,
            isConflito:   row.isconflito,
            groupId:      row.groupid,
            dataCriacao:  row.datacriacao,
            criadoPor:    row.criadopor,
            cancelado:    row.cancelado,
            motivo_cancelamento: row.motivo_cancelamento,
            datacancelamento:    row.datacancelamento
        }
    };
}

/**
 * Converte um objeto do frontend para o formato de colunas do banco de dados.
 * @param {Object} dados - Evento do frontend (pode ter extendedProps)
 * @returns {Object} Objeto com colunas em lowercase para insert/update no Supabase
 */
export function frontendParaDb(dados) {
    const ext = dados.extendedProps || {};
    return {
        title:       dados.title || ext.title,
        titulopuro:  ext.tituloPuro || dados.tituloPuro || dados.title,
        start_time:  dados.start,
        end_time:    dados.end,
        espacos:     ext.espacos      || dados.espacos,
        responsavel: ext.responsavel  || dados.responsavel,
        contatowhats: ext.contatoWhats || dados.contatoWhats || null,
        contatoemail: ext.contatoEmail || dados.contatoEmail || null,
        color:       dados.color       || ext.color,
        isconflito:  ext.isConflito    || dados.isConflito   || false,
        groupid:     ext.groupId       || dados.groupId      || null,
        datacriacao: ext.dataCriacao   || dados.dataCriacao,
        criadopor:   ext.criadoPor     || dados.criadoPor
    };
}
