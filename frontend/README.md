# Frontend - Portal da Locadora

Interface web para o sistema de gestão de locadora focado em motoristas de aplicativo.

## 🚀 Stack Tecnológica

- **React 19** + **TypeScript**
- **Vite 7** - Build tool ultrarrápido
- **Tailwind CSS 4** - Utility-first CSS
- **TanStack Query** - Gerenciamento de estado e cache
- **Axios** - Cliente HTTP
- **React Router** - Navegação (será configurado)

## 📁 Estrutura de Pastas

```
src/
├── features/          # Features por domínio
│   ├── auth/         # Autenticação
│   └── dashboard/    # Dashboard
├── components/        # Componentes reutilizáveis
│   ├── ui/           # Botões, inputs, modais
│   └── layout/       # Header, sidebar, footer
├── services/         # Integração com API
│   └── api.ts        # Cliente Axios configurado
├── hooks/            # Custom React hooks
├── types/            # TypeScript types
├── utils/            # Funções utilitárias
└── index.css         # Estilos globais + Tailwind
```

## 🛠️ Comandos

```bash
npm run dev          # Dev server (porta 5173)
npm run build        # Build para produção
npm run preview      # Preview da build
npm run lint         # ESLint
npm run lint:fix     # ESLint com auto-fix
npm run type-check   # Verificar tipos TS
```

## ⚙️ Configuração

**Variáveis de ambiente (.env):**
```
VITE_API_URL=http://localhost:3000/api/v1
```

## 🎨 Classes Tailwind Customizadas

```tsx
<button className="btn-primary">Salvar</button>
<button className="btn-secondary">Cancelar</button>
<div className="card">...</div>
<input className="input" />
<label className="label">Nome</label>
```

## 🌐 URLs

- **Dev:** http://localhost:5173
- **API:** http://localhost:3000/api/v1

## ✅ Status Atual

- [x] Vite + React configurado
- [x] Tailwind CSS 4 funcionando
- [x] Integração com backend OK
- [x] Dashboard inicial
- [ ] Autenticação JWT
- [ ] Rotas protegidas
- [ ] CRUDs de domínio
