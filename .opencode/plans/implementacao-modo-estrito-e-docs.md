# Plano de Implementação

## Objetivo
Corrigir a IA que inventa termos clínicos inexistentes, adicionar configs de modo estrito e seções omitíveis, reorganizar documentação.

---

## 1. `index.html` — Adicionar fieldset de configurações

**Onde:** Entre o fechamento do fieldset 4 (`</fieldset>`) e a `<div class="grid-2">` dos botões.

**O que adicionar:**

```html
<fieldset class="config-fieldset">
  <legend>Configurações do Prompt</legend>

  <div class="config-group">
    <label class="checkbox-label">
      <input type="checkbox" id="modoEstrito" />
      <span class="checkbox-custom"></span>
      <strong>Modo Estrito</strong>
      <span class="checkbox-hint">A IA deve usar SOMENTE o que foi escrito nos campos, sem inventar dados clínicos, sinais vitais, diagnósticos ou procedimentos</span>
    </label>
  </div>

  <div class="config-group">
    <span class="config-label">Seções obrigatórias no relatório:</span>
    <div class="checkbox-grid">
      <label class="checkbox-label">
        <input type="checkbox" id="secaoAtividades" checked />
        <span class="checkbox-custom"></span>
        Descrição das atividades
      </label>
      <label class="checkbox-label">
        <input type="checkbox" id="secaoReflexao" checked />
        <span class="checkbox-custom"></span>
        Reflexão semanal
      </label>
      <label class="checkbox-label">
        <input type="checkbox" id="secaoPesquisa" checked />
        <span class="checkbox-custom"></span>
        Pesquisa / lacuna de conhecimento
      </label>
      <label class="checkbox-label">
        <input type="checkbox" id="secaoDcn" checked />
        <span class="checkbox-custom"></span>
        DCNs
      </label>
      <label class="checkbox-label">
        <input type="checkbox" id="secaoCampo" checked />
        <span class="checkbox-custom"></span>
        Avaliação do campo
      </label>
      <label class="checkbox-label">
        <input type="checkbox" id="secaoProfessor" checked />
        <span class="checkbox-custom"></span>
        Avaliação do professor
      </label>
      <label class="checkbox-label">
        <input type="checkbox" id="secaoAutoavaliacao" checked />
        <span class="checkbox-custom"></span>
        Autoavaliação
      </label>
    </div>
  </div>
</fieldset>
```

---

## 2. `assets/js/app.js` — Lógica do modo estrito e seções dinâmicas

### 2.1. Novas variáveis no início do `gerarPrompt()` (após linha 162)

```js
const modoEstrito = document.getElementById('modoEstrito').checked;
const secaoAtividades = document.getElementById('secaoAtividades').checked;
const secaoReflexao = document.getElementById('secaoReflexao').checked;
const secaoPesquisa = document.getElementById('secaoPesquisa').checked;
const secaoDcn = document.getElementById('secaoDcn').checked;
const secaoCampo = document.getElementById('secaoCampo').checked;
const secaoProfessor = document.getElementById('secaoProfessor').checked;
const secaoAutoavaliacao = document.getElementById('secaoAutoavaliacao').checked;
```

### 2.2. Contexto normativo do DOC.md (após linha 215, antes da checklist)

Adicionar:

```js
const docContexto =
  '\n' +
  'CONTEXTO NORMATIVO DO CURSO (seguir rigorosamente):\n' +
  '- Competência da UC: Assistir à criança, adolescente e à mulher nos diferentes níveis de atenção à saúde, com base no raciocínio clínico e crítico, no Processo de Enfermagem, norteado por Teorias de Enfermagem e práticas de segurança do paciente, utilizando as taxonomias de enfermagem.\n' +
  '- DCNs: Atenção à saúde, Comunicação, Tomada de decisão, Educação Permanente\n' +
  '- Objetivos específicos: Integrar os fundamentos teóricos e metodológicos do Processo de Enfermagem à prática assistencial; Aplicar o Processo de Enfermagem em diferentes níveis de complexidade assistencial; Executar práticas assistenciais fundamentadas em princípios científicos, técnicos, éticos e humanísticos.\n' +
  '- O Webfólio deve conter obrigatoriamente: descrição detalhada das atividades, reflexão semanal, link das pesquisas realizadas, DCNs identificadas e desenvolvidas, avaliação do campo, avaliação do professor e autoavaliação.\n';
```

