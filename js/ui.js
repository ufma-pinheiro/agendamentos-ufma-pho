// js/ui.js - inicializacao da interface, listeners e construcao dinamica
import { supabase } from '../supabaseClient.js';
import { estado } from './estado.js';
import { stringToColor, debounce, escapeHtml } from './utils.js';
import { mesesAbrev } from './constants.js';
import { initTheme, toggleTheme } from './theme.js';
import { getCalendar, recarregarDados } from './calendar.js';
import { fecharModal, fecharModalForm, deletarEvento, salvarOuEditarEvento } from './reservas.js';
import { atualizarDashboard } from './dashboard.js';
import { exportarExcel, exportarPDF } from './export.js';
import { fazerBackupJSON, restaurarBackupJSON } from './backup.js';
import { adicionarUsuarioViaAdmin } from './admin.js';
import { atualizarTodasTelas, atualizarResumoMes, atualizarUltimosEventos, atualizarMeusEventos } from './telas.js';

export function initUI() {
    const avatar = document.getElementById('userAvatar');
    if (avatar && estado.usuarioLogado.email) {
        const iniciais = estado.usuarioLogado.email.substring(0, 2).toUpperCase();
        avatar.textContent = iniciais;
        avatar.style.background = stringToColor(estado.usuarioLogado.email);
    }

    document.getElementById('userEmailDisplay').textContent = estado.usuarioLogado.email;

    // Bind Events Globais
    document.getElementById('btnLogout')?.addEventListener('click', async () => {
        await supabase.auth.signOut();
    });
    document.getElementById('btnToggleTheme')?.addEventListener('click', toggleTheme);
    document.getElementById('menuToggle')?.addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));

    // Sidebar collapse
    const btnCollapse = document.getElementById('btnCollapseSidebar');
    if (btnCollapse) {
        // Restaurar estado do localStorage
        if (localStorage.getItem('sidebarCollapsed') === 'true') {
            document.getElementById('sidebar').classList.add('collapsed');
        }
        btnCollapse.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
            // Atualizar calendário após a transição
            setTimeout(() => { if (getCalendar()) getCalendar().updateSize(); }, 350);
        });
    }

    document.getElementById('btnCloseModal')?.addEventListener('click', fecharModal);
    document.getElementById('btnCloseModalOnly')?.addEventListener('click', fecharModal);
    document.getElementById('btnFecharModalForm')?.addEventListener('click', fecharModalForm);
    document.getElementById('btnCancelarForm')?.addEventListener('click', fecharModalForm);

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                if (modal.id === 'eventModal') fecharModal();
                if (modal.id === 'modalFormAgendamento') fecharModalForm();
            }
        });
    });

    document.addEventListener('click', (e) => {
        const eventContent = e.target.closest('.event-content-clickable');
        if (eventContent) {
            const id = eventContent.getAttribute('data-event-id');
            const jsonStr = eventContent.getAttribute('data-event-json');
            const cal = window.getCalendar && window.getCalendar();
            let ev = cal ? cal.getEventById(id) : null;
            if (!ev && jsonStr) {
                try {
                    ev = JSON.parse(jsonStr.replace(/&quot;/g, '"'));
                } catch (err) {
                    console.error('Erro ao parsear JSON do evento', err);
                }
            }
            if (ev) window.abrirDetalhes(ev);
        }
    });

    // Atalhos de teclado
    document.addEventListener('keydown', (e) => {
        // Ignorar se estiver digitando em input/textarea
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') {
            if (e.key === 'Escape') {
                e.target.blur();
                fecharModal();
                fecharModalForm();
            }
            return;
        }

        switch (e.key.toLowerCase()) {
            case 'n':
                if (estado.nivelAcesso !== 'leitor') {
                    e.preventDefault();
                    window.abrirModalFormulario();
                }
                break;
            case 't':
                if (getCalendar()) {
                    e.preventDefault();
                    getCalendar().today();
                }
                break;
            case '/':
                e.preventDefault();
                document.getElementById('buscaGlobal')?.focus();
                break;
            case 'escape':
                fecharModal();
                fecharModalForm();
                break;
        }
    });

    initTheme();
    construirInterfaceDinamica();

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = btn.getAttribute('data-target');
            if (target) window.switchTab(target, btn);
        });
    });
}

