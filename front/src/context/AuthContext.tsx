import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  usuario: User | null;
  user: User | null;
  login: (email: string, senha: string) => Promise<boolean>;
  registrar: (
    nome: string,
    email: string,
    senha: string
  ) => Promise<boolean>;
  sair: () => void;
  logout: () => void;
  atualizarUsuario: (dados: Partial<User>) => Promise<void>;
  updateUser: (dados: Partial<User>) => Promise<void>;
  solicitarRecuperacaoSenha: (
    email: string
  ) => Promise<{ ok: boolean; tokenDesenvolvimento?: string }>;
  requestPasswordReset: (
    email: string
  ) => Promise<{ ok: boolean; devToken?: string }>;
  redefinirSenha: (
    token: string,
    novaSenha: string
  ) => Promise<boolean>;
  resetPassword: (
    token: string,
    novaSenha: string
  ) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

const CHAVE_TOKEN = 'medsync_token';
const CHAVE_SESSAO = 'medsync_sessao';
const CHAVE_USUARIO = 'medsync_usuario';

function normalizarUsuario(
  bruto: any,
  fallback: User | null = null
): User | null {
  if (!bruto && !fallback) {
    return null;
  }

  const fonte = bruto || fallback || {};

  const nome =
    fonte.nome ??
    fonte.name ??
    fallback?.name ??
    fallback?.nome ??
    '';

  const id =
    fonte.id ??
    fonte._id ??
    fonte.usuarioId ??
    fonte.userId ??
    fallback?.id ??
    '';

  const email =
    fonte.email ??
    fallback?.email ??
    '';

  const avatar =
    fonte.avatar ??
    fallback?.avatar ??
    null;

  return {
    ...fallback,
    ...fonte,
    id: String(id),
    nome,
    name: nome,
    email,
    avatar,
  } as User;
}

function extrairUsuarioResposta(
  res: any,
  fallback: User | null = null
): User | null {
  /*
   * O backend pode devolver o usuário em formatos
   * diferentes dependendo da rota:
   *
   * { usuario: {...} }
   * { dados: {...} }
   * { dados: { usuario: {...} } }
   *
   * Nunca acessamos res.usuario.nome diretamente.
   */
  const bruto =
    res?.usuario ??
    res?.dados?.usuario ??
    res?.dados ??
    null;

  return normalizarUsuario(
    bruto,
    fallback
  );
}

