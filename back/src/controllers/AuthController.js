const jwt = require('jsonwebtoken');

const UsuarioModel = require('../models/UserModel');
const TokenModel = require('../models/TokenModel');

const {
  enviarEmailRecuperacao,
} = require('../services/emailService');

function gerarToken(usuario) {
  const id = usuario._id.toString();

  return jwt.sign(
    {
      id,
      email: usuario.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN || '7d',
    }
  );
}

const AuthController = {
  async registrar(req, res, next) {
    try {
      const {
        nome,
        email,
        senha,
      } = req.body;

      const existe =
        await UsuarioModel.buscarPorEmail(
          email
        );

      if (existe) {
        return res.status(409).json({
          sucesso: false,
          mensagem:
            'Este e-mail já está cadastrado',
        });
      }

      const usuario =
        await UsuarioModel.criar({
          nome,
          email,
          senha,
        });

      const token =
        gerarToken(usuario);

      return res.status(201).json({
        sucesso: true,
        mensagem:
          'Conta criada com sucesso',
        token,
        usuario:
          UsuarioModel.formatar(
            usuario
          ),
      });
    } catch (erro) {
      next(erro);
    }
  },

  async login(req, res, next) {
    try {
      const {
        email,
        senha,
      } = req.body;

      const usuario =
        await UsuarioModel.buscarPorEmail(
          email
        );

      if (!usuario) {
        return res.status(401).json({
          sucesso: false,
          mensagem:
            'E-mail ou senha incorretos',
        });
      }

      const senhaValida =
        await UsuarioModel.verificarSenha(
          senha,
          usuario.senha
        );

      if (!senhaValida) {
        return res.status(401).json({
          sucesso: false,
          mensagem:
            'E-mail ou senha incorretos',
        });
      }

      const token =
        gerarToken(usuario);

      return res.json({
        sucesso: true,
        mensagem:
          'Login realizado com sucesso',
        token,
        usuario:
          UsuarioModel.formatar(
            usuario
          ),
      });
    } catch (erro) {
      next(erro);
    }
  },

  async meusDados(req, res) {
    return res.json({
      sucesso: true,
      usuario: req.usuario,
    });
  },

  async atualizarMeusDados(
    req,
    res,
    next
  ) {
    try {
      const {
        nome,
        avatar,
      } = req.body;

      /*
       * O middleware auth.js agora garante
       * que req.usuarioId seja o ID real
       * do usuario autenticado.
       */
      const idUsuario =
        req.usuarioId;

      if (!idUsuario) {
        return res.status(401).json({
          sucesso: false,
          mensagem:
            'Usuario nao autenticado',
        });
      }

      /*
       * Monta somente os campos enviados.
       */
      const dados = {};

      if (nome !== undefined) {
        if (
          typeof nome !== 'string' ||
          nome.trim().length < 2
        ) {
          return res.status(400).json({
            sucesso: false,
            mensagem:
              'Nome invalido',
          });
        }

        dados.nome =
          nome.trim();
      }

      if (avatar !== undefined) {
        dados.avatar = avatar;
      }

      if (
        Object.keys(dados).length === 0
      ) {
        return res.status(400).json({
          sucesso: false,
          mensagem:
            'Nenhum dado para atualizar',
        });
      }

      /*
       * Atualiza exatamente o usuario
       * identificado pelo JWT.
       */
      const atualizado =
        await UsuarioModel.atualizar(
          idUsuario,
          dados
        );

      if (!atualizado) {
        return res.status(404).json({
          sucesso: false,
          mensagem:
            'Usuario nao encontrado',
        });
      }

      const usuario =
        UsuarioModel.formatar(
          atualizado
        );

      console.log(
        '[PERFIL] Usuario atualizado:',
        usuario
      );

      return res.json({
        sucesso: true,
        mensagem:
          'Perfil atualizado com sucesso',
        usuario,
      });
    } catch (erro) {
      console.error(
        '[PERFIL] Erro ao atualizar usuario:',
        erro
      );

      next(erro);
    }
  },

  async esqueciSenha(
    req,
    res,
    next
  ) {
    try {
      const { email } =
        req.body;

      const usuario =
        await UsuarioModel.buscarPorEmail(
          email
        );

      if (!usuario) {
        return res.json({
          sucesso: true,
          mensagem:
            'Se o e-mail estiver cadastrado, você receberá o código em breve',
        });
      }

      const idUsuario =
        usuario._id.toString();

      const token =
        await TokenModel.criar(
          idUsuario
        );

      try {
        await enviarEmailRecuperacao(
          usuario.email,
          usuario.nome,
          token
        );
      } catch (erroEmail) {
        console.error(
          'Falha ao enviar e-mail:',
          erroEmail.message
        );

        if (
          process.env.NODE_ENV !==
          'production'
        ) {
          return res.json({
            sucesso: true,
            mensagem:
              'Não foi possível enviar o e-mail. Verifique as configurações SMTP no .env',
            tokenDesenvolvimento:
              token,
          });
        }

        return res.status(500).json({
          sucesso: false,
          mensagem:
            'Erro ao enviar e-mail. Tente novamente mais tarde',
        });
      }

      return res.json({
        sucesso: true,
        mensagem:
          'Código de recuperação enviado para seu e-mail',
      });
    } catch (erro) {
      next(erro);
    }
  },

  async redefinirSenha(
    req,
    res,
    next
  ) {
    try {
      const {
        token,
        novaSenha,
      } = req.body;

      const registro =
        await TokenModel.buscarValido(
          token
        );

      if (!registro) {
        return res.status(400).json({
          sucesso: false,
          mensagem:
            'Código inválido ou expirado',
        });
      }

      const usuario =
        await UsuarioModel.buscarPorEmail(
          registro.email
        );

      if (!usuario) {
        return res.status(404).json({
          sucesso: false,
          mensagem:
            'Usuário não encontrado',
        });
      }

      const idUsuario =
        usuario._id.toString();

      await UsuarioModel.alterarSenha(
        idUsuario,
        novaSenha
      );

      await TokenModel.marcarUtilizado(
        token
      );

      return res.json({
        sucesso: true,
        mensagem:
          'Senha redefinida com sucesso',
      });
    } catch (erro) {
      next(erro);
    }
  },
};

module.exports = AuthController;