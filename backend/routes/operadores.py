from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Operador
from schemas import OperadorCreate, OperadorResponse
from typing import List

router = APIRouter()

@router.get("/operadores", response_model=List[OperadorResponse])
def listar_operadores(db: Session = Depends(get_db)):
    operadores = db.query(Operador).all()
    return operadores

@router.get("/operadores/{id_operador}", response_model=OperadorResponse)
def obter_operador(id_operador: int, db: Session = Depends(get_db)):
    operador = db.query(Operador).filter(Operador.id_operador == id_operador).first()
    if not operador:
        raise HTTPException(status_code=404, detail="Operador não encontrado")
    return operador

@router.post("/operadores", response_model=OperadorResponse)
def criar_operador(operador: OperadorCreate, db: Session = Depends(get_db)):
    novo_operador = Operador(
        nome=operador.nome,
        setor=operador.setor
    )
    db.add(novo_operador)
    db.commit()
    db.refresh(novo_operador)
    return novo_operador