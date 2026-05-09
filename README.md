# Sistema de Controle de Estoque de Autopeças
 
Sistema web para controle e análise de movimentação de estoque de autopeças.
Desenvolvido com foco em boas práticas de modelagem relacional, arquitetura REST e
separação de responsabilidades entre backend e frontend.
 
> Este projeto está em desenvolvimento ativo — novas funcionalidades e melhorias
> são adicionadas continuamente.
 
## Tecnologias
 
- **Backend**: Python, FastAPI, SQLAlchemy, psycopg2
- **Banco de dados**: PostgreSQL
- **Frontend**: HTML, CSS, JavaScript (Fetch API)
## Funcionalidades
 
- Dashboard com KPIs operacionais (total de movimentações, entradas, saídas e produtos)
- Listagem de produtos com busca por SKU ou nome
- Listagem de operadores por setor
- Registro de movimentações de entrada e saída
- Filtro de movimentações por operador, produto e tipo
- API REST documentada via Swagger UI
## Estrutura do Projeto
 
```
estoque-sistema/
├── banco_dados/
│   └── schema.sql              # Criação e população das tabelas
├── backend/
│   ├── main.py                 # Inicialização da API
│   ├── database.py             # Conexão com PostgreSQL
│   ├── models.py               # Modelos SQLAlchemy
│   ├── schemas.py              # Schemas Pydantic
│   └── routes/
│       ├── operadores.py       # Endpoints de operadores
│       ├── produtos.py         # Endpoints de produtos
│       └── movimentacoes.py    # Endpoints de movimentações e KPIs
└── frontend/
    ├── index.html              # Interface principal
    ├── styles.css              # Estilos
    └── script.js               # Lógica e consumo da API
```
 
## Como Rodar Localmente
 
### Pré-requisitos
 
- Python 3.10+
- PostgreSQL instalado e rodando
- pgAdmin 4 (opcional)
### 1. Clonar o repositório
 
```bash
git clone https://github.com/Pacharrovski/estoque-sistema.git
cd estoque-sistema
```
 
### 2. Criar e ativar o ambiente virtual
 
```bash
python3 -m venv venv
source venv/bin/activate
```
 
### 3. Instalar as dependências
 
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary faker
```
 
### 4. Configurar o banco de dados
 
Crie um banco chamado `estoque_db` no PostgreSQL e rode o script:
 
```bash
psql -U postgres -d estoque_db -f banco_dados/schema.sql
```
 
### 5. Rodar o backend
 
```bash
cd backend
uvicorn main:app --reload
```
 
A API estará disponível em `http://localhost:8000`
 
A documentação Swagger estará em `http://localhost:8000/docs`
 
### 6. Rodar o frontend
 
Em outro terminal:
 
```bash
cd frontend
python3 -m http.server 5500
```
 
Acesse `http://localhost:5500`
 
## Modelagem do Banco de Dados
 
### Tabelas
 
**operadores**
| Coluna | Tipo | Restrição |
|--------|------|-----------|
| id_operador | SERIAL | PK |
| nome | VARCHAR(255) | NOT NULL |
| setor | VARCHAR(100) | NOT NULL |
 
**produtos**
| Coluna | Tipo | Restrição |
|--------|------|-----------|
| id_produto | SERIAL | PK |
| sku | VARCHAR(50) | UNIQUE, NOT NULL |
| nome | VARCHAR(255) | NOT NULL |
| categoria | VARCHAR(100) | NOT NULL |
| quantidade_esperada | INTEGER | NOT NULL |
 
**movimentacoes**
| Coluna | Tipo | Restrição |
|--------|------|-----------|
| id_movimentacao | SERIAL | PK |
| id_operador | INTEGER | FK → operadores |
| id_produto | INTEGER | FK → produtos |
| tipo | VARCHAR(20) | NOT NULL — ENTRADA ou SAIDA |
| quantidade | INTEGER | NOT NULL |
| data | TIMESTAMP WITH TIME ZONE | NOT NULL |
 
### Relacionamentos
 
- Um operador realiza zero ou muitas movimentações (1:N)
- Um produto sofre zero ou muitas movimentações (1:N)
- Uma movimentação pertence a exatamente um operador e um produto
## API — Endpoints
 
### Produtos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/produtos` | Lista todos os produtos |
| GET | `/api/produtos/{id}` | Busca produto por ID |
| GET | `/api/produtos/sku/{sku}` | Busca produto por SKU |
| POST | `/api/produtos` | Cria novo produto |
 
### Operadores
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/operadores` | Lista todos os operadores |
| GET | `/api/operadores/{id}` | Busca operador por ID |
| POST | `/api/operadores` | Cria novo operador |
 
### Movimentações
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/movimentacoes` | Lista todas as movimentações |
| GET | `/api/movimentacoes/{id}` | Busca movimentação por ID |
| POST | `/api/movimentacoes` | Registra nova movimentação |
| GET | `/api/kpis` | Retorna KPIs operacionais |
 
## Autor
 
**Samuel Pacharra Lopes Martins**
- LinkedIn: [linkedin.com/in/samuel-p-aa194a2a9](https://linkedin.com/in/samuel-p-aa194a2a9)
- Email: samuelpacharramartins@gmail.com