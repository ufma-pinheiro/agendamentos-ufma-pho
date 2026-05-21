/**
 * js/utils.js — barrel
 * Re-exporta os utilitarios. Caminhos de import dos consumidores preservados.
 */
export { showToast, setButtonLoading, hideLoading, debounce, stringToColor, adjustColor, escapeHtml } from './utils/helpers.js';
export { showSuccessModal, showConflictModal } from './utils/modais-feedback.js';
export { showConfirmModal, showSeriesActionModal, showCancelMotivModal } from './utils/modais-prompt.js';
