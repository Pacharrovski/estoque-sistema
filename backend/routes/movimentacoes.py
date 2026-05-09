from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from database import get_db
from models import Movimentacao, Operador, Produto
from schemas import MovimentacaoCreate, MovimentacaoResponse, MovimentacaoComDetalhes
from typing import List
from datetime import datetime

router = APIRouter()

@router.get("/movimentacoes", response_model=List[MovimentacaoComDetalhes])
def listar_movimentacoes(db: Session = Depends(get_db)):
    movimentacoes = db.query(Movimentacao)\
        .options(
            joinedload(Movimentacao.operador),
            joinedload(Movimentacao.produto)
        )\
        .order_by(Movimentacao.data.desc())\
        .all()
    return movimentacoes

@router.get("/movimentacoes/{id_movimentacao}", response_model=MovimentacaoComDetalhes)
def obter_movimentacao(id_movimentacao: int, db: Session = Depends(get_db)):
    movimentacao = db.query(Movimentacao)\
        .options(
            joinedload(Movimentacao.operador),
            joinedload(Movimentacao.produto)
        )\
        .filter(Movimentacao.id_movimentacao == id_movimentacao)\
        .first()
    if not movimentacao:
        raise HTTPException(status_code=404, detail="Movimentação não encontrada")
    return movimentacao

@router.post("/movimentacoes", response_model=MovimentacaoResponse)
def criar_movimentacao(movimentacao: MovimentacaoCreate, db: Session = Depends(get_db)):
    operador = db.query(Operador).filter(Operador.id_operador == movimentacao.id_operador).first()
    if not operador:
        raise HTTPException(status_code=404, detail="Operador não encontrado")

    produto = db.query(Produto).filter(Produto.id_produto == movimentacao.id_produto).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    nova_movimentacao = Movimentacao(
        id_operador=movimentacao.id_operador,
        id_produto=movimentacao.id_produto,
        tipo=movimentacao.tipo,
        quantidade=movimentacao.quantidade,
        data=movimentacao.data or datetime.utcnow()
    )
    db.add(nova_movimentacao)
    db.commit()
    db.refresh(nova_movimentacao)
    return nova_movimentacao

@router.get("/kpis")
def obter_kpis(db: Session = Depends(get_db)):
    total_movimentacoes = db.query(func.count(Movimentacao.id_movimentacao)).scalar()

    total_entradas = db.query(func.sum(Movimentacao.quantidade))\
        .filter(Movimentacao.tipo == "ENTRADA").scalar() or 0

    total_saidas = db.query(func.sum(Movimentacao.quantidade))\
        .filter(Movimentacao.tipo == "SAIDA").scalar() or 0

    produtos_em_estoque = db.query(func.count(Produto.id_produto)).scalar()

    movimentacoes_por_operador = db.query(
        Operador.nome,
        func.count(Movimentacao.id_movimentacao).label("total")
    )\
        .join(Movimentacao, Operador.id_operador == Movimentacao.id_operador)\
        .group_by(Operador.nome)\
        .all()

    return {
        "total_movimentacoes": total_movimentacoes,
        "total_entradas": total_entradas,
        "total_saidas": total_saidas,
        "produtos_em_estoque": produtos_em_estoque,
        "movimentacoes_por_operador": [
            {"operador": nome, "total": total}
            for nome, total in movimentacoes_por_operador
        ]
    }