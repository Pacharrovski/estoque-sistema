from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import produtos, operadores, movimentacoes, estoque

# Cria a aplicação FastAPI
app = FastAPI(
    title="Sistema de Controle de Estoque",
    description="API REST para controle de movimentação de autopeças",
    version="1.0.0"
)

# Configuração de CORS (permite o frontend acessar a API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Cria as tabelas no banco se não existirem
Base.metadata.create_all(bind=engine)

# Registra as rotas
app.include_router(produtos.router, prefix="/api", tags=["Produtos"])
app.include_router(operadores.router, prefix="/api", tags=["Operadores"])
app.include_router(movimentacoes.router, prefix="/api", tags=["Movimentações"])
app.include_router(estoque.router, prefix="/api", tags=["Estoque"])

# Rota raiz (pra testar se a API está no ar)


@app.get("/")
def root():
    return {"status": "online", "message": "API de Controle de Estoque funcionando"}
