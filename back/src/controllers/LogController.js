const RegistroDoseModel = require('../models/LogModel');
const MedicamentoModel = require('../models/MedicationModel');

const RegistroDoseController = {
  async listar(req, res, next) {
    try {
      const dias = parseInt(req.query.dias, 10) || null;
      const registros = await RegistroDoseModel.listarPorUsuario(
        req.usuario.id,
        { dias }
      );
      return res.json({ sucesso: true, dados: registros });
    } catch (erro) {
      next(erro);
    }
  },

  async hoje(req, res, next) {
    try {
      // ?data=AAAA-MM-DD é opcional (já validado na rota).
      const registros = await RegistroDoseModel.listarHoje(
        req.usuario.id,
        req.query.data || null
      );
      return res.json({ sucesso: true, dados: registros });
    } catch (erro) {
      next(erro);
    }
  },

  async adesao(req, res, next) {
    try {
      const dias7 = await RegistroDoseModel.taxaAdesao(req.usuario.id, 7);
      const dias30 = await RegistroDoseModel.taxaAdesao(req.usuario.id, 30);
      return res.json({ sucesso: true, dados: { dias7, dias30 } });
    } catch (erro) {
      next(erro);
    }
  },

  async salvar(req, res, next) {
    try {
      const {
        medicamentoId,
        horarioAgendado,
        situacao,
        observacao,
        dataDose,
      } = req.body;

      const medicamento = await MedicamentoModel.buscarUm(
        medicamentoId,
        req.usuario.id
      );

      if (!medicamento) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Medicamento nao encontrado',
        });
      }

      const registro = await RegistroDoseModel.salvar(
        req.usuario.id,
        medicamentoId,
        horarioAgendado,
        situacao,
        observacao || null,
        dataDose || null
      );

      return res.json({
        sucesso: true,
        mensagem: 'Dose registrada',
        dados: registro,
      });
    } catch (erro) {
      next(erro);
    }
  },
};

module.exports = RegistroDoseController;