### 2.3. Instrução de modo estrito (após o "Atue como tutor...")

Inserir após a linha 214 (após `'.\n'`):

```js
(modoEstrito
  ? '\n⚠️ MODO ESTRITO ATIVADO: Utilize EXCLUSIVAMENTE as informações fornecidas nos campos abaixo. NÃO invente, adicione ou sugira dados clínicos (sinais vitais, diagnósticos, condições de pacientes, procedimentos) que não foram explicitamente relatados pelo aluno. Mantenha-se fiel ao texto original de cada campo.\n'
  : '\nVocê pode enriquecer o relatório com seu conhecimento técnico-científico de enfermagem, desde que seja coerente com os dados fornecidos e com a área de atuação.\n') +
```

### 2.4. Checklist dinâmica (substituir as linhas 220-252)

Substituir a checklist fixa por:

```js
let secaoItems = [];
if (secaoAtividades) secaoItems.push(
  '1. DESCRIÇÃO DETALHADA DAS ATIVIDADES REALIZADAS EM CAMPO\n' +
  '   - Setores percorridos, procedimentos executados, condutas observadas\n' +
  '   - Exames, técnicas (ex: Manobras de Leopold, AU, SSVV, banho do RN)\n' +
  '   - Condições clínicas das pacientes atendidas'
);
if (secaoReflexao) secaoItems.push(
  '2. REFLEXÃO SEMANAL\n' +
  '   - Aprendizado central do plantão\n' +
  '   - Relação teoria-prática vivenciada\n' +
  '   - Impacto na formação acadêmica e profissional'
);
if (secaoPesquisa) secaoItems.push(
  '3. LINK DAS PESQUISAS REALIZADAS\n' +
  '   - Tema estudado advindo do ensino clínico da especialidade\n' +
  '   - Pesquisa realizada para suprir lacuna de conhecimento identificada\n' +
  '   - Referência com link ativo'
);
if (secaoDcn) secaoItems.push(
  '4. DCNs IDENTIFICADAS E DESENVOLVIDAS\n' +
  '   - Diretriz Curricular Nacional trabalhada no plantão\n' +
  '   - Como ela se materializou no raciocínio clínico ou tomada de decisão'
);
if (secaoCampo) secaoItems.push(
  '5. AVALIAÇÃO DO CAMPO DE ESTÁGIO\n' +
  '   - Estrutura física, organização, resolutividade'
);
if (secaoProfessor) secaoItems.push(
  '6. AVALIAÇÃO DO PROFESSOR\n' +
  '   - Didática, domínio técnico, acolhimento, suporte'
);
if (secaoAutoavaliacao) secaoItems.push(
  '7. AUTOAVALIAÇÃO\n' +
  '   - Segurança, dificuldades, proatividade, responsabilidade'
);

const checklistDinamica = secaoItems.join('\n\n');
```

Depois substituir o bloco:

```
'⚠️ ATENÇÃO — SEÇÕES OBRIGATÓRIAS (NÃO OMITIR NENHUMA):\n' +
... (antiga checklist fixa)
```

Por:

```
'⚠️ SEÇÕES DO RELATÓRIO:\n' +
checklistDinamica +
'\n'
```

### 2.5. Parágrafos condicionais (ajustar regras de construção textual)

O Parágrafo 1-2 (Atividades) — sempre presente se `secaoAtividades`.
O Parágrafo 3 (Lacuna/Pesquisa) — condicional a `secaoPesquisa`.
O Parágrafo 4 (Reflexão + DCNs) — condicional a `secaoReflexao || secaoDcn`.
O Parágrafo 5 (Avaliações) — condicional a `secaoCampo || secaoProfessor || secaoAutoavaliacao`.

Estrutura condicional:

```js
let paragrafos = [];

if (secaoAtividades) {
  paragrafos.push(
    'Parágrafo 1 e 2 — ATIVIDADES EM CAMPO:\n' +
    '...' // conteúdo existente
  );
}

if (secaoPesquisa) {
  paragrafos.push(
    'Parágrafo 3 — LACUNA DE CONHECIMENTO, PESQUISA E LINK CIENTÍFICO:\n' +
    '...' // conteúdo existente
  );
}

// etc.
```