function construirInterfaceDinamica() {
    const containerEspacos = document.getElementById('espacosAccordionContainer');
    if (containerEspacos) {
        const grupos = [
            {
                id: 'eng', titulo: 'Engenharia & Ed. Física', cor: '#8e44ad', icon: 'fa-cogs', salas: 5, extras: [
                    { id: 'esp_eng_aud', value: 'Engenharia - Auditório', label: 'Auditório' }
                ]
            },
            {
                id: 'lic', titulo: 'Licenciaturas', cor: '#e67e22', icon: 'fa-graduation-cap', salas: 8, extras: [
                    { id: 'esp_lic_aud', value: 'Licenciaturas - Auditório', label: 'Auditório' },
                    { id: 'esp_lic_lab', value: 'Licenciaturas - Lab. Informática', label: 'Lab. Info' }
                ]
            },
            {
                id: 'sau', titulo: 'Saúde', cor: '#27ae60', icon: 'fa-heartbeat', salas: 11, extras: [
                    { id: 'esp_sau_aud', value: 'Saúde - Auditório', label: 'Auditório' },
                    { id: 'esp_sau_lab', value: 'Saúde - Lab. Informática', label: 'Lab. Info' }
                ]
            }
        ];

        let html = '';
        grupos.forEach(g => {
            html += `
                <div class="espaco-group" style="--group-color: ${g.cor}">
                    <div class="espaco-header" onclick="this.parentElement.classList.toggle('open')">
                        <div class="espaco-title">
                            <div class="espaco-icon" style="background: ${g.cor}20; color: ${g.cor}">
                                <i class="fas ${g.icon}"></i>
                            </div>
                            <span>${g.titulo}</span>
                        </div>
                        <i class="fas fa-chevron-down toggle-icon"></i>
                    </div>
                    <div class="espaco-content">
                        <div class="espaco-grid">
                            ${g.extras.map(e => `
                                <label class="checkbox-card">
                                    <input type="checkbox" name="espaco" value="${e.value}">
                                    <span>${e.label}</span>
                                </label>
                            `).join('')}
                            ${Array.from({ length: g.salas }, (_, i) => i + 1).map(i => `
                                <label class="checkbox-card">
                                    <input type="checkbox" name="espaco" value="${g.titulo.split(' &')[0]} - Sala ${i}">
                                    <span>Sala ${i}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        });
        containerEspacos.innerHTML = html;
    }

    const containerMeses = document.getElementById('monthGridContainer');
    if (containerMeses) {
        containerMeses.innerHTML = mesesAbrev.map((m, i) => `
            <button class="month-chip" data-mes="${i}" onclick="selecionarMes(${i})">${m}</button>
        `).join('');
        atualizarSelecaoMes();
    }

    const selectDashMes = document.getElementById('filtroDashMes');
    const selectRelMes = document.getElementById('filtroRelatorioMes');
    if (selectDashMes) selectDashMes.innerHTML = '<option value="Todos">Todos os Meses</option>' + mesesAbrev.map((m, i) => `<option value="${i}">${m}</option>`).join('');
    if (selectRelMes) selectRelMes.innerHTML = '<option value="Todos">Todos os Meses</option>' + mesesAbrev.map((m, i) => `<option value="${i}">${m}</option>`).join('');

    // Listeners Secundários
    document.getElementById('btnAnoAnt')?.addEventListener('click', () => mudarAno(-1));
    document.getElementById('btnAnoProx')?.addEventListener('click', () => mudarAno(1));
    document.getElementById('btnRefreshDados')?.addEventListener('click', recarregarDados);
    document.getElementById('btnNovoAgendamento')?.addEventListener('click', () => window.abrirModalFormulario());
    document.getElementById('btnAplicarFiltrosDash')?.addEventListener('click', () => atualizarDashboard(estado));
    document.getElementById('btnExportExcel')?.addEventListener('click', exportarExcel);
    document.getElementById('btnExportPDF')?.addEventListener('click', exportarPDF);
    document.getElementById('btnBackupJSON')?.addEventListener('click', fazerBackupJSON);
    document.getElementById('btnRestoreJSON')?.addEventListener('click', () => document.getElementById('inputRestoreJSON').click());
    document.getElementById('inputRestoreJSON')?.addEventListener('change', restaurarBackupJSON);

    const searchInput = document.getElementById('buscaGlobal');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => aplicarBusca(e.target.value), 300));
        document.getElementById('btnLimparBusca')?.addEventListener('click', () => {
            searchInput.value = '';
            aplicarBusca('');
            searchInput.focus();
        });
    }

    document.getElementById('btnDeleteEvent')?.addEventListener('click', () => deletarEvento(atualizarTodasTelas));
    document.getElementById('btnEditEvent')?.addEventListener('click', () => window.prepararEdicao());
    document.getElementById('reservaForm')?.addEventListener('submit', (e) => salvarOuEditarEvento(e, estado, atualizarTodasTelas));
    document.getElementById('btnAddDataRow')?.addEventListener('click', () => window.adicionarLinhaData());
    document.getElementById('formNovoUsuario')?.addEventListener('submit', adicionarUsuarioViaAdmin);

    const whatsInput = document.getElementById('contatoWhats');
    if (whatsInput) {
        whatsInput.addEventListener('input', function (e) {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 11) v = v.slice(0, 11);
            if (v.length > 7) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
            else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
            e.target.value = v;
        });
    }
}