function salvarSessao(
  u: User
) {
  localStorage.setItem(
    CHAVE_SESSAO,
    JSON.stringify(u)
  );

  /*
   * Mantém compatibilidade com partes antigas
   * do frontend que ainda consultam medsync_usuario.
   */
  localStorage.setItem(
    CHAVE_USUARIO,
    JSON.stringify(u)
  );
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [usuario, setUsuario] =
    useState<User | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    const sessaoSalva =
      localStorage.getItem(
        CHAVE_SESSAO
      );

    const tokenSalvo =
      localStorage.getItem(
        CHAVE_TOKEN
      );

    if (!sessaoSalva || !tokenSalvo) {
      setIsLoading(false);
      return;
    }

    let usuarioInicial: User | null =
      null;

    try {
      usuarioInicial =
        normalizarUsuario(
          JSON.parse(
            sessaoSalva
          )
        );

      if (usuarioInicial) {
        setUsuario(
          usuarioInicial
        );
      }
    } catch {
      localStorage.removeItem(
        CHAVE_SESSAO
      );
    }

    api.auth.eu()
      .then((res) => {
        const u =
          extrairUsuarioResposta(
            res,
            usuarioInicial
          );

        if (!u) {
          throw new Error(
            'Resposta inválida ao carregar usuário'
          );
        }

        setUsuario(u);
        salvarSessao(u);
      })
      .catch(() => {
        localStorage.removeItem(
          CHAVE_TOKEN
        );

        localStorage.removeItem(
          CHAVE_SESSAO
        );

        localStorage.removeItem(
          CHAVE_USUARIO
        );

        setUsuario(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (
    email: string,
    senha: string
  ): Promise<boolean> => {
    try {
      const res =
        await api.auth.login(
          email,
          senha
        );

      const u =
        extrairUsuarioResposta(
          res
        );

      if (!u || !res?.token) {
        return false;
      }

      localStorage.setItem(
        CHAVE_TOKEN,
        res.token
      );

      salvarSessao(u);
      setUsuario(u);

      return true;
    } catch {
      return false;
    }
  };

  const registrar = async (
    nome: string,
    email: string,
    senha: string
  ): Promise<boolean> => {
    try {
      const res =
        await api.auth.registrar(
          nome,
          email,
          senha
        );

      const u =
        extrairUsuarioResposta(
          res
        );

      if (!u || !res?.token) {
        return false;
      }

      localStorage.setItem(
        CHAVE_TOKEN,
        res.token
      );

      salvarSessao(u);
      setUsuario(u);

      return true;
    } catch (erro: any) {
      if (
        erro?.message?.includes(
          'ja esta cadastrado'
        )
      ) {
        throw erro;
      }

      return false;
    }
  };

  const sair = () => {
    localStorage.removeItem(
      CHAVE_TOKEN
    );

    localStorage.removeItem(
      CHAVE_SESSAO
    );

    localStorage.removeItem(
      CHAVE_USUARIO
    );

    setUsuario(null);
  };

  const atualizarUsuario = async (
    dados: Partial<User>
  ): Promise<void> => {
    const nomeNovo =
      String(
        dados.name ??
          dados.nome ??
          ''
      ).trim();

    const avatarNovo =
      dados.avatar;

    if (!nomeNovo) {
      throw new Error(
        'Nome inválido'
      );
    }

    if (!localStorage.getItem(
      CHAVE_TOKEN
    )) {
      throw new Error(
        'Usuário não autenticado'
      );
    }

    /*
     * O backend recebe "nome", não "name".
     */
    const res =
      await api.auth.atualizarEu({
        nome: nomeNovo,
        avatar: avatarNovo,
      });

    /*
     * NÃO usamos res.usuario.nome diretamente.
     * Se o backend não devolver o usuário,
     * mantemos o usuário atual e aplicamos
     * o nome que acabou de ser salvo.
     */
    const resposta =
      extrairUsuarioResposta(
        res,
        usuario
      );

    const u =
      normalizarUsuario(
        {
          ...(resposta || {}),
          nome:
            resposta?.nome ??
            nomeNovo,
          name:
            resposta?.name ??
            resposta?.nome ??
            nomeNovo,
          avatar:
            resposta?.avatar ??
            avatarNovo ??
            usuario?.avatar ??
            null,
        },
        usuario
      );

    if (!u) {
      throw new Error(
        'Não foi possível atualizar os dados do usuário'
      );
    }

    setUsuario(u);
    salvarSessao(u);
  };

  const solicitarRecuperacaoSenha =
    async (
      email: string
    ): Promise<{
      ok: boolean;
      tokenDesenvolvimento?: string;
    }> => {
      try {
        const res =
          await api.auth.esqueciSenha(
            email
          );

        return {
          ok: true,
          tokenDesenvolvimento:
            res.tokenDesenvolvimento,
        };
      } catch {
        return {
          ok: false,
        };
      }
    };

  const redefinirSenha = async (
    token: string,
    novaSenha: string
  ): Promise<boolean> => {
    try {
      await api.auth.redefinirSenha(
        token,
        novaSenha
      );

      return true;
    } catch {
      return false;
    }
  };

  const ctx: AuthContextType = {
    usuario,
    user: usuario,

    login,
    registrar,

    sair,
    logout: sair,

    atualizarUsuario,
    updateUser: atualizarUsuario,

    solicitarRecuperacaoSenha,

    requestPasswordReset:
      async (email) => {
        const r =
          await solicitarRecuperacaoSenha(
            email
          );

        return {
          ok: r.ok,
          devToken:
            r.tokenDesenvolvimento,
        };
      },

    redefinirSenha,
    resetPassword:
      redefinirSenha,

    isLoading,
  };

  return (
    <AuthContext.Provider
      value={ctx}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth =
  () => useContext(AuthContext);
