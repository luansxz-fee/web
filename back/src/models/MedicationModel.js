const mongoose = require('mongoose');

const medicamentoSchema = new mongoose.Schema(
  {
    usuario_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
      index: true,
    },

    nome: {
      type: String,
      required: true,
      trim: true,
    },

    dosagem: {
      type: String,
      required: true,
    },

    unidade: {
      type: String,
      required: true,
    },

    frequencia: {
      type: String,
      required: true,
    },

    horarios: {
      type: [String],
      default: [],
    },

    data_inicio: {
      type: Date,
      required: true,
    },

    data_termino: {
      type: Date,
      default: null,
    },

    instrucoes: {
      type: String,
      default: null,
    },

    cor: {
      type: String,
      required: true,
    },

    icone: {
      type: String,
      required: true,
    },

    categoria: {
      type: String,
      required: true,
    },

    estoque_atual: {
      type: Number,
      default: 30,
    },

    estoque_maximo: {
      type: Number,
      default: 30,
    },

    lembrete_ativo: {
      type: Boolean,
      default: true,
    },

    ativo: {
      type: Boolean,
      default: true,
    },

    url_imagem: {
      type: String,
      default: null,
    },

    medico_prescritor: {
      type: String,
      default: null,
    },

    efeitos_colaterais: {
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

const Medicamento = mongoose.model(
  'Medicamento',
  medicamentoSchema
);

const MedicamentoModel = {

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
      id: doc._id.toString(),

      usuarioId: doc.usuario_id
        ? doc.usuario_id.toString()
        : null,

      nome: doc.nome,
      dosagem: doc.dosagem,
      unidade: doc.unidade,
      frequencia: doc.frequencia,

      horarios: Array.isArray(doc.horarios)
        ? doc.horarios
        : [],

      dataInicio: formatarData(doc.data_inicio),
      dataTermino: formatarData(doc.data_termino),

      instrucoes: doc.instrucoes || null,

      cor: doc.cor,
      icone: doc.icone,
      categoria: doc.categoria,

      estoqueAtual: doc.estoque_atual,
      estoqueMaximo: doc.estoque_maximo,

      lembreteAtivo: !!doc.lembrete_ativo,
      ativo: !!doc.ativo,

      urlImagem: doc.url_imagem || null,

      medicoPrescritor:
        doc.medico_prescritor || null,

      efeitosColaterais:
        doc.efeitos_colaterais || null,

      criadoEm: doc.criado_em
        ? doc.criado_em.toISOString()
        : null,
    };
  },

  async listarPorUsuario(usuarioId) {
    if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
      return [];
    }

    const documentos = await Medicamento.find({
      usuario_id: usuarioId,
    })
      .sort({ criado_em: -1 })
      .lean();

    return documentos.map((doc) =>
      this.formatar(doc)
    );
  },

  async buscarUm(id, usuarioId) {
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(usuarioId)
    ) {
      return null;
    }

    const doc = await Medicamento.findOne({
      _id: id,
      usuario_id: usuarioId,
    }).lean();

    return this.formatar(doc);
  },

  async criar(usuarioId, dados) {
    if (
      !mongoose.Types.ObjectId.isValid(usuarioId)
    ) {
      throw new Error('Usuario invalido');
    }

    const novoMedicamento = new Medicamento({
      /*
       * ESTE CAMPO É O QUE SEPARA OS USUÁRIOS
       */
      usuario_id: usuarioId,

      nome: dados.nome,
      dosagem: dados.dosagem,
      unidade: dados.unidade,
      frequencia: dados.frequencia,

      horarios: Array.isArray(dados.horarios)
        ? dados.horarios
        : [],

      data_inicio: dados.dataInicio,
      data_termino: dados.dataTermino || null,

      instrucoes: dados.instrucoes || null,

      cor: dados.cor || '#2563EB',
      icone: dados.icone || '💊',
      categoria: dados.categoria || 'Outros',

      estoque_atual:
        dados.estoqueAtual ?? 30,

      estoque_maximo:
        dados.estoqueMaximo ?? 30,

      lembrete_ativo:
        dados.lembreteAtivo !== undefined
          ? !!dados.lembreteAtivo
          : true,

      ativo:
        dados.ativo !== false,

      url_imagem:
        dados.urlImagem || null,

      medico_prescritor:
        dados.medicoPrescritor || null,

      efeitos_colaterais:
        dados.efeitosColaterais || null,
    });

    const salvo = await novoMedicamento.save();

    return this.formatar(salvo);
  },

  async atualizar(id, usuarioId, dados) {
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(usuarioId)
    ) {
      return null;
    }

    const mapaCampos = {
      nome: 'nome',
      dosagem: 'dosagem',
      unidade: 'unidade',
      frequencia: 'frequencia',
      horarios: 'horarios',
      dataInicio: 'data_inicio',
      dataTermino: 'data_termino',
      instrucoes: 'instrucoes',
      cor: 'cor',
      icone: 'icone',
      categoria: 'categoria',
      estoqueAtual: 'estoque_atual',
      estoqueMaximo: 'estoque_maximo',
      lembreteAtivo: 'lembrete_ativo',
      ativo: 'ativo',
      urlImagem: 'url_imagem',
      medicoPrescritor: 'medico_prescritor',
      efeitosColaterais: 'efeitos_colaterais',
    };

    const atualizacao = {};

    for (const [chave, campo] of Object.entries(
      mapaCampos
    )) {
      if (dados[chave] === undefined) continue;

      atualizacao[campo] = dados[chave];
    }

    if (
      Object.keys(atualizacao).length === 0
    ) {
      return this.buscarUm(id, usuarioId);
    }

    /*
     * MUITO IMPORTANTE:
     * O ID do medicamento E o ID do usuário
     * são usados juntos.
     */
    const docAtualizado =
      await Medicamento.findOneAndUpdate(
        {
          _id: id,
          usuario_id: usuarioId,
        },
        {
          $set: atualizacao,
        },
        {
          new: true,
        }
      );

    return this.formatar(docAtualizado);
  },

  async excluir(id, usuarioId) {
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(usuarioId)
    ) {
      return false;
    }

    const resultado =
      await Medicamento.deleteOne({
        _id: id,
        usuario_id: usuarioId,
      });

    return resultado.deletedCount > 0;
  },
};

module.exports = MedicamentoModel;