function mudarAno(delta) {
    estado.anoFiltro += delta;
    document.getElementById('displayAno').textContent = estado.anoFiltro;
    atualizarResumoMes();
}

function atualizarSelecaoMes() {
    document.querySelectorAll('.month-chip').forEach(btn => {
        const ativo = parseInt(btn.getAttribute('data-mes')) === estado.mesFiltro;
        btn.classList.toggle('active', ativo);
    });
}

window.selecionarMes = function(mes) {
    estado.mesFiltro = mes;
    atualizarSelecaoMes();
    atualizarResumoMes();
};

function aplicarBusca(termo) {
    estado.termoBusca = termo.toLowerCase().trim();
    document.getElementById('btnLimparBusca').style.display = estado.termoBusca ? 'flex' : 'none';

    atualizarUltimosEventos();
    if (document.getElementById('abaMeusEventos').classList.contains('active')) atualizarMeusEventos();
    if (document.getElementById('abaResumo').classList.contains('active')) atualizarResumoMes();

    // Filtrar calendário
    const cal = getCalendar();
    if (cal) {
        cal.getEvents().forEach(ev => {
            if (!estado.termoBusca) {
                ev.setProp('display', 'block');
                return;
            }
            const texto = `${ev.extendedProps.tituloPuro} ${ev.extendedProps.responsavel} ${(ev.extendedProps.espacos || []).join(' ')}`.toLowerCase();
            ev.setProp('display', texto.includes(estado.termoBusca) ? 'block' : 'none');
        });
    }

    const dropdown = document.getElementById('searchResults');
    if (estado.termoBusca.length > 2 && cal) {
        const matches = cal.getEvents()
            .filter(ev => !ev.extendedProps.isFeriado)
            .filter(ev => (`${ev.extendedProps.tituloPuro} ${ev.extendedProps.responsavel}`.toLowerCase()).includes(estado.termoBusca))
            .slice(0, 5);
        if (matches.length > 0) {
            dropdown.innerHTML = matches.map(ev => `
                <div class="search-result-item" onclick="abrirDetalhes(getCalendar().getEventById('${ev.id}')); document.getElementById('searchResults').classList.remove('active')">
                    <div class="search-result-color" style="background:${ev.backgroundColor}"></div>
                    <div class="search-result-info">
                        <div class="search-result-title">${escapeHtml(ev.extendedProps.tituloPuro)}</div>
                        <div class="search-result-meta">${ev.start.toLocaleDateString('pt-BR')} • ${escapeHtml(ev.extendedProps.responsavel)}</div>
                    </div>
                </div>
            `).join('');
            dropdown.classList.add('active');
        } else dropdown.classList.remove('active');
    } else dropdown.classList.remove('active');
}
