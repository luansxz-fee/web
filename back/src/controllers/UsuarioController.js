
const UsuarioModel = require('../models/UserModel');

const UsuarioController = {

  async buscarPorId(req, res, next) {
    try {
      const usuario = await UsuarioModel.buscarPorId(
        req.params.id
      );

      if (!usuario) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Usuario nao encontrado',
        });
      }

      return res.json({
        sucesso: true,
        usuario: UsuarioModel.formatar(usuario),
      });
    } catch (erro) {
      next(erro);
    }
  },

};

module.exports = UsuarioController;