---

## 3. `assets/css/style.css` — Estilos para as configs

Adicionar ao final do arquivo:

```css
/* ===== Configurações do Prompt ===== */
.config-fieldset {
  border: 2px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  background: var(--surface);
}

.config-fieldset legend {
  font-weight: 700;
  font-size: 1rem;
  color: var(--primary);
  padding: 0 0.5rem;
}

.config-group {
  margin-bottom: 1rem;
}

.config-group:last-child {
  margin-bottom: 0;
}

.config-label {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: var(--text);
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.4rem 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1.4;
  padding: 0.25rem 0;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  accent-color: var(--primary);
  cursor: pointer;
  flex-shrink: 0;
}

.checkbox-hint {
  display: block;
  font-size: 0.8rem;
  color: var(--muted);
  font-weight: 400;
  margin-left: 1.5rem;
  margin-top: 0.1rem;
}

.checkbox-label strong {
  color: var(--primary);
}
```

---

## 4. Reorganizar documentação

### 4.1. Mover `DOC.md` → `docs/plano-ensino-clinico.md`

```bash
mkdir -p docs
mv DOC.md docs/plano-ensino-clinico.md
```

### 4.2. Criar `docs/regras-webfolio.md`

Extrair do DOC.md:

```markdown
# Regras do Webfólio — Ensino Clínico em Saúde da Mulher, Criança e Adolescente

Extraído do Plano de Ensino Clínico (docs/plano-ensino-clinico.md).

## Estrutura Obrigatória do Webfólio (Apêndice 2)

O relatório diário DEVE conter:

1. **Descrição detalhada das atividades realizadas em campo**
   - Setores percorridos, procedimentos executados, condutas observadas
   - Exames, técnicas, condições clínicas

2. **Reflexão semanal**
   - Aprendizado central do plantão
   - Relação teoria-prática
   - Impacto na formação profissional

3. **Link das pesquisas realizadas**
   - Tema estudado advindo do ensino clínico
   - Pesquisa para suprir lacuna de conhecimento

4. **DCNs identificadas e desenvolvidas**
   - Atenção à saúde / Comunicação / Tomada de decisão / Educação Permanente

5. **Avaliação do campo de estágio**
6. **Avaliação do professor**
7. **Autoavaliação**

## Competências da UC

- Assistir à criança, adolescente e à mulher nos diferentes níveis de atenção à saúde
- Base no raciocínio clínico e crítico, Processo de Enfermagem
- Teorias de Enfermagem e práticas de segurança do paciente
- Taxonomias de enfermagem (NANDA, NIC, NOC)

## Critérios de Avaliação (Rubrica - Apêndice 1)

- Atividade 2 e 4 (Ensino Clínico): Ótimo / Bom / Regular / Ruim
- Avaliação contínua com feedback semanal
```

### 4.3. Criar `docs/configuracoes.md`

```markdown
# Configurações do Prompt

## Modo Estrito

Quando ativado, instrui a IA a utilizar **exclusivamente** as informações fornecidas nos campos do formulário, sem inventar:

- Sinais vitais
- Diagnósticos
- Procedimentos
- Condições de pacientes
- Termos técnicos não mencionados

Recomendado quando o aluno quer garantir que o relatório reflita exatamente o que foi vivenciado e descrito.

## Seções do Relatório

Permite ativar/desativar cada seção obrigatória do relatório:

| Seção | Descrição |
|---|---|
| Descrição das atividades | Atividades, setores, procedimentos |
| Reflexão semanal | Aprendizado e relação teoria-prática |
| Pesquisa / lacuna | Lacuna de conhecimento + link científico |
| DCNs | Diretrizes Curriculares Nacionais |
| Avaliação do campo | Estrutura e organização do campo |
| Avaliação do professor | Didática e suporte do docente |
| Autoavaliação | Segurança, dificuldades, proatividade |

Se uma seção for desmarcada, a instrução correspondente é removida do prompt e o número de parágrafos é ajustado automaticamente.
```

