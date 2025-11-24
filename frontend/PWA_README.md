# PWA - Progressive Web App

## Portal do Motorista

O Portal do Motorista foi configurado como uma Progressive Web App (PWA), permitindo que os motoristas instalem o aplicativo em seus dispositivos móveis.

### Funcionalidades PWA Implementadas

1. **Manifest.json**
   - Configurações do aplicativo
   - Nome, descrição e ícones
   - Tema e cores
   - Modo standalone (funciona como app nativo)

2. **Service Worker**
   - Cache de páginas principais
   - Funcionamento offline básico
   - Atualização automática de cache

3. **Meta Tags PWA**
   - Theme color para Android
   - Apple touch icon para iOS
   - Suporte para instalação na tela inicial

### Instalação

#### Android (Chrome)
1. Acesse o Portal do Motorista pelo navegador
2. Toque no menu (três pontos) no canto superior direito
3. Selecione "Adicionar à tela inicial" ou "Instalar app"
4. Confirme a instalação

#### iOS (Safari)
1. Acesse o Portal do Motorista pelo Safari
2. Toque no ícone de compartilhamento (quadrado com seta)
3. Role para baixo e selecione "Adicionar à Tela de Início"
4. Confirme a instalação

### Arquivos PWA

- `/public/manifest.json` - Configuração do PWA
- `/public/sw.js` - Service Worker para cache e offline
- `/src/main.tsx` - Registro do Service Worker
- `/index.html` - Meta tags e link para manifest

### Ícones Necessários

Para uma implementação completa do PWA, você precisa criar os seguintes ícones:

1. **icon-192.png** (192x192 pixels)
   - Ícone para instalação no Android
   - Formato: PNG com fundo sólido
   - Recomendação: Logo do Portal do Motorista com padding

2. **icon-512.png** (512x512 pixels)
   - Ícone de alta resolução para splash screen
   - Formato: PNG com fundo sólido
   - Mesmo design do icon-192.png

#### Como Criar os Ícones

Você pode usar ferramentas online como:
- [favicon.io](https://favicon.io/)
- [realfavicongenerator.net](https://realfavicongenerator.net/)
- Ou criar no Photoshop/Figma

**Design Sugerido:**
- Fundo: Azul (#2563eb)
- Logo: Ícone de carro branco centralizado
- Padding: 20% em todos os lados

Coloque os ícones criados na pasta `/public/` do frontend.

### Recursos Offline

Atualmente, o PWA armazena em cache as seguintes páginas:
- Login
- Dashboard
- Contratos
- Pagamentos
- Perfil

**Nota:** As requisições de API ainda requerem conexão com a internet. Para funcionalidade offline completa, seria necessário implementar estratégias de cache mais avançadas.

### Melhorias Futuras

- [ ] Cache de dados de API com estratégia de revalidação
- [ ] Notificações push para pagamentos próximos
- [ ] Sincronização em background
- [ ] Modo offline completo com IndexedDB
- [ ] Update prompt quando nova versão estiver disponível
