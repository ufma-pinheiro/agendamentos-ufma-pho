// js/reservas/modais-basicos.js - controles básicos de modal (sem dependências de outros módulos reservas)
// Extraído para evitar importação circular entre crud.js e modais.js

export function fecharModalForm() {
    const modal = document.getElementById('modalFormAgendamento');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

export function fecharModal() {
    const modal = document.getElementById('eventModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}