---

## 5. Sistema de Cache (LocalStorage) + Sessões + Modal de Config

### 5.1. Estrutura de dados no localStorage

Chave única: `'nurse_report_app'`

```json
{
  "sessions": {
    "sessao_1717000001": {
      "id": "sessao_1717000001",
      "numero": 1,
      "date": "2026-05-31",
      "area": "Saúde da Mulher (Obstetrícia)",
      "fields": {
        "faculdadeNome": "Centro Universitário São Camilo",
        "professoraNome": "Prof. Luciane",
        "dataPlantao": "2026-05-31",
        "diaEstagio": "Primeiro",
        "estagioArea": "Saúde da Mulher (Obstetrícia)",
        "grupoIntegrantes": "",
        "hospitalNome": "Hospital Municipal",
        "hospitalDescricao": "Estrutura boa...",
        "setoresAcoes": "Centro Obstétrico...",
        "ocorrenciasExtra": "",
        "dificuldade": "Recordação das fisiopatologias...",
        "estudoTema": "Manual de Gestação de Alto Risco",
        "estudoLink": "https://...",
        "dcnDesenvolvida": "Atenção à Saúde",
        "reflexaoSemanal": "",
        "autoavaliacao": "",
        "avaliacaoProfessor": ""
      },
      "config": {
        "modoEstrito": false,
        "secaoAtividades": true,
        "secaoReflexao": true,
        "secaoPesquisa": true,
        "secaoDcn": true,
        "secaoCampo": true,
        "secaoProfessor": true,
        "secaoAutoavaliacao": true
      },
      "createdAt": "2026-05-31T10:00:00.000Z",
      "updatedAt": "2026-05-31T10:30:00.000Z"
    }
  },
  "activeSessionId": "sessao_1717000001",
  "nextNumero": 2,
  "theme": "light"
}
```

### 5.2. Comportamentos

| Evento | Ação |
|---|---|
| **Page load** | Ler `activeSessionId` do localStorage → preencher todos os campos do form + configs |
| **Input em qualquer campo** | Auto-save debounced (300ms) → atualizar `fields` da sessão ativa no localStorage |
| **Gerar prompt** | Auto-save imediato antes de gerar |
| **Clique "Limpar" sutil** | Limpa todos os campos do form (mas NÃO apaga a sessão do localStorage) |
| **Criar nova sessão** | Incrementa `nextNumero`, cria sessão vazia, define como `activeSessionId`, limpa form |
| **Carregar sessão** | Preenche form com os `fields` e `config` da sessão selecionada |
| **Excluir sessão(ões)** | Remove do `sessions`, se for a ativa, redireciona para a mais recente ou cria nova |

### 5.3. Mudanças no `index.html`

**Header** — adicionar barra de sessão entre o `<header>` e o `<form>`:

```html
<div class="session-bar">
  <div class="session-bar-left">
    <button type="button" class="btn-session" id="btnSessaoAtual" onclick="abrirGerenciadorSessoes()">
      📋 Relatório #<span id="sessaoNumero">1</span>
    </button>
    <span class="session-meta" id="sessaoMeta"></span>
  </div>
  <div class="session-bar-right">
    <button type="button" class="btn-subtle" id="btnLimparForm" onclick="limparFormulario()">
      🧹 Limpar
    </button>
    <button type="button" class="btn-icon" id="btnConfig" onclick="abrirConfig()" title="Configurações">
      ⚙️
    </button>
  </div>
</div>
```

**Modais** — adicionar antes do fechamento de `</body>`:

```html
<!-- Modal Gerenciador de Sessões -->
<div class="modal-overlay" id="modalSessoes" onclick="fecharModalSeFora(event, 'modalSessoes')">
  <div class="modal">
    <div class="modal-header">
      <h2>📋 Relatórios Salvos</h2>
      <button type="button" class="btn-close" onclick="fecharModal('modalSessoes')">&times;</button>
    </div>
    <div class="modal-body">
      <div id="sessaoList">
        <!-- Renderizado por JS -->
      </div>
      <p class="text-muted" id="sessaoEmpty" style="display:none">Nenhum relatório salvo ainda.</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline" onclick="criarNovaSessao()">+ Nova Sessão</button>
      <button type="button" class="btn btn-danger" id="btnExcluirSelecionadas" onclick="excluirSessoesSelecionadas()" disabled>
        Excluir selecionadas
      </button>
    </div>
  </div>
</div>

<!-- Modal Config -->
<div class="modal-overlay" id="modalConfig" onclick="fecharModalSeFora(event, 'modalConfig')">
  <div class="modal modal-sm">
    <div class="modal-header">
      <h2>⚙️ Configurações</h2>
      <button type="button" class="btn-close" onclick="fecharModal('modalConfig')">&times;</button>
    </div>
    <div class="modal-body">
      <div class="config-group">
        <label class="config-label">Tema</label>
        <div class="theme-toggle">
          <button type="button" class="btn-theme" id="btnThemeLight" onclick="setTheme('light')">☀️ Claro</button>
          <button type="button" class="btn-theme" id="btnThemeDark" onclick="setTheme('dark')">🌙 Escuro</button>
        </div>
      </div>
      <div class="config-group">
        <label class="config-label">Armazenamento</label>
        <button type="button" class="btn btn-danger btn-sm" onclick="limparTodasSessoes()">
          🗑️ Limpar todas as sessões
        </button>
      </div>
    </div>
  </div>
</div>
```

### 5.4. Mudanças no `assets/js/app.js` — Sistema de Sessões

**Constantes** (topo da IIFE):

```js
const STORAGE_KEY = 'nurse_report_app';
const FORM_FIELD_IDS = [
  'faculdadeNome', 'professoraNome', 'dataPlantao', 'diaEstagio',
  'estagioArea', 'grupoIntegrantes', 'hospitalNome', 'hospitalDescricao',
  'setoresAcoes', 'ocorrenciasExtra', 'dificuldade', 'estudoTema',
  'estudoLink', 'dcnDesenvolvida', 'reflexaoSemanal', 'autoavaliacao',
  'avaliacaoProfessor'
];
const CONFIG_IDS = [
  'modoEstrito', 'secaoAtividades', 'secaoReflexao', 'secaoPesquisa',
  'secaoDcn', 'secaoCampo', 'secaoProfessor', 'secaoAutoavaliacao'
];
```

**Funções de localStorage:**

```js
function lerAppState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch { return null; }
}

function salvarAppState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function obterSessaoAtiva(state) {
  if (!state || !state.activeSessionId) return null;
  return state.sessions[state.activeSessionId] || null;
}
```

**Auto-save (debounced):**

```js
let autoSaveTimeout = null;

function autoSalvar() {
  if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(function () {
    salvarCamposAtuais();
  }, 300);
}

function salvarCamposAtuais() {
  var state = lerAppState() || { sessions: {}, nextNumero: 1, theme: 'light' };
  var sessao = obterSessaoAtiva(state);
  if (!sessao) return;

  // Coletar todos os campos do formulário
  FORM_FIELD_IDS.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) sessao.fields[id] = el.value;
  });

  // Coletar configs
  CONFIG_IDS.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) sessao.config[id] = el.checked;
  });

  sessao.updatedAt = new Date().toISOString();
  state.sessions[sessao.id] = sessao;
  salvarAppState(state);
}
```

**Restaurar sessão no load:**

```js
function restaurarSessao() {
  var state = lerAppState();
  if (!state || !state.activeSessionId) {
    criarNovaSessao();
    return;
  }

  var sessao = state.sessions[state.activeSessionId];
  if (!sessao) {
    criarNovaSessao();
    return;
  }

  // Preencher campos do form
  FORM_FIELD_IDS.forEach(function (id) {
    var el = document.getElementById(id);
    if (el && sessao.fields[id] !== undefined) {
      el.value = sessao.fields[id];
    }
  });

  // Preencher configs
  CONFIG_IDS.forEach(function (id) {
    var el = document.getElementById(id);
    if (el && sessao.config[id] !== undefined) {
      el.checked = sessao.config[id];
    }
  });

  atualizarIndicadorSessao(sessao);
  aplicarTema(state.theme || 'light');
}
```

**Criar nova sessão:**

