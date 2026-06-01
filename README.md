# Gerador de Webfólio — Enfermagem São Camilo

Ferramenta web para gerar **prompts estruturados** de relatórios diários de estágio (Webfólio) para o curso de Enfermagem, alinhados ao manual de ensino clínico e às Diretrizes Curriculares Nacionais (DCNs).

## Funcionalidades

- Formulário completo com os dados do plantão
- **Modo Estrito** — impede a IA de inventar dados clínicos não informados
- **Seções customizáveis** — ative/desative cada parte do relatório
- **Cache automático (LocalStorage)** — dados salvos automaticamente a cada digitação
- **Gerenciador de sessões** — múltiplos relatórios salvos com data, número e área
- **Tema escuro** — alternância entre claro e escuro
- **Limpeza rápida** — botão sutil para limpar o formulário quando carregar uma sessão anterior
- Reconhecimento de fala (dictação por voz) para facilitar o preenchimento
- Geração de prompt no formato **5 parágrafos + referências ABNT**
- Cópia com um clique para área de transferência

## Como usar

1. Acesse o [site publicado no GitHub Pages](https://seu-usuario.github.io/nurse-report/) ou abra o `index.html` localmente
2. Preencha os campos do formulário com os dados do seu plantão
3. Clique em **"Compilar e Gerar Prompt"**
4. Copie o prompt gerado
5. Cole no ChatGPT (ou outra IA) e receba o relatório completo
6. Revise e ajuste conforme necessário

Os dados são salvos automaticamente. Feche a página sem medo — ao voltar, tudo estará no lugar.

## Documentação

- [`docs/plano-ensino-clinico.md`](docs/plano-ensino-clinico.md) — Plano de ensino completo da disciplina
- [`docs/regras-webfolio.md`](docs/regras-webfolio.md) — Regras do Webfólio extraídas do plano
- [`docs/configuracoes.md`](docs/configuracoes.md) — Explicação das configurações do prompt

## Estrutura do projeto

```
nurse-report/
├── index.html                  # Página principal
├── assets/
│   ├── css/
│   │   └── style.css           # Estilos da aplicação
│   └── js/
│       └── app.js              # Lógica da aplicação
├── docs/
│   ├── plano-ensino-clinico.md # Plano de ensino (regras do curso)
│   ├── regras-webfolio.md      # Regras do Webfólio
│   └── configuracoes.md        # Docs das configs do prompt
├── README.md                   # Este arquivo
└── .gitignore
```

## Publicar no GitHub Pages

1. Crie um repositório no GitHub
2. Envie os arquivos:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/seu-usuario/nurse-report.git
   git push -u origin main
   ```
3. No GitHub, vá em **Settings > Pages**, selecione branch `main` e pasta `/`

## Tecnologias

- HTML5 semântico, CSS3 (variáveis, flexbox, grid, animações)
- JavaScript puro (vanilla JS, sem dependências)
- Web Speech API (reconhecimento de fala)
- 100% cliente-side (sem backend)

## Licença

Uso educacional — livre para adaptação e compartilhamento.
