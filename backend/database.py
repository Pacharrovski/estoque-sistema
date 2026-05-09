from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool

# Connection string
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/estoque_db"

# Cria o engine
engine = create_engine(
    DATABASE_URL,
    poolclass=StaticPool,  # reutiliza conexões
    # echo=True mostra todas as queries no terminal (útil pra debug)
    echo=False
)

# Função que cria uma nova sessão do banco
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Classe mãe que os models vão herdar
Base = declarative_base()

# Função que outras partes do código vão usar pra pegar uma sessão


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