```js
function criarNovaSessao() {
  var state = lerAppState() || { sessions: {}, nextNumero: 1, theme: 'light' };
  var id = 'sessao_' + Date.now();
  var numero = state.nextNumero;

  state.sessions[id] = {
    id: id,
    numero: numero,
    date: '',
    area: '',
    fields: {},
    config: {
      modoEstrito: false,
      secaoAtividades: true,
      secaoReflexao: true,
      secaoPesquisa: true,
      secaoDcn: true,
      secaoCampo: true,
      secaoProfessor: true,
      secaoAutoavaliacao: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  state.activeSessionId = id;
  state.nextNumero = numero + 1;
  salvarAppState(state);
  limparFormularioDireto(); // limpa sem confirmar
  atualizarIndicadorSessao(state.sessions[id]);
  fecharModal('modalSessoes');
}
```

**Atualizar indicador de sessão:**

```js
function atualizarIndicadorSessao(sessao) {
  var numEl = document.getElementById('sessaoNumero');
  var metaEl = document.getElementById('sessaoMeta');
  if (numEl) numEl.textContent = sessao.numero;
  if (metaEl) {
    var partes = [];
    if (sessao.date) partes.push(formatarDataExibicao(sessao.date));
    if (sessao.area) partes.push(sessao.area);
    metaEl.textContent = partes.length ? '• ' + partes.join(' • ') : '';
  }
}
```

**Gerenciador de sessões (renderizar lista):**

```js
function abrirGerenciadorSessoes() {
  var state = lerAppState();
  if (!state) { fecharModal('modalSessoes'); return; }

  var container = document.getElementById('sessaoList');
  var emptyEl = document.getElementById('sessaoEmpty');
  var ids = Object.keys(state.sessions);

  if (ids.length === 0) {
    container.innerHTML = '';
    emptyEl.style.display = 'block';
    document.getElementById('btnExcluirSelecionadas').disabled = true;
    abrirModal('modalSessoes');
    return;
  }

  emptyEl.style.display = 'none';
  var html = '<table class="session-table">' +
    '<thead><tr><th class="col-check"></th><th>#</th><th>Data</th><th>Área</th><th>Atualizado</th><th class="col-actions"></th></tr></thead><tbody>';

  // Ordenar por updatedAt decrescente
  ids.sort(function (a, b) {
    return new Date(state.sessions[b].updatedAt) - new Date(state.sessions[a].updatedAt);
  });

  ids.forEach(function (id) {
    var s = state.sessions[id];
    var ativo = id === state.activeSessionId;
    var dataFormatada = s.date ? s.date.split('-').reverse().join('/') : '—';
    var atualizadoEm = new Date(s.updatedAt).toLocaleString('pt-BR');
    html += '<tr class="' + (ativo ? 'tr-active' : '') + '">' +
      '<td><input type="checkbox" class="sessao-check" value="' + id + '" ' +
        (ativo ? 'disabled' : '') + ' /></td>' +
      '<td>' + s.numero + '</td>' +
      '<td>' + dataFormatada + '</td>' +
      '<td>' + (s.area || '—') + '</td>' +
      '<td>' + atualizadoEm + '</td>' +
      '<td>' +
        (ativo
          ? '<span class="badge-active">Ativo</span>'
          : '<button type="button" class="btn btn-sm btn-outline" onclick="carregarSessao(\'' + id + '\')">Carregar</button>'
        ) +
      '</td></tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
  document.getElementById('btnExcluirSelecionadas').disabled = true;
  abrirModal('modalSessoes');
}
```

**Carregar e excluir sessões:**

