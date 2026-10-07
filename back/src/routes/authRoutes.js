const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/AuthController.js');
const autenticar = require('../middleware/auth.js');
const validar = require('../middleware/validate.js');

router.post('/registrar',
  [
    body('nome').trim().notEmpty().withMessage('Nome e obrigatorio').isLength({ min: 2, max: 100 }),
    body('email').isEmail().withMessage('E-mail invalido').normalizeEmail(),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter ao menos 6 caracteres'),
  ],
  validar,
  ctrl.registrar
);

router.post('/login',
  [
    body('email').isEmail().withMessage('E-mail invalido').normalizeEmail(),
    body('senha').notEmpty().withMessage('Senha e obrigatoria'),
  ],
  validar,
  ctrl.login
);

router.post('/esqueci-senha',
  [body('email').isEmail().withMessage('E-mail invalido').normalizeEmail()],
  validar,
  ctrl.esqueciSenha
);

router.post('/redefinir-senha',
  [
    body('token').notEmpty().withMessage('Token e obrigatorio'),
    body('novaSenha').isLength({ min: 6 }).withMessage('Nova senha deve ter ao menos 6 caracteres'),
  ],
  validar,
  ctrl.redefinirSenha
);

router.get('/eu', autenticar, ctrl.meusDados);

router.put('/eu',
  autenticar,
  [body('nome').optional().trim().isLength({ min: 2, max: 100 })],
  validar,
  ctrl.atualizarMeusDados
);

module.exports = router;
