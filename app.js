import { supabase } from './supabaseClient.js';
import { showToast, setButtonLoading, hideLoading, debounce, stringToColor, adjustColor, escapeHtml } from './js/utils.js';
import { dbParaFrontend, frontendParaDb } from './js/db.js';
import { initAuth, aplicarPermissoes, setupAuthListener } from './js/auth.js';
import { iniciarSistema, calendar, getCorPorEspaco, getClasseBadge, buscarDadosMensais, recarregarDados } from './js/calendar.js';
import { mesesAbrev, feriadosFixos } from './js/constants.js';
import { atualizarPainelNotificacoes } from './js/notifications.js';
import { atualizarDashboard } from './js/dashboard.js';
import { salvarOuEditarEvento, deletarEvento, initReservasWindow, fecharModal, fecharModalForm } from './js/reservas.js';

// Estado global
const estado = {
    anoFiltro: new Date().getFullYear(),
    mesFiltro: new Date().getMonth(),
    usuarioLogado: null,
    nivelAcesso: 'leitor',
    graficosAtivos: { meses: null, espacos: null, dias: null, resps: null },
    termoBusca: '',
    timerBusca: null
};

// calendar, realtimeChannel, mesesAbrev e feriadosFixos movidos para módulos
let eventoSelecionadoNoModal = null;

// ==========================================
// ESTADO E VARÁVEIS GLOBAIS
// ==========================================

window.switchTab = function (tabId, navElement) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    const selectedTab = document.getElementById(tabId);
    if (selectedTab) selectedTab.classList.add('active');

    if (navElement) {
        navElement.classList.add('active');
    } else {
        const btn = document.querySelector(`.nav-item[data-target="${tabId}"]`);
        if (btn) btn.classList.add('active');
    }

    const titles = {
        'abaCalendario': 'Calendário', 'abaMeusEventos': 'Meus Eventos',
        'abaResumo': 'Resumo Mensal', 'abaDashboard': 'Dashboard Analytics',
        'abaRelatorios': 'Relatórios', 'abaUsuarios': 'Gestão de Usuários',
        'abaNotificacoes': 'Central de Notificações'
    };
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = titles[tabId] || 'Calendário';

    try {
        if (tabId === 'abaCalendario' && typeof calendar !== 'undefined' && calendar) {
            setTimeout(() => calendar.updateSize(), 100);
        }
        if (tabId === 'abaResumo') atualizarResumoMes();
        if (tabId === 'abaDashboard') atualizarDashboard(estado);
        if (tabId === 'abaMeusEventos') atualizarMeusEventos();
        if (tabId === 'abaNotificacoes' && typeof atualizarPainelNotificacoes === 'function') {
            atualizarPainelNotificacoes();
        }
    } catch (e) {
        console.error("Erro ao carregar dados da aba:", e);
    }

    const sidebar = document.getElementById('sidebar');
    if (sidebar && window.innerWidth < 1024) sidebar.classList.remove('open');
};

