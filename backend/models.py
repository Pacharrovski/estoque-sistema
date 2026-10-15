from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Operador(Base):
    __tablename__ = "operadores"

    id_operador = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    setor = Column(String(100), nullable=False)

    movimentacoes = relationship("Movimentacao", back_populates="operador")


class Produto(Base):
    __tablename__ = "produtos"

    id_produto = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, nullable=False, index=True)
    nome = Column(String(255), nullable=False)
    categoria = Column(String(100), nullable=False)
    quantidade_esperada = Column(Integer, nullable=False)
    estoque_seguranca = Column(Integer, nullable=False, default=0)
    prazo_entrega_dias = Column(Integer, nullable=False, default=1)

    movimentacoes = relationship("Movimentacao", back_populates="produto")


class Movimentacao(Base):
    __tablename__ = "movimentacoes"

    id_movimentacao = Column(Integer, primary_key=True, index=True)
    id_operador = Column(Integer, ForeignKey(
        "operadores.id_operador"), nullable=False)
    id_produto = Column(Integer, ForeignKey(
        "produtos.id_produto"), nullable=False)
    tipo = Column(String(20), nullable=False)
    quantidade = Column(Integer, nullable=False)
    data = Column(TIMESTAMP(timezone=True),
                  nullable=False, default=datetime.utcnow)

    operador = relationship("Operador", back_populates="movimentacoes")
    produto = relationship("Produto", back_populates="movimentacoes")


class Configuracao(Base):
    __tablename__ = "configuracoes"

    id_configuracao = Column(Integer, primary_key=True, index=True)
    chave = Column(String(100), unique=True, nullable=False)
    valor = Column(String(255), nullable=False)
    descricao = Column(String, nullable=True)
