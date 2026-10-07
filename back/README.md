# MedSync Backend

## Setup

```
cd medsync-backend
npm install
npm run setup-db
npm run dev
```

A API sobe em http://localhost:3001

## Configurar e-mail para recuperacao de senha

Edite o .env com suas credenciais:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SEGURO=false
EMAIL_USUARIO=seuemail@gmail.com
EMAIL_SENHA=xxxx xxxx xxxx xxxx
EMAIL_REMETENTE=MedSync <seuemail@gmail.com>
```

Para Gmail, ative verificacao em duas etapas em myaccount.google.com/security e gere uma Senha de app de 16 caracteres.

## Rotas

POST   /api/auth/registrar
POST   /api/auth/login
GET    /api/auth/eu
PUT    /api/auth/eu
POST   /api/auth/esqueci-senha
POST   /api/auth/redefinir-senha

GET    /api/usuarios
GET    /api/usuarios/:id

GET    /api/medicamentos
POST   /api/medicamentos
GET    /api/medicamentos/:id
PUT    /api/medicamentos/:id
DELETE /api/medicamentos/:id
PATCH  /api/medicamentos/:id/alternar

GET    /api/registros
GET    /api/registros/hoje
GET    /api/registros/adesao
POST   /api/registros

GET    /api/health
