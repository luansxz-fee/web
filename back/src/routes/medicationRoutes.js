const router = require('express').Router();

const { body } = require('express-validator');

const ctrl = require('../controllers/MedicationController.js');
const autenticar = require('../middleware/auth.js');
const validar = require('../middleware/validate.js');

router.use(autenticar);

const validacoesMedicamento = [
  body('nome')
    .trim()
    .notEmpty()
    .withMessage('Nome do medicamento e obrigatorio'),

  body('dosagem')
    .trim()
    .notEmpty()
    .withMessage('Dosagem e obrigatoria'),

  body('unidade')
    .trim()
    .notEmpty()
    .withMessage('Unidade e obrigatoria'),

  body('frequencia')
    .trim()
    .notEmpty()
    .withMessage('Frequencia e obrigatoria'),

  body('horarios')
    .isArray({ min: 1 })
    .withMessage('Informe ao menos um horario'),

  body('horarios.*')
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('Horario invalido, use HH:MM'),

  body('dataInicio')
    .isDate()
    .withMessage('Data de inicio invalida'),

  body('cor')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Cor invalida'),

  body('estoqueAtual')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Estoque invalido'),

  body('estoqueMaximo')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacidade invalida'),

  body('urlImagem')
    .optional({ nullable: true })
    .custom((val) => {
      if (!val || val === '') {
        return true;
      }

      try {
        new URL(val);
        return true;
      } catch {
        throw new Error('URL da imagem invalida');
      }
    }),
];

router.get('/', ctrl.listar);

router.get('/:id', ctrl.buscar);

router.post(
  '/',
  validacoesMedicamento,
  validar,
  ctrl.criar
);

router.put(
  '/:id',
  validacoesMedicamento,
  validar,
  ctrl.atualizar
);

router.delete('/:id', ctrl.excluir);

router.patch('/:id/alternar', ctrl.alternarAtivo);

module.exports = router;