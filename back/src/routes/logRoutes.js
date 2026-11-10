const router = require('express').Router();
const { body, query } = require('express-validator');
const ctrl = require('../controllers/LogController.js');
const autenticar = require('../middleware/auth.js');
const validar = require('../middleware/validate.js');

router.use(autenticar);


const SITUACOES = {
  tomada: 'tomada',
  tomado: 'tomada',
  taken: 'tomada',
  perdida: 'perdida',
  perdido: 'perdida',
  missed: 'perdida',
  pulada: 'pulada',
  pulado: 'pulada',
  skipped: 'pulada',
  pendente: 'pendente',
  pending: 'pendente',
};

const normalizarSituacao = (valor) => {
  const chave = String(valor ?? '').trim().toLowerCase();
  return SITUACOES[chave] || chave;
};

const opcoesData = { format: 'YYYY-MM-DD', strictMode: true, delimiters: ['-'] };

router.get('/', ctrl.listar);

router.get(
  '/hoje',
  [
    query('data')
      .optional()
      .isDate(opcoesData)
      .withMessage('Data invalida, use AAAA-MM-DD'),
  ],
  validar,
  ctrl.hoje
);

router.get('/adesao', ctrl.adesao);

router.post(
  '/',
  [
    body('medicamentoId')
      .notEmpty()
      .withMessage('ID do medicamento e obrigatorio'),
    body('horarioAgendado')
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('Horario invalido, use HH:MM'),
    body('situacao')
      .customSanitizer(normalizarSituacao)
      .isIn(['tomada', 'perdida', 'pulada', 'pendente'])
      .withMessage('Situacao invalida'),
    body('observacao').optional({ nullable: true }).isString(),
    body('dataDose')
      .optional({ nullable: true, checkFalsy: true })
      .isDate(opcoesData)
      .withMessage('Data invalida, use AAAA-MM-DD'),
  ],
  validar,
  ctrl.salvar
);

module.exports = router;