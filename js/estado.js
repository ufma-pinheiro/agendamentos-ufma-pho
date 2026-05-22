// js/estado.js - estado global da aplicacao
export const estado = {
    anoFiltro: new Date().getFullYear(),
    mesFiltro: new Date().getMonth(),
    usuarioLogado: null,
    nivelAcesso: 'leitor',
    graficosAtivos: { meses: null, espacos: null, dias: null, resps: null },
    termoBusca: '',
    timerBusca: null,
    meusEventosFiltro: 'ativos' // 'ativos' ou 'cancelados'
};