window.abrirDetalhes = function (event) {
    if (!event) return;
    eventoSelecionadoNoModal = event;
    const modal = document.getElementById('eventModal');
    
    // Suporte para quando passamos o objeto 'event' do FullCalendar ou um objeto plano
    const props = event.extendedProps || event;
    if (!props) return;

    const cor = event.backgroundColor || '#0056b3';
    const header = document.getElementById('modalHeaderBg');
    header.style.background = `linear-gradient(135deg, ${cor} 0%, ${adjustColor(cor, -30)} 100%)`;

    document.getElementById('modalTitle').textContent = props.tituloPuro || event.title;
    document.getElementById('modalTipo').textContent = props.isFeriado ? 'FERIADO' : 'EVENTO';

    const formatDate = (d) => d ? d.toLocaleDateString('pt-BR') : '-';
    const formatTime = (d) => d ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-';

    let dataTexto = '';
    if (event.end && event.start.toDateString() !== event.end.toDateString()) {
        dataTexto = `De ${formatDate(event.start)} às ${formatTime(event.start)} até ${formatDate(event.end)} às ${formatTime(event.end)}`;
    } else {
        dataTexto = `${formatDate(event.start)} das ${formatTime(event.start)} até ${formatTime(event.end)}`;
    }
    document.getElementById('modalDateTime').textContent = dataTexto;
    document.getElementById('modalResp').textContent = props.responsavel || 'Não informado';
    document.getElementById('modalCriador').textContent = props.criadoPor || 'Sistema';

    const rowContato = document.getElementById('rowModalContato');
    const modalContato = document.getElementById('modalContato');
    if (props.contatoWhats || props.contatoEmail) {
        modalContato.innerHTML = '';
        if (props.contatoWhats) {
            const iconW = document.createElement('i');
            iconW.className = 'fab fa-whatsapp';
            iconW.style.cssText = 'color: #25d366; margin-right: 0.5rem;';
            modalContato.appendChild(iconW);
            modalContato.appendChild(document.createTextNode(props.contatoWhats));
            modalContato.appendChild(document.createElement('br'));
        }
        if (props.contatoEmail) {
            const iconE = document.createElement('i');
            iconE.className = 'fas fa-envelope';
            iconE.style.cssText = 'color: var(--primary-500); margin-right: 0.5rem;';
            modalContato.appendChild(iconE);
            modalContato.appendChild(document.createTextNode(props.contatoEmail));
        }
        rowContato.style.display = 'flex';
    } else {
        rowContato.style.display = 'none';
    }

    const espacos = props.espacos || [props.espaco];
    const tagsContainer = document.getElementById('modalEspacosTags');
    tagsContainer.innerHTML = '';
    espacos.forEach(e => {
        const cor = getCorPorEspaco([e]);
        const span = document.createElement('span');
        span.className = 'tag-local';
        span.style.cssText = `background: ${cor}20; color: ${cor}; border: 1px solid ${cor}40;`;
        span.textContent = e;
        tagsContainer.appendChild(span);
    });

    const warning = document.getElementById('modalWarning');
    if (props.isConflito) warning.style.display = 'flex';
    else warning.style.display = 'none';

    const podeEditar = estado.nivelAcesso !== 'leitor' && !props.isFeriado;
    document.getElementById('modalActionButtons').style.display = podeEditar ? 'flex' : 'none';
    document.getElementById('modalCloseOnly').style.display = podeEditar ? 'none' : 'flex';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

// Filtro por espaço via chips
window.filtrarPorEspaco = function (filtro, btn) {
    const allChip = document.querySelector('.legend-chip[data-filter="all"]');
    const categoryChips = Array.from(document.querySelectorAll('.legend-chip:not([data-filter="all"])'));

    if (filtro === 'all') {
        // Chip "Todos": ativa todos os outros e marca Todos
        categoryChips.forEach(c => c.classList.add('active'));
        allChip.classList.add('active');
    } else {
        btn.classList.toggle('active');
        // Se algum foi desativado, desmarcar "Todos"; se todos ativos, marcar "Todos"
        const todosAtivos = categoryChips.every(c => c.classList.contains('active'));
        const algumAtivo = categoryChips.some(c => c.classList.contains('active'));
        if (todosAtivos) allChip.classList.add('active');
        else allChip.classList.remove('active');
        // Se nenhum estiver ativo, re-ativar todos (não deixar tudo invisível)
        if (!algumAtivo) {
            categoryChips.forEach(c => c.classList.add('active'));
            allChip.classList.add('active');
        }
    }

    // Aplicar filtro no calendário
    if (!calendar) return;
    const activeFilters = categoryChips
        .filter(c => c.classList.contains('active'))
        .map(c => c.getAttribute('data-filter'));

    calendar.getEvents().forEach(ev => {
        if (ev.extendedProps.isFeriado) return;
        const espacos = ev.extendedProps.espacos || [ev.extendedProps.espaco];
        // Mostra se qualquer espaço do evento bater com qualquer filtro ativo
        const match = activeFilters.some(f => espacos.some(e => e.toLowerCase().includes(f.toLowerCase())));
        ev.setProp('display', match ? 'block' : 'none');
    });
};

// Funções de Modal e Form movidas para js/reservas.js
// Inicialização via initReservasWindow()

window.deletarUsuario = async function (email) {
    const result = await Swal.fire({
        title: 'Remover usuário?',
        text: `Deseja remover o acesso de ${email}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Remover',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        const { error } = await supabase.from('usuarios').delete().eq('email', email);
        if (error) {
            showToast('Erro ao remover: ' + error.message, 'error');
        } else {
            carregarListaUsuariosAdmin();
            showToast('Usuário removido');
        }
    }
};

// Funções auxiliares movidas para js/reservas.js

// Funções de fechamento de modal movidas para js/reservas.js

// ==========================================
// TEMA
// ==========================================

function initTheme() {
    const savedTheme = localStorage.getItem('themeUFMA') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('themeUFMA', next);
    updateThemeIcon(next);

    if (typeof calendar !== 'undefined' && calendar) calendar.render();

    if (typeof atualizarDashboard === 'function' &&
        document.getElementById('abaDashboard')?.classList.contains('active')) {
        atualizarDashboard();
    }
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('btnToggleTheme');
    if (btn) btn.innerHTML = `<i class="fas fa-${theme === 'dark' ? 'sun' : 'moon'}"></i>`;
}

// ==========================================
// AUTENTICAÇÃO E INICIALIZAÇÃO
// ==========================================

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
    iniciarSistema(estado, {
        onEventsLoaded: atualizarTodasTelas,
        onUpdate: atualizarTodasTelas,
        onDateClick: window.abrirModalFormulario,
        onEventClick: (info) => {
            if (typeof window.setEventoSelecionado === 'function') {
                window.setEventoSelecionado(info.event);
            }
            window.abrirDetalhes(info.event);
        }
    });

    initReservasWindow(atualizarTodasTelas);
    hideLoading();
});

// Listener de logout
setupAuthListener(authVerificado);

function initUI() {
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
            setTimeout(() => { if (calendar) calendar.updateSize(); }, 350);
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
                if (calendar) {
                    e.preventDefault();
                    calendar.today();
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

// removido: aplicarPermissoes agora está em js/auth.js

// ==========================================
// CONSTRUÇÃO DA INTERFACE
// ==========================================

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

// ==========================================
// FUNÇÕES DO CALENDÁRIO
// ==========================================

// Funções de calendário movidas para js/calendar.js

// ==========================================
// SALVAR/EDITAR/DELETAR
// ==========================================

let _salvando = false;
// CRUD removido e movido para js/reservas.js

// ==========================================
// ESTADO E AUXILIARES
// ==========================================

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

function aplicarBusca(termo) {
    estado.termoBusca = termo.toLowerCase().trim();
    document.getElementById('btnLimparBusca').style.display = estado.termoBusca ? 'flex' : 'none';

    atualizarUltimosEventos();
    if (document.getElementById('abaMeusEventos').classList.contains('active')) atualizarMeusEventos();
    if (document.getElementById('abaResumo').classList.contains('active')) atualizarResumoMes();

    // Filtrar calendário
    if (calendar) {
        calendar.getEvents().forEach(ev => {
            if (!estado.termoBusca) {
                ev.setProp('display', 'block');
                return;
            }
            const texto = `${ev.extendedProps.tituloPuro} ${ev.extendedProps.responsavel} ${(ev.extendedProps.espacos || []).join(' ')}`.toLowerCase();
            ev.setProp('display', texto.includes(estado.termoBusca) ? 'block' : 'none');
        });
    }

    const dropdown = document.getElementById('searchResults');
    if (estado.termoBusca.length > 2) {
        const matches = calendar.getEvents()
            .filter(ev => !ev.extendedProps.isFeriado)
            .filter(ev => (`${ev.extendedProps.tituloPuro} ${ev.extendedProps.responsavel}`.toLowerCase()).includes(estado.termoBusca))
            .slice(0, 5);
        if (matches.length > 0) {
            dropdown.innerHTML = matches.map(ev => `
                <div class="search-result-item" onclick="abrirDetalhes(calendar.getEventById('${ev.id}')); document.getElementById('searchResults').classList.remove('active')">
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

// ==========================================
// VISUALIZAÇÕES E FILTROS
// ==========================================

function atualizarTodasTelas() {
    atualizarUltimosEventos();
    const abaResumo = document.getElementById('abaResumo');
    const abaDashboard = document.getElementById('abaDashboard');

    if (abaResumo?.classList.contains('active')) atualizarResumoMes();
    if (abaDashboard?.classList.contains('active')) atualizarDashboard(estado);
    if (estado.nivelAcesso !== 'leitor') atualizarMeusEventos();
}

function renderizarCards(eventos, containerId, mensagemVazio) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let lista = eventos;
    if (estado.termoBusca) {
        lista = eventos.filter(ev => (`${ev.extendedProps.tituloPuro} ${ev.extendedProps.responsavel} ${(ev.extendedProps.espacos || []).join(' ')}`.toLowerCase()).includes(estado.termoBusca));
    }

    const agora = new Date();
    const ativos = lista.filter(ev => (ev.end || ev.start) >= agora);
    const passados = lista.filter(ev => (ev.end || ev.start) < agora);

    if (lista.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-calendar-times"></i><h3>${mensagemVazio}</h3></div>`;
        return;
    }

    function renderCard(ev) {
        const passado = (ev.end || ev.start) < agora;
        const inicio = new Date(ev.start);
        const dia = inicio.getDate().toString().padStart(2, '0');
        const mes = mesesAbrev[inicio.getMonth()];
        const espacos = ev.extendedProps.espacos || [ev.extendedProps.espaco] || [];

        return `
            <div class="event-row ${passado ? 'past' : ''}" onclick="abrirDetalhes(calendar.getEventById('${ev.id}') || ${JSON.stringify(ev).replace(/"/g, '&quot;')})">
                <div class="event-date-box"><span class="day">${dia}</span><span class="month">${mes}</span></div>
                <div class="event-content">
                    <h4>${escapeHtml(ev.extendedProps.tituloPuro || ev.title)}</h4>
                    <div class="event-meta">
                        <span><i class="far fa-user"></i> ${escapeHtml(ev.extendedProps.responsavel) || '-'}</span>
                    </div>
                    <div class="event-locais">${espacos.map(e => `<span class="tag-local-mini ${getClasseBadge(e)}">${escapeHtml(e)}</span>`).join('')}</div>
                </div>
            </div>`;
    }

    let html = ativos.map(renderCard).join('');
    if (passados.length > 0) {
        html += `<div class="past-divider">Encerrados (${passados.length})</div>` + passados.map(renderCard).join('');
    }
    container.innerHTML = html;
}

async function atualizarUltimosEventos() {
    if (!calendar) return;
    const container = document.getElementById('containerUltimosEventos');
    if (!container) return;

    try {
        const { data, error } = await supabase
            .from('reservas')
            .select('id, title, start_time, end_time, color, titulopuro, espacos, responsavel, contatowhats, contatoemail, isconflito, groupid, datacriacao, criadopor')
            .order('datacriacao', { ascending: false })
            .limit(5);

        if (error) throw error;
        const eventos = data.map(dbParaFrontend);

        container.innerHTML = eventos.map(ev => `
            <div class="event-mini-card" onclick="abrirDetalhes(calendar.getEventById('${ev.id}') || ${JSON.stringify(ev).replace(/"/g, '&quot;')})">
                <div class="event-info">
                    <h5>${escapeHtml(ev.extendedProps.tituloPuro)}</h5>
                    <div class="event-meta-mini"><span><i class="far fa-user"></i> ${escapeHtml(ev.extendedProps.responsavel)}</span></div>
                </div>
                <i class="fas fa-chevron-right arrow"></i>
            </div>`).join('');
    } catch (e) { console.error(e); }
}

async function atualizarMeusEventos() {
    if (!calendar || !estado.usuarioLogado) return;
    const container = document.getElementById('containerMeusEventos');
    if (!container) return;
    try {
        const { data, error } = await supabase.from('reservas').select('*').eq('criadopor', estado.usuarioLogado.email).order('start_time', { ascending: true });
        if (error) throw error;
        renderizarCards(data.map(dbParaFrontend), 'containerMeusEventos', 'Você ainda não criou eventos');
    } catch (e) { console.error(e); }
}

async function atualizarResumoMes() {
    if (!calendar) return;
    const eventos = await buscarDadosMensais(estado.anoFiltro, estado.mesFiltro);
    renderizarCards(eventos, 'listaResumo', 'Nenhum evento neste mês');
}

// ==========================================
// DASHBOARD & ADMIN & EXPORTAÇÃO
// ==========================================

// Funções de Dashboard removidas e movidas para js/dashboard.js

async function adicionarUsuarioViaAdmin(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSalvarUsuario');
    setButtonLoading(btn, true);
    const email = document.getElementById('novoUsuarioEmail').value.trim();
    const role = document.getElementById('novoUsuarioRole').value;

    try {
        const { data, error } = await supabase
            .from('usuarios')
            .upsert({ email, role }, { onConflict: 'email' })
            .select()
            .single();

        if (error) {
            showToast('Erro: ' + error.message, 'error');
        } else {
            showToast(`Usuário ${email} configurado com sucesso!`);
            document.getElementById('formNovoUsuario').reset();
            carregarListaUsuariosAdmin();
        }
    } catch (err) {
        showToast('Erro: ' + err.message, 'error');
    } finally {
        setButtonLoading(btn, false);
    }
}

async function carregarListaUsuariosAdmin() {
    if (estado.nivelAcesso !== 'dono') return;
    const lista = document.getElementById('listaUsuariosAdmin');
    lista.innerHTML = '<div class="loading-skeleton"><div class="skeleton" style="height:50px"></div></div>';
    try {
        const { data: usuarios, error } = await supabase.from('usuarios').select('email, role');

        if (error) {
            lista.innerHTML = '<div class="empty-state small error"><span>Erro ao carregar usuários</span></div>';
            return;
        }

        if (!usuarios || usuarios.length === 0) {
            lista.innerHTML = '<div class="empty-state small"><span>Nenhum usuário cadastrado</span></div>';
            return;
        }

        lista.innerHTML = usuarios.map(u => {
            const roleIcons = { dono: '👑', editor: '✍️', leitor: '👁️' };
            const roleLabels = { dono: 'Admin', editor: 'Editor', leitor: 'Leitor' };
            return `
                <li class="user-item">
                    <div class="user-info-row">
                        <div class="user-avatar-mini" style="background: ${stringToColor(u.email)}">${u.email.substring(0, 2).toUpperCase()}</div>
                        <div class="user-details"><span class="user-email-list">${u.email}</span><span class="user-role-badge ${u.role}">${roleIcons[u.role]} ${roleLabels[u.role]}</span></div>
                    </div>
                    ${u.email !== estado.usuarioLogado.email ? `<button class="btn-icon danger" onclick="deletarUsuario('${u.email}')" title="Remover acesso"><i class="fas fa-user-times"></i></button>` : '<span class="you-badge">Você</span>'}
                </li>`;
        }).join('');
    } catch (e) {
        lista.innerHTML = '<div class="empty-state small error"><span>Erro ao carregar usuários</span></div>';
    }
}

function obterDadosParaExportacao() {
    if (!calendar) return [];
    const filtroAno = document.getElementById('filtroRelatorioAno').value;
    const filtroMes = document.getElementById('filtroRelatorioMes').value;
    let eventos = calendar.getEvents().filter(ev => {
        if (ev.extendedProps.isFeriado || !ev.start) return false;
        const matchAno = filtroAno === "Todos" || ev.start.getFullYear().toString() === filtroAno;
        const matchMes = filtroMes === "Todos" || ev.start.getMonth().toString() === filtroMes;
        return matchAno && matchMes;
    });
    eventos.sort((a, b) => a.start - b.start);
    return eventos.map(ev => {
        const format = (d) => d ? `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : '-';
        return {
            "Evento": ev.extendedProps.tituloPuro, "Início": format(ev.start), "Término": format(ev.end),
            "Responsável": ev.extendedProps.responsavel || "-", "WhatsApp": ev.extendedProps.contatoWhats || "-",
            "E-mail": ev.extendedProps.contatoEmail || "-", "Espaços": (ev.extendedProps.espacos || [ev.extendedProps.espaco]).join(", "),
            "Criado por": ev.extendedProps.criadoPor || "-"
        };
    });
}

function exportarExcel() {
    const dados = obterDadosParaExportacao();
    if (dados.length === 0) { showToast('Nenhum dado para exportar', 'error'); return; }
    const ws = XLSX.utils.json_to_sheet(dados); const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Agendamentos");
    XLSX.writeFile(wb, `Agendamentos_UFMA_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Excel baixado com sucesso!');
}

function exportarPDF() {
    const dados = obterDadosParaExportacao();
    if (dados.length === 0) { showToast('Nenhum dado para exportar', 'error'); return; }
    const { jsPDF } = window.jspdf; const doc = new jsPDF('landscape');
    doc.setFontSize(20); doc.text("Relatório de Agendamentos UFMA", 14, 20);
    doc.setFontSize(10); doc.setTextColor(100); doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);
    doc.autoTable({ head: [Object.keys(dados[0])], body: dados.map(obj => Object.values(obj)), startY: 35, theme: 'grid', styles: { fontSize: 9, cellPadding: 3 }, headStyles: { fillColor: [59, 130, 246], textColor: 255 } });
    doc.save(`Relatorio_UFMA_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('PDF gerado com sucesso!');
}

function fazerBackupJSON() {
    if (!calendar) return;
    const dados = calendar.getEvents().map(ev => ({
        id: ev.id,
        ...ev.extendedProps,
        start: ev.start?.toISOString(),
        end: ev.end?.toISOString()
    }));
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `backup_ufma_${new Date().toISOString().split('T')[0]}.json`; a.click();
    URL.revokeObjectURL(url); showToast('Backup salvo!');
}

async function restaurarBackupJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const confirm = await Swal.fire({
        title: 'Restaurar Backup?',
        text: 'Isso pode sobrescrever dados existentes. Continuar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, restaurar',
        cancelButtonText: 'Cancelar'
    });
    if (!confirm.isConfirmed) { e.target.value = ''; return; }

    const reader = new FileReader();
    reader.onload = async (evt) => {
        try {
            const dados = JSON.parse(evt.target.result);
            if (!Array.isArray(dados)) throw new Error('Formato inválido');
            Swal.fire({ title: 'Restaurando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            for (const item of dados) {
                const { id, ...rest } = item;
                // Mapeia os campos do backup para o formato do banco
                const dadosDb = {
                    title: rest.title || rest.tituloPuro,
                    titulopuro: rest.tituloPuro || rest.titulopuro || rest.title,
                    start_time: rest.start || rest.start_time,
                    end_time: rest.end || rest.end_time,
                    espacos: rest.espacos,
                    responsavel: rest.responsavel,
                    contatowhats: rest.contatoWhats || rest.contatowhats || null,
                    contatoemail: rest.contatoEmail || rest.contatoemail || null,
                    color: rest.color,
                    isconflito: rest.isConflito || rest.isconflito || false,
                    groupid: rest.groupId || rest.groupid || null,
                    datacriacao: rest.dataCriacao || rest.datacriacao,
                    criadopor: rest.criadoPor || rest.criadopor || null
                };

                if (id) {
                    dadosDb.id = id;
                    await supabase.from('reservas').upsert(dadosDb, { onConflict: 'id' });
                } else {
                    await supabase.from('reservas').insert(dadosDb);
                }
            }

            await recarregarDados();
            Swal.close();
            showToast('Backup restaurado com sucesso!');
        } catch (err) {
            console.error("Erro ao restaurar:", err);
            Swal.close();
            showToast('Erro ao restaurar backup: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}
