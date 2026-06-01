# Gerador de Webfólio — Enfermagem São Camilo

Ferramenta web para gerar **prompts estruturados** de relatórios diários de estágio (Webfólio) para o curso de Enfermagem, alinhados ao manual de ensino clínico e às Diretrizes Curriculares Nacionais (DCNs).

## Funcionalidades

- Formulário completo com os dados do plantão
- Geração de prompt no formato **5 parágrafos + referências ABNT**
- Campos opcionais para Reflexão Semanal, Autoavaliação e Avaliação do Professor
- **Checklist explícito** de seções obrigatórias no prompt:
  1. Descrição detalhada das atividades em campo
  2. Reflexão semanal
  3. Link das pesquisas realizadas
  4. DCNs identificadas e desenvolvidas
  5. Avaliação do campo de estágio
  6. Avaliação do professor
  7. Autoavaliação
- Reconhecimento de fala (dictation por voz) para facilitar o preenchimento
- Design responsivo e pronto para GitHub Pages
- Cópia com um clique para área de transferência

## Como usar

1. Acesse o [site publicado no GitHub Pages](https://seu-usuario.github.io/nurse-report/) ou abra o `index.html` localmente
2. Preencha os campos do formulário com os dados do seu plantão
3. Clique em **"Compilar e Gerar Prompt"**
4. Copie o prompt gerado
5. Cole no ChatGPT (ou outra IA) e receba o relatório completo
6. Revise e ajuste conforme necessário

### Exemplo de uso

Preencha dados como:
- **Área:** Saúde da Mulher (Obstetrícia)
- **Hospital:** Hospital Municipal Vereador José Storopolli
- **Atividades:** Centro Obstétrico, manobras de Leopold, banho do RN, etc.
- **Pesquisa:** Manual de Gestação de Alto Risco do Ministério da Saúde

O prompt gerado instruirá a IA a produzir um relatório com:
1. Atividades em campo (parágrafos 1-2)
2. Lacuna de conhecimento + pesquisa (parágrafo 3)
3. Reflexão semanal + DCNs (parágrafo 4)
4. Avaliações (parágrafo 5)
5. Referências em formato ABNT

## Estrutura do projeto

```
nurse-report/
├── index.html                  # Página principal
├── assets/
│   ├── css/
│   │   └── style.css           # Estilos da aplicação
│   └── js/
│       └── app.js              # Lógica da aplicação
├── Plano EC Saúde da mulher, criança 2026-1.pdf  # Plano de ensino clínico
├── README.md                   # Este arquivo
└── .gitignore
```

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (ex: `seu-usuario/nurse-report`)
2. Envie os arquivos para o repositório:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/seu-usuario/nurse-report.git
   git push -u origin main
   ```
3. No GitHub, vá em **Settings > Pages**
4. Selecione a branch `main` e pasta `/` (root)
5. O site será publicado em `https://seu-usuario.github.io/nurse-report/`

> **Dica:** A ferramenta funciona 100% no lado do cliente (não requer backend). Pode ser usada localmente ou em qualquer hospedagem estática.

## Requisitos

- Navegador moderno (Chrome, Edge, Firefox, Safari)
- Conexão com internet apenas se for usar com IA (ChatGPT etc.)
- Microfone (opcional, para dictação por voz)

## Tecnologias

- HTML5 semântico
- CSS3 (variáveis, flexbox, grid, animações)
- JavaScript puro (vanilla JS, sem dependências)
- Web Speech API (reconhecimento de fala)

## Licença

Uso educacional — livre para adaptação e compartilhamento.
