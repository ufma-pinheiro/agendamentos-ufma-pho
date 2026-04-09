// app.js - Versão Supabase (Auth + PostgreSQL + Realtime)
import { supabase } from './supabaseClient.js';

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

let calendar;
let eventoSelecionadoNoModal = null;
const mesesAbrev = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const feriadosFixos = [];

// ==========================================
// MAPEAMENTO DE COLUNAS (Frontend ↔ DB)
// ==========================================

// Converte dados do banco (lowercase) para o formato do frontend (camelCase)
function dbParaFrontend(row) {
    return {
        id: row.id,
        title: row.title,
        tituloPuro: row.titulopuro,
        start: row.start_time,
        end: row.end_time,
        espacos: row.espacos,
        responsavel: row.responsavel,
        contatoWhats: row.contatowhats,
        contatoEmail: row.contatoemail,
        color: row.color,
        backgroundColor: row.color,
        borderColor: row.color,
        textColor: '#fff',
        isConflito: row.isconflito,
        groupId: row.groupid,
        dataCriacao: row.datacriacao,
        criadoPor: row.criadopor,
        display: 'block'
    };
}

// Converte dados do frontend para o formato do banco (lowercase)
function frontendParaDb(dados) {
    return {
        title: dados.title,
        titulopuro: dados.tituloPuro,
        start_time: dados.start,
        end_time: dados.end,
        espacos: dados.espacos,
        responsavel: dados.responsavel,
        contatowhats: dados.contatoWhats || null,
        contatoemail: dados.contatoEmail || null,
        color: dados.color,
        isconflito: dados.isConflito || false,
        groupid: dados.groupId || null,
        datacriacao: dados.dataCriacao,
        criadopor: dados.criadoPor
    };
}

// ==========================================
// UTILITÁRIOS VISUAIS
// ==========================================

function showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}"></i>
        </div>
        <div class="toast-content">
            <span>${message}</span>
        </div>
    `;
    
    container.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)'; 
        toast.style.opacity = '1';
    });
    
    setTimeout(() => {
        toast.style.transform = 'translateY(20px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function setButtonLoading(btn, loading = true) {
    if(loading) {
        btn.dataset.originalHtml = btn.innerHTML;
        btn.innerHTML = '<div class="spinner-inline"></div>';
        btn.disabled = true;
    } else {
        btn.innerHTML = btn.dataset.originalHtml;
        btn.disabled = false;
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if(overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.style.display = 'none', 300);
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => { clearTimeout(timeout); func(...args); };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function stringToColor(str) {
    let hash = 0;
    for(let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + "00000".substring(0, 6 - c.length) + c;
}

function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

// ==========================================
// FUNÇÕES GLOBAIS (EXPOSTAS AO WINDOW)
// ==========================================

window.switchTab = function(tabId, navElement) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    const selectedTab = document.getElementById(tabId);
    if(selectedTab) selectedTab.classList.add('active');
    
    if(navElement) {
        navElement.classList.add('active');
    } else {
        const btn = document.querySelector(`.nav-item[data-target="${tabId}"]`);
        if(btn) btn.classList.add('active');
    }
    
    const titles = {
        'abaCalendario': 'Calendário', 'abaMeusEventos': 'Meus Eventos',
        'abaResumo': 'Resumo Mensal', 'abaDashboard': 'Dashboard Analytics',
        'abaRelatorios': 'Relatórios', 'abaUsuarios': 'Gestão de Usuários'
    };
    const pageTitle = document.getElementById('pageTitle');
    if(pageTitle) pageTitle.textContent = titles[tabId] || 'Calendário';
    
    try {
        if(tabId === 'abaCalendario' && typeof calendar !== 'undefined' && calendar) {
            setTimeout(() => calendar.updateSize(), 100);
        }
        if(tabId === 'abaResumo') atualizarResumoMes();
        if(tabId === 'abaDashboard') atualizarDashboard();
        if(tabId === 'abaMeusEventos') atualizarMeusEventos();
    } catch(e) {
        console.error("Erro ao carregar dados da aba:", e);
    }
    
    const sidebar = document.getElementById('sidebar');
    if(sidebar && window.innerWidth < 1024) sidebar.classList.remove('open');
};

window.abrirDetalhes = function(event) {
    eventoSelecionadoNoModal = event;
    const modal = document.getElementById('eventModal');
    const props = event.extendedProps;
    
    const cor = event.backgroundColor || '#0056b3';
    const header = document.getElementById('modalHeaderBg');
    header.style.background = `linear-gradient(135deg, ${cor} 0%, ${adjustColor(cor, -30)} 100%)`;
    
    document.getElementById('modalTitle').textContent = props.tituloPuro || event.title;
    document.getElementById('modalTipo').textContent = props.isFeriado ? 'FERIADO' : 'EVENTO';
    
    const formatDate = (d) => d ? d.toLocaleDateString('pt-BR') : '-';
    const formatTime = (d) => d ? d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : '-';
    
    let dataTexto = '';
    if(event.end && event.start.toDateString() !== event.end.toDateString()) {
        dataTexto = `De ${formatDate(event.start)} às ${formatTime(event.start)} até ${formatDate(event.end)} às ${formatTime(event.end)}`;
    } else {
        dataTexto = `${formatDate(event.start)} das ${formatTime(event.start)} até ${formatTime(event.end)}`;
    }
    document.getElementById('modalDateTime').textContent = dataTexto;
    document.getElementById('modalResp').textContent = props.responsavel || 'Não informado';
    document.getElementById('modalCriador').textContent = props.criadoPor || 'Sistema';
    
    const rowContato = document.getElementById('rowModalContato');
    const modalContato = document.getElementById('modalContato');
    if(props.contatoWhats || props.contatoEmail) {
        let html = '';
        if(props.contatoWhats) html += `<i class="fab fa-whatsapp" style="color: #25d366; margin-right: 0.5rem;"></i>${props.contatoWhats}<br>`;
        if(props.contatoEmail) html += `<i class="fas fa-envelope" style="color: var(--primary-500); margin-right: 0.5rem;"></i>${props.contatoEmail}`;
        modalContato.innerHTML = html;
        rowContato.style.display = 'flex';
    } else {
        rowContato.style.display = 'none';
    }
    
    const espacos = props.espacos || [props.espaco];
    const tagsContainer = document.getElementById('modalEspacosTags');
    tagsContainer.innerHTML = espacos.map(e => 
        `<span class="tag-local" style="background: ${getCorPorEspaco([e])}20; color: ${getCorPorEspaco([e])}; border: 1px solid ${getCorPorEspaco([e])}40;">${e}</span>`
    ).join('');
    
    const warning = document.getElementById('modalWarning');
    if(props.isConflito) warning.style.display = 'flex';
    else warning.style.display = 'none';
    
    const podeEditar = estado.nivelAcesso !== 'leitor' && !props.isFeriado;
    document.getElementById('modalActionButtons').style.display = podeEditar ? 'flex' : 'none';
    document.getElementById('modalCloseOnly').style.display = podeEditar ? 'none' : 'flex';
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

// Filtro por espaço via chips
window.filtrarPorEspaco = function(filtro, btn) {
    const chips = document.querySelectorAll('.legend-chip');
    
    if(filtro === 'all') {
        // Toggle all: se todos estão ativos, desativa todos; senão, ativa todos
        const todosAtivos = Array.from(chips).every(c => c.classList.contains('active'));
        chips.forEach(c => {
            if(todosAtivos) c.classList.remove('active');
            else c.classList.add('active');
        });
    } else {
        btn.classList.toggle('active');
        // Atualizar "Todos" automaticamente
        const allChip = document.querySelector('.legend-chip[data-filter="all"]');
        const categoryChips = document.querySelectorAll('.legend-chip:not([data-filter="all"])');
        const todosAtivos = Array.from(categoryChips).every(c => c.classList.contains('active'));
        if(todosAtivos) allChip.classList.add('active');
        else allChip.classList.remove('active');
    }
    
    // Aplicar filtro no calendário
    if(!calendar) return;
    const activeFilters = Array.from(document.querySelectorAll('.legend-chip.active:not([data-filter="all"])'))
        .map(c => c.getAttribute('data-filter'));
    
    calendar.getEvents().forEach(ev => {
        if(ev.extendedProps.isFeriado) return;
        const espacos = ev.extendedProps.espacos || [ev.extendedProps.espaco];
        const match = activeFilters.length === 0 || espacos.some(e => activeFilters.some(f => e.includes(f)));
        ev.setProp('display', match ? 'block' : 'none');
    });
};

window.abrirModalFormulario = function(dataInicial = null) {
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

window.selecionarMes = function(mes) {
    estado.mesFiltro = mes;
    atualizarSelecaoMes();
    atualizarResumoMes();
};

window.prepararEdicaoPorId = function(id) {
    eventoSelecionadoNoModal = calendar.getEventById(id);
    prepararEdicao();
};

window.deletarPorId = async function(id) {
    eventoSelecionadoNoModal = calendar.getEventById(id);
    deletarEvento();
};

window.deletarUsuario = async function(email) {
    const result = await Swal.fire({
        title: 'Remover usuário?',
        text: `Deseja remover o acesso de ${email}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Remover',
        cancelButtonText: 'Cancelar'
    });
    
    if(result.isConfirmed) {
        const { error } = await supabase.from('usuarios').delete().eq('email', email);
        if(error) {
            showToast('Erro ao remover: ' + error.message, 'error');
        } else {
            carregarListaUsuariosAdmin();
            showToast('Usuário removido');
        }
    }
};

window.adicionarLinhaData = function(dataEspecifica = null) {
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
        input.addEventListener('input', function(e) {
            let v = e.target.value.replace(/\D/g, '');
            if(v.length >= 2) v = v.slice(0,2) + ':' + v.slice(2,4);
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
    
    if(typeof calendar !== 'undefined' && calendar) calendar.render();
    
    if(typeof atualizarDashboard === 'function' && 
       document.getElementById('abaDashboard')?.classList.contains('active')) {
        atualizarDashboard();
    }
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('btnToggleTheme');
    if(btn) btn.innerHTML = `<i class="fas fa-${theme === 'dark' ? 'sun' : 'moon'}"></i>`;
}

// ==========================================
// AUTENTICAÇÃO E INICIALIZAÇÃO
// ==========================================

// NÃO usar failsafe que esconde o loading antes da verificação
let authVerificado = false;
const failsafeLoading = setTimeout(() => { 
    if(authVerificado) hideLoading(); 
}, 15000);

function mostrarAcessoNegado() {
    // Esconde o loading e mostra o overlay de acesso negado
    const loading = document.getElementById('loadingOverlay');
    if(loading) loading.style.display = 'none';
    
    const denied = document.getElementById('accessDeniedOverlay');
    if(denied) denied.style.display = 'flex';
}

async function initAuth() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if(!session) {
            window.location.href = "login.html";
            return;
        }
        
        const user = session.user;
        estado.usuarioLogado = user;
        
        // Buscar role do usuário
        const { data: userData, error: roleError } = await supabase
            .from('usuarios')
            .select('role')
            .eq('email', user.email)
            .single();
        
        if(user.email === 'tipinheiro@ufma.br') {
            estado.nivelAcesso = 'dono';
        } else if(userData && userData.role) {
            estado.nivelAcesso = userData.role;
        } else {
            // Email não cadastrado - mostrar tela de acesso negado
            await supabase.auth.signOut();
            mostrarAcessoNegado();
            return;
        }
        
        // Só inicializa a UI depois de confirmar acesso
        authVerificado = true;
        initUI();
        aplicarPermissoes();
        iniciarSistema();
        hideLoading();
        
    } catch(erro) {
        console.error("Erro na inicialização:", erro);
        hideLoading();
        showToast("Houve um problema de conexão com o banco de dados.", "error");
    }
}

