import { supabase } from './supabaseClient.js';
import { showToast, setButtonLoading, hideLoading, debounce, stringToColor, adjustColor, escapeHtml } from './js/utils.js';
import { dbParaFrontend, frontendParaDb } from './js/db.js';
import { initAuth, aplicarPermissoes, setupAuthListener } from './js/auth.js';
import { iniciarSistema, calendar, getCorPorEspaco, getClasseBadge, buscarDadosMensais, recarregarDados } from './js/calendar.js';
import { mesesAbrev, feriadosFixos } from './js/constants.js';

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
        'abaRelatorios': 'Relatórios', 'abaUsuarios': 'Gestão de Usuários'
    };
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = titles[tabId] || 'Calendário';

    try {
        if (tabId === 'abaCalendario' && typeof calendar !== 'undefined' && calendar) {
            setTimeout(() => calendar.updateSize(), 100);
        }
        if (tabId === 'abaResumo') atualizarResumoMes();
        if (tabId === 'abaDashboard') atualizarDashboard();
        if (tabId === 'abaMeusEventos') atualizarMeusEventos();
    } catch (e) {
        console.error("Erro ao carregar dados da aba:", e);
    }

    const sidebar = document.getElementById('sidebar');
    if (sidebar && window.innerWidth < 1024) sidebar.classList.remove('open');
};

