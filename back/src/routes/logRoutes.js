const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/LogController.js');
const autenticar = require('../middleware/auth.js');
const validar = require('../middleware/validate.js');

router.use(autenticar);

router.get('/', ctrl.listar);
router.get('/hoje', ctrl.hoje);
router.get('/adesao', ctrl.adesao);

router.post('/',
  [
    body('medicamentoId').notEmpty().withMessage('ID do medicamento e obrigatorio'),
    body('horarioAgendado').matches(/^\d{2}:\d{2}$/).withMessage('Horario invalido, use HH:MM'),
    body('situacao').isIn(['tomada', 'perdida', 'pulada', 'pendente']).withMessage('Situacao invalida'),
    body('observacao').optional({ nullable: true }).isString(),
  ],
  validar,
  ctrl.salvar
);

module.exports = router;
