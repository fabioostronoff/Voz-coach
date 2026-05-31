# 🎙 Coach de Voz — Deploy no Vercel

## Como colocar no iPhone em 5 minutos

### Passo 1 — Criar conta no Vercel (grátis)
1. Acesse **vercel.com**
2. Clique em "Sign Up"
3. Entre com sua conta do GitHub (ou crie uma conta GitHub grátis em github.com)

### Passo 2 — Subir o projeto
1. Acesse **vercel.com/new**
2. Clique em **"Deploy from template"** → não, vá em **"Import Project"**
3. Ou mais fácil: use o **Vercel CLI** (veja abaixo)

### Opção mais fácil — Deploy direto pelo site
1. Vá em **vercel.com**
2. Faça login
3. Clique em **"Add New Project"**
4. Escolha **"Upload"** (arraste a pasta inteira `voz-coach`)
5. Clique **Deploy**
6. Em ~1 minuto você terá uma URL como `voz-coach.vercel.app`

### Passo 3 — Instalar no iPhone
1. Abra a URL no **Safari** (obrigatório — Chrome não permite no iOS)
2. Toque no botão **Compartilhar** (⬆️ na barra de baixo)
3. Role e toque em **"Adicionar à Tela de Início"**
4. Confirme o nome "Coach de Voz"
5. Toque em **Adicionar**

Pronto! O app aparece na sua tela inicial como qualquer outro app. 🎉

---

## Estrutura dos arquivos
```
voz-coach/
├── index.html          ← entrada principal + meta tags PWA
├── package.json        ← dependências
├── vite.config.js      ← configuração do build
├── public/
│   ├── manifest.json   ← configuração do PWA (nome, ícone, cor)
│   ├── icon-192.png    ← ícone do app
│   └── icon-512.png    ← ícone grande
└── src/
    ├── main.jsx        ← inicialização React
    └── App.jsx         ← todo o código do app
```

## Personalizar
- **Nome do app**: edite `"short_name"` em `public/manifest.json`
- **Ícone**: substitua `public/icon-192.png` e `public/icon-512.png` por imagens suas (PNG quadrado)
- **Cor de fundo**: edite `"background_color"` em `manifest.json`

## Observações
- A gravação de voz funciona apenas no **Safari** no iPhone (limitação do iOS)
- O app funciona offline após o primeiro acesso (exceto os feedbacks da IA que precisam de internet)
- Dados de progresso ficam salvos no dispositivo (localStorage)
