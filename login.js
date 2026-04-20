// login.js - Autenticação via Supabase (apenas Google OAuth)
import { supabase } from './supabaseClient.js';

// Verifica se já está logado
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if(session) {
        // Verificar se o email está cadastrado na tabela usuarios
        const allowed = await verificarAcesso(session.user.email);
        if(allowed) {
            document.body.style.opacity = '0';
            setTimeout(() => {
                window.location.href = "index.html";
            }, 200);
        } else {
            // Não tem acesso - deslogar
            await supabase.auth.signOut();
            showError('Seu e-mail não está autorizado a acessar o sistema. Solicite acesso ao administrador.');
        }
    }
}
checkSession();

// Escuta mudanças de autenticação (para OAuth redirect)
supabase.auth.onAuthStateChange(async (event, session) => {
    if(event === 'SIGNED_IN' && session) {
        const allowed = await verificarAcesso(session.user.email);
        if(allowed) {
            document.body.style.opacity = '0';
            setTimeout(() => {
                window.location.href = "index.html";
            }, 200);
        } else {
            await supabase.auth.signOut();
            showError('Seu e-mail não está autorizado a acessar o sistema. Solicite acesso ao administrador.');
        }
    }
});

// Verifica se o email existe na tabela usuarios
async function verificarAcesso(email) {
    // Hardcoded admin como fallback
    if(email === 'tipinheiro@ufma.br') return true;
    
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('email')
            .eq('email', email)
            .single();
        
        return !!data;
    } catch(e) {
        return false;
    }
}

// Login com Google OAuth
document.getElementById('btnGoogleLogin').addEventListener('click', async () => {
    const btn = document.getElementById('btnGoogleLogin');
    btn.classList.add('loading');
    btn.innerHTML = '<div class="spinner-inline"></div><span>Redirecionando...</span>';
    
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + window.location.pathname.replace('login.html', 'index.html')
            }
        });
        
        if(error) {
            btn.classList.remove('loading');
            btn.innerHTML = '<i class="fab fa-google"></i> Entrar com Google';
            showError(error.message || 'Erro ao conectar com Google. Tente novamente.');
        }
    } catch(error) {
        btn.classList.remove('loading');
        btn.innerHTML = '<i class="fab fa-google"></i> Entrar com Google';
        showError('Erro ao conectar com Google. Tente novamente.');
    }
});

function showError(message) {
    const existing = document.querySelector('.error-message');
    if(existing) existing.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${message}</span>`;
    
    const container = document.querySelector('.login-card .login-content');
    container.insertBefore(errorDiv, container.firstChild);
    
    setTimeout(() => errorDiv.classList.add('show'), 10);
    
    setTimeout(() => {
        errorDiv.classList.remove('show');
        setTimeout(() => errorDiv.remove(), 300);
    }, 8000);
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const overlay = document.getElementById('loadingOverlay');
        if(overlay) overlay.style.display = 'none';
    }, 500);
});