// Escuta mudanças de auth (logout, etc.)
supabase.auth.onAuthStateChange((event, session) => {
    if(event === 'SIGNED_OUT' && authVerificado) {
        window.location.href = "login.html";
    }
});

// Iniciar autenticação
initAuth();

function initUI() {
    const avatar = document.getElementById('userAvatar');
    if(avatar && estado.usuarioLogado.email) {
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
    if(btnCollapse) {
        // Restaurar estado do localStorage
        if(localStorage.getItem('sidebarCollapsed') === 'true') {
            document.getElementById('sidebar').classList.add('collapsed');
        }
        btnCollapse.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
            // Atualizar calendário após a transição
            setTimeout(() => { if(calendar) calendar.updateSize(); }, 350);
        });
    }
    
    document.getElementById('btnCloseModal')?.addEventListener('click', fecharModal);
    document.getElementById('btnCloseModalOnly')?.addEventListener('click', fecharModal);
    document.getElementById('btnFecharModalForm')?.addEventListener('click', fecharModalForm);
    document.getElementById('btnCancelarForm')?.addEventListener('click', fecharModalForm);
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if(e.target === modal) {
                if(modal.id === 'eventModal') fecharModal();
                if(modal.id === 'modalFormAgendamento') fecharModalForm();
            }
        });
    });

    // Atalhos de teclado
    document.addEventListener('keydown', (e) => {
        // Ignorar se estiver digitando em input/textarea
        const tag = e.target.tagName.toLowerCase();
        if(tag === 'input' || tag === 'textarea' || tag === 'select') {
            if(e.key === 'Escape') {
                e.target.blur();
                fecharModal();
                fecharModalForm();
            }
            return;
        }
        
        switch(e.key.toLowerCase()) {
            case 'n':
                if(estado.nivelAcesso !== 'leitor') {
                    e.preventDefault();
                    window.abrirModalFormulario();
                }
                break;
            case 't':
                if(calendar) {
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
            if(target) window.switchTab(target, btn);
        });
    });
}

function aplicarPermissoes() {
    const roles = {
        'dono': { label: 'Administrador', icon: 'fa-crown', class: 'badge-admin' },
        'editor': { label: 'Editor', icon: 'fa-pen', class: 'badge-editor' },
        'leitor': { label: 'Leitor', icon: 'fa-eye', class: 'badge-leitor' }
    };
    
    const role = roles[estado.nivelAcesso];
    const roleEl = document.getElementById('userRoleDisplay');
    roleEl.innerHTML = `<i class="fas ${role.icon}"></i>${role.label}`;
    roleEl.className = `user-role ${role.class}`;
    
    const adminOnly = document.querySelectorAll('.admin-only');
    const editorOnly = ['btnNovoAgendamento', 'btnTabMeusEventos', 'btnTabRelatorios'];
    
    if(estado.nivelAcesso === 'dono') {
        adminOnly.forEach(el => el.style.display = '');
        editorOnly.forEach(id => document.getElementById(id).style.display = '');
        carregarListaUsuariosAdmin();
    } else if(estado.nivelAcesso === 'editor') {
        adminOnly.forEach(el => el.style.display = 'none');
        editorOnly.forEach(id => document.getElementById(id).style.display = '');
    } else {
        adminOnly.forEach(el => el.style.display = 'none');
        editorOnly.forEach(id => document.getElementById(id).style.display = 'none');
        document.getElementById('leitorBlockMessage').style.display = 'flex';
    }
}

// ==========================================
// CONSTRUÇÃO DA INTERFACE
// ==========================================

