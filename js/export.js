// js/export.js - exportacao de relatorios (Excel / PDF)
import { getCalendar } from './calendar.js';
import { showToast } from './utils.js';

export function obterDadosParaExportacao() {
    const cal = getCalendar();
    if (!cal) return [];
    const filtroAno = document.getElementById('filtroRelatorioAno').value;
    const filtroMes = document.getElementById('filtroRelatorioMes').value;
    let eventos = cal.getEvents().filter(ev => {
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

export function exportarExcel() {
    const dados = obterDadosParaExportacao();
    if (dados.length === 0) { showToast('Nenhum dado para exportar', 'error'); return; }
    const ws = XLSX.utils.json_to_sheet(dados); const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Agendamentos");
    XLSX.writeFile(wb, `Agendamentos_UFMA_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Excel baixado com sucesso!');
}

export function exportarPDF() {
    const dados = obterDadosParaExportacao();
    if (dados.length === 0) { showToast('Nenhum dado para exportar', 'error'); return; }
    const { jsPDF } = window.jspdf; const doc = new jsPDF('landscape');
    doc.setFontSize(20); doc.text("Relatório de Agendamentos UFMA", 14, 20);
    doc.setFontSize(10); doc.setTextColor(100); doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);
    doc.autoTable({ head: [Object.keys(dados[0])], body: dados.map(obj => Object.values(obj)), startY: 35, theme: 'grid', styles: { fontSize: 9, cellPadding: 3 }, headStyles: { fillColor: [59, 130, 246], textColor: 255 } });
    doc.save(`Relatorio_UFMA_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('PDF gerado com sucesso!');
}
