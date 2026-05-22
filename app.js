// app.js - orquestrador: bootstrap de autenticacao e inicializacao do sistema
import { estado } from './js/estado.js';
import { initAuth, aplicarPermissoes, setupAuthListener } from './js/auth.js';
import { iniciarSistema, getCalendar } from './js/calendar.js';
import { hideLoading } from './js/utils.js';
import { initUI } from './js/ui.js';
import './js/handlers.js';
import { initReservasWindow } from './js/reservas.js';
import { atualizarTodasTelas } from './js/telas.js';
import { carregarListaUsuariosAdmin } from './js/admin.js';

// Expor no escopo global para uso em onclick inline do HTML
window.estadoGlobal = estado;
window.getCalendar = getCalendar;

// ==========================================
// AUTENTICAÇÃO E INICIALIZAÇÃO
// ==========================================

let authVerificado = false;
const failsafeLoading = setTimeout(() => {
    if (authVerificado) hideLoading();
}, 15000);

// Iniciar autenticação
initAuth(estado, () => {
    authVerificado = true;
    initUI();
    aplicarPermissoes(estado.nivelAcesso, carregarListaUsuariosAdmin);
    initReservasWindow(atualizarTodasTelas);

    iniciarSistema(estado, {
        onEventsLoaded: atualizarTodasTelas,
        onUpdate: atualizarTodasTelas,
        onDateClick: (date) => window.abrirModalFormulario(date),
        onEventClick: (info) => {
            if (typeof window.setEventoSelecionado === 'function') {
                window.setEventoSelecionado(info.event);
            }
            window.abrirDetalhes(info.event);
        }
    });
    hideLoading();
});

// Listener de logout
setupAuthListener();
