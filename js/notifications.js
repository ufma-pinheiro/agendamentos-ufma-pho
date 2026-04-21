// js/notifications.js - Módulo de Gestão de Notificações Administrativas
import { supabase } from '../supabaseClient.js';
import { showToast, escapeHtml } from './utils.js';

/**
 * Atualiza o painel de notificações
 */
export async function atualizarPainelNotificacoes() {
    const lista = document.getElementById('listaLogsNotificacoes');
    if (!lista) return;

    try {
        const agora = new Date();
        const horasAntecedencia = parseInt(document.getElementById('notifHorasAntecedencia')?.value || 24);
        const limite = new Date(agora.getTime() + (horasAntecedencia * 60 * 60 * 1000));

        // Buscar eventos na janela de notificação
        const { data: eventos, error } = await supabase
            .from('reservas')
            .select('id, title, start_time, responsavel, contatoemail, espacos')
            .gte('start_time', agora.toISOString())
            .lte('start_time', limite.toISOString())
            .order('start_time', { ascending: true });

        if (error) throw error;

        if (eventos.length === 0) {
            lista.innerHTML = `<tr><td colspan="5" class="text-center p-4">Nenhuma notificação pendente na janela de ${horasAntecedencia}h.</td></tr>`;
            return;
        }

        lista.innerHTML = eventos.map(ev => {
            const dataObj = new Date(ev.start_time);
            const dataStr = dataObj.toLocaleDateString('pt-BR');
            const horaStr = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            return `
                <tr>
                    <td>${dataStr} às ${horaStr}</td>
                    <td><span class="font-semibold">${escapeHtml(ev.title)}</span></td>
                    <td>${escapeHtml(ev.contatoemail || 'N/A')}</td>
                    <td><span class="badge badge-warning">Pendente (${horasAntecedencia}h)</span></td>
                    <td>
                        <button class="btn-action-mini btn-notificar" data-id="${ev.id}" title="Notificar Agora">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Listeners para disparo manual
        lista.querySelectorAll('.btn-notificar').forEach(btn => {
            btn.addEventListener('click', () => dispararNotificacaoManual(btn.dataset.id));
        });

    } catch (e) {
        console.error("Erro ao carregar notificações:", e);
        lista.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-danger">Erro ao carregar dados.</td></tr>`;
    }
}

/**
 * Simula o disparo de uma notificação manual
 */
export async function dispararNotificacaoManual(id) {
    try {
        const { data: ev, error } = await supabase
            .from('reservas')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Simulação de disparo (integração futura com Edge Functions)
        const template = document.getElementById('notifTemplateCorpo').value;
        const assunto = document.getElementById('notifTemplateAssunto').value;
        
        console.log(`[Simulação] Enviando e-mail: ${assunto}`);
        showToast(`Notificação enviada com sucesso para ${ev.contatoemail || 'o responsável'}!`, 'success');
        
    } catch (e) {
        showToast("Erro ao disparar notificação", "error");
    }
}
