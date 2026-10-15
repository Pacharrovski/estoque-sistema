from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Produto, Movimentacao, Configuracao
from datetime import datetime, timezone, timedelta

router = APIRouter()


def obter_janela_consumo(db: Session) -> int:
    config = db.query(Configuracao).filter(
        Configuracao.chave == "janela_consumo_dias"
    ).first()
    return int(config.valor) if config else 90


@router.get("/estoque")
def listar_estoque(db: Session = Depends(get_db)):
    janela_dias = obter_janela_consumo(db)
    agora = datetime.now(timezone.utc)
    inicio_janela = agora - timedelta(days=janela_dias)

    produtos = db.query(Produto).all()
    resultado = []

    for produto in produtos:
        # Estoque atual: quantidade_esperada + entradas - saidas
        total_entradas = db.query(func.sum(Movimentacao.quantidade))\
            .filter(
                Movimentacao.id_produto == produto.id_produto,
                Movimentacao.tipo == "ENTRADA"
        ).scalar() or 0

        total_saidas = db.query(func.sum(Movimentacao.quantidade))\
            .filter(
                Movimentacao.id_produto == produto.id_produto,
                Movimentacao.tipo == "SAIDA"
        ).scalar() or 0

        estoque_atual = produto.quantidade_esperada + total_entradas - total_saidas

        # Saidas na janela de consumo
        saidas_janela = db.query(func.sum(Movimentacao.quantidade))\
            .filter(
                Movimentacao.id_produto == produto.id_produto,
                Movimentacao.tipo == "SAIDA",
                Movimentacao.data >= inicio_janela
        ).scalar() or 0

        # Data da primeira movimentacao do produto
        primeira_mov = db.query(func.min(Movimentacao.data))\
            .filter(
                Movimentacao.id_produto == produto.id_produto
        ).scalar()

        # Calcular dias observados e status do Cd
        if primeira_mov is None:
            cd = 0.0
            dias_observados = 0
            status_cd = "SEM MOVIMENTO"
        else:
            if primeira_mov.tzinfo is None:
                primeira_mov = primeira_mov.replace(tzinfo=timezone.utc)

            dias_desde_cadastro = (agora - primeira_mov).days + 1

            if dias_desde_cadastro >= janela_dias:
                # Historico completo
                dias_observados = janela_dias
                cd = round(saidas_janela / janela_dias, 4)
                status_cd = "NORMAL"
            else:
                # Historico parcial — divide pelos dias reais observados
                dias_observados = dias_desde_cadastro
                cd = round(saidas_janela / dias_desde_cadastro, 4)

                if dias_desde_cadastro >= 30:
                    status_cd = "PROVISÓRIO"
                else:
                    status_cd = "BAIXA CONFIABILIDADE"

        # Ponto de ressuprimento
        if status_cd in ("SEM MOVIMENTO", "BAIXA CONFIABILIDADE"):
            pr = None
            status_reposicao = "SEM DADOS"
        else:
            pr = round(
                (cd * produto.prazo_entrega_dias) + produto.estoque_seguranca, 2
            )
            status_reposicao = "REPOR" if estoque_atual <= pr else "OK"

        resultado.append({
            "id_produto": produto.id_produto,
            "sku": produto.sku,
            "nome": produto.nome,
            "categoria": produto.categoria,
            "quantidade_esperada": produto.quantidade_esperada,
            "estoque_seguranca": produto.estoque_seguranca,
            "prazo_entrega_dias": produto.prazo_entrega_dias,
            "estoque_atual": estoque_atual,
            "total_entradas": total_entradas,
            "total_saidas": total_saidas,
            "consumo_medio_diario": cd,
            "dias_observados": dias_observados,
            "janela_consumo_dias": janela_dias,
            "ponto_ressuprimento": pr,
            "status_cd": status_cd,
            "status_reposicao": status_reposicao
        })

    return resultado