window.abrirDetalhes = function (event) {
    eventoSelecionadoNoModal = event;
    const modal = document.getElementById('eventModal');
    const props = event.extendedProps;

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

window.abrirModalFormulario = function (dataInicial = null) {
    const modal = document.getElementById('modalFormAgendamento');
    const form = document.getElementById('reservaForm');

    form.reset();
    document.getElementById('editEventId').value = '';
    document.getElementById('editGroupId').value = '';
    document.getElementById('formTitleModal').innerHTML = '<i class="fas fa-plus-circle"></i> Novo Agendamento';
    document.getElementById('btnSalvar').innerHTML = '<i class="fas fa-check"></i> Confirmar Agendamento';

    document.querySelectorAll('input[name="espaco"]').forEach(cb => {
        cb.checked = false;
        cb.closest('.checkbox-card')?.classList.remove('checked');
    });

    document.getElementById('datasContainer').innerHTML = '';
    window.adicionarLinhaData(dataInicial);

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.selecionarMes = function (mes) {
    estado.mesFiltro = mes;
    atualizarSelecaoMes();
    atualizarResumoMes();
};

window.prepararEdicaoPorId = function (id) {
    eventoSelecionadoNoModal = calendar.getEventById(id);
    prepararEdicao();
};

window.deletarPorId = async function (id) {
    eventoSelecionadoNoModal = calendar.getEventById(id);
    deletarEvento();
};

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

window.adicionarLinhaData = function (dataEspecifica = null) {
    const container = document.getElementById('datasContainer');
    const id = Date.now();

    const row = document.createElement('div');
    row.className = 'data-row-styled';
    row.innerHTML = `
        <div class="date-input-group">
            <label>Data</label>
            <input type="text" class="input-date flatpickr" id="data_${id}" required placeholder="Selecione">
        </div>
        <div class="time-inputs">
            <div class="time-input">
                <label>Início</label>
                <input type="text" class="input-time" placeholder="08:00" maxlength="5" value="08:00" required>
            </div>
            <div class="time-separator">até</div>
            <div class="time-input">
                <label>Término</label>
                <input type="text" class="input-time" placeholder="12:00" maxlength="5" value="12:00" required>
            </div>
        </div>
        <button type="button" class="btn-remove-data" onclick="this.closest('.data-row-styled').remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(row);

    flatpickr(row.querySelector('.flatpickr'), {
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "d/m/Y",
        locale: "pt",
        defaultDate: dataEspecifica,
        disableMobile: true
    });

    row.querySelectorAll('.input-time').forEach(input => {
        input.addEventListener('input', function (e) {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length >= 2) v = v.slice(0, 2) + ':' + v.slice(2, 4);
            e.target.value = v;
        });
    });
};

function fecharModal() {
    document.getElementById('eventModal').classList.remove('active');
    document.body.style.overflow = '';
    eventoSelecionadoNoModal = null;
}

function fecharModalForm() {
    document.getElementById('modalFormAgendamento').classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
        document.getElementById('reservaForm').reset();
        document.getElementById('datasContainer').innerHTML = '';
    }, 300);
}

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
        onEventClick: window.abrirDetalhes
    });
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
    document.getElementById('btnAplicarFiltrosDash')?.addEventListener('click', atualizarDashboard);
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

    document.getElementById('btnDeleteEvent')?.addEventListener('click', deletarEvento);
    document.getElementById('btnEditEvent')?.addEventListener('click', prepararEdicao);
    document.getElementById('reservaForm')?.addEventListener('submit', salvarOuEditarEvento);
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
async function salvarOuEditarEvento(e) {
    e.preventDefault();
    if (_salvando) return; // Prevenção de duplo clique
    _salvando = true;
    const btn = document.getElementById('btnSalvar');
    setButtonLoading(btn, true);

    try {
        const editId = document.getElementById('editEventId').value;
        const titulo = document.getElementById('titulo').value;
        const responsavel = document.getElementById('responsavel').value;
        const contatoWhats = document.getElementById('contatoWhats').value;
        const contatoEmail = document.getElementById('contatoEmail').value;

        const espacos = Array.from(document.querySelectorAll('input[name="espaco"]:checked')).map(cb => cb.value);
        if (espacos.length === 0) { showToast('Selecione pelo menos um espaço', 'error'); setButtonLoading(btn, false); return; }

        const sessoes = [];
        document.querySelectorAll('.data-row-styled').forEach(row => {
            const data = row.querySelector('.flatpickr').value;
            const horaIni = row.querySelectorAll('.input-time')[0].value;
            const horaFim = row.querySelectorAll('.input-time')[1].value;
            if (data && horaIni && horaFim) sessoes.push({ start: `${data}T${horaIni}`, end: `${data}T${horaFim}` });
        });

        if (sessoes.length === 0) { showToast('Adicione pelo menos uma data válida', 'error'); setButtonLoading(btn, false); return; }

        // Validação de horário: fim deve ser após início
        for (const sess of sessoes) {
            const ini = new Date(sess.start).getTime();
            const fim = new Date(sess.end).getTime();
            if (fim <= ini) {
                showToast('O horário de término deve ser posterior ao de início', 'error');
                setButtonLoading(btn, false);
                return;
            }
        }

        const conflitos = [];
        sessoes.forEach(sess => {
            const ini = new Date(sess.start).getTime();
            const fim = new Date(sess.end).getTime();
            calendar.getEvents().forEach(ev => {
                if (editId && ev.id === editId) return;
                if (ev.extendedProps.isFeriado) return;
                const evEspacos = ev.extendedProps.espacos || [ev.extendedProps.espaco];
                const comum = espacos.filter(e => evEspacos.includes(e));
                if (comum.length === 0) return;
                const evIni = ev.start.getTime();
                const evFim = ev.end ? ev.end.getTime() : evIni + 3600000;
                if (ini < evFim && fim > evIni) conflitos.push(ev);
            });
        });

        let forcar = false;
        if (conflitos.length > 0) {
            const result = await Swal.fire({
                title: 'Conflitos detectados',
                html: `<p style="margin-bottom:15px">Este agendamento conflita com <b>${conflitos.length}</b> evento(s) existente(s).</p>
                       <div style="text-align:left;max-height:150px;overflow:auto;background:#f8f9fa;padding:10px;border-radius:8px;">
                       ${conflitos.map(c => `<div style="padding:5px;border-left:3px solid #e74c3c;margin:5px 0;padding-left:8px;">
                            <b>${escapeHtml(c.extendedProps.tituloPuro)}</b><br><small>${(c.extendedProps.espacos || [c.extendedProps.espaco]).map(escapeHtml).join(', ')}</small>
                       </div>`).join('')}</div>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Forçar mesmo assim',
                cancelButtonText: 'Voltar e corrigir',
                confirmButtonColor: '#e74c3c'
            });
            if (!result.isConfirmed) { setButtonLoading(btn, false); return; }
            forcar = true;
        }

        const cor = getCorPorEspaco(espacos);
        const groupId = editId ? document.getElementById('editGroupId').value : `GRP-${Date.now()}`;
        const timestamp = Date.now();
        const criadoPor = estado.usuarioLogado.email;

        // Se editando, deletar o antigo
        if (editId) {
            const antigo = calendar.getEventById(editId);
            if (antigo) antigo.remove();
            await supabase.from('reservas').delete().eq('id', editId);
        }

        // Inserir novas sessões
        for (let i = 0; i < sessoes.length; i++) {
            const dadosFrontend = {
                title: titulo,
                tituloPuro: titulo,
                start: sessoes[i].start,
                end: sessoes[i].end,
                espacos: espacos,
                responsavel: responsavel,
                contatoWhats: contatoWhats,
                contatoEmail: contatoEmail,
                color: cor,
                isConflito: forcar,
                groupId: groupId,
                dataCriacao: timestamp + i,
                criadoPor: criadoPor
            };

            const dadosDb = frontendParaDb(dadosFrontend);

            const { data: inserted, error } = await supabase
                .from('reservas')
                .insert(dadosDb)
                .select()
                .single();

            if (error) {
                console.error("Erro ao inserir:", error);
                showToast('Erro ao salvar: ' + error.message, 'error');
                setButtonLoading(btn, false);
                _salvando = false;
                return;
            }
            // O realtime INSERT vai adicionar ao calendário automaticamente
        }

        fecharModalForm();
        atualizarTodasTelas();
        showToast(editId ? 'Agendamento atualizado!' : 'Agendamento criado com sucesso!');

    } catch (erro) {
        console.error("Erro:", erro);
        showToast('Erro ao salvar: ' + erro.message, 'error');
    }
    finally { setButtonLoading(btn, false); _salvando = false; }
}

