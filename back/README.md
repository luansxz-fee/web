# MedSync Backend

API responsável pelo gerenciamento de usuários, autenticação, medicamentos e registros do MedSync.

## Setup

Entre na pasta do backend e instale as dependências:

```bash
cd back
npm install
```

Configure o arquivo `.env` com as variáveis necessárias e execute:

```bash
npm run setup-db
npm run dev
```

A API estará disponível em:

[http://localhost:3001](http://localhost:3001)

## Variáveis de ambiente

Configure seu arquivo `.env` com as seguintes variáveis:

```env
PORT=3001
NODE_ENV=development

MONGODB_URI=sua_string_de_conexao_mongodb
JWT_SECRET=sua_chave_secreta
BCRYPT_ROUNDS=12
```

Não compartilhe o arquivo `.env` nem envie suas credenciais para o GitHub.

## Configurar e-mail para recuperação de senha

Edite o arquivo `.env` com suas credenciais de e-mail:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SEGURO=false
EMAIL_USUARIO=seuemail@gmail.com
EMAIL_SENHA=sua_senha_de_app
EMAIL_REMETENTE=MedSync <seuemail@gmail.com>
```

Para utilizar o Gmail:

1. Acesse [myaccount.google.com/security](https://myaccount.google.com/security).
2. Ative a verificação em duas etapas.
3. Gere uma Senha de app.
4. Utilize a senha de 16 caracteres na variável `EMAIL_SENHA`.

Não utilize sua senha normal do Gmail.

## Autenticação

As rotas protegidas exigem autenticação por token JWT.

Envie o token no cabeçalho HTTP:

```http
Authorization: Bearer SEU_TOKEN_JWT
```

## Rotas da API

### Autenticação

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/registrar` | Cadastro de usuário |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/eu` | Consultar usuário autenticado |
| PUT | `/api/auth/eu` | Atualizar usuário autenticado |
| POST | `/api/auth/esqueci-senha` | Solicitar recuperação de senha |
| POST | `/api/auth/redefinir-senha` | Redefinir senha |

### Usuários

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/usuarios/:id` | Consultar usuário por ID |

**Observação:** a listagem geral de usuários (`GET /api/usuarios`) não está disponibilizada. A consulta individual continua protegida por autenticação JWT.

### Medicamentos

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/medicamentos` | Listar medicamentos |
| POST | `/api/medicamentos` | Cadastrar medicamento |
| GET | `/api/medicamentos/:id` | Consultar medicamento por ID |
| PUT | `/api/medicamentos/:id` | Atualizar medicamento |
| DELETE | `/api/medicamentos/:id` | Excluir medicamento |
| PATCH | `/api/medicamentos/:id/alternar` | Alternar status do medicamento |

### Registros

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/registros` | Consultar registros |
| GET | `/api/registros/hoje` | Consultar registros do dia |
| GET | `/api/registros/adesao` | Consultar adesão |
| POST | `/api/registros` | Criar registro |

### Health Check

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/health` | Verificar disponibilidade da API |

Endpoint:

[http://localhost:3001/api/health](http://localhost:3001/api/health)

## Tecnologias utilizadas

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- JWT (JSON Web Token)
- Bcrypt
- Nodemailer

## Segurança

- Autenticação por JWT.
- Senhas armazenadas com hash utilizando bcrypt.
- Proteção de rotas autenticadas.
- Limitação de requisições com express-rate-limit.
- Variáveis sensíveis armazenadas no `.env`.
- Listagem geral de usuários desabilitada.

## Desenvolvimento

Para iniciar o servidor em modo de desenvolvimento:

```bash
npm run dev
```

O Nodemon reinicia automaticamente o servidor quando identifica alterações nos arquivos monitorados.