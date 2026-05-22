// js/theme.js - gerenciamento de tema claro/escuro
import { estado } from './estado.js';
import { getCalendar } from './calendar.js';
import { atualizarDashboard } from './dashboard.js';

export function initTheme() {
    const savedTheme = localStorage.getItem('themeUFMA') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

export function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('themeUFMA', next);
    updateThemeIcon(next);

    if (getCalendar()) getCalendar().render();

    if (typeof atualizarDashboard === 'function' &&
        document.getElementById('abaDashboard')?.classList.contains('active')) {
        atualizarDashboard(estado);
    }
}

export function updateThemeIcon(theme) {
    const btn = document.getElementById('btnToggleTheme');
    if (btn) btn.innerHTML = `<i class="fas fa-${theme === 'dark' ? 'sun' : 'moon'}"></i>`;
}
