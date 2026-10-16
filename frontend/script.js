// ===== CONFIGURAÇÃO =====
const API_URL = 'http://localhost:8000/api';

// ===== VARIÁVEIS GLOBAIS =====
let produtos = [];
let operadores = [];
let movimentacoes = [];
let dadosEstoque = [];
let categoriaSelecionada = '';

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

        produtos = await fetch(`${API_URL}/produtos`).then(r => r.json());
        operadores = await fetch(`${API_URL}/operadores`).then(r => r.json());
        movimentacoes = await fetch(`${API_URL}/movimentacoes`).then(r => r.json());
        dadosEstoque = await fetch(`${API_URL}/estoque`).then(r => r.json());

        console.log('Dados carregados:', { produtos, operadores, movimentacoes });

        renderizarKPIs();
        renderizarProdutos();
        renderizarOperadores();
        renderizarMovimentacoes();
        preencherSelects();
        renderizarEstoque();
        preencherFiltrosCategoriaEstoque();
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
function renderizarProdutos(filtro = '', categoria = '') {
    const listDiv = document.getElementById('produtos-list');
    listDiv.innerHTML = '';

    const produtosFiltrados = produtos.filter(p =>
        (p.sku.toLowerCase().includes(filtro.toLowerCase()) ||
        p.nome.toLowerCase().includes(filtro.toLowerCase())) &&
        (categoria === '' || p.categoria === categoria)
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
let paginaAtual = 1;
const itensPorPagina = 5;

function renderizarMovimentacoes(pagina = 1) {
    const listDiv = document.getElementById('movimentacoes-list');
    listDiv.innerHTML = '';
    paginaAtual = pagina;

    const total = movimentacoes.length;
    const totalPaginas = Math.ceil(total / itensPorPagina);
    const inicio = (pagina - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const pagAtual = movimentacoes.slice(inicio, fim);

    if (pagAtual.length === 0) {
        listDiv.innerHTML = '<p style="text-align: center; color: #999;">Nenhuma movimentação registrada</p>';
        return;
    }

    pagAtual.forEach(mov => {
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

    if (totalPaginas > 1) {
        const paginacaoDiv = document.createElement('div');
        paginacaoDiv.className = 'paginacao';

        const btnAnterior = document.createElement('button');
        btnAnterior.textContent = '← Anterior';
        btnAnterior.className = 'btn-paginacao';
        btnAnterior.disabled = pagina === 1;
        btnAnterior.addEventListener('click', () => renderizarMovimentacoes(pagina - 1));

        const info = document.createElement('span');
        info.className = 'paginacao-info';
        info.textContent = `Página ${pagina} de ${totalPaginas} (${total} movimentações)`;

        const btnProximo = document.createElement('button');
        btnProximo.textContent = 'Próximo →';
        btnProximo.className = 'btn-paginacao';
        btnProximo.disabled = pagina === totalPaginas;
        btnProximo.addEventListener('click', () => renderizarMovimentacoes(pagina + 1));

        paginacaoDiv.appendChild(btnAnterior);
        paginacaoDiv.appendChild(info);
        paginacaoDiv.appendChild(btnProximo);
        listDiv.appendChild(paginacaoDiv);
    }
}

// ===== FILTRAR MOVIMENTAÇÕES =====
function filtrarMovimentacoes(idOperador, idProduto, tipo, dataInicio, dataFim) {
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

    if (dataInicio) {
        const inicio = new Date(dataInicio);
        movimentacoesFiltradas = movimentacoesFiltradas.filter(m => new Date(m.data) >= inicio);
    }

    if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        movimentacoesFiltradas = movimentacoesFiltradas.filter(m => new Date(m.data) <= fim);
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

        // Preencher categorias dos produtos
    const categoriaProdutosSelect = document.getElementById('filter-categoria-produtos');
    const categoriasProdutos = [...new Set(produtos.map(p => p.categoria))].sort();
    categoriaProdutosSelect.innerHTML = '<option value="">Todas as categorias</option>';
    categoriasProdutos.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        categoriaProdutosSelect.appendChild(opt);
    });

}

// ===== CONFIGURAR ABAS =====
function configurarAbas() {
    const tabBtns = document.querySelectorAll('.tab-btn');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(tab => tab.classList.remove('active'));

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
                headers: { 'Content-Type': 'application/json' },
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
                carregarDados();
            } else {
                const erro = await response.json();
                mostrarMensagem(erro.detail || 'Erro ao registrar movimentação', 'error');
            }
        } catch (erro) {
            console.error('Erro:', erro);
            mostrarMensagem('Erro ao registrar movimentação', 'error');
        }
    });

    // ===== FILTROS DE MOVIMENTAÇÕES =====
    const btnFiltrar = document.getElementById('btn-filtrar');
    const btnLimpar = document.getElementById('btn-limpar-filtro');

    btnFiltrar.addEventListener('click', () => {
        const idOperador = document.getElementById('filter-operador').value;
        const idProduto = document.getElementById('filter-produto').value;
        const tipo = document.getElementById('filter-tipo').value;
        const dataInicio = document.getElementById('filter-data-inicio').value;
        const dataFim = document.getElementById('filter-data-fim').value;
        filtrarMovimentacoes(idOperador, idProduto, tipo, dataInicio, dataFim);
    });

    btnLimpar.addEventListener('click', () => {
        document.getElementById('filter-operador').value = '';
        document.getElementById('filter-produto').value = '';
        document.getElementById('filter-tipo').value = '';
        document.getElementById('filter-data-inicio').value = '';
        document.getElementById('filter-data-fim').value = '';
        renderizarMovimentacoes();
    });

    // ===== FILTROS DE ESTOQUE =====
    const btnFiltrarEstoque = document.getElementById('btn-filtrar-estoque');
    const btnLimparEstoque = document.getElementById('btn-limpar-estoque');

    btnFiltrarEstoque.addEventListener('click', () => {
        const status = document.getElementById('filter-status-reposicao').value;
        const categoria = document.getElementById('filter-categoria-estoque').value;
        renderizarEstoque(status, categoria);
    });

    btnLimparEstoque.addEventListener('click', () => {
        document.getElementById('filter-status-reposicao').value = '';
        document.getElementById('filter-categoria-estoque').value = '';
        renderizarEstoque();
    });
}

