const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    usuario_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    token: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    expira_em: {
      type: Date,
      required: true,
    },
    utilizado: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'criado_em', updatedAt: 'atualizado_em' },
  }
);

const Token = mongoose.model('TokenRecuperacao', tokenSchema);

const TokenModel = {
  gerarCodigo() {
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 8 }, () =>
      caracteres[Math.floor(Math.random() * caracteres.length)]
    ).join('');
  },

  async criar(usuarioId) {
    if (!mongoose.Types.ObjectId.isValid(usuarioId)) return null;

    await Token.deleteMany({ usuario_id: usuarioId });

    const token = this.gerarCodigo();
    const expiraEm = new Date(Date.now() + 3600 * 1000);

    await Token.create({
      usuario_id: usuarioId,
      token,
      expira_em: expiraEm,
    });

    return token;
  },

  async buscarValido(token) {
    if (!token) return null;

    const tokenDoc = await Token.findOne({
      token: token.toUpperCase(),
      utilizado: false,
      expira_em: { $gt: new Date() },
    }).populate('usuario_id', 'nome email');

    if (!tokenDoc || !tokenDoc.usuario_id) return null;

    return {
      id: tokenDoc._id.toString(),
      usuario_id: tokenDoc.usuario_id._id.toString(),
      token: tokenDoc.token,
      expira_em: tokenDoc.expira_em,
      utilizado: tokenDoc.utilizado ? 1 : 0,
      nome: tokenDoc.usuario_id.nome,
      email: tokenDoc.usuario_id.email,
    };
  },

  async marcarUtilizado(token) {
    if (!token) return;
    await Token.updateOne(
      { token: token.toUpperCase() },
      { $set: { utilizado: true } }
    );
  },
};

module.exports = TokenModel;