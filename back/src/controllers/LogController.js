const RegistroDoseModel = require('../models/LogModel');
const MedicamentoModel = require('../models/MedicationModel');

const RegistroDoseController = {

  async listar(req, res, next) {
    try {
      const dias = parseInt(req.query.dias) || null;
      const registros = await RegistroDoseModel.listarPorUsuario(req.usuario.id, { dias });
      return res.json({ sucesso: true, dados: registros });
    } catch (erro) {
      next(erro);
    }
  },

  async hoje(req, res, next) {
    try {
      const registros = await RegistroDoseModel.listarHoje(req.usuario.id);
      return res.json({ sucesso: true, dados: registros });
    } catch (erro) {
      next(erro);
    }
  },

  async adesao(req, res, next) {
    try {
      const taxa7 = await RegistroDoseModel.taxaAdesao(req.usuario.id, 7);
      const taxa30 = await RegistroDoseModel.taxaAdesao(req.usuario.id, 30);
      return res.json({ sucesso: true, dados: { dias7: taxa7, dias30: taxa30 } });
    } catch (erro) {
      next(erro);
    }
  },

  async salvar(req, res, next) {
    try {
      const { medicamentoId, horarioAgendado, situacao, observacao } = req.body;

      const medicamento = await MedicamentoModel.buscarUm(medicamentoId, req.usuario.id);
      if (!medicamento) {
        return res.status(404).json({ sucesso: false, mensagem: 'Medicamento nao encontrado' });
      }

      const registro = await RegistroDoseModel.salvar(
        req.usuario.id,
        medicamentoId,
        horarioAgendado,
        situacao,
        observacao || null
      );
      return res.json({ sucesso: true, mensagem: 'Dose registrada', dados: registro });
    } catch (erro) {
      next(erro);
    }
  },
};

module.exports = RegistroDoseController;