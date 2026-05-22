// js/backup.js - backup e restauracao de dados (JSON)
import { supabase } from '../supabaseClient.js';
import { showToast } from './utils.js';
import { recarregarDados } from './calendar.js';
import { atualizarMeusEventos } from './telas.js';

export async function fazerBackupJSON() {
    try {
        const { data, error } = await supabase.from('reservas').select('*');
        if (error) throw error;

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        const agora = new Date();
        const d = String(agora.getDate()).padStart(2, '0');
        const m = String(agora.getMonth() + 1).padStart(2, '0');
        const ano = agora.getFullYear();
        const h = String(agora.getHours()).padStart(2, '0');
        const min = String(agora.getMinutes()).padStart(2, '0');

        a.href = url;
        a.setAttribute('download', `Backup_Agendamentos_${d}-${m}-${ano}_as_${h}h${min}.json`);

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Backup salvo com sucesso!');
    } catch (err) {
        console.error("Erro ao gerar backup:", err);
        showToast('Erro ao gerar backup: ' + err.message, 'error');
    }
}

export async function restaurarBackupJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const confirm = await Swal.fire({
        title: 'Restaurar Backup?',
        text: 'Isso pode sobrescrever dados existentes e restaurará eventos cancelados. Continuar?',
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
            if (!Array.isArray(dados)) throw new Error('O arquivo não contém um array JSON válido.');
            Swal.fire({ title: 'Restaurando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            let sucessos = 0;
            let conflitosIgnorados = 0;

            for (const item of dados) {
                const { id, ...rest } = item;

                // Ignorar feriados fixos que foram incluídos no backup antigo
                if (rest.isFeriado || item.isFeriado) continue;
                // Ignorar se o ID for explicitamente uma string não numérica (ex: "feriado-1")
                if (id && isNaN(parseInt(id, 10))) continue;

                // Mapeia os campos do backup (antigo do frontend ou novo direto do Supabase) para o formato do banco
                const dadosDb = {
                    title: rest.title || rest.tituloPuro || rest.titulopuro || 'Evento sem título',
                    titulopuro: rest.titulopuro || rest.tituloPuro || rest.title || 'Evento sem título',
                    start_time: rest.start_time || rest.start,
                    end_time: rest.end_time || rest.end,
                    espacos: rest.espacos || (rest.espaco ? [rest.espaco] : []),
                    responsavel: rest.responsavel || 'Não informado',
                    contatowhats: rest.contatowhats || rest.contatoWhats || null,
                    contatoemail: rest.contatoemail || rest.contatoEmail || null,
                    color: rest.color || '#0056b3',
                    isconflito: rest.isconflito !== undefined ? rest.isconflito : (rest.isConflito || false),
                    groupid: rest.groupid || rest.groupId || null,
                    datacriacao: rest.datacriacao || rest.dataCriacao || new Date().toISOString(),
                    criadopor: rest.criadopor || rest.criadoPor || null,
                    // Novos campos de soft delete
                    cancelado: rest.cancelado !== undefined ? rest.cancelado : false,
                    motivo_cancelamento: rest.motivo_cancelamento || null,
                    datacancelamento: rest.datacancelamento || null
                };

                if (!dadosDb.start_time || !dadosDb.end_time) {
                    console.warn("Evento sem start_time ignorado:", item);
                    continue;
                }

                let erroSupabase = null;
                if (id) {
                    dadosDb.id = id;
                    const { error } = await supabase.from('reservas').upsert(dadosDb, { onConflict: 'id' });
                    erroSupabase = error;
                } else {
                    const { error } = await supabase.from('reservas').insert(dadosDb);
                    erroSupabase = error;
                }

                if (erroSupabase) {
                    // P0001 = Raise Exception (Provavelmente a Trigger de Conflito do Supabase)
                    if (erroSupabase.code === 'P0001') {
                        console.warn(`Item ignorado (conflito detectado): ${dadosDb.title}`, erroSupabase.message);
                        conflitosIgnorados++;
                    } else {
                        console.error("Erro no item:", dadosDb, "Erro Supabase:", erroSupabase);
                        throw new Error(erroSupabase.message || JSON.stringify(erroSupabase));
                    }
                } else {
                    sucessos++;
                }
            }

            if (typeof recarregarDados === 'function') {
                await recarregarDados();
            }
            if (document.getElementById('abaMeusEventos')?.classList.contains('active')) {
                if (typeof atualizarMeusEventos === 'function') atualizarMeusEventos();
            }

            Swal.close();

            if (conflitosIgnorados > 0) {
                Swal.fire('Restaurado com Ressalvas', `Backup restaurado: ${sucessos} eventos. Omitidos ${conflitosIgnorados} eventos por conflito com a agenda atual.`, 'warning');
            } else {
                showToast(`Backup restaurado com sucesso! (${sucessos} eventos)`);
            }
        } catch (err) {
            console.error("Erro ao restaurar:", err);
            Swal.close();
            showToast('Erro ao restaurar backup: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}
