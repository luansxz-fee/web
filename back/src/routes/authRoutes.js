const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/AuthController.js');
const autenticar = require('../middleware/auth.js');
const validar = require('../middleware/validate.js');

const validarSenhaForte = (campo) =>
  body(campo)
    .isLength({ min: 8 })
    .withMessage('A senha deve ter ao menos 8 caracteres')
    .matches(/[a-z]/)
    .withMessage('A senha deve conter uma letra minúscula')
    .matches(/[A-Z]/)
    .withMessage('A senha deve conter uma letra maiúscula')
    .matches(/\d/)
    .withMessage('A senha deve conter um número')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('A senha deve conter um caractere especial');

router.post(
  '/registrar',
  [
    body('nome')
      .trim()
      .notEmpty()
      .withMessage('Nome é obrigatório')
      .isLength({ min: 2, max: 100 }),
    body('email')
      .isEmail()
      .withMessage('E-mail inválido')
      .normalizeEmail(),
    validarSenhaForte('senha'),
  ],
  validar,
  ctrl.registrar
);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('E-mail inválido')
      .normalizeEmail(),
    body('senha')
      .notEmpty()
      .withMessage('Senha é obrigatória'),
  ],
  validar,
  ctrl.login
);

router.post(
  '/esqueci-senha',
  [
    body('email')
      .isEmail()
      .withMessage('E-mail inválido')
      .normalizeEmail(),
  ],
  validar,
  ctrl.esqueciSenha
);

router.post(
  '/redefinir-senha',
  [
    body('token').notEmpty().withMessage('Token é obrigatório'),
    validarSenhaForte('novaSenha'),
  ],
  validar,
  ctrl.redefinirSenha
);

router.get('/eu', autenticar, ctrl.meusDados);

router.put(
  '/eu',
  autenticar,
  [
    body('nome')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }),
  ],
  validar,
  ctrl.atualizarMeusDados
);

module.exports = router;