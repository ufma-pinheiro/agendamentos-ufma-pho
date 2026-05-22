// js/reservas/datas.js - utilitários de data e sessão

export function pad2(n) {
    return String(n).padStart(2, '0');
}

export function formatDateYmd(date) {
    return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

export function parseYmdToUtcDate(ymd) {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
}

export function gerarUuid() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `GRP-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export function montarSessao(dataYmd, horaIni, horaFim) {
    return {
        start: `${dataYmd}T${horaIni}:00-03:00`,
        end: `${dataYmd}T${horaFim}:00-03:00`
    };
}
