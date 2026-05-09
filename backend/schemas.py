from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# ===== SCHEMAS DE OPERADORES =====

class OperadorBase(BaseModel):
    """Schema base com campos comuns"""
    nome: str
    setor: str

class OperadorCreate(OperadorBase):
    """Schema para criar um operador"""
    pass

class OperadorResponse(OperadorBase):
    """Schema para devolver um operador (com ID)"""
    id_operador: int
    
    class Config:
        from_attributes = True  # permite converter model do SQLAlchemy pra dict

# ===== SCHEMAS DE PRODUTOS =====

class ProdutoBase(BaseModel):
    """Schema base com campos comuns"""
    sku: str
    nome: str
    categoria: str
    quantidade_esperada: int

class ProdutoCreate(ProdutoBase):
    """Schema para criar um produto"""
    pass

class ProdutoResponse(ProdutoBase):
    """Schema para devolver um produto (com ID)"""
    id_produto: int
    
    class Config:
        from_attributes = True

# ===== SCHEMAS DE MOVIMENTACOES =====

class MovimentacaoBase(BaseModel):
    """Schema base com campos comuns"""
    id_operador: int
    id_produto: int
    tipo: str  # ENTRADA ou SAIDA
    quantidade: int

class MovimentacaoCreate(MovimentacaoBase):
    """Schema para criar uma movimentação"""
    data: Optional[datetime] = None  # opcional, se não informar usa data atual

class MovimentacaoResponse(MovimentacaoBase):
    """Schema para devolver uma movimentação (com ID e data)"""
    id_movimentacao: int
    data: datetime
    
    class Config:
        from_attributes = True

# ===== SCHEMAS COM RELACIONAMENTOS (para queries complexas) =====

class MovimentacaoComDetalhes(MovimentacaoResponse):
    """Movimentação com dados do operador e produto"""
    operador: OperadorResponse
    produto: ProdutoResponse
    
    class Config:
        from_attributes = True