// ===== CONFIGURAR BUSCA =====

function configurarBusca() {
    const searchBox = document.getElementById('search-produtos');
    const categoriaSelect = document.getElementById('filter-categoria-produtos');

    searchBox.addEventListener('input', (e) => {
        renderizarProdutos(e.target.value, categoriaSelect.value);
    });

    categoriaSelect.addEventListener('change', (e) => {
        renderizarProdutos(searchBox.value, e.target.value);
    });
}

// ===== RENDERIZAR ESTOQUE =====
function renderizarEstoque(filtroStatus = '', filtroCategoria = '') {
    const tbody = document.getElementById('estoque-tbody');
    const contador = document.getElementById('estoque-contador');
    tbody.innerHTML = '';

    let dados = dadosEstoque;

    if (filtroStatus) {
        dados = dados.filter(p => p.status_reposicao === filtroStatus);
    }

    if (filtroCategoria) {
        dados = dados.filter(p => p.categoria === filtroCategoria);
    }

    contador.textContent = `${dados.length} produto(s) exibido(s)`;

    if (dados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center; color:#999; padding:30px;">
                    Nenhum produto encontrado
                </td>
            </tr>`;
        return;
    }

    dados.forEach(p => {
        const tr = document.createElement('tr');
        if (p.status_reposicao === 'REPOR') tr.classList.add('linha-repor');

        tr.innerHTML = `
            <td>${p.sku}</td>
            <td>${p.nome}</td>
            <td>${p.categoria}</td>
            <td>${p.quantidade_esperada}</td>
            <td><strong>${p.estoque_atual}</strong></td>
            <td>${p.consumo_medio_diario}</td>
            <td>${p.ponto_ressuprimento !== null ? p.ponto_ressuprimento : '—'}</td>
            <td>${badgeStatusCd(p.status_cd)}</td>
            <td>${badgeReposicao(p.status_reposicao)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function badgeStatusCd(status) {
    const mapa = {
        'NORMAL':               'badge-normal',
        'PROVISÓRIO':           'badge-provisorio',
        'BAIXA CONFIABILIDADE': 'badge-baixa-conf',
        'SEM MOVIMENTO':        'badge-sem-movimento'
    };
    const cls = mapa[status] || 'badge-sem-dados';
    return `<span class="badge ${cls}">${status}</span>`;
}

function badgeReposicao(status) {
    const mapa = {
        'OK':        'badge-ok',
        'REPOR':     'badge-repor',
        'SEM DADOS': 'badge-sem-dados'
    };
    const cls = mapa[status] || 'badge-sem-dados';
    return `<span class="badge ${cls}">${status}</span>`;
}

function preencherFiltrosCategoriaEstoque() {
    const select = document.getElementById('filter-categoria-estoque');
    const categorias = [...new Set(dadosEstoque.map(p => p.categoria))].sort();

    select.innerHTML = '<option value="">Todas as categorias</option>';
    categorias.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
}

// ===== MOSTRAR MENSAGEM =====
function mostrarMensagem(texto, tipo) {
    const messageDiv = document.createElement('div');
    messageDiv.className = tipo;
    messageDiv.textContent = texto;

    const content = document.querySelector('.content');
    content.insertBefore(messageDiv, content.firstChild);

    setTimeout(() => messageDiv.remove(), 3000);
}