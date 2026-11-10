const UsuarioController = {
  /*
   * Cada usuário só pode consultar o PRÓPRIO cadastro.
   */
  async buscarPorId(req, res, next) {
    try {
      if (req.params.id !== req.usuarioId) {
        return res.status(403).json({
          sucesso: false,
          mensagem: 'Acesso negado a este usuario',
        });
      }

      return res.json({
        sucesso: true,
        usuario: req.usuario,
      });
    } catch (erro) {
      next(erro);
    }
  },
};

module.exports = UsuarioController;