// js/handlers.js - handlers globais expostos em window.* (onclick inline do HTML)
import { supabase } from '../supabaseClient.js';
import { estado } from './estado.js';
import { getCalendar, getCorPorEspaco } from './calendar.js';
import { adjustColor, showToast } from './utils.js';
import { atualizarResumoMes, atualizarMeusEventos, atualizarCancelamentos, atualizarUltimosEventos } from './telas.js';
import { atualizarDashboard } from './dashboard.js';
import { atualizarPainelConflitos } from './conflitos.js';
import { atualizarPainelNotificacoes } from './notifications.js';
import { carregarListaUsuariosAdmin } from './admin.js';

let eventoSelecionadoNoModal = null;

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
        'abaResumo': 'Resumo Mensal',        'abaDashboard': 'Dashboard Analytics',
        'abaRelatorios': 'Relatórios', 'abaUsuarios': 'Gestão de Usuários',
        'abaNotificacoes': 'Central de Notificações',
        'abaCancelamentos': 'Histórico de Cancelamentos',
        'abaConflitos': 'Painel de Conflitos Global',
        'abaUltimosRegistros': 'Últimos Registros'
    };
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = titles[tabId] || 'Calendário';

    try {
        if (tabId === 'abaCalendario' && getCalendar()) {
            setTimeout(() => getCalendar().updateSize(), 250);
        }
        if (tabId === 'abaResumo') atualizarResumoMes();
        if (tabId === 'abaDashboard') atualizarDashboard(estado);
        if (tabId === 'abaMeusEventos') atualizarMeusEventos();
        if (tabId === 'abaCancelamentos') atualizarCancelamentos();
        if (tabId === 'abaConflitos') atualizarPainelConflitos();
        if (tabId === 'abaUltimosRegistros') atualizarUltimosEventos();
        if (tabId === 'abaNotificacoes' && typeof atualizarPainelNotificacoes === 'function') {
            atualizarPainelNotificacoes();
        }
    } catch (e) {
        console.error("Erro ao carregar dados da aba:", e);
    }

    const sidebar = document.getElementById('sidebar');
    if (sidebar && window.innerWidth < 1024) {
        sidebar.classList.remove('open');
        document.body.classList.remove('sidebar-open');
    }
};

window.abrirDetalhes = function (event) {
    if (!event) return;
    eventoSelecionadoNoModal = event;
    if (typeof window.setEventoSelecionado === 'function') {
        window.setEventoSelecionado(event);
    }
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

    const isDono = estado.nivelAcesso === 'dono';
    const isCriador = props.criadoPor === estado.usuarioLogado?.email;
    const podeEditar = !props.isFeriado && (isDono || (estado.nivelAcesso === 'editor' && isCriador));
    document.getElementById('modalActionButtons').style.display = podeEditar ? 'flex' : 'none';

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
    const cal = getCalendar();
    if (!cal) return;
    const activeFilters = categoryChips
        .filter(c => c.classList.contains('active'))
        .map(c => c.getAttribute('data-filter'));

    cal.getEvents().forEach(ev => {
        if (ev.extendedProps.isFeriado) return;
        const espacos = ev.extendedProps.espacos || [ev.extendedProps.espaco];
        // Mostra se qualquer espaço do evento bater com qualquer filtro ativo
        const match = activeFilters.some(f => espacos.some(e => e.toLowerCase().includes(f.toLowerCase())));
        ev.setProp('display', match ? 'block' : 'none');
    });
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
