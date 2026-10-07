const URL_BASE =
  (import.meta as any).env?.VITE_API_URL ||
  'https://medsync-backend-oqms.onrender.com/api';

function obterToken(): string | null {
  return localStorage.getItem('medsync_token');
}

async function requisicao<T>(
  metodo: string,
  caminho: string,
  corpo?: unknown,
  autenticado = true
): Promise<T> {
  const cabecalhos: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (autenticado) {
    const token = obterToken();

    if (token) {
      cabecalhos['Authorization'] = `Bearer ${token}`;
    }
  }

  const resposta = await fetch(`${URL_BASE}${caminho}`, {
    method: metodo,
    headers: cabecalhos,
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
  });

  const dados = await resposta
    .json()
    .catch(() => ({
      sucesso: false,
      mensagem: 'Erro de comunicação com o servidor',
    }));

  if (!resposta.ok) {
    throw new Error(
      dados?.mensagem || `Erro ${resposta.status}`
    );
  }

  return dados as T;
}

export const api = {
  auth: {
    registrar: (nome: string, email: string, senha: string) =>
      requisicao<{
        token: string;
        usuario: any;
      }>(
        'POST',
        '/auth/registrar',
        {
          nome,
          email,
          senha,
        },
        false
      ),

    login: (email: string, senha: string) =>
      requisicao<{
        token: string;
        usuario: any;
      }>(
        'POST',
        '/auth/login',
        {
          email,
          senha,
        },
        false
      ),

    eu: () =>
      requisicao<{
        usuario: any;
      }>(
        'GET',
        '/auth/eu'
      ),

    atualizarEu: (dados: {
      nome?: string;
      avatar?: string;
    }) =>
      requisicao<{
        usuario: any;
      }>(
        'PUT',
        '/auth/eu',
        dados
      ),

    esqueciSenha: (email: string) =>
      requisicao<{
        tokenDesenvolvimento?: string;
      }>(
        'POST',
        '/auth/esqueci-senha',
        {
          email,
        },
        false
      ),

    redefinirSenha: (
      token: string,
      novaSenha: string
    ) =>
      requisicao<{}>(
        'POST',
        '/auth/redefinir-senha',
        {
          token,
          novaSenha,
        },
        false
      ),
  },

  usuarios: {
    listarTodos: () =>
      requisicao<{
        total: number;
        usuarios: any[];
      }>(
        'GET',
        '/usuarios'
      ),

    buscarPorId: (id: number | string) =>
      requisicao<{
        usuario: any;
      }>(
        'GET',
        `/usuarios/${id}`
      ),
  },

  medicamentos: {
    listar: () =>
      requisicao<{
        dados: any[];
      }>(
        'GET',
        '/medicamentos'
      ),

    buscar: (id: number | string) =>
      requisicao<{
        dados: any;
      }>(
        'GET',
        `/medicamentos/${id}`
      ),

    criar: (dados: any) =>
      requisicao<{
        dados: any;
      }>(
        'POST',
        '/medicamentos',
        dados
      ),

    atualizar: (
      id: number | string,
      dados: any
    ) =>
      requisicao<{
        dados: any;
      }>(
        'PUT',
        `/medicamentos/${id}`,
        dados
      ),

    excluir: (id: number | string) =>
      requisicao<{}>(
        'DELETE',
        `/medicamentos/${id}`
      ),

    alternar: (id: number | string) =>
      requisicao<{
        dados: any;
      }>(
        'PATCH',
        `/medicamentos/${id}/alternar`
      ),
  },

  registros: {
    listar: (dias?: number) =>
      requisicao<{
        dados: any[];
      }>(
        'GET',
        `/registros${dias ? `?dias=${dias}` : ''}`
      ),

    hoje: () =>
      requisicao<{
        dados: any[];
      }>(
        'GET',
        '/registros/hoje'
      ),

    adesao: () =>
      requisicao<{
        dados: {
          dias7: number;
          dias30: number;
        };
      }>(
        'GET',
        '/registros/adesao'
      ),

    salvar: (
      medicamentoId: number | string,
      horarioAgendado: string,
      situacao: string,
      observacao?: string
    ) =>
      requisicao<{
        dados: any;
      }>(
        'POST',
        '/registros',
        {
          medicamentoId,
          horarioAgendado,
          situacao,
          observacao,
        }
      ),
  },
};