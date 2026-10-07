const { validationResult } = require('express-validator');

function validar(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(422).json({
      sucesso: false,
      mensagem: 'Dados inválidos',
      erros: erros.array().map(e => ({ campo: e.path, mensagem: e.msg })),
    });
  }
  next();
}

module.exports = validar;
