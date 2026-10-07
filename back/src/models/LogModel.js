
const mongoose = require('mongoose');

const registroDoseSchema = new mongoose.Schema(
  {
    medicamento_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicamento',
      required: true,
    },
    usuario_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    horario_agendado: {
      type: String,
      required: true,
    },
    tomado_em: {
      type: Date,
      default: null,
    },
    situacao: {
      type: String,
      required: true,
    },
    data_dose: {
      type: String,
      required: true,
    },
    observacao: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: 'criado_em',
      updatedAt: 'atualizado_em',
    },
  }
);

const RegistroDose = mongoose.model(
  'RegistroDose',
  registroDoseSchema
);

const RegistroDoseModel = {
  formatar(doc) {
    if (!doc) return null;

    const formatarData = (valor) => {
      if (!valor) return null;

      if (valor instanceof Date) {
        return valor.toISOString().split('T')[0];
      }

      return valor;
    };

    return {
      id: doc._id
        ? doc._id.toString()
        : doc.id,

      medicamentoId: doc.medicamento_id
        ? doc.medicamento_id.toString()
        : doc.medicamentoId,

      usuarioId: doc.usuario_id
        ? doc.usuario_id.toString()
        : doc.usuarioId,

      horarioAgendado: doc.horario_agendado,
      tomadoEm: doc.tomado_em
        ? new Date(doc.tomado_em).toISOString()
        : null,

      situacao: doc.situacao,
      dataDose: formatarData(doc.data_dose),
      observacao: doc.observacao || null,

      criadoEm: doc.criado_em instanceof Date
        ? doc.criado_em.toISOString()
        : doc.criado_em,
    };
  },

  async listarPorUsuario(usuarioId, { dias } = {}) {
    if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
      return [];
    }

    const filtro = {
      usuario_id: usuarioId,
    };

    if (dias && Number.isFinite(Number(dias)) && Number(dias) > 0) {
      const dataLimite = new Date();
      dataLimite.setDate(
        dataLimite.getDate() - Number(dias)
      );

      const limiteStr = dataLimite.toISOString().split('T')[0];

      filtro.data_dose = {
        $gte: limiteStr,
      };
    }

    const documentos = await RegistroDose.find(filtro).sort({
      data_dose: -1,
      horario_agendado: -1,
    });

    return documentos.map((doc) => this.formatar(doc));
  },

  async listarHoje(usuarioId) {
    if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
      return [];
    }

    const hoje = new Date().toISOString().split('T')[0];

    const documentos = await RegistroDose.find({
      usuario_id: usuarioId,
      data_dose: hoje,
    }).sort({
      horario_agendado: 1,
    });

    return documentos.map((doc) => this.formatar(doc));
  },

  async salvar(
    usuarioId,
    medicamentoId,
    horarioAgendado,
    situacao,
    observacao = null
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(usuarioId) ||
      !mongoose.Types.ObjectId.isValid(medicamentoId)
    ) {
      return null;
    }

    const hoje = new Date().toISOString().split('T')[0];

    const tomadoEm =
      situacao === 'tomada' ? new Date() : null;

    // Busca somente o registro pertencente ao usuário atual.
    const filtro = {
      usuario_id: usuarioId,
      medicamento_id: medicamentoId,
      data_dose: hoje,
      horario_agendado: horarioAgendado,
    };

    const existente = await RegistroDose.findOne(filtro);

    if (existente) {
      existente.situacao = situacao;
      existente.tomado_em = tomadoEm;
      existente.observacao = observacao;

      const atualizado = await existente.save();

      return this.formatar(atualizado);
    }

    const novoRegistro = await RegistroDose.create({
      usuario_id: usuarioId,
      medicamento_id: medicamentoId,
      horario_agendado: horarioAgendado,
      tomado_em: tomadoEm,
      situacao,
      data_dose: hoje,
      observacao,
    });

    return this.formatar(novoRegistro);
  },

  async taxaAdesao(usuarioId, dias = 7) {
    if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
      return 0;
    }

    const quantidadeDias = Number(dias);

    if (
      !Number.isFinite(quantidadeDias) ||
      quantidadeDias <= 0
    ) {
      return 0;
    }

    const dataLimite = new Date();
    dataLimite.setDate(
      dataLimite.getDate() - quantidadeDias
    );

    const limiteStr = dataLimite.toISOString().split('T')[0];

    const filtro = {
      usuario_id: usuarioId,
      data_dose: {
        $gte: limiteStr,
      },
    };

    const total = await RegistroDose.countDocuments(filtro);

    if (total === 0) {
      return 100;
    }

    const tomadas = await RegistroDose.countDocuments({
      ...filtro,
      situacao: 'tomada',
    });

    return Math.round((tomadas / total) * 100);
  },

  async excluirPorMedicamento(medicamentoId, usuarioId) {
    if (
      !mongoose.Types.ObjectId.isValid(medicamentoId) ||
      !mongoose.Types.ObjectId.isValid(usuarioId)
    ) {
      return;
    }

    await RegistroDose.deleteMany({
      medicamento_id: medicamentoId,
      usuario_id: usuarioId,
    });
  },
};

module.exports = RegistroDoseModel;

// tentar