async function deletarEvento() {
    if (!eventoSelecionadoNoModal) return;
    const result = await Swal.fire({
        title: 'Confirmar exclusão?', text: 'Esta ação não pode ser desfeita.', icon: 'warning',
        showCancelButton: true, confirmButtonText: 'Sim, excluir', cancelButtonText: 'Cancelar', confirmButtonColor: '#e74c3c'
    });
    if (result.isConfirmed) {
        try {
            const { error } = await supabase.from('reservas').delete().eq('id', eventoSelecionadoNoModal.id);
            if (error) {
                showToast('Erro ao excluir: ' + error.message, 'error');
                return;
            }
            eventoSelecionadoNoModal.remove();
            fecharModal();
            atualizarTodasTelas();
            showToast('Evento excluído com sucesso');
        } catch (e) { showToast('Erro ao excluir', 'error'); }
    }
}

function prepararEdicao() {
    if (!eventoSelecionadoNoModal) return;
    const ev = eventoSelecionadoNoModal;
    const props = ev.extendedProps;

    fecharModal();

    document.getElementById('editEventId').value = ev.id;
    document.getElementById('editGroupId').value = props.groupId || '';
    document.getElementById('formTitleModal').innerHTML = '<i class="fas fa-edit"></i> Editar Agendamento';
    document.getElementById('btnSalvar').innerHTML = '<i class="fas fa-save"></i> Salvar Alterações';
    document.getElementById('titulo').value = props.tituloPuro || ev.title;
    document.getElementById('responsavel').value = props.responsavel || '';
    document.getElementById('contatoWhats').value = props.contatoWhats || '';
    document.getElementById('contatoEmail').value = props.contatoEmail || '';

    document.querySelectorAll('input[name="espaco"]').forEach(cb => {
        cb.checked = (props.espacos || [props.espaco]).includes(cb.value);
        if (cb.checked) cb.closest('.checkbox-card')?.classList.add('checked');
    });

    document.getElementById('datasContainer').innerHTML = '';
    window.adicionarLinhaData();

    const row = document.querySelector('.data-row-styled');
    const dataIni = new Date(ev.start.getTime() - (ev.start.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    const horaIni = ev.start.toTimeString().slice(0, 5);
    const horaFim = ev.end ? ev.end.toTimeString().slice(0, 5) : horaIni;

    row.querySelector('.flatpickr')._flatpickr.setDate(dataIni);
    row.querySelectorAll('.input-time')[0].value = horaIni;
    row.querySelectorAll('.input-time')[1].value = horaFim;

    document.getElementById('modalFormAgendamento').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ==========================================
// VISUALIZAÇÕES E FILTROS
// ==========================================

function atualizarTodasTelas() {
    atualizarUltimosEventos();
    // Note: atualizarResumoMes e atualizarDashboard agora são acionados na troca de abas 
    // ou podem ser chamados aqui se estiverem visíveis.
    const abaResumo = document.getElementById('abaResumo');
    const abaDashboard = document.getElementById('abaDashboard');

    if (abaResumo?.classList.contains('active')) atualizarResumoMes();
    if (abaDashboard?.classList.contains('active')) atualizarDashboard();
    if (estado.nivelAcesso !== 'leitor') atualizarMeusEventos();
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

    // Contador mostra só os ativos
    const countBadge = document.getElementById(containerId + '__count');
    if (countBadge) countBadge.textContent = ativos.length;

    if (lista.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h3>${estado.termoBusca ? 'Nenhum resultado' : mensagemVazio}</h3>
                <p>${estado.termoBusca ? 'Tente outro termo de busca.' : 'Nenhum evento para exibir aqui.'}</p>
            </div>`;
        return;
    }

    function renderCard(ev) {
        const passado = (ev.end || ev.start) < agora;
        const inicio = ev.start;
        const fim = ev.end;
        const dia = inicio.getDate().toString().padStart(2, '0');
        const mes = mesesAbrev[inicio.getMonth()];
        const horaInicio = inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const horaFim = fim ? fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
        const periodo = horaFim ? `${horaInicio} - ${horaFim}` : `A partir das ${horaInicio}`;
        const espacos = ev.extendedProps.espacos || [ev.extendedProps.espaco];
        const badgeConflito = ev.extendedProps.isConflito
            ? `<span class="badge-conflito"><i class="fas fa-exclamation"></i> Conflito</span>` : '';

        return `
            <div class="event-row ${passado ? 'past' : ''} ${ev.extendedProps.isConflito ? 'conflito' : ''}" style="--event-color: ${ev.backgroundColor || '#0056b3'}">
                <div class="event-date-box">
                    <span class="day">${dia}</span>
                    <span class="month">${mes}</span>
                </div>
                <div class="event-content" onclick="abrirDetalhes(calendar.getEventById('${ev.id}'))">
                    <div class="event-header-row">
                        <h4>${escapeHtml(ev.extendedProps.tituloPuro)}</h4>
                        ${badgeConflito}
                    </div>
                    <div class="event-meta">
                        <span><i class="far fa-clock"></i> ${periodo}</span>
                        <span><i class="far fa-user"></i> ${escapeHtml(ev.extendedProps.responsavel) || '-'}</span>
                    </div>
                    <div class="event-locais">${espacos.map(e => `<span class="tag-local-mini ${getClasseBadge(e)}">${escapeHtml(e)}</span>`).join('')}</div>
                </div>
                ${(estado.nivelAcesso !== 'leitor') ? `
                <div class="event-actions">
                    <button class="btn-icon-sm" onclick="event.stopPropagation(); prepararEdicaoPorId('${ev.id}')" title="Editar agendamento"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon-sm danger" onclick="event.stopPropagation(); deletarPorId('${ev.id}')" title="Excluir agendamento"><i class="fas fa-trash"></i></button>
                </div>` : ''}
            </div>`;
    }

    let html = '';

    // Eventos ativos
    if (ativos.length === 0) {
        html += `<div class="empty-state small"><i class="fas fa-calendar-check"></i><p>Nenhum evento ativo no momento.</p></div>`;
    } else {
        html += ativos.map(renderCard).join('');
    }

    // Seção de passados colapsável
    if (passados.length > 0) {
        html += `
        <div class="past-events-section">
            <button class="btn-past-toggle" onclick="this.closest('.past-events-section').classList.toggle('open')">
                <i class="fas fa-history"></i>
                <span>Encerrados (${passados.length})</span>
                <i class="fas fa-chevron-down toggle-chevron"></i>
            </button>
            <div class="past-events-list">
                ${passados.map(renderCard).join('')}
            </div>
        </div>`;
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

        if (eventos.length === 0) {
            container.innerHTML = `<div class="empty-state small"><i class="fas fa-inbox"></i><span>Nenhum evento recente</span></div>`;
            return;
        }

        container.innerHTML = eventos
            .sort((a, b) => b.extendedProps.dataCriacao - a.extendedProps.dataCriacao)
            .map(ev => {
                const data = new Date(ev.start);
                const hoje = new Date(); const ontem = new Date(hoje); ontem.setDate(ontem.getDate() - 1);
                let dataTexto = (data.toDateString() === hoje.toDateString()) ? 'Hoje' : (data.toDateString() === ontem.toDateString()) ? 'Ontem' : data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
                return `
                <div class="event-mini-card" onclick="abrirDetalhes({id: '${ev.id}', extendedProps: ${JSON.stringify(ev.extendedProps)}, title: '${ev.title.replace(/'/g, "\\'")}', backgroundColor: '${ev.backgroundColor}', start: new Date('${ev.start}'), end: new Date('${ev.end}')})" style="--card-color: ${ev.backgroundColor}">
                    <div class="event-status"></div>
                    <div class="event-info">
                        <h5>${escapeHtml(ev.extendedProps.tituloPuro)}</h5>
                        <div class="event-meta-mini"><span><i class="far fa-calendar"></i> ${dataTexto}</span><span><i class="far fa-user"></i> ${escapeHtml(ev.extendedProps.responsavel) || '-'}</span></div>
                    </div>
                    <i class="fas fa-chevron-right arrow"></i>
                </div>`;
            }).join(''); // Manter a ordenação visual
    } catch (e) {
        console.error("Erro ao atualizar últimos eventos:", e);
    }
}

async function atualizarMeusEventos() {
    if (!calendar || !estado.usuarioLogado) return;
    const container = document.getElementById('containerMeusEventos');
    container.innerHTML = `<div class="loading-inline"><i class="fas fa-spinner fa-spin"></i> Carregando seus eventos...</div>`;

    try {
        const { data, error } = await supabase
            .from('reservas')
            .select('id, title, start_time, end_time, color, titulopuro, espacos, responsavel, contatowhats, contatoemail, isconflito, groupid, datacriacao, criadopor')
            .eq('criadopor', estado.usuarioLogado.email)
            .order('start_time', { ascending: true });

        if (error) throw error;

        const meus = data.map(dbParaFrontend);
        renderizarCards(meus, 'containerMeusEventos', 'Você ainda não criou nenhum evento');
    } catch (e) {
        console.error("Erro ao carregar meus eventos:", e);
        container.innerHTML = `<div class="empty-state small"><p>Erro ao carregar seus dados.</p></div>`;
    }
}

async function atualizarResumoMes() {
    if (!calendar) return;
    const container = document.getElementById('listaResumo');
    container.innerHTML = `<div class="loading-inline"><i class="fas fa-spinner fa-spin"></i> Carregando resumo...</div>`;

    const eventos = await buscarDadosMensais(estado.anoFiltro, estado.mesFiltro);
    eventos.sort((a, b) => new Date(a.start) - new Date(b.start));

    renderizarCards(eventos, 'listaResumo', 'Nenhum evento neste mês');
}

// ==========================================
// DASHBOARD & ADMIN & EXPORTAÇÃO
// ==========================================

async function atualizarDashboard() {
    if (!calendar || estado.nivelAcesso !== 'dono') return;

    const filtroAno = parseInt(document.getElementById('filtroDashAno').value);
    const filtroMesRaw = document.getElementById('filtroDashMes').value;
    const filtroMes = filtroMesRaw === "Todos" ? "Todos" : parseInt(filtroMesRaw);
    const filtroCat = document.getElementById('filtroDashCategoria').value;

    let eventos = [];

    if (filtroMes === "Todos") {
        // Se precisar de todos os meses, infelizmente temos que buscar o ano todo
        // Mas o usuário falou que o foco é o mês atual.
        const { data, error } = await supabase
            .from('reservas')
            .select('id, title, start_time, end_time, color, titulopuro, espacos, responsavel, contatowhats, contatoemail, isconflito, groupid, datacriacao, criadopor')
            .gte('start_time', `${filtroAno}-01-01T00:00:00`)
            .lte('end_time', `${filtroAno}-12-31T23:59:59`);
        if (!error && data) eventos = data.map(dbParaFrontend);
    } else {
        eventos = await buscarDadosMensais(filtroAno, filtroMes);
    }

    // Filtragem por categoria (feita em memória para não complicar a query SQL)
    if (filtroCat !== "Todas") {
        eventos = eventos.filter(ev => (ev.extendedProps.espacos || []).some(e => e.includes(filtroCat)));
    }

    let totalHoras = 0; let conflitos = 0;
    const espacosUnicos = new Set(); const respsUnicos = new Set();
    const porMes = Array(12).fill(0); const porDia = Array(7).fill(0);
    const contagemEspacos = {}; const contagemResps = {};

    eventos.forEach(ev => {
        const ini = ev.start.getTime(); const fim = ev.end ? ev.end.getTime() : ini + 3600000;
        totalHoras += (fim - ini) / 3600000;
        if (ev.extendedProps.isConflito) conflitos++;
        (ev.extendedProps.espacos || [ev.extendedProps.espaco]).forEach(e => {
            espacosUnicos.add(e); contagemEspacos[e] = (contagemEspacos[e] || 0) + 1;
        });
        respsUnicos.add(ev.extendedProps.responsavel);
        contagemResps[ev.extendedProps.responsavel] = (contagemResps[ev.extendedProps.responsavel] || 0) + 1;
        porMes[ev.start.getMonth()]++; porDia[ev.start.getDay()]++;
    });

    animateValue('dashMetrica1', parseInt(document.getElementById('dashMetrica1').textContent), eventos.length, 1000);
    animateValue('dashMetrica5', parseInt(document.getElementById('dashMetrica5').textContent), Math.round(totalHoras), 1000);
    animateValue('dashMetrica2', parseInt(document.getElementById('dashMetrica2').textContent), espacosUnicos.size, 1000);
    animateValue('dashMetrica4', parseInt(document.getElementById('dashMetrica4').textContent), respsUnicos.size, 1000);
    animateValue('dashMetrica3', parseInt(document.getElementById('dashMetrica3').textContent), conflitos, 1000);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    Chart.defaults.color = isDark ? '#94a3b8' : '#64748b';
    Chart.defaults.borderColor = isDark ? '#334155' : '#e2e8f0';

    if (estado.graficosAtivos.meses) estado.graficosAtivos.meses.destroy();
    if (estado.graficosAtivos.dias) estado.graficosAtivos.dias.destroy();
    if (estado.graficosAtivos.espacos) estado.graficosAtivos.espacos.destroy();
    if (estado.graficosAtivos.resps) estado.graficosAtivos.resps.destroy();

    estado.graficosAtivos.meses = new Chart(document.getElementById('chartMeses'), { type: 'bar', data: { labels: mesesAbrev, datasets: [{ label: 'Reservas', data: porMes, backgroundColor: '#3b82f6', borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
    estado.graficosAtivos.dias = new Chart(document.getElementById('chartDias'), { type: 'bar', data: { labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'], datasets: [{ label: 'Reservas', data: porDia, backgroundColor: '#10b981', borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });

    const topEspacos = Object.entries(contagemEspacos).sort((a, b) => b[1] - a[1]).slice(0, 5);
    estado.graficosAtivos.espacos = new Chart(document.getElementById('chartEspacos'), { type: 'doughnut', data: { labels: topEspacos.map(i => i[0].split(' - ')[0]), datasets: [{ data: topEspacos.map(i => i[1]), backgroundColor: ['#8e44ad', '#e67e22', '#27ae60', '#3498db', '#e74c3c'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 12 } } }, cutout: '70%' } });

    const topResps = Object.entries(contagemResps).sort((a, b) => b[1] - a[1]).slice(0, 5);
    estado.graficosAtivos.resps = new Chart(document.getElementById('chartResps'), { type: 'bar', data: { labels: topResps.map(i => i[0].split(' ')[0]), datasets: [{ label: 'Eventos', data: topResps.map(i => i[1]), backgroundColor: '#f59e0b', borderRadius: 6 }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
}

function animateValue(id, start, end, duration) {
    if (start === end) return;
    const range = end - start;
    let stepTime = Math.max(Math.abs(Math.floor(duration / range)), 50);
    let startTime = new Date().getTime(); let endTime = startTime + duration; let timer;
    function run() {
        let now = new Date().getTime(); let remaining = Math.max((endTime - now) / duration, 0);
        let value = Math.round(end - (remaining * range));
        document.getElementById(id).innerHTML = value + (id === 'dashMetrica5' ? '<span class="suffix">h</span>' : '');
        if (value == end) clearInterval(timer);
    }
    timer = setInterval(run, stepTime); run();
}

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
