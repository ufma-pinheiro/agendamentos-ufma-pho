// js/dashboard.js - Módulo de Analytics e Dashboard
import { supabase } from '../supabaseClient.js';
import { buscarDadosMensais, dbParaFrontend, calendar } from './calendar.js';
import { mesesAbrev } from './constants.js';
import { escapeHtml } from './utils.js';

/**
 * Atualiza todas as métricas e gráficos do dashboard
 * @param {Object} estado - Estado global do app
 */
export async function atualizarDashboard(estado) {
    if (!calendar || estado.nivelAcesso !== 'dono') return;

    const filtroAno = parseInt(document.getElementById('filtroDashAno').value);
    const filtroMesRaw = document.getElementById('filtroDashMes').value;
    const filtroMes = filtroMesRaw === "Todos" ? "Todos" : parseInt(filtroMesRaw);
    const filtroCat = document.getElementById('filtroDashCategoria').value;

    let eventos = [];

    try {
        if (filtroMes === "Todos") {
            const { data, error } = await supabase
                .from('reservas')
                .select('id, title, start_time, end_time, color, titulopuro, espacos, responsavel, contatowhats, contatoemail, isconflito, groupid, datacriacao, criadopor')
                .gte('start_time', `${filtroAno}-01-01T00:00:00`)
                .lte('end_time', `${filtroAno}-12-31T23:59:59`);
            
            if (error) throw error;
            if (data) eventos = data.map(dbParaFrontend);
        } else {
            eventos = await buscarDadosMensais(filtroAno, filtroMes);
        }

        // Filtragem por categoria
        if (filtroCat !== "Todas") {
            eventos = eventos.filter(ev => (ev.extendedProps.espacos || []).some(e => e.includes(filtroCat)));
        }

        const metrics = processarMetricas(eventos);
        renderizarMetricas(metrics);
        renderizarGraficos(metrics, estado);

    } catch (e) {
        console.error("Erro ao atualizar dashboard:", e);
    }
}

function processarMetricas(eventos) {
    let totalHoras = 0;
    let conflitos = 0;
    const espacosUnicos = new Set();
    const respsUnicos = new Set();
    const porMes = Array(12).fill(0);
    const porDia = Array(7).fill(0);
    const contagemEspacos = {};
    const contagemResps = {};

    eventos.forEach(ev => {
        const ini = ev.start.getTime();
        const fim = ev.end ? ev.end.getTime() : ini + 3600000;
        totalHoras += (fim - ini) / 3600000;
        
        if (ev.extendedProps.isConflito) conflitos++;
        
        (ev.extendedProps.espacos || [ev.extendedProps.espaco]).forEach(e => {
            espacosUnicos.add(e);
            contagemEspacos[e] = (contagemEspacos[e] || 0) + 1;
        });

        respsUnicos.add(ev.extendedProps.responsavel);
        contagemResps[ev.extendedProps.responsavel] = (contagemResps[ev.extendedProps.responsavel] || 0) + 1;
        
        porMes[ev.start.getMonth()]++;
        porDia[ev.start.getDay()]++;
    });

    return {
        totalEventos: eventos.length,
        totalHoras,
        conflitos,
        espacosUnicosCount: espacosUnicos.size,
        respsUnicosCount: respsUnicos.size,
        porMes,
        porDia,
        contagemEspacos,
        contagemResps
    };
}

function renderizarMetricas(m) {
    animateValue('dashMetrica1', parseInt(document.getElementById('dashMetrica1').textContent) || 0, m.totalEventos, 1000);
    animateValue('dashMetrica5', parseInt(document.getElementById('dashMetrica5').textContent) || 0, Math.round(m.totalHoras), 1000);
    animateValue('dashMetrica2', parseInt(document.getElementById('dashMetrica2').textContent) || 0, m.espacosUnicosCount, 1000);
    animateValue('dashMetrica4', parseInt(document.getElementById('dashMetrica4').textContent) || 0, m.respsUnicosCount, 1000);
    animateValue('dashMetrica3', parseInt(document.getElementById('dashMetrica3').textContent) || 0, m.conflitos, 1000);
}

function renderizarGraficos(m, estado) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    Chart.defaults.color = isDark ? '#94a3b8' : '#64748b';
    Chart.defaults.borderColor = isDark ? '#334155' : '#e2e8f0';

    // Limpar gráficos anteriores
    Object.values(estado.graficosAtivos).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') chart.destroy();
    });

    estado.graficosAtivos.meses = new Chart(document.getElementById('chartMeses'), {
        type: 'bar',
        data: {
            labels: mesesAbrev,
            datasets: [{ label: 'Reservas', data: m.porMes, backgroundColor: '#3b82f6', borderRadius: 6 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    estado.graficosAtivos.dias = new Chart(document.getElementById('chartDias'), {
        type: 'bar',
        data: {
            labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
            datasets: [{ label: 'Reservas', data: m.porDia, backgroundColor: '#10b981', borderRadius: 6 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    const topEspacos = Object.entries(m.contagemEspacos).sort((a, b) => b[1] - a[1]).slice(0, 5);
    estado.graficosAtivos.espacos = new Chart(document.getElementById('chartEspacos'), {
        type: 'doughnut',
        data: {
            labels: topEspacos.map(i => i[0].split(' - ')[0]),
            datasets: [{ data: topEspacos.map(i => i[1]), backgroundColor: ['#8e44ad', '#e67e22', '#27ae60', '#3498db', '#e74c3c'], borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 12 } } }, cutout: '70%' }
    });

    const topResps = Object.entries(m.contagemResps).sort((a, b) => b[1] - a[1]).slice(0, 5);
    estado.graficosAtivos.resps = new Chart(document.getElementById('chartResps'), {
        type: 'bar',
        data: {
            labels: topResps.map(i => i[0].split(' ')[0]),
            datasets: [{ label: 'Eventos', data: topResps.map(i => i[1]), backgroundColor: '#f59e0b', borderRadius: 6 }]
        },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

export function animateValue(id, start, end, duration) {
    const el = document.getElementById(id);
    if (!el || start === end) return;
    
    const range = end - start;
    let stepTime = Math.max(Math.abs(Math.floor(duration / range)), 50);
    let startTime = new Date().getTime();
    let endTime = startTime + duration;
    let timer;

    function run() {
        let now = new Date().getTime();
        let remaining = Math.max((endTime - now) / duration, 0);
        let value = Math.round(end - (remaining * range));
        el.innerHTML = value + (id === 'dashMetrica5' ? '<span class="suffix">h</span>' : '');
        if (value == end) clearInterval(timer);
    }
    
    timer = setInterval(run, stepTime);
    run();
}
