// js/admin.js - gestao de usuarios (admin)
import { supabase } from '../supabaseClient.js';
import { estado } from './estado.js';
import { setButtonLoading, showToast, stringToColor } from './utils.js';

export async function adicionarUsuarioViaAdmin(e) {
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

export async function carregarListaUsuariosAdmin() {
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
