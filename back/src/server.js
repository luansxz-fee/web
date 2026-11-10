require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const conectarBanco = require('./config/database');

const rotasAuth = require('./routes/authRoutes.js');
const rotasUsuarios = require('./routes/usuarioRoutes.js');
const rotasMedicamentos = require('./routes/medicationRoutes.js');
const rotasRegistros = require('./routes/logRoutes.js');

const {
  tratarErro,
  rotaNaoEncontrada,
} = require('./middleware/errorHandler.js');

const app = express();

// Necessário atrás de proxy (Render, Heroku, Nginx) para o rate limit ler o IP real.
app.set('trust proxy', 1);
app.disable('x-powered-by');

const PORTA = process.env.PORT || 3001;

// CORS
app.use(cors({
  origin: '*',
  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
  ],
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limit geral
const limitadorGeral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    sucesso: false,
    mensagem: 'Muitas requisicoes. Tente novamente em 15 minutos.',
  },
});

app.use('/api', limitadorGeral);

const limitadorAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    sucesso: false,
    mensagem: 'Muitas tentativas. Aguarde 15 minutos.',
  },
});

// Limite rígido apenas nas rotas sensíveis (força bruta / spam de e-mail).
// Rotas como GET /api/auth/eu, chamada a cada abertura do app, não entram aqui.
app.post(
  [
    '/api/auth/login',
    '/api/auth/registrar',
    '/api/auth/esqueci-senha',
    '/api/auth/redefinir-senha',
  ],
  limitadorAuth
);

app.get('/api/health', (req, res) => {
  res.json({
    sucesso: true,
    servico: 'MedSync API',
    versao: '1.0.0',
    horario: new Date().toISOString(),
    ambiente: process.env.NODE_ENV || 'development',
  });
});

app.use('/api/auth', rotasAuth);
app.use('/api/usuarios', rotasUsuarios);
app.use('/api/medicamentos', rotasMedicamentos);
app.use('/api/registros', rotasRegistros);

app.use(rotaNaoEncontrada);
app.use(tratarErro);

async function iniciarServidor() {
  try {
    await conectarBanco();

    app.listen(PORTA, '0.0.0.0', () => {
      console.log(`MedSync API rodando na porta ${PORTA}`);
      console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (erro) {
    console.error('Falha ao iniciar o MedSync:', erro.message);
    process.exit(1);
  }
}

iniciarServidor();

module.exports = app;