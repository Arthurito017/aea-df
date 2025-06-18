CREATE DATABASE aea_df;
USE aea_df;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  funcao ENUM('juridico', 'contabil', 'administrativo', 'diretorias') NOT NULL
);
INSERT INTO usuarios (nome, cpf, funcao) VALUES
('Arthur Dev', '077.068.791-19', 'administrativo');
INSERT INTO usuarios (nome, cpf, funcao) VALUES
('Dalila Juridico', '123.456.789-00', 'juridico'),
('Carlos Contador', '321.654.987-00', 'contabil'),
('Maria Diretora', '111.222.333-44', 'diretorias');
ALTER TABLE usuarios ADD COLUMN diretoria VARCHAR(100) DEFAULT NULL;

SELECT * FROM usuarios;

CREATE TABLE atendimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    departamento_destino VARCHAR(100) NOT NULL,
    atendente VARCHAR(100) NOT NULL,
    solicitante VARCHAR(100) NOT NULL,
    assunto VARCHAR(100) NOT NULL,
    data_hora DATETIME NOT NULL,
    situacao VARCHAR(50) NOT NULL,
    canal VARCHAR(50) NOT NULL, -- telefone/whatsapp, presencial, email, outros
    observacoes TEXT
);
ALTER TABLE atendimentos ADD COLUMN diretoria VARCHAR(100) NULL;
ALTER TABLE atendimentos ADD COLUMN data_hora_fim DATETIME AFTER data_hora;
ALTER TABLE atendimentos
ADD COLUMN data_criado DATETIME DEFAULT CURRENT_TIMESTAMP;

INSERT INTO atendimentos (
    departamento_destino,
    atendente,
    solicitante,
    assunto,
    data_hora,
    situacao,
    canal,
    observacoes
) VALUES (
    'juridico',
    'Dalila Jurídica',
    'Carlos Silva',
    'IR - Proc. Judicial',
    '2025-06-05 14:30:00',
    'Atendido',
    'whatsapp',
    'Foi orientado a buscar documentação adicional.'
);
select * from atendimentos;
DESCRIBE atendimentos;
ALTER TABLE atendimentos MODIFY COLUMN data_hora_fim VARCHAR(5);

DESCRIBE atendimentos;
