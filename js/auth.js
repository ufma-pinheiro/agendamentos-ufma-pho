// js/auth.js - Módulo de Autenticação e Autorização
import { supabase } from '../supabaseClient.js';
import { showToast, hideLoading } from './utils.js';

/**
 * Mostra a tela de acesso negado
 */
export function mostrarAcessoNegado() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) loading.style.display = 'none';

    const denied = document.getElementById('accessDeniedOverlay');
    if (denied) denied.style.display = 'flex';
}

/**
 * Inicializa a autenticação e verifica permissões
 * @param {Object} estado - Estado global do app
 * @param {Function} onAuthenticated - Callback para quando autenticado com sucesso
 */
export async function initAuth(estado, onAuthenticated) {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!session) {
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

        // Regra de negócio: TI Pinheiro é sempre Dono
        if (user.email === 'tipinheiro@ufma.br') {
            estado.nivelAcesso = 'dono';
        } else if (userData && userData.role) {
            estado.nivelAcesso = (userData.role || 'leitor').toLowerCase().trim();
        } else {
            // Email não cadastrado ou sem role - bloquear acesso
            await supabase.auth.signOut();
            mostrarAcessoNegado();
            return;
        }

        // Sucesso
        if (typeof onAuthenticated === 'function') {
            onAuthenticated();
        }

    } catch (erro) {
        console.error("Erro na inicialização de Auth:", erro);
        hideLoading();
        showToast("Houve um problema de conexão com o banco de dados.", "error");
    }
}

/**
 * Aplica visualmente as permissões na interface
 * @param {string} nivelAcesso - 'dono', 'editor' ou 'leitor'
 * @param {Function} carregarListaUsuariosAdmin - Callback para recarregar lista se admin
 */
export function aplicarPermissoes(nivelAcesso, carregarListaUsuariosAdmin) {
    const roles = {
        'dono': { label: 'Administrador', icon: 'fa-crown', class: 'badge-admin' },
        'editor': { label: 'Editor', icon: 'fa-pen', class: 'badge-editor' },
        'leitor': { label: 'Leitor', icon: 'fa-eye', class: 'badge-leitor' }
    };

    const role = roles[nivelAcesso] || roles['leitor'];
    const roleEl = document.getElementById('userRoleDisplay');
    
    if (roleEl) {
        roleEl.innerHTML = `<i class="fas ${role.icon}"></i>${role.label}`;
        roleEl.className = `user-role ${role.class}`;
    }

    const adminOnly = document.querySelectorAll('.admin-only');
    const editorOnlyIds = ['btnNovoAgendamento', 'btnTabMeusEventos', 'btnTabRelatorios'];

    if (nivelAcesso === 'dono') {
        adminOnly.forEach(el => el.style.display = '');
        editorOnlyIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = '';
        });
        const notifTab = document.getElementById('btnTabNotificacoes');
        if (notifTab) notifTab.style.display = '';

        if (typeof carregarListaUsuariosAdmin === 'function') {
            carregarListaUsuariosAdmin();
        }
    } else if (nivelAcesso === 'editor') {
        adminOnly.forEach(el => el.style.display = 'none');
        editorOnlyIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = '';
        });
    } else {
        // Leitor
        adminOnly.forEach(el => el.style.display = 'none');
        editorOnlyIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        const leitorMsg = document.getElementById('leitorBlockMessage');
        if (leitorMsg) leitorMsg.style.display = 'flex';
    }
}

/**
 * Escuta mudanças no estado de autenticação
 */
export function setupAuthListener() {
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            window.location.href = "login.html";
        }
    });
}
