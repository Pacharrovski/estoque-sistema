// ===== CONFIGURAÇÃO =====
const API_URL = 'http://localhost:8000/api';

// ===== VARIÁVEIS GLOBAIS =====
let produtos = [];
let operadores = [];
let movimentacoes = [];

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    configurarAbas();
    configurarFormulario();
    configurarBusca();
});

// ===== CARREGAR DADOS DA API =====
async function carregarDados() {
    try {
        console.log('Carregando dados da API...');
        
        // Carrega os 3 dados
        produtos = await fetch(`${API_URL}/produtos`).then(r => r.json());
        operadores = await fetch(`${API_URL}/operadores`).then(r => r.json());
        movimentacoes = await fetch(`${API_URL}/movimentacoes`).then(r => r.json());
        
        console.log('Dados carregados:', { produtos, operadores, movimentacoes });
        
        // Renderiza os dados nas telas
        renderizarKPIs();
        renderizarProdutos();
        renderizarOperadores();
        renderizarMovimentacoes();
        preencherSelects();
    } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
        mostrarMensagem('Erro ao conectar com a API. Certifique-se que ela está rodando.', 'error');
    }
}

// ===== RENDERIZAR KPIs =====
async function renderizarKPIs() {
    try {
        const kpis = await fetch(`${API_URL}/kpis`).then(r => r.json());
        
        document.getElementById('total-movimentacoes').textContent = kpis.total_movimentacoes;
        document.getElementById('total-entradas').textContent = kpis.total_entradas;
        document.getElementById('total-saidas').textContent = kpis.total_saidas;
        document.getElementById('produtos-estoque').textContent = kpis.produtos_em_estoque;
        
        renderizarGraficoOperadores(kpis.movimentacoes_por_operador);
    } catch (erro) {
        console.error('Erro ao carregar KPIs:', erro);
    }
}

// ===== RENDERIZAR GRÁFICO DE OPERADORES =====
function renderizarGraficoOperadores(dados) {
    const chartDiv = document.getElementById('operadores-chart');
    chartDiv.innerHTML = '';
    
    dados.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'chart-item';
        itemDiv.innerHTML = `
            <span class="chart-name">${item.operador}</span>
            <span class="chart-value">${item.total} movimentações</span>
        `;
        chartDiv.appendChild(itemDiv);
    });
}

// ===== RENDERIZAR PRODUTOS =====
function renderizarProdutos(filtro = '') {
    const listDiv = document.getElementById('produtos-list');
    listDiv.innerHTML = '';
    
    const produtosFiltrados = produtos.filter(p => 
        p.sku.toLowerCase().includes(filtro.toLowerCase()) ||
        p.nome.toLowerCase().includes(filtro.toLowerCase())
    );
    
    if (produtosFiltrados.length === 0) {
        listDiv.innerHTML = '<p style="text-align: center; color: #999;">Nenhum produto encontrado</p>';
        return;
    }
    
    produtosFiltrados.forEach(produto => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'list-item';
        itemDiv.innerHTML = `
            <h4>${produto.sku}</h4>
            <p><strong>Nome:</strong> ${produto.nome}</p>
            <p><strong>Categoria:</strong> ${produto.categoria}</p>
            <p><strong>Quantidade Esperada:</strong> ${produto.quantidade_esperada}</p>
        `;
        listDiv.appendChild(itemDiv);
    });
}

// ===== RENDERIZAR OPERADORES =====
function renderizarOperadores() {
    const listDiv = document.getElementById('operadores-list');
    listDiv.innerHTML = '';
    
    operadores.forEach(operador => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'list-item';
        itemDiv.innerHTML = `
            <h4>${operador.nome}</h4>
            <p><strong>Setor:</strong> ${operador.setor}</p>
        `;
        listDiv.appendChild(itemDiv);
    });
}

// ===== RENDERIZAR MOVIMENTAÇÕES =====
function renderizarMovimentacoes() {
    const listDiv = document.getElementById('movimentacoes-list');
    listDiv.innerHTML = '';
    
   
    const ultimas = movimentacoes.slice(0, 5);
    
    if (ultimas.length === 0) {
        listDiv.innerHTML = '<p style="text-align: center; color: #999;">Nenhuma movimentação registrada</p>';
        return;
    }
    
    ultimas.forEach(mov => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'list-item';
        const tipoClass = mov.tipo === 'ENTRADA' ? 'entrada' : 'saida';
        itemDiv.innerHTML = `
            <h4>${mov.produto.sku} - ${mov.produto.nome}</h4>
            <p><strong>Operador:</strong> ${mov.operador.nome}</p>
            <p><strong>Tipo:</strong> <span class="tipo-${tipoClass}">${mov.tipo}</span></p>
            <p><strong>Quantidade:</strong> ${mov.quantidade}</p>
            <p><strong>Data:</strong> ${new Date(mov.data).toLocaleString('pt-BR')}</p>
        `;
        listDiv.appendChild(itemDiv);
    });
}

