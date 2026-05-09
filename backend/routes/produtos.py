from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Produto
from schemas import ProdutoCreate, ProdutoResponse
from typing import List

router = APIRouter()

@router.get("/produtos", response_model=List[ProdutoResponse])
def listar_produtos(db: Session = Depends(get_db)):
    produtos = db.query(Produto).all()
    return produtos

@router.get("/produtos/{id_produto}", response_model=ProdutoResponse)
def obter_produto(id_produto: int, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter(Produto.id_produto == id_produto).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return produto

@router.get("/produtos/sku/{sku}", response_model=ProdutoResponse)
def obter_produto_por_sku(sku: str, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter(Produto.sku == sku).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return produto

@router.post("/produtos", response_model=ProdutoResponse)
def criar_produto(produto: ProdutoCreate, db: Session = Depends(get_db)):
    produto_existente = db.query(Produto).filter(Produto.sku == produto.sku).first()
    if produto_existente:
        raise HTTPException(status_code=400, detail="SKU já cadastrado")
    novo_produto = Produto(
        sku=produto.sku,
        nome=produto.nome,
        categoria=produto.categoria,
        quantidade_esperada=produto.quantidade_esperada
    )
    db.add(novo_produto)
    db.commit()
    db.refresh(novo_produto)
    return novo_produto