function construirInterfaceDinamica() {
    const containerEspacos = document.getElementById('espacosAccordionContainer');
    if(containerEspacos) {
        const grupos = [
            { id: 'eng', titulo: 'Engenharia & Ed. Física', cor: '#8e44ad', icon: 'fa-cogs', salas: 5, extras: [
                { id: 'esp_eng_aud', value: 'Engenharia - Auditório', label: 'Auditório' }
            ]},
            { id: 'lic', titulo: 'Licenciaturas', cor: '#e67e22', icon: 'fa-graduation-cap', salas: 8, extras: [
                { id: 'esp_lic_aud', value: 'Licenciaturas - Auditório', label: 'Auditório' },
                { id: 'esp_lic_lab', value: 'Licenciaturas - Lab. Informática', label: 'Lab. Info' }
            ]},
            { id: 'sau', titulo: 'Saúde', cor: '#27ae60', icon: 'fa-heartbeat', salas: 11, extras: [
                { id: 'esp_sau_aud', value: 'Saúde - Auditório', label: 'Auditório' },
                { id: 'esp_sau_lab', value: 'Saúde - Lab. Informática', label: 'Lab. Info' }
            ]}
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
                                    <div class="checkbox-box"><i class="fas fa-check"></i></div>
                                    <span>${e.label}</span>
                                </label>
                            `).join('')}
                            ${Array.from({length: g.salas}, (_, i) => i + 1).map(i => `
                                <label class="checkbox-card">
                                    <input type="checkbox" name="espaco" value="${g.titulo.split(' &')[0]} - Sala ${i}">
                                    <div class="checkbox-box"><i class="fas fa-check"></i></div>
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
    if(containerMeses) {
        containerMeses.innerHTML = mesesAbrev.map((m, i) => `
            <button class="month-chip" data-mes="${i}" onclick="selecionarMes(${i})">${m}</button>
        `).join('');
        atualizarSelecaoMes();
    }
    
    const selectDashMes = document.getElementById('filtroDashMes');
    const selectRelMes = document.getElementById('filtroRelatorioMes');
    if(selectDashMes) selectDashMes.innerHTML = '<option value="Todos">Todos os Meses</option>' + mesesAbrev.map((m, i) => `<option value="${i}">${m}</option>`).join('');
    if(selectRelMes) selectRelMes.innerHTML = '<option value="Todos">Todos os Meses</option>' + mesesAbrev.map((m, i) => `<option value="${i}">${m}</option>`).join('');
    
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
    if(searchInput) {
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
}

// ==========================================
// FUNÇÕES DO CALENDÁRIO
// ==========================================

function iniciarSistema() {
    const calendarEl = document.getElementById('calendar');
    if(!calendarEl) return;
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
        buttonText: { today: 'Hoje', month: 'Mês', week: 'Semana', day: 'Dia' },
        eventDisplay: 'block',
        events: feriadosFixos,
        height: 'auto',
        contentHeight: 'auto',
        
        dateClick: function(info) {
            if(estado.nivelAcesso === 'leitor') { showToast('Modo leitura: Não é possível criar eventos', 'info'); return; }
            window.abrirModalFormulario(info.dateStr);
        },
        
        eventClick: function(info) { window.abrirDetalhes(info.event); },
        
        eventContent: function(arg) {
            const props = arg.event.extendedProps;
            const time = arg.event.start ? `${arg.event.start.getHours().toString().padStart(2,'0')}h` : '';
            const conflitoBadge = props.isConflito ? '<div class="event-conflito-badge"><i class="fas fa-exclamation"></i></div>' : '';
            return {
                html: `
                    <div class="fc-event-custom">
                        ${conflitoBadge}
                        <div class="event-time">${time}</div>
                        <div class="event-title">${props.tituloPuro || arg.event.title}</div>
                        <div class="event-loc">${(props.espacos || [props.espaco])[0]}</div>
                    </div>
                `
            };
        }
    });
    
    calendar.render();
    carregarDadosDaNuvem();
    iniciarRealtime();
    
    const whatsInput = document.getElementById('contatoWhats');
    if(whatsInput) {
        whatsInput.addEventListener('input', function(e) {
            let v = e.target.value.replace(/\D/g, '');
            if(v.length > 11) v = v.slice(0, 11);
            if(v.length > 7) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
            else if(v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
            e.target.value = v;
        });
    }
}

function getCorPorEspaco(espacos) {
    const esp = (espacos || [])[0] || "";
    if(esp.includes("Licenciaturas")) return "#e67e22";
    if(esp.includes("Saúde")) return "#27ae60";
    if(esp.includes("Engenharia")) return "#8e44ad";
    return "#0056b3";
}

function getClasseBadge(nomeEspaco) {
    const esp = nomeEspaco || "";
    if(esp.includes("Engenharia")) return "badge-eng";
    if(esp.includes("Saúde")) return "badge-sau";
    if(esp.includes("Licenciaturas")) return "badge-lic";
    return "badge-outros";
}

async function carregarDadosDaNuvem() {
    try {
        const { data, error } = await supabase.from('reservas').select('*');
        
        if(error) {
            console.error("Erro ao carregar dados:", error);
            showToast('Erro ao carregar dados: ' + error.message, 'error');
            return;
        }
        
        if(data) {
            data.forEach(row => {
                const evento = dbParaFrontend(row);
                calendar.addEvent(evento);
            });
        }
        
        atualizarTodasTelas();
    } catch(e) {
        console.error("Erro ao carregar dados:", e);
        showToast('Erro ao carregar dados', 'error');
    }
}

async function recarregarDados() {
    const btn = document.getElementById('btnRefreshDados');
    btn.classList.add('rotating');
    calendar.removeAllEvents();
    await carregarDadosDaNuvem();
    setTimeout(() => btn.classList.remove('rotating'), 500);
    showToast('Dados atualizados com sucesso!');
}

// ==========================================
// REALTIME
// ==========================================

function iniciarRealtime() {
    supabase
        .channel('reservas-realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reservas' }, (payload) => {
            const evento = dbParaFrontend(payload.new);
            // Evitar duplicatas: converter ID para string para comparação consistente
            const existing = calendar.getEventById(String(evento.id));
            if(!existing) {
                calendar.addEvent(evento);
                atualizarTodasTelas();
            }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reservas' }, (payload) => {
            const evento = dbParaFrontend(payload.new);
            const existing = calendar.getEventById(evento.id);
            if(existing) existing.remove();
            calendar.addEvent(evento);
            atualizarTodasTelas();
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'reservas' }, (payload) => {
            const existing = calendar.getEventById(payload.old.id);
            if(existing) {
                existing.remove();
                atualizarTodasTelas();
            }
        })
        .subscribe();
}

// ==========================================
// SALVAR/EDITAR/DELETAR
// ==========================================

let _salvando = false;
async function salvarOuEditarEvento(e) {
    e.preventDefault();
    if(_salvando) return; // Prevenção de duplo clique
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
        if(espacos.length === 0) { showToast('Selecione pelo menos um espaço', 'error'); setButtonLoading(btn, false); return; }
        
        const sessoes = [];
        document.querySelectorAll('.data-row-styled').forEach(row => {
            const data = row.querySelector('.flatpickr').value;
            const horaIni = row.querySelectorAll('.input-time')[0].value;
            const horaFim = row.querySelectorAll('.input-time')[1].value;
            if(data && horaIni && horaFim) sessoes.push({ start: `${data}T${horaIni}`, end: `${data}T${horaFim}` });
        });
        
        if(sessoes.length === 0) { showToast('Adicione pelo menos uma data válida', 'error'); setButtonLoading(btn, false); return; }
        
        // Validação de horário: fim deve ser após início
        for(const sess of sessoes) {
            const ini = new Date(sess.start).getTime();
            const fim = new Date(sess.end).getTime();
            if(fim <= ini) {
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
                if(editId && ev.id === editId) return;
                if(ev.extendedProps.isFeriado) return;
                const evEspacos = ev.extendedProps.espacos || [ev.extendedProps.espaco];
                const comum = espacos.filter(e => evEspacos.includes(e));
                if(comum.length === 0) return;
                const evIni = ev.start.getTime();
                const evFim = ev.end ? ev.end.getTime() : evIni + 3600000;
                if(ini < evFim && fim > evIni) conflitos.push(ev);
            });
        });
        
        let forcar = false;
        if(conflitos.length > 0) {
            const result = await Swal.fire({
                title: 'Conflitos detectados',
                html: `<p style="margin-bottom:15px">Este agendamento conflita com <b>${conflitos.length}</b> evento(s) existente(s).</p>
                       <div style="text-align:left;max-height:150px;overflow:auto;background:#f8f9fa;padding:10px;border-radius:8px;">
                       ${conflitos.map(c => `<div style="padding:5px;border-left:3px solid #e74c3c;margin:5px 0;padding-left:8px;">
                            <b>${c.extendedProps.tituloPuro}</b><br><small>${(c.extendedProps.espacos || [c.extendedProps.espaco]).join(', ')}</small>
                       </div>`).join('')}</div>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Forçar mesmo assim',
                cancelButtonText: 'Voltar e corrigir',
                confirmButtonColor: '#e74c3c'
            });
            if(!result.isConfirmed) { setButtonLoading(btn, false); return; }
            forcar = true;
        }
        
        const cor = getCorPorEspaco(espacos);
        const groupId = editId ? document.getElementById('editGroupId').value : `GRP-${Date.now()}`;
        const timestamp = Date.now();
        const criadoPor = estado.usuarioLogado.email;
        
        // Se editando, deletar o antigo
        if(editId) {
            const antigo = calendar.getEventById(editId);
            if(antigo) antigo.remove();
            await supabase.from('reservas').delete().eq('id', editId);
        }
        
        // Inserir novas sessões
        for(let i = 0; i < sessoes.length; i++) {
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
            
            if(error) {
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
        
    } catch(erro) { 
        console.error("Erro:", erro);
        showToast('Erro ao salvar: ' + erro.message, 'error'); 
    } 
    finally { setButtonLoading(btn, false); _salvando = false; }
}

async function deletarEvento() {
    if(!eventoSelecionadoNoModal) return;
    const result = await Swal.fire({
        title: 'Confirmar exclusão?', text: 'Esta ação não pode ser desfeita.', icon: 'warning',
        showCancelButton: true, confirmButtonText: 'Sim, excluir', cancelButtonText: 'Cancelar', confirmButtonColor: '#e74c3c'
    });
    if(result.isConfirmed) {
        try {
            const { error } = await supabase.from('reservas').delete().eq('id', eventoSelecionadoNoModal.id);
            if(error) {
                showToast('Erro ao excluir: ' + error.message, 'error');
                return;
            }
            eventoSelecionadoNoModal.remove();
            fecharModal();
            atualizarTodasTelas();
            showToast('Evento excluído com sucesso');
        } catch(e) { showToast('Erro ao excluir', 'error'); }
    }
}

function prepararEdicao() {
    if(!eventoSelecionadoNoModal) return;
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
        if(cb.checked) cb.closest('.checkbox-card')?.classList.add('checked');
    });
    
    document.getElementById('datasContainer').innerHTML = '';
    window.adicionarLinhaData();
    
    const row = document.querySelector('.data-row-styled');
    const dataIni = new Date(ev.start.getTime() - (ev.start.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    const horaIni = ev.start.toTimeString().slice(0,5);
    const horaFim = ev.end ? ev.end.toTimeString().slice(0,5) : horaIni;
    
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
    atualizarResumoMes();
    if(estado.nivelAcesso !== 'leitor') atualizarMeusEventos();
    if(estado.nivelAcesso === 'dono') atualizarDashboard();
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
    if(document.getElementById('abaMeusEventos').classList.contains('active')) atualizarMeusEventos();
    if(document.getElementById('abaResumo').classList.contains('active')) atualizarResumoMes();
    
    // Filtrar calendário
    if(calendar) {
        calendar.getEvents().forEach(ev => {
            if(!estado.termoBusca) {
                ev.setProp('display', 'block');
                return;
            }
            const texto = `${ev.extendedProps.tituloPuro} ${ev.extendedProps.responsavel} ${(ev.extendedProps.espacos || []).join(' ')}`.toLowerCase();
            ev.setProp('display', texto.includes(estado.termoBusca) ? 'block' : 'none');
        });
    }
    
    const dropdown = document.getElementById('searchResults');
    if(estado.termoBusca.length > 2) {
        const matches = calendar.getEvents()
            .filter(ev => !ev.extendedProps.isFeriado)
            .filter(ev => (`${ev.extendedProps.tituloPuro} ${ev.extendedProps.responsavel}`.toLowerCase()).includes(estado.termoBusca))
            .slice(0, 5);
        if(matches.length > 0) {
            dropdown.innerHTML = matches.map(ev => `
                <div class="search-result-item" onclick="abrirDetalhes(calendar.getEventById('${ev.id}')); document.getElementById('searchResults').classList.remove('active')">
                    <div class="search-result-color" style="background:${ev.backgroundColor}"></div>
                    <div class="search-result-info">
                        <div class="search-result-title">${ev.extendedProps.tituloPuro}</div>
                        <div class="search-result-meta">${ev.start.toLocaleDateString('pt-BR')} • ${ev.extendedProps.responsavel}</div>
                    </div>
                </div>
            `).join('');
            dropdown.classList.add('active');
        } else dropdown.classList.remove('active');
    } else dropdown.classList.remove('active');
}

function renderizarCards(eventos, containerId, mensagemVazio) {
    const container = document.getElementById(containerId);
    if(!container) return;
    
    let lista = eventos;
    if(estado.termoBusca) {
        lista = eventos.filter(ev => (`${ev.extendedProps.tituloPuro} ${ev.extendedProps.responsavel} ${(ev.extendedProps.espacos || []).join(' ')}`.toLowerCase()).includes(estado.termoBusca));
    }
    
    if(lista.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-calendar-times"></i><h3>${estado.termoBusca ? 'Nenhum resultado' : mensagemVazio}</h3></div>`;
        return;
    }
    
    container.innerHTML = lista.map(ev => {
        const inicio = ev.start;
        const fim = ev.end;
        const passado = (fim || inicio) < new Date();
        const dia = inicio.getDate().toString().padStart(2,'0');
        const mes = mesesAbrev[inicio.getMonth()];
        const horaInicio = inicio.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
        const horaFim = fim ? fim.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : '';
        const periodo = horaFim ? `${horaInicio} - ${horaFim}` : `A partir das ${horaInicio}`;
        const espacos = ev.extendedProps.espacos || [ev.extendedProps.espaco];
        
        return `
            <div class="event-row ${passado ? 'past' : ''} ${ev.extendedProps.isConflito ? 'conflito' : ''}" style="--event-color: ${ev.backgroundColor || '#0056b3'}">
                <div class="event-date-box"><span class="day">${dia}</span><span class="month">${mes}</span></div>
                <div class="event-content" onclick="abrirDetalhes(calendar.getEventById('${ev.id}'))">
                    <div class="event-header-row">
                        <h4>${ev.extendedProps.tituloPuro}</h4>
                        ${ev.extendedProps.isConflito ? '<span class="badge-conflito"><i class="fas fa-exclamation"></i>Conflito</span>' : ''}
                    </div>
                    <div class="event-meta"><span><i class="far fa-clock"></i> ${periodo}</span><span><i class="far fa-user"></i> ${ev.extendedProps.responsavel || '-'}</span></div>
                    <div class="event-locais">${espacos.map(e => `<span class="tag-local-mini ${getClasseBadge(e)}">${e}</span>`).join('')}</div>
                </div>
                ${(estado.nivelAcesso !== 'leitor') ? `
                <div class="event-actions">
                    <button class="btn-icon-sm" onclick="event.stopPropagation(); prepararEdicaoPorId('${ev.id}')" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon-sm danger" onclick="event.stopPropagation(); deletarPorId('${ev.id}')" title="Excluir"><i class="fas fa-trash"></i></button>
                </div>` : ''}
            </div>`;
    }).join('');
}

function atualizarUltimosEventos() {
    if(!calendar) return;
    const eventos = calendar.getEvents().filter(ev => !ev.extendedProps.isFeriado)
        .sort((a, b) => (b.extendedProps.dataCriacao || 0) - (a.extendedProps.dataCriacao || 0)).slice(0, 5);
    const container = document.getElementById('containerUltimosEventos');
    if(!container) return;
    if(eventos.length === 0) { container.innerHTML = `<div class="empty-state small"><i class="fas fa-inbox"></i><span>Nenhum evento recente</span></div>`; return; }
    
    container.innerHTML = eventos.map(ev => {
        const data = ev.start;
        const hoje = new Date(); const ontem = new Date(hoje); ontem.setDate(ontem.getDate() - 1);
        let dataTexto = (data.toDateString() === hoje.toDateString()) ? 'Hoje' : (data.toDateString() === ontem.toDateString()) ? 'Ontem' : data.toLocaleDateString('pt-BR', {day: 'numeric', month: 'short'});
        return `
            <div class="event-mini-card" onclick="abrirDetalhes(calendar.getEventById('${ev.id}'))" style="--card-color: ${ev.backgroundColor}">
                <div class="event-status"></div>
                <div class="event-info">
                    <h5>${ev.extendedProps.tituloPuro}</h5>
                    <div class="event-meta-mini"><span><i class="far fa-calendar"></i> ${dataTexto}</span><span><i class="far fa-user"></i> ${ev.extendedProps.responsavel || '-'}</span></div>
                </div>
                <i class="fas fa-chevron-right arrow"></i>
            </div>`;
    }).join('');
}

function atualizarMeusEventos() {
    if(!calendar || !estado.usuarioLogado) return;
    const meus = calendar.getEvents().filter(ev => !ev.extendedProps.isFeriado && ev.extendedProps.criadoPor === estado.usuarioLogado.email).sort((a, b) => a.start - b.start);
    renderizarCards(meus, 'containerMeusEventos', 'Você ainda não criou nenhum evento');
}

function atualizarResumoMes() {
    if(!calendar) return;
    const inicioMes = new Date(estado.anoFiltro, estado.mesFiltro, 1);
    const fimMes = new Date(estado.anoFiltro, estado.mesFiltro + 1, 0, 23, 59, 59);
    const eventos = calendar.getEvents().filter(ev => {
        if(ev.extendedProps.isFeriado || !ev.start) return false;
        return ev.start <= fimMes && (ev.end || ev.start) >= inicioMes;
    }).sort((a, b) => a.start - b.start);
    renderizarCards(eventos, 'listaResumo', 'Nenhum evento neste mês');
}

// ==========================================
// DASHBOARD & ADMIN & EXPORTAÇÃO
// ==========================================

function atualizarDashboard() {
    if(!calendar || estado.nivelAcesso !== 'dono') return;
    const filtroAno = document.getElementById('filtroDashAno').value;
    const filtroMes = document.getElementById('filtroDashMes').value;
    const filtroCat = document.getElementById('filtroDashCategoria').value;
    
    let eventos = calendar.getEvents().filter(ev => {
        if(ev.extendedProps.isFeriado || !ev.start) return false;
        const matchAno = filtroAno === "Todos" || ev.start.getFullYear().toString() === filtroAno;
        const matchMes = filtroMes === "Todos" || ev.start.getMonth().toString() === filtroMes;
        const matchCat = filtroCat === "Todas" || (ev.extendedProps.espacos || []).some(e => e.includes(filtroCat));
        return matchAno && matchMes && matchCat;
    });
    
    let totalHoras = 0; let conflitos = 0;
    const espacosUnicos = new Set(); const respsUnicos = new Set();
    const porMes = Array(12).fill(0); const porDia = Array(7).fill(0);
    const contagemEspacos = {}; const contagemResps = {};
    
    eventos.forEach(ev => {
        const ini = ev.start.getTime(); const fim = ev.end ? ev.end.getTime() : ini + 3600000;
        totalHoras += (fim - ini) / 3600000;
        if(ev.extendedProps.isConflito) conflitos++;
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
    
    if(estado.graficosAtivos.meses) estado.graficosAtivos.meses.destroy();
    if(estado.graficosAtivos.dias) estado.graficosAtivos.dias.destroy();
    if(estado.graficosAtivos.espacos) estado.graficosAtivos.espacos.destroy();
    if(estado.graficosAtivos.resps) estado.graficosAtivos.resps.destroy();
    
    estado.graficosAtivos.meses = new Chart(document.getElementById('chartMeses'), { type: 'bar', data: { labels: mesesAbrev, datasets: [{ label: 'Reservas', data: porMes, backgroundColor: '#3b82f6', borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
    estado.graficosAtivos.dias = new Chart(document.getElementById('chartDias'), { type: 'bar', data: { labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'], datasets: [{ label: 'Reservas', data: porDia, backgroundColor: '#10b981', borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
    
    const topEspacos = Object.entries(contagemEspacos).sort((a, b) => b[1] - a[1]).slice(0, 5);
    estado.graficosAtivos.espacos = new Chart(document.getElementById('chartEspacos'), { type: 'doughnut', data: { labels: topEspacos.map(i => i[0].split(' - ')[0]), datasets: [{ data: topEspacos.map(i => i[1]), backgroundColor: ['#8e44ad', '#e67e22', '#27ae60', '#3498db', '#e74c3c'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 12 } } }, cutout: '70%' } });
    
    const topResps = Object.entries(contagemResps).sort((a, b) => b[1] - a[1]).slice(0, 5);
    estado.graficosAtivos.resps = new Chart(document.getElementById('chartResps'), { type: 'bar', data: { labels: topResps.map(i => i[0].split(' ')[0]), datasets: [{ label: 'Eventos', data: topResps.map(i => i[1]), backgroundColor: '#f59e0b', borderRadius: 6 }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
}

function animateValue(id, start, end, duration) {
    if(start === end) return;
    const range = end - start;
    let stepTime = Math.max(Math.abs(Math.floor(duration / range)), 50);
    let startTime = new Date().getTime(); let endTime = startTime + duration; let timer;
    function run() {
        let now = new Date().getTime(); let remaining = Math.max((endTime - now) / duration, 0);
        let value = Math.round(end - (remaining * range));
        document.getElementById(id).innerHTML = value + (id === 'dashMetrica5' ? '<span class="suffix">h</span>' : '');
        if(value == end) clearInterval(timer);
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
        
        if(error) {
            showToast('Erro: ' + error.message, 'error');
        } else {
            showToast(`Usuário ${email} configurado com sucesso!`);
            document.getElementById('formNovoUsuario').reset();
            carregarListaUsuariosAdmin();
        }
    } catch(err) {
        showToast('Erro: ' + err.message, 'error');
    } finally { 
        setButtonLoading(btn, false); 
    }
}

async function carregarListaUsuariosAdmin() {
    if(estado.nivelAcesso !== 'dono') return;
    const lista = document.getElementById('listaUsuariosAdmin');
    lista.innerHTML = '<div class="loading-skeleton"><div class="skeleton" style="height:50px"></div></div>';
    try {
        const { data: usuarios, error } = await supabase.from('usuarios').select('*');
        
        if(error) {
            lista.innerHTML = '<div class="empty-state small error"><span>Erro ao carregar usuários</span></div>';
            return;
        }
        
        if(!usuarios || usuarios.length === 0) { 
            lista.innerHTML = '<div class="empty-state small"><span>Nenhum usuário cadastrado</span></div>'; 
            return; 
        }
        
        lista.innerHTML = usuarios.map(u => {
            const roleIcons = { dono: '👑', editor: '✍️', leitor: '👁️' }; 
            const roleLabels = { dono: 'Admin', editor: 'Editor', leitor: 'Leitor' };
            return `
                <li class="user-item">
                    <div class="user-info-row">
                        <div class="user-avatar-mini" style="background: ${stringToColor(u.email)}">${u.email.substring(0,2).toUpperCase()}</div>
                        <div class="user-details"><span class="user-email-list">${u.email}</span><span class="user-role-badge ${u.role}">${roleIcons[u.role]} ${roleLabels[u.role]}</span></div>
                    </div>
                    ${u.email !== estado.usuarioLogado.email ? `<button class="btn-icon danger" onclick="deletarUsuario('${u.email}')" title="Remover acesso"><i class="fas fa-user-times"></i></button>` : '<span class="you-badge">Você</span>'}
                </li>`;
        }).join('');
    } catch(e) { 
        lista.innerHTML = '<div class="empty-state small error"><span>Erro ao carregar usuários</span></div>'; 
    }
}

function obterDadosParaExportacao() {
    if(!calendar) return [];
    const filtroAno = document.getElementById('filtroRelatorioAno').value;
    const filtroMes = document.getElementById('filtroRelatorioMes').value;
    let eventos = calendar.getEvents().filter(ev => {
        if(ev.extendedProps.isFeriado || !ev.start) return false;
        const matchAno = filtroAno === "Todos" || ev.start.getFullYear().toString() === filtroAno;
        const matchMes = filtroMes === "Todos" || ev.start.getMonth().toString() === filtroMes;
        return matchAno && matchMes;
    });
    eventos.sort((a, b) => a.start - b.start);
    return eventos.map(ev => {
        const format = (d) => d ? `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}` : '-';
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
    if(dados.length === 0) { showToast('Nenhum dado para exportar', 'error'); return; }
    const ws = XLSX.utils.json_to_sheet(dados); const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Agendamentos");
    XLSX.writeFile(wb, `Agendamentos_UFMA_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Excel baixado com sucesso!');
}

function exportarPDF() {
    const dados = obterDadosParaExportacao();
    if(dados.length === 0) { showToast('Nenhum dado para exportar', 'error'); return; }
    const { jsPDF } = window.jspdf; const doc = new jsPDF('landscape');
    doc.setFontSize(20); doc.text("Relatório de Agendamentos UFMA", 14, 20);
    doc.setFontSize(10); doc.setTextColor(100); doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);
    doc.autoTable({ head: [Object.keys(dados[0])], body: dados.map(obj => Object.values(obj)), startY: 35, theme: 'grid', styles: { fontSize: 9, cellPadding: 3 }, headStyles: { fillColor: [59, 130, 246], textColor: 255 } });
    doc.save(`Relatorio_UFMA_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('PDF gerado com sucesso!');
}

function fazerBackupJSON() {
    if(!calendar) return;
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
    if(!file) return;
    const confirm = await Swal.fire({ 
        title: 'Restaurar Backup?', 
        text: 'Isso pode sobrescrever dados existentes. Continuar?', 
        icon: 'warning', 
        showCancelButton: true, 
        confirmButtonText: 'Sim, restaurar', 
        cancelButtonText: 'Cancelar' 
    });
    if(!confirm.isConfirmed) { e.target.value = ''; return; }
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
        try {
            const dados = JSON.parse(evt.target.result);
            if(!Array.isArray(dados)) throw new Error('Formato inválido');
            Swal.fire({ title: 'Restaurando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            
            for(const item of dados) {
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
                
                if(id) {
                    dadosDb.id = id;
                    await supabase.from('reservas').upsert(dadosDb, { onConflict: 'id' });
                } else {
                    await supabase.from('reservas').insert(dadosDb);
                }
            }
            
            await recarregarDados(); 
            Swal.close(); 
            showToast('Backup restaurado com sucesso!');
        } catch(err) { 
            console.error("Erro ao restaurar:", err);
            Swal.close(); 
            showToast('Erro ao restaurar backup: ' + err.message, 'error'); 
        }
    };
    reader.readAsText(file); 
    e.target.value = '';
}
