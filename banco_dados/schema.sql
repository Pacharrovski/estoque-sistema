-- CRIAÇÃO DAS TABELAS

CREATE TABLE operadores (
    id_operador SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    setor VARCHAR(100) NOT NULL
);

CREATE TABLE produtos (
    id_produto SERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    quantidade_esperada INTEGER NOT NULL
);

CREATE TABLE movimentacoes (
    id_movimentacao SERIAL PRIMARY KEY,
    id_operador INTEGER NOT NULL,
    id_produto INTEGER NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    quantidade INTEGER NOT NULL,
    data TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_operador FOREIGN KEY (id_operador) REFERENCES operadores(id_operador) ON DELETE RESTRICT,
    CONSTRAINT fk_produto FOREIGN KEY (id_produto) REFERENCES produtos(id_produto) ON DELETE RESTRICT
);

-- INSERÇÃO DE DADOS

INSERT INTO operadores (nome, setor) 
VALUES 
  ('Carlos Silva', 'Separação'),
  ('Ana Pereira', 'Conferência Check-in'),
  ('Roberto Costa', 'Conferência Check-out');

INSERT INTO produtos (sku, nome, categoria, quantidade_esperada) 
VALUES 
  ('MF-OL-001', 'Filtro de Óleo Mann Filter', 'Filtros', 50),
  ('MF-AR-002', 'Filtro de Ar Mann Filter', 'Filtros', 45),
  ('MF-CB-003', 'Filtro de Cabine Mann Filter', 'Filtros', 40),
  ('NK-AM-004', 'Amortecedor Dianteiro Nakata', 'Amortecedores', 30),
  ('NK-AT-005', 'Amortecedor Traseiro Nakata', 'Amortecedores', 28),
  ('NK-AG-006', 'Amortecedor Especial 4WD Nakata', 'Amortecedores', 20),
  ('SB-RT-007', 'Retentor Motor Sabó', 'Retentores', 100),
  ('SB-CT-008', 'Retentor Cambio Sabó', 'Retentores', 80),
  ('SB-DT-009', 'Retentor Diferencial Sabó', 'Retentores', 60),
  ('GT-CB-010', 'Correia de Distribuição Gates', 'Correias', 25),
  ('GT-AR-011', 'Correia de Acessórios Gates', 'Correias', 35),
  ('GT-SP-012', 'Correia Serpentina Gates', 'Correias', 40),
  ('MF-TP-013', 'Filtro de Transmissão Mann Filter', 'Filtros', 35),
  ('NK-CB-014', 'Amortecedor Comercial Nakata', 'Amortecedores', 15),
  ('SB-VT-015', 'Retentor Virabrequim Sabó', 'Retentores', 90);

INSERT INTO movimentacoes (id_operador, id_produto, tipo, quantidade, data) 
VALUES 
  (1, 1, 'ENTRADA', 25, '2026-05-01 08:30:00+00'),
  (2, 4, 'SAIDA', 5, '2026-05-01 10:15:00+00'),
  (3, 7, 'ENTRADA', 40, '2026-05-02 09:00:00+00'),
  (1, 10, 'SAIDA', 3, '2026-05-02 14:30:00+00'),
  (2, 2, 'ENTRADA', 20, '2026-05-03 08:45:00+00'),
  (3, 8, 'SAIDA', 12, '2026-05-03 11:20:00+00'),
  (1, 5, 'ENTRADA', 15, '2026-05-04 09:30:00+00'),
  (2, 13, 'SAIDA', 8, '2026-05-04 15:45:00+00'),
  (3, 11, 'ENTRADA', 30, '2026-05-05 07:50:00+00'),
  (1, 9, 'SAIDA', 10, '2026-05-05 16:00:00+00');