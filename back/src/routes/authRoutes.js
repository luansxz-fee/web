const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/AuthController.js');
const autenticar = require('../middleware/auth.js');
const validar = require('../middleware/validate.js');


const senhaForteRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

router.post(
  '/registrar',
  [
    body('nome')
      .trim()
      .notEmpty()
      .withMessage('Nome e obrigatorio')
      .isLength({ min: 2, max: 100 }),

    body('email')
      .isEmail()
      .withMessage('E-mail invalido')
      .normalizeEmail(),

    body('senha')
      .matches(senhaForteRegex)
      .withMessage(
        'A senha deve possuir no minimo 8 caracteres, ' +
        'letras maiusculas e minusculas, numeros ' +
        'e pelo menos um caractere especial.'
      ),
  ],
  validar,
  ctrl.registrar
);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('E-mail invalido')
      .normalizeEmail(),

    body('senha')
      .notEmpty()
      .withMessage('Senha e obrigatoria'),
  ],
  validar,
  ctrl.login
);

router.post(
  '/esqueci-senha',
  [
    body('email')
      .isEmail()
      .withMessage('E-mail invalido')
      .normalizeEmail(),
  ],
  validar,
  ctrl.esqueciSenha
);

router.post(
  '/redefinir-senha',
  [
    body('token')
      .notEmpty()
      .withMessage('Token e obrigatorio'),

    body('novaSenha')
      .matches(senhaForteRegex)
      .withMessage(
        'A nova senha deve possuir no minimo 8 caracteres, ' +
        'letras maiusculas e minusculas, numeros ' +
        'e pelo menos um caractere especial.'
      ),
  ],
  validar,
  ctrl.redefinirSenha
);

router.get(
  '/eu',
  autenticar,
  ctrl.meusDados
);

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