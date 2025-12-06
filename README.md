# Nexus Launcher Manager

Painel de gerenciamento para Launcher Android TV, com suporte a revendas, gestão de APKs e integração AI.

## Deploy na Vercel

1. Faça o fork ou push deste repositório para o seu GitHub.
2. Acesse [Vercel](https://vercel.com) e crie um "New Project".
3. Importe o repositório do GitHub.
4. Em **Environment Variables**, adicione:
   - `API_KEY`: Sua chave da Gemini AI API.
5. Clique em **Deploy**.

## Desenvolvimento Local

1. `npm install`
2. Crie um arquivo `.env` com `API_KEY=sua_chave_aqui`
3. `npm run dev`
