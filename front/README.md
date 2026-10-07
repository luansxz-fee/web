# MedSync Frontend — React + TypeScript + Vite

## 🚀 Setup

### 1. Instalar dependências
```bash
cd medsync
npm install
```

### 2. Configurar API
```bash
cp .env.example .env
```
O `.env` padrão aponta para `http://localhost:3001/api` (backend local).

### 3. Rodar
```bash
npm run dev
```
Frontend: `http://localhost:5173`

> ⚠️ O backend (`medsync-backend`) precisa estar rodando antes de usar o frontend.

---

## 📁 Estrutura
```
medsync/
├── src/
│   ├── components/      # Layout, Logo, MedModal, AppRouter
│   ├── context/         # AuthContext, MedContext, ThemeContext
│   ├── pages/           # Landing, Login, Register, Dashboard, etc.
│   ├── services/
│   │   └── api.ts       # Todas as chamadas HTTP ao backend
│   ├── types/           # TypeScript interfaces
│   └── index.css        # Design system
└── .env.example
```
