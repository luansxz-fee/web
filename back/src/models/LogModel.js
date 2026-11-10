const mongoose = require('mongoose');

/*
 * Fuso usado para decidir qual é o "dia" de uma dose.
 * Antes usava UTC (toISOString), então depois das 21h em Brasília a API
 * já considerava "amanhã". Pode ser trocado pela variável APP_TIMEZONE.
 */
const FUSO_HORARIO = process.env.APP_TIMEZONE || 'America/Sao_Paulo';

function dataNoFuso(data = new Date()) {
  // O locale en-CA formata como AAAA-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO_HORARIO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(data);
}

function dataLimite(dias) {
  return dataNoFuso(new Date(Date.now() - Number(dias) * 24 * 60 * 60 * 1000));
}

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
    horario_agendado: { type: String, required: true },
    tomado_em: { type: Date, default: null },
    situacao: { type: String, required: true },
    data_dose: { type: String, required: true },
    observacao: { type: String, default: null },
  },
  {
    timestamps: {
      createdAt: 'criado_em',
      updatedAt: 'atualizado_em',
    },
  }
);

/*
 * Uma dose por usuário + medicamento + dia + horário.
 * Evita registros duplicados quando duas requisições chegam ao mesmo tempo.
 * Se já existirem duplicatas no banco, rode "npm run setup-db" uma vez: ele as
 * remove e cria o índice.
 */
registroDoseSchema.index(
  {
    usuario_id: 1,
    medicamento_id: 1,
    data_dose: 1,
    horario_agendado: 1,
  },
  { unique: true, name: 'uq_dose_unica' }
);

const RegistroDose = mongoose.model('RegistroDose', registroDoseSchema);

RegistroDose.on('index', (erro) => {
  if (erro) {
    console.error(
      'Aviso: não foi possível criar o índice único de doses. ' +
        'Execute "npm run setup-db" para remover duplicatas. Detalhe:',
      erro.message
    );
  }
});

const RegistroDoseModel = {
  dataNoFuso,

  formatar(doc) {
    if (!doc) return null;

    const formatarData = (valor) => {
      if (!valor) return null;
      if (valor instanceof Date) return valor.toISOString().split('T')[0];
      return valor;
    };

    return {
      id: doc._id ? doc._id.toString() : doc.id,
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
      criadoEm:
        doc.criado_em instanceof Date
          ? doc.criado_em.toISOString()
          : doc.criado_em,
    };
  },

  async listarPorUsuario(usuarioId, { dias } = {}) {
    if (!mongoose.Types.ObjectId.isValid(usuarioId)) return [];

    const filtro = { usuario_id: usuarioId };

    if (dias && Number.isFinite(Number(dias)) && Number(dias) > 0) {
      filtro.data_dose = { $gte: dataLimite(dias) };
    }

    const documentos = await RegistroDose.find(filtro).sort({
      data_dose: -1,
      horario_agendado: -1,
      atualizado_em: -1,
    });

    return documentos.map((doc) => this.formatar(doc));
  },

  async listarHoje(usuarioId, data = null) {
    if (!mongoose.Types.ObjectId.isValid(usuarioId)) return [];

    const documentos = await RegistroDose.find({
      usuario_id: usuarioId,
      data_dose: data || dataNoFuso(),
    }).sort({
      horario_agendado: 1,
      atualizado_em: -1,
    });

    return documentos.map((doc) => this.formatar(doc));
  },

  async salvar(
    usuarioId,
    medicamentoId,
    horarioAgendado,
    situacao,
    observacao = null,
    dataDose = null
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(usuarioId) ||
      !mongoose.Types.ObjectId.isValid(medicamentoId)
    ) {
      return null;
    }

    const filtro = {
      usuario_id: usuarioId,
      medicamento_id: medicamentoId,
      data_dose: dataDose || dataNoFuso(),
      horario_agendado: horarioAgendado,
    };

    const dadosAtualizados = {
      situacao,
      tomado_em: situacao === 'tomada' ? new Date() : null,
      observacao,
    };

    // Atualiza o registro existente ou cria um novo.
    const atualizar = () =>
      RegistroDose.findOneAndUpdate(
        filtro,
        { $set: dadosAtualizados },
        {
          returnDocument: 'after',
          upsert: true,
          setDefaultsOnInsert: true,
          runValidators: true,
        }
      );

    let registro;

    try {
      registro = await atualizar();
    } catch (erro) {
      // Duas requisições simultâneas tentaram criar a mesma dose:
      // na segunda tentativa o registro já existe e vira um update.
      if (erro && erro.code === 11000) {
        registro = await atualizar();
      } else {
        throw erro;
      }
    }

    // Sincroniza registros duplicados antigos do mesmo horário.
    await RegistroDose.updateMany(
      { ...filtro, _id: { $ne: registro._id } },
      { $set: dadosAtualizados }
    );

    return this.formatar(registro);
  },

  async taxaAdesao(usuarioId, dias = 7) {
    if (!mongoose.Types.ObjectId.isValid(usuarioId)) return 0;

    const quantidadeDias = Number(dias);

    if (!Number.isFinite(quantidadeDias) || quantidadeDias <= 0) return 0;

    const filtro = {
      usuario_id: usuarioId,
      data_dose: { $gte: dataLimite(quantidadeDias) },
    };

    const total = await RegistroDose.countDocuments(filtro);

    if (total === 0) return 100;

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