// ===== FILTRAR MOVIMENTAÇÕES =====
function filtrarMovimentacoes(idOperador, idProduto, tipo) {
    const listDiv = document.getElementById('movimentacoes-list');
    listDiv.innerHTML = '';
    
    let movimentacoesFiltradas = movimentacoes;
    
    if (idOperador) {
        movimentacoesFiltradas = movimentacoesFiltradas.filter(m => m.id_operador === parseInt(idOperador));
    }
    
    if (idProduto) {
        movimentacoesFiltradas = movimentacoesFiltradas.filter(m => m.id_produto === parseInt(idProduto));
    }
    
    if (tipo) {
        movimentacoesFiltradas = movimentacoesFiltradas.filter(m => m.tipo === tipo);
    }
    
    if (movimentacoesFiltradas.length === 0) {
        listDiv.innerHTML = '<p style="text-align: center; color: #999;">Nenhuma movimentação encontrada</p>';
        return;
    }
    
    movimentacoesFiltradas.forEach(mov => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'list-item';
        const tipoClass = mov.tipo === 'ENTRADA' ? 'entrada' : 'saida';
        itemDiv.innerHTML = `
            <h4>${mov.produto.sku} - ${mov.produto.nome}</h4>
            <p><strong>Operador:</strong> ${mov.operador.nome}</p>
            <p><strong>Tipo:</strong> <span class="tipo-${tipoClass}">${mov.tipo}</span></p>
            <p><strong>Quantidade:</strong> ${mov.quantidade}</p>
            <p><strong>Data:</strong> ${new Date(mov.data).toLocaleString('pt-BR')}</p>
        `;
        listDiv.appendChild(itemDiv);
    });
}

// ===== PREENCHER SELECTS DO FORMULÁRIO =====
function preencherSelects() {
    const operadorSelect = document.getElementById('operador-select');
    const produtoSelect = document.getElementById('produto-select');
    const filterOperadorSelect = document.getElementById('filter-operador');
    const filterProdutoSelect = document.getElementById('filter-produto');
    
    operadorSelect.innerHTML = '<option value="">Selecione um operador</option>';
    produtoSelect.innerHTML = '<option value="">Selecione um produto</option>';
    filterOperadorSelect.innerHTML = '<option value="">Todos os operadores</option>';
    filterProdutoSelect.innerHTML = '<option value="">Todos os produtos</option>';
    
    operadores.forEach(op => {
        const option1 = document.createElement('option');
        option1.value = op.id_operador;
        option1.textContent = op.nome;
        operadorSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = op.id_operador;
        option2.textContent = op.nome;
        filterOperadorSelect.appendChild(option2);
    });
    
    produtos.forEach(prod => {
        const option1 = document.createElement('option');
        option1.value = prod.id_produto;
        option1.textContent = `${prod.sku} - ${prod.nome}`;
        produtoSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = prod.id_produto;
        option2.textContent = `${prod.sku} - ${prod.nome}`;
        filterProdutoSelect.appendChild(option2);
    });
}

// ===== CONFIGURAR ABAS =====
function configurarAbas() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            // Remove classe active de todos os botões
            tabBtns.forEach(b => b.classList.remove('active'));
            
            // Adiciona classe active ao botão clicado
            btn.classList.add('active');
            
            // Esconde todas as abas
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Mostra a aba selecionada
            document.getElementById(tabName).classList.add('active');
        });
    });
}

// ===== CONFIGURAR FORMULÁRIO =====
function configurarFormulario() {
    const form = document.getElementById('form-movimentacao');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const idOperador = document.getElementById('operador-select').value;
        const idProduto = document.getElementById('produto-select').value;
        const tipo = document.getElementById('tipo-select').value;
        const quantidade = document.getElementById('quantidade-input').value;
        
        if (!idOperador || !idProduto || !tipo || !quantidade) {
            mostrarMensagem('Preencha todos os campos', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/movimentacoes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_operador: parseInt(idOperador),
                    id_produto: parseInt(idProduto),
                    tipo: tipo,
                    quantidade: parseInt(quantidade),
                    data: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                mostrarMensagem('Movimentação registrada com sucesso!', 'success');
                form.reset();
                carregarDados(); // Recarrega todos os dados
            } else {
                mostrarMensagem('Erro ao registrar movimentação', 'error');
            }
        } catch (erro) {
            console.error('Erro:', erro);
            mostrarMensagem('Erro ao registrar movimentação', 'error');
        }
    });
// ===== FILTRAR MOVIMENTAÇÕES =====
    const btnFiltrar = document.getElementById('btn-filtrar');
    const btnLimpar = document.getElementById('btn-limpar-filtro');

    btnFiltrar.addEventListener('click', () => {
        const idOperador = document.getElementById('filter-operador').value;
        const idProduto = document.getElementById('filter-produto').value;
        const tipo = document.getElementById('filter-tipo').value;
        filtrarMovimentacoes(idOperador, idProduto, tipo);
    });

    btnLimpar.addEventListener('click', () => {
        document.getElementById('filter-operador').value = '';
        document.getElementById('filter-produto').value = '';
        document.getElementById('filter-tipo').value = '';
        renderizarMovimentacoes();
    });
}

// ===== CONFIGURAR BUSCA =====
function configurarBusca() {
    const searchBox = document.getElementById('search-produtos');
    
    searchBox.addEventListener('input', (e) => {
        const filtro = e.target.value;
        renderizarProdutos(filtro);
    });
}

// ===== MOSTRAR MENSAGEM =====
function mostrarMensagem(texto, tipo) {
    const messageDiv = document.createElement('div');
    messageDiv.className = tipo; // 'success' ou 'error'
    messageDiv.textContent = texto;
    
    // Insere no topo do content
    const content = document.querySelector('.content');
    content.insertBefore(messageDiv, content.firstChild);
    
    // Remove a mensagem após 3 segundos
    setTimeout(() => messageDiv.remove(), 3000);
}