```js
function carregarSessao(id) {
  var state = lerAppState();
  if (!state || !state.sessions[id]) return;
  state.activeSessionId = id;
  salvarAppState(state);
  restaurarSessao();
  fecharModal('modalSessoes');
}

function excluirSessoesSelecionadas() {
  var checks = document.querySelectorAll('.sessao-check:checked');
  if (checks.length === 0) return;
  var ids = Array.from(checks).map(function (c) { return c.value; });
  if (!confirm('Excluir ' + ids.length + ' relatório(s)?')) return;

  var state = lerAppState();
  if (!state) return;
  ids.forEach(function (id) { delete state.sessions[id]; });

  // Se a sessão ativa foi excluída, redirecionar
  if (ids.indexOf(state.activeSessionId) !== -1) {
    var remaining = Object.keys(state.sessions);
    if (remaining.length > 0) {
      state.activeSessionId = remaining[0];
    } else {
      criarNovaSessao();
      fecharModal('modalSessoes');
      return;
    }
  }

  salvarAppState(state);
  restaurarSessao();
  abrirGerenciadorSessoes(); // re-render
}

function limparTodasSessoes() {
  if (!confirm('Tem certeza? Todos os relatórios salvos serão perdidos.')) return;
  if (!confirm('Essa ação não pode ser desfeita. Continuar?')) return;
  var state = { sessions: {}, activeSessionId: null, nextNumero: 1, theme: 'light' };
  salvarAppState(state);
  criarNovaSessao();
  fecharModal('modalConfig');
}
```

**Handler de input (auto-save):**

No `DOMContentLoaded`, adicionar listeners:

```js
FORM_FIELD_IDS.forEach(function (id) {
  var el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', autoSalvar);
    el.addEventListener('change', autoSalvar);
  }
});

CONFIG_IDS.forEach(function (id) {
  var el = document.getElementById(id);
  if (el) {
    el.addEventListener('change', autoSalvar);
  }
});
```

**Modificar `gerarPrompt()` para salvar antes:**

No início da função, adicionar `salvarCamposAtuais();` e também atualizar `date` e `area` da sessão com os valores atuais.

**Modificar `limparFormulario()`:**

Alterar para:
1. Se houver dados no form, confirmar "Tem certeza que deseja limpar?"
2. Resetar form
3. NÃO apagar a sessão do localStorage (só os campos ficam vazios)
4. Auto-salvar após limpar (persiste campos vazios)

**Funções auxiliares de modal:**

```js
function abrirModal(id) {
  document.getElementById(id).classList.add('open');
}

function fecharModal(id) {
  document.getElementById(id).classList.remove('open');
}

function fecharModalSeFora(event, id) {
  if (event.target === event.currentTarget) fecharModal(id);
}

function abrirConfig() {
  fecharModal('modalConfig'); // força fechar se já tiver
  // force re-render
  abrirModal('modalConfig');
}
```

### 5.5. Tema Dark

**Variáveis CSS:**

No `:root`, adicionar data-theme:

```css
[data-theme="dark"] {
  --bg: #1a1a2e;
  --surface: #16213e;
  --text: #e0e0e0;
  --text-secondary: #a0a0a0;
  --border: #2a2a4a;
  --primary: #6c63ff;
  --primary-hover: #5a52d5;
  --muted: #888;
  --input-bg: #0f3460;
  --shadow: 0 2px 8px rgba(0,0,0,0.4);
}
```

**Função setTheme:**

```js
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  var state = lerAppState() || { sessions: {}, nextNumero: 1, theme: 'light' };
  state.theme = theme;
  salvarAppState(state);

  // Atualizar botões
  document.getElementById('btnThemeLight').classList.toggle('active', theme === 'light');
  document.getElementById('btnThemeDark').classList.toggle('active', theme === 'dark');
}

function aplicarTema(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  var lightBtn = document.getElementById('btnThemeLight');
  var darkBtn = document.getElementById('btnThemeDark');
  if (lightBtn) lightBtn.classList.toggle('active', theme === 'light');
  if (darkBtn) darkBtn.classList.toggle('active', theme === 'dark');
}
```

**No `DOMContentLoaded`**, restaurar tema antes de tudo:

```js
var state = lerAppState();
if (state && state.theme) {
  aplicarTema(state.theme);
}
```

### 5.6. Mudanças no `assets/css/style.css` — Modais, tema dark, sessões

Adicionar ao final do arquivo:

