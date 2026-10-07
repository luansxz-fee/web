CREATE DATABASE IF NOT EXISTS medsync
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE medsync;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  avatar VARCHAR(500) DEFAULT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tokens_recuperacao_senha (
  id INT NOT NULL AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  token CHAR(8) NOT NULL,
  expira_em DATETIME NOT NULL,
  utilizado TINYINT(1) NOT NULL DEFAULT 0,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_token (token),
  CONSTRAINT fk_token_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS medicamentos (
  id INT NOT NULL AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  nome VARCHAR(150) NOT NULL,
  dosagem VARCHAR(50) NOT NULL,
  unidade VARCHAR(30) NOT NULL DEFAULT 'mg',
  frequencia VARCHAR(50) NOT NULL DEFAULT 'Diário',
  horarios JSON NOT NULL,
  categoria VARCHAR(50) NOT NULL DEFAULT 'Outros',
  data_inicio DATE NOT NULL,
  data_termino DATE DEFAULT NULL,
  cor VARCHAR(20) NOT NULL DEFAULT '#2563EB',
  icone VARCHAR(10) NOT NULL DEFAULT '💊',
  url_imagem VARCHAR(1000) DEFAULT NULL,
  estoque_atual INT NOT NULL DEFAULT 30,
  estoque_maximo INT NOT NULL DEFAULT 30,
  instrucoes TEXT DEFAULT NULL,
  medico_prescritor VARCHAR(100) DEFAULT NULL,
  efeitos_colaterais TEXT DEFAULT NULL,
  lembrete_ativo TINYINT(1) NOT NULL DEFAULT 1,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_medicamento_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_med_usuario (usuario_id),
  INDEX idx_med_usuario_ativo (usuario_id, ativo),
  INDEX idx_med_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS registros_doses (
  id INT NOT NULL AUTO_INCREMENT,
  medicamento_id INT NOT NULL,
  usuario_id INT NOT NULL,
  horario_agendado VARCHAR(5) NOT NULL,
  data_dose DATE NOT NULL,
  tomado_em DATETIME DEFAULT NULL,
  situacao ENUM('pendente','tomada','perdida','pulada') NOT NULL DEFAULT 'pendente',
  observacao TEXT DEFAULT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dose_unica (medicamento_id, data_dose, horario_agendado),
  CONSTRAINT fk_dose_medicamento FOREIGN KEY (medicamento_id) REFERENCES medicamentos(id) ON DELETE CASCADE,
  CONSTRAINT fk_dose_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_dose_usuario_data (usuario_id, data_dose),
  INDEX idx_dose_medicamento (medicamento_id),
  INDEX idx_dose_situacao (usuario_id, situacao),
  INDEX idx_dose_data_situacao (data_dose, situacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
