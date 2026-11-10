const router = require('express').Router();
const { body } = require('express-validator');

const ctrl = require('../controllers/MedicationController.js');
const autenticar = require('../middleware/auth.js');
const validar = require('../middleware/validate.js');

router.use(autenticar);


function validacoesMedicamento({ parcial = false } = {}) {
  const campo = (nome) => {
    const cadeia = body(nome);
    return parcial ? cadeia.optional() : cadeia;
  };

  return [
    campo('nome')
      .trim()
      .notEmpty()
      .withMessage('Nome do medicamento e obrigatorio'),

    campo('dosagem')
      .trim()
      .notEmpty()
      .withMessage('Dosagem e obrigatoria'),

    campo('unidade')
      .trim()
      .notEmpty()
      .withMessage('Unidade e obrigatoria'),

    campo('frequencia')
      .trim()
      .notEmpty()
      .withMessage('Frequencia e obrigatoria'),

    campo('horarios')
      .isArray({ min: 1 })
      .withMessage('Informe ao menos um horario'),

    body('horarios.*')
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('Horario invalido, use HH:MM'),

    campo('dataInicio')
      .isISO8601()
      .withMessage('Data de inicio invalida'),

    body('dataTermino')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601()
      .withMessage('Data de termino invalida'),

    body('cor')
      .optional({ nullable: true })
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Cor invalida'),

    body('estoqueAtual')
      .optional({ nullable: true })
      .isInt({ min: 0 })
      .withMessage('Estoque invalido'),

    body('estoqueMaximo')
      .optional({ nullable: true })
      .isInt({ min: 1 })
      .withMessage('Capacidade invalida'),

    body('lembreteAtivo')
      .optional({ nullable: true })
      .isBoolean()
      .withMessage('lembreteAtivo deve ser verdadeiro ou falso'),

    body('ativo')
      .optional({ nullable: true })
      .isBoolean()
      .withMessage('ativo deve ser verdadeiro ou falso'),

    body('medicoPrescritor')
      .optional({ nullable: true })
      .isString()
      .withMessage('Nome do medico invalido'),

    body('crm')
      .optional({ nullable: true })
      .isString()
      .withMessage('CRM invalido'),

    body('urlImagem')
      .optional({ nullable: true })
      .custom((val) => {
        if (!val || val === '') return true;

        try {
          new URL(val);
          return true;
        } catch {
          throw new Error('URL da imagem invalida');
        }
      }),
  ];
}

router.get('/', ctrl.listar);
router.get('/:id', ctrl.buscar);

router.post(
  '/',
  validacoesMedicamento(),
  validar,
  ctrl.criar
);

router.put(
  '/:id',
  validacoesMedicamento({ parcial: true }),
  validar,
  ctrl.atualizar
);

router.patch('/:id/alternar', ctrl.alternarAtivo);

router.delete('/:id', ctrl.excluir);

module.exports = router;