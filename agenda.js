const SHEET_ID = '1heivImPkAO9AB4fFkbYFc1hd4dHkalXXxDbUcPvvw98'; 
const SHEET_TITLE = 'Página1'; 
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_TITLE}`;

const TEMPO_CACHE = 15 * 60 * 1000; // 15 minutos em milissegundos

function carregarAgenda() {
    const cacheSalvo = localStorage.getItem('agenda_dados_google');
    const cacheTempo = localStorage.getItem('agenda_tempo_google');
    const agora = new Date().getTime();

    
    if (cacheSalvo && cacheTempo && (agora - cacheTempo < TEMPO_CACHE)) {
        console.log("Carregando agenda do cache local... ⚡");
        processarDadosBrutos(cacheSalvo);
        return;
    }

    
    console.log("Buscando novos dados do Google Sheets...");
    fetch(URL)
        .then(res => res.text())
        .then(textoBruto => {
            
            localStorage.setItem('agenda_dados_google', textoBruto);
            localStorage.setItem('agenda_tempo_google', agora.toString());
            
            processarDadosBrutos(textoBruto);
        })
        .catch(err => {
            console.error("Erro ao buscar dados da planilha, tentando usar cache antigo:", err);
            
            if (cacheSalvo) {
                processarDadosBrutos(cacheSalvo);
            } else {
                document.getElementById('agenda-container').innerHTML = "<p>Erro ao carregar os eventos. Verifique sua conexão.</p>";
            }
        });
}


function processarDadosBrutos(textoDoGoogle) {
    
    const jsonPuro = JSON.parse(textoDoGoogle.substring(47).slice(0, -2));
    const linhas = jsonPuro.table.rows;
    
    processarERenderizar(linhas);
}

function processarERenderizar(linhas) {
    const container = document.getElementById('agenda-container');
    
    if (!container) {
        console.error("Erro: O elemento #agenda-container não foi encontrado no HTML.");
        return;
    }
    
    container.innerHTML = ''; 
    //console.log("Dados recebidos do Google:", linhas); 

    const eventosPorData = {};

    linhas.forEach(linha => {
    if (!linha.c || !linha.c[0]) return;

    const dataOriginal = linha.c[0].f || linha.c[0].v; 

    if (dataOriginal.toString().includes("Data")) {
        console.log("Ignorando a linha de cabeçalho da planilha.");
        return; 
    }

    const hora = linha.c[1] ? (linha.c[1].f || linha.c[1].v) : '--:--';
    const categoria = linha.c[2] ? linha.c[2].v : 'Geral';
    const titulo = linha.c[3] ? linha.c[3].v : 'Sem título';
    const local = linha.c[4] ? linha.c[4].v : 'A definir';

    if (!eventosPorData[dataOriginal]) {
        eventosPorData[dataOriginal] = [];
    }
    
    eventosPorData[dataOriginal].push({ hora, categoria, titulo, local });
});

    if (Object.keys(eventosPorData).length === 0) {
        container.innerHTML = "<p class='subtitle'>Nenhum evento marcado para os próximos dias! 🎉</p>";
        return;
    }

    for (const data in eventosPorData) {
        const diaSection = document.createElement('div');
        diaSection.className = 'agenda-dia-bloco';
        
        let eventosHTML = `<h3>📅 ${data}</h3>`;
        
        eventosPorData[data].forEach(evento => {
            eventosHTML += `
                <div class="evento-card ${evento.categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}">
                    <div class="evento-hora">${evento.hora}</div>
                    <div class="evento-info">
                        <h4>[${evento.categoria}] ${evento.titulo}</h4>
                        <p>📍 ${evento.local}</p>
                    </div>
                </div>
            `;
        });

        diaSection.innerHTML = eventosHTML;
        container.appendChild(diaSection);
    }
}

// Inicializa
window.addEventListener('DOMContentLoaded', carregarAgenda);