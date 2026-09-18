-- ====================================================================
-- SISTEMA DE GESTÃO DE OFICINA MECÂNICA (SGOM)
-- SCRIPT DE CRIAÇÃO DA BASE DE DADOS RELACIONAL (SQL)
-- Compatível com: MySQL 8.0+ / MariaDB / PostgreSQL
-- Atende aos Casos de Uso CU01 até CU08 e Requisitos RF01 até RF12
-- ====================================================================

CREATE DATABASE IF NOT EXISTS sgom_oficina CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sgom_oficina;

-- 1. TABELA DE UTILIZADORES (CU01 / RF01 / RF11)
CREATE TABLE IF NOT EXISTS utilizadores (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil ENUM('admin', 'atendente', 'mecanico') NOT NULL,
    cargo VARCHAR(80) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE CLIENTES (CU02 / RF02)
CREATE TABLE IF NOT EXISTS clientes (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    telefone VARCHAR(30) NOT NULL,
    email VARCHAR(100),
    endereco VARCHAR(200),
    nuit VARCHAR(25) NOT NULL UNIQUE, -- Validação de unicidade do NUIT
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA DE VEÍCULOS (CU03 / RF03 / RF10)
CREATE TABLE IF NOT EXISTS veiculos (
    id VARCHAR(36) PRIMARY KEY,
    cliente_id VARCHAR(36) NOT NULL,
    matricula VARCHAR(20) NOT NULL UNIQUE, -- Validação de matrícula única
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    ano INT NOT NULL,
    cor VARCHAR(30),
    quilometragem INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_veiculo_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- 4. TABELA DE MECÂNICOS / TÉCNICOS (CU06 / RF06)
CREATE TABLE IF NOT EXISTS mecanicos (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    especialidade VARCHAR(100) NOT NULL,
    telefone VARCHAR(30) NOT NULL,
    email VARCHAR(100),
    status ENUM('ativo', 'inativo') DEFAULT 'ativo',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABELA DE STOCK DE PEÇAS (CU07 / RF07 / RF08)
CREATE TABLE IF NOT EXISTS pecas_stock (
    id VARCHAR(36) PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nome VARCHAR(120) NOT NULL,
    categoria VARCHAR(60) NOT NULL,
    quantidade INT NOT NULL DEFAULT 0,
    min_quantidade INT NOT NULL DEFAULT 2, -- Gatilho para alertas de reposição
    preco_unitario DECIMAL(10,2) NOT NULL,
    fornecedor VARCHAR(100),
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. TABELA DE ORDENS DE SERVIÇO (CU04 / CU05 / RF04 / RF05)
CREATE TABLE IF NOT EXISTS ordens_servico (
    id VARCHAR(36) PRIMARY KEY,
    cliente_id VARCHAR(36) NOT NULL,
    veiculo_id VARCHAR(36) NOT NULL,
    mecanico_id VARCHAR(36) NOT NULL,
    descricao_problema TEXT NOT NULL,
    diagnostico TEXT,
    status ENUM('Pendente', 'Em execucao', 'Aguardando peca', 'Concluida') DEFAULT 'Pendente',
    custo_mao_obra DECIMAL(10,2) DEFAULT 0.00,
    data_abertura DATETIME NOT NULL,
    data_conclusao DATETIME NULL,
    CONSTRAINT fk_os_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    CONSTRAINT fk_os_veiculo FOREIGN KEY (veiculo_id) REFERENCES veiculos(id),
    CONSTRAINT fk_os_mecanico FOREIGN KEY (mecanico_id) REFERENCES mecanicos(id)
);

-- 7. TABELA ASSOCIATIVA DE PEÇAS UTILIZADAS NA OS (RF08)
CREATE TABLE IF NOT EXISTS itens_os_pecas (
    id VARCHAR(36) PRIMARY KEY,
    os_id VARCHAR(36) NOT NULL,
    peca_id VARCHAR(36) NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    adicionado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_item_os FOREIGN KEY (os_id) REFERENCES ordens_servico(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_peca FOREIGN KEY (peca_id) REFERENCES pecas_stock(id)
);

-- 8. TABELA DE FATURAS E ORÇAMENTOS (CU08 / RF09)
CREATE TABLE IF NOT EXISTS faturas (
    id VARCHAR(36) PRIMARY KEY,
    os_id VARCHAR(36) NOT NULL UNIQUE,
    cliente_id VARCHAR(36) NOT NULL,
    veiculo_id VARCHAR(36) NOT NULL,
    subtotal_pecas DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    subtotal_mao_obra DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    desconto DECIMAL(10,2) DEFAULT 0.00,
    justificativa_desconto TEXT NULL, -- Obrigatória se desconto > 0 (Regra CU08)
    taxa_iva DECIMAL(5,2) DEFAULT 16.00,
    valor_iva DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_faturado DECIMAL(10,2) NOT NULL,
    metodo_pagamento VARCHAR(50) NOT NULL,
    data_emissao DATETIME NOT NULL,
    CONSTRAINT fk_fatura_os FOREIGN KEY (os_id) REFERENCES ordens_servico(id),
    CONSTRAINT fk_fatura_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    CONSTRAINT fk_fatura_veiculo FOREIGN KEY (veiculo_id) REFERENCES veiculos(id)
);

-- ====================================================================
-- DADOS INICIAIS DE TESTE (SEED DATA)
-- ====================================================================

-- Utilizadores padrão
INSERT INTO utilizadores (id, nome, email, senha_hash, perfil, cargo) VALUES
('usr-1', 'Dr. Arnaldo Silva', 'admin@oficina.co.mz', '$2y$10$e8w..hash..exemplo', 'admin', 'Diretor Geral / Gerente'),
('usr-2', 'Marta Cossa', 'atendimento@oficina.co.mz', '$2y$10$e8w..hash..exemplo', 'atendente', 'Recepcionista e Atendente'),
('usr-3', 'Mestre João Sitoe', 'mecanica@oficina.co.mz', '$2y$10$e8w..hash..exemplo', 'mecanico', 'Mecânico Chefe');

-- Clientes
INSERT INTO clientes (id, nome, telefone, email, endereco, nuit) VALUES
('cli-1', 'Empresa Transportes Zambeze Lda', '+258 84 100 2030', 'contato@zambeze.co.mz', 'Av. 24 de Julho, Maputo', '400123999'),
('cli-2', 'Carlos Manuel Tembe', '+258 82 555 4321', 'carlos.tembe@gmail.com', 'Bairro da Sommerschield, Maputo', '100456789'),
('cli-3', 'Ana Paula Mondlane', '+258 87 333 9876', 'ana.mondlane@hotmail.com', 'Av. Julius Nyerere, Maputo', '100987654');

-- Veículos
INSERT INTO veiculos (id, cliente_id, matricula, marca, modelo, ano, cor, quilometragem) VALUES
('veh-1', 'cli-1', 'AFE-890-MC', 'Toyota', 'Hilux D4D 3.0', 2021, 'Branco', 78400),
('veh-2', 'cli-2', 'AIH-112-MC', 'Isuzu', 'D-Max 2.5', 2020, 'Prata', 112000),
('veh-3', 'cli-3', 'AGK-445-MC', 'Nissan', 'X-Trail 2.0', 2022, 'Cinzento', 45200);

-- Mecânicos
INSERT INTO mecanicos (id, nome, especialidade, telefone, email, status) VALUES
('mec-1', 'Mestre João Sitoe', 'Motores e Transmissões', '+258 84 999 1111', 'joao.sitoe@oficina.co.mz', 'ativo'),
('mec-2', 'Técnico Daniel Macuácua', 'Eletricidade e Injeção Eletrónica', '+258 82 888 2222', 'daniel.m@oficina.co.mz', 'ativo'),
('mec-3', 'António Matusse', 'Suspensão, Freios e Alinhamento', '+258 86 777 3333', 'antonio.m@oficina.co.mz', 'ativo');

-- Peças no Stock
INSERT INTO pecas_stock (id, codigo, nome, categoria, quantidade, min_quantidade, preco_unitario, fornecedor) VALUES
('prt-1', 'FIL-OLEO-01', 'Filtro de Óleo Hilux / D4D', 'Filtros e Fluidos', 18, 5, 850.00, 'AutoPeças Moçambique Lda'),
('prt-2', 'PAS-TRAV-01', 'Jogo Pastilhas Travão Frente', 'Sistema de Travagem', 12, 4, 2800.00, 'Distribuidora Central Maputo'),
('prt-3', 'OLEO-5W30-5L', 'Óleo Sintético 5W30 (Garrafão 5L)', 'Filtros e Fluidos', 24, 6, 3200.00, 'TotalEnergies Moçambique'),
('prt-4', 'DISC-TRAV-01', 'Par de Discos de Travão Dianteiros', 'Sistema de Travagem', 6, 2, 6500.00, 'Distribuidora Central Maputo'),
('prt-5', 'BAT-70AH-01', 'Bateria Automóvel Willard 70Ah', 'Baterias e Elétrica', 8, 3, 7200.00, 'Baterias do Índico');