```css
/* ===== Session Bar ===== */
.session-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
  gap: 0.5rem;
}

.session-bar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.session-bar-right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-session {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.35rem 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text);
  transition: border-color 0.2s, background 0.2s;
}

.btn-session:hover {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 10%, var(--surface));
}

.session-meta {
  font-size: 0.8rem;
  color: var(--muted);
}

.btn-subtle {
  background: none;
  border: 1px solid transparent;
  border-radius: var(--radius);
  padding: 0.35rem 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--muted);
  transition: color 0.2s, border-color 0.2s;
}

.btn-subtle:hover {
  color: var(--text);
  border-color: var(--border);
}

.btn-icon {
  background: none;
  border: 1px solid transparent;
  border-radius: var(--radius);
  padding: 0.35rem 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  transition: border-color 0.2s;
}

.btn-icon:hover {
  border-color: var(--border);
}

/* ===== Modais ===== */
.modal-overlay {
  display: none;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

.modal-overlay.open {
  display: flex;
}

.modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  width: 90%;
  max-width: 640px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  animation: slideUp 0.2s ease;
}

.modal-sm {
  max-width: 420px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.1rem;
}

.modal-body {
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--border);
  gap: 0.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--muted);
  line-height: 1;
  padding: 0.25rem;
}

.btn-close:hover {
  color: var(--text);
}

/* ===== Session Table ===== */
.session-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.session-table th {
  text-align: left;
  padding: 0.5rem;
  border-bottom: 2px solid var(--border);
  color: var(--muted);
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.session-table td {
  padding: 0.5rem;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.session-table tr:hover td {
  background: color-mix(in srgb, var(--primary) 5%, var(--surface));
}

.tr-active td {
  background: color-mix(in srgb, var(--primary) 10%, var(--surface));
}

.col-check { width: 2rem; }
.col-actions { width: 7rem; text-align: right; }

.badge-active {
  font-size: 0.75rem;
  color: var(--primary);
  font-weight: 600;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: 1px solid #dc3545;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-danger:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.theme-toggle {
  display: flex;
  gap: 0.5rem;
}

.btn-theme {
  flex: 1;
  padding: 0.6rem 1rem;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text);
  transition: border-color 0.2s, background 0.2s;
}

.btn-theme.active {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 15%, var(--surface));
}

.btn-theme:hover {
  border-color: var(--primary);
}

.btn-sm {
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
}

.text-muted {
  color: var(--muted);
  text-align: center;
  padding: 2rem 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

### 5.7. Mudança no `limparFormulario()` existente

Substituir a função atual por:

```js
window.limparFormulario = function () {
  document.getElementById('reportForm').reset();
  document.getElementById('outputArea').style.display = 'none';
  document.getElementById('promptResult').value = '';

  // Preencher data de hoje se vazio
  var hoje = new Date();
  var dataInput = document.getElementById('dataPlantao');
  if (dataInput && !dataInput.value) {
    dataInput.value = hoje.getFullYear() + '-' +
      String(hoje.getMonth() + 1).padStart(2, '0') + '-' +
      String(hoje.getDate()).padStart(2, '0');
  }

  autoSalvar(); // persiste form vazio
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

E criar `limparFormularioDireto` (sem confirm):

```js
function limparFormularioDireto() {
  document.getElementById('reportForm').reset();
  document.getElementById('outputArea').style.display = 'none';
  document.getElementById('promptResult').value = '';
}
```

---

## 6. `README.md` — Atualizar

Adicionar/atualizar:

```markdown
## Funcionalidades

- [... existentes ...]
- **Modo Estrito** — impede a IA de inventar dados clínicos não informados
- **Seções customizáveis** — ative/desative cada parte do relatório
- **Cache automático (LocalStorage)** — seus dados são salvos automaticamente a cada digitação
- **Gerenciador de sessões** — múltiplos relatórios salvos com data, número e área
- **Tema escuro** — alternância entre claro e escuro
- **Limpeza rápida** — botão sutil para limpar o formulário quando carregar uma sessão anterior

## Documentação

- [`docs/plano-ensino-clinico.md`](docs/plano-ensino-clinico.md) — Plano de ensino completo da disciplina
- [`docs/regras-webfolio.md`](docs/regras-webfolio.md) — Regras do Webfólio extraídas do plano
- [`docs/configuracoes.md`](docs/configuracoes.md) — Explicação das configurações do prompt

## Estrutura do projeto

```
nurse-report/
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── docs/
│   ├── plano-ensino-clinico.md
│   ├── regras-webfolio.md
│   └── configuracoes.md
├── README.md
└── .gitignore
```
```

