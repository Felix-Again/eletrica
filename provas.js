const SHEET_ID = '1heivImPkAO9AB4fFkbYFc1hd4dHkalXXxDbUcPvvw98'; 
const SHEET_TITLE = 'Página1'; 
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_TITLE}`;

const TEMPO_CACHE = 15 * 60 * 1000;

function carregarProvas() {
    const cacheSalvo = localStorage.getItem('agenda_dados_google');
    const cacheTempo = localStorage.getItem('agenda_tempo_google');
    const agora = new Date().getTime();

    if (cacheSalvo && cacheTempo && (agora - cacheTempo < TEMPO_CACHE)) {
        processarDadosBrutos(cacheSalvo);
        return;
    }

    fetch(URL)
        .then(res => res.text())
        .then(textoBruto => {
            localStorage.setItem('agenda_dados_google', textoBruto);
            localStorage.setItem('agenda_tempo_google', agora.toString());
            processarDadosBrutos(textoBruto);
        })
        .catch(err => {
            console.error(err);
            document.getElementById('provas-container').innerHTML = "<p>Erro ao carregar as avaliações.</p>";
        });
}

function processarDadosBrutos(textoDoGoogle) {
    const jsonPuro = JSON.parse(textoDoGoogle.substring(47).slice(0, -2));
    const linhas = jsonPuro.table.rows;
    filtrarERenderizarProvas(linhas);
}

function filtrarERenderizarProvas(linhas) {
    const container = document.getElementById('provas-container');
    if (!container) return;

    container.innerHTML = '';
    
    container.className = 'calendario-grid';

    const provasPorData = {};

    linhas.forEach(linha => {
        if (!linha.c || !linha.c[0]) return;

        const dataOriginal = linha.c[0].f || linha.c[0].v;
        if (dataOriginal.toString().includes("Data")) return; 

        let categoria = linha.c[2] ? linha.c[2].v.toString().toLowerCase().trim() : '';
        
        if (!categoria.includes("prova") && !categoria.includes("sub") && !categoria.includes("rec")) {
            return; 
        }

        const hora = linha.c[1] ? (linha.c[1].f || linha.c[1].v) : '--:--';
        const titulo = linha.c[3] ? linha.c[3].v : 'Sem título';
        const local = linha.c[4] ? linha.c[4].v : 'A definir';

        if (!provasPorData[dataOriginal]) {
            provasPorData[dataOriginal] = [];
        }
        provasPorData[dataOriginal].push({ hora, titulo, local });
    });

    if (Object.keys(provasPorData).length === 0) {
        
        container.className = '';
        container.innerHTML = "<p class='subtitle'>Nenhuma avaliação marcada por enquanto! 🙌</p>";
        return;
    }

    for (const data in provasPorData) {
        const diaBlco = document.createElement('div');
        diaBlco.className = 'calendario-dia-bloco';
        
        let provasHTML = `<h3>📅 ${data}</h3>`;
        
        provasPorData[data].forEach(prova => {
            provasHTML += `
                <div class="prova-mini-card">
                    <h4>${prova.titulo}</h4>
                    <p>⏱️ ${prova.hora}</p>
                    <p>📍 ${prova.local}</p>
                </div>
            `;
        });
        
        diaBlco.innerHTML = provasHTML;
        container.appendChild(diaBlco);
    }
}

window.addEventListener('DOMContentLoaded', carregarProvas);