const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/UserModel');

async function autenticar(req, res, next) {
  try {
    const cabecalho = req.headers.authorization;

    if (
      !cabecalho ||
      !cabecalho.startsWith('Bearer ')
    ) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Token nao fornecido',
      });
    }

    const token = cabecalho
      .substring(7)
      .trim();

    if (!token) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Token nao fornecido',
      });
    }

    const decodificado = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (
      !decodificado ||
      !decodificado.id
    ) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Token invalido',
      });
    }

    const usuario =
      await UsuarioModel.buscarPorId(
        decodificado.id
      );

    if (!usuario) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Usuario nao encontrado',
      });
    }

    /*
     * ID REAL do usuario no MongoDB.
     *
     * Esse campo e usado pelos controllers
     * para garantir que as alteracoes sejam
     * feitas na conta autenticada.
     */
    req.usuarioId =
      usuario._id.toString();

    /*
     * Dados formatados do usuario autenticado.
     */
    req.usuario =
      UsuarioModel.formatar(usuario);

    next();
  } catch (erro) {
    console.error(
      'Erro de autenticacao:',
      erro.message
    );

    if (
      erro.name === 'TokenExpiredError'
    ) {
      return res.status(401).json({
        sucesso: false,
        mensagem:
          'Sessao expirada, faca login novamente',
      });
    }

    return res.status(401).json({
      sucesso: false,
      mensagem: 'Token invalido',
    });
  }
}

module.exports = autenticar;