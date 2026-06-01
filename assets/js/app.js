(function () {
  'use strict';

  /* ===================================================================
     CONSTANTES
     =================================================================== */

  var STORAGE_KEY = 'nurse_report_app';

  var FORM_FIELD_IDS = [
    'faculdadeNome', 'professoraNome', 'dataPlantao', 'diaEstagio',
    'estagioArea', 'grupoIntegrantes', 'hospitalNome', 'hospitalDescricao',
    'setoresAcoes', 'ocorrenciasExtra', 'dificuldade', 'estudoTema',
    'estudoLink', 'dcnDesenvolvida', 'reflexaoSemanal', 'autoavaliacao',
    'avaliacaoProfessor', 'nomeRelatorio'
  ];

  var CONFIG_IDS = [
    'modoEstrito', 'perguntasIA', 'secaoAtividades', 'secaoReflexao', 'secaoPesquisa',
    'secaoDcn', 'secaoCampo', 'secaoProfessor', 'secaoAutoavaliacao'
  ];

  var PROGRESS_FIELD_IDS = [
    'faculdadeNome', 'professoraNome', 'dataPlantao', 'diaEstagio',
    'estagioArea', 'hospitalNome', 'hospitalDescricao',
    'setoresAcoes', 'dificuldade', 'estudoTema', 'estudoLink',
    'dcnDesenvolvida'
  ];

  /* ===================================================================
     LOCALSTORAGE HELPERS
     =================================================================== */

  function lerAppState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
    } catch (e) {
      return null;
    }
  }

  function salvarAppState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('[Storage] Erro ao salvar:', e);
    }
  }

  function obterSessaoAtiva(state) {
    if (!state || !state.activeSessionId) return null;
    return state.sessions[state.activeSessionId] || null;
  }

  /* ===================================================================
     SESSION MANAGEMENT
     =================================================================== */

  function criarNovaSessao() {
    var state = lerAppState() || {
      sessions: {},
      nextNumero: 1,
      theme: 'light'
    };

    var id = 'sessao_' + Date.now();
    var numero = state.nextNumero;

    state.sessions[id] = {
      id: id,
      numero: numero,
      date: '',
      area: '',
      nome: '',
      fields: {},
      config: {
        modoEstrito: false,
        perguntasIA: false,
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
    limparFormularioDireto();
    if (document.getElementById('nomeRelatorio')) {
      document.getElementById('nomeRelatorio').value = '';
    }
    atualizarIndicadorSessao(state.sessions[id]);
    fecharModal('modalSessoes');
  }

  function salvarCamposAtuais() {
    var state = lerAppState();
    if (!state) return;

    var sessao = obterSessaoAtiva(state);
    if (!sessao) return;

    FORM_FIELD_IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sessao.fields[id] = el.value;
    });

    CONFIG_IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sessao.config[id] = el.checked;
    });

    sessao.date = document.getElementById('dataPlantao')
      ? document.getElementById('dataPlantao').value : '';
    sessao.area = document.getElementById('estagioArea')
      ? document.getElementById('estagioArea').value : '';
    sessao.nome = document.getElementById('nomeRelatorio')
      ? document.getElementById('nomeRelatorio').value : '';
    sessao.updatedAt = new Date().toISOString();

    state.sessions[sessao.id] = sessao;
    salvarAppState(state);
    atualizarIndicadorSessao(sessao);
    atualizarProgresso();
  }

  var autoSaveTimeout = null;

  function autoSalvar() {
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(function () {
      salvarCamposAtuais();
    }, 300);
  }

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

    FORM_FIELD_IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && sessao.fields[id] !== undefined) {
        el.value = sessao.fields[id];
      }
    });

    /* Restaurar nome também do top-level (para sessões antigas) */
    var nomeEl = document.getElementById('nomeRelatorio');
    if (nomeEl && !nomeEl.value && sessao.nome) {
      nomeEl.value = sessao.nome;
    }

    CONFIG_IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && sessao.config[id] !== undefined) {
        el.checked = sessao.config[id];
      }
    });

    atualizarIndicadorSessao(sessao);
    atualizarProgresso();
    aplicarTema(state.theme || 'light');
  }

  function atualizarIndicadorSessao(sessao) {
    if (!sessao) return;
    var numEl = document.getElementById('sessaoNumero');
    var metaEl = document.getElementById('sessaoMeta');
    if (numEl) {
      var label = 'Relat\u00f3rio #' + sessao.numero;
      if (sessao.nome && sessao.nome.trim()) {
        label += ' \u2014 ' + sessao.nome.trim();
      }
      numEl.textContent = label;
    }
    if (metaEl) {
      var partes = [];
      if (sessao.date) {
        var d = sessao.date.split('-');
        partes.push(d[2] + '/' + d[1] + '/' + d[0]);
      }
      if (sessao.area) partes.push(sessao.area);
      metaEl.textContent = partes.length ? '\u2022 ' + partes.join(' \u2022 ') : '';
    }
  }

  function atualizarProgresso() {
    var total = PROGRESS_FIELD_IDS.length;
    var preenchidos = 0;

    PROGRESS_FIELD_IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.value && el.value.trim() !== '') {
        preenchidos++;
      }
    });

    var pct = Math.round((preenchidos / total) * 100);
    var fill = document.getElementById('progressFill');
    var text = document.getElementById('progressText');
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = pct + '%';
  }

  function limparFormularioDireto() {
    document.getElementById('reportForm').reset();
    document.getElementById('outputArea').style.display = 'none';
    document.getElementById('promptResult').value = '';
    if (document.getElementById('nomeRelatorio')) {
      document.getElementById('nomeRelatorio').value = '';
    }

    var hoje = new Date();
    var dataInput = document.getElementById('dataPlantao');
    if (dataInput && !dataInput.value) {
      dataInput.value = hoje.getFullYear() + '-' +
        String(hoje.getMonth() + 1).padStart(2, '0') + '-' +
        String(hoje.getDate()).padStart(2, '0');
    }
    atualizarProgresso();
  }

  /* ===================================================================
     SESSION MANAGER MODAL
     =================================================================== */

  window.abrirGerenciadorSessoes = function () {
    var state = lerAppState();
    var container = document.getElementById('sessaoList');
    var emptyEl = document.getElementById('sessaoEmpty');

    if (!state || Object.keys(state.sessions).length === 0) {
      container.innerHTML = '';
      emptyEl.style.display = 'block';
      document.getElementById('btnExcluirSelecionadas').disabled = true;
      abrirModal('modalSessoes');
      return;
    }

    emptyEl.style.display = 'none';
    var ids = Object.keys(state.sessions);

    ids.sort(function (a, b) {
      return new Date(state.sessions[b].updatedAt) -
             new Date(state.sessions[a].updatedAt);
    });

    var html = '<table class="session-table">' +
      '<thead><tr>' +
      '<th class="col-check"></th>' +
      '<th>#</th><th>Data</th><th>\u00c1rea</th><th>Nome</th><th>Atualizado</th>' +
      '<th class="col-actions"></th>' +
      '</tr></thead><tbody>';

    ids.forEach(function (id) {
      var s = state.sessions[id];
      var ativo = id === state.activeSessionId;
      var dataF = s.date
        ? s.date.split('-').reverse().join('/')
        : '\u2014';
      var atualizado = new Date(s.updatedAt).toLocaleString('pt-BR');

      html += '<tr class="' + (ativo ? 'tr-active' : '') + '">' +
        '<td><input type="checkbox" class="sessao-check" value="' +
        id + '" ' + (ativo ? 'disabled' : '') + ' /></td>' +
        '<td>' + s.numero + '</td>' +
        '<td>' + dataF + '</td>' +
        '<td>' + (s.area || '\u2014') + '</td>' +
        '<td>' + (s.nome || '\u2014') + '</td>' +
        '<td>' + atualizado + '</td>' +
        '<td>' +
        (ativo
          ? '<span class="badge-active">Ativo</span>'
          : '<button type="button" class="btn btn-sm btn-outline" onclick="carregarSessao(\'' +
            id + '\')">Carregar</button>'
        ) +
        '</td></tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
    document.getElementById('btnExcluirSelecionadas').disabled = true;
    abrirModal('modalSessoes');
  };

  window.carregarSessao = function (id) {
    var state = lerAppState();
    if (!state || !state.sessions[id]) return;
    state.activeSessionId = id;
    salvarAppState(state);
    restaurarSessao();
    fecharModal('modalSessoes');
  };

  window.excluirSessoesSelecionadas = function () {
    var checks = document.querySelectorAll('.sessao-check:checked');
    if (checks.length === 0) return;

    var ids = Array.from(checks).map(function (c) { return c.value; });
    if (!confirm('Excluir ' + ids.length + ' relat\u00f3rio(s)?')) return;

    var state = lerAppState();
    if (!state) return;

    ids.forEach(function (id) { delete state.sessions[id]; });

    if (ids.indexOf(state.activeSessionId) !== -1) {
      var remaining = Object.keys(state.sessions);
      if (remaining.length > 0) {
        state.activeSessionId = remaining[0];
      } else {
        salvarAppState(state);
        criarNovaSessao();
        fecharModal('modalSessoes');
        return;
      }
    }

    salvarAppState(state);
    restaurarSessao();
    window.abrirGerenciadorSessoes();
  };

  window.criarNovaSessao = criarNovaSessao;

  /* ===================================================================
     THEME
     =================================================================== */

  function aplicarTema(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var lightBtn = document.getElementById('btnThemeLight');
    var darkBtn = document.getElementById('btnThemeDark');
    if (lightBtn) lightBtn.classList.toggle('active', theme === 'light');
    if (darkBtn) darkBtn.classList.toggle('active', theme === 'dark');
  }

  window.setTheme = function (theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var state = lerAppState() || {
      sessions: {},
      nextNumero: 1,
      theme: 'light'
    };
    state.theme = theme;
    salvarAppState(state);

    document.getElementById('btnThemeLight').classList.toggle('active', theme === 'light');
    document.getElementById('btnThemeDark').classList.toggle('active', theme === 'dark');
  };

  /* ===================================================================
     MODALS
     =================================================================== */

  function abrirModal(id) {
    document.getElementById(id).classList.add('open');
  }

  function fecharModal(id) {
    document.getElementById(id).classList.remove('open');
  }

  window.fecharModal = fecharModal;

  window.fecharModalSeFora = function (event, id) {
    if (event.target === event.currentTarget) fecharModal(id);
  };

  window.abrirConfig = function () {
    abrirModal('modalConfig');
  };

  /* ===================================================================
     SPEECH RECOGNITION
     =================================================================== */

  var recognition = null;
  var currentTargetField = null;
  var speechSupported = false;

  function isSecureContext() {
    return window.location.protocol === 'https:' ||
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  }

  function tryInitSpeech() {
    var SR = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SR) {
      console.warn('[Dictation] Web Speech API n\u00e3o encontrada neste navegador.');
      updateSpeechStatus(false, 'API n\u00e3o suportada');
      return;
    }
    try {
      recognition = new SR();
    } catch (e) {
      console.warn('[Dictation] Erro ao criar SpeechRecognition:', e);
      updateSpeechStatus(false, 'Falha na cria\u00e7\u00e3o');
      return;
    }
    speechSupported = true;
    updateSpeechStatus(true);

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'pt-BR';
    recognition.maxAlternatives = 1;

    recognition.onresult = function (e) {
      if (!e.results || !e.results[0] || !e.results[0][0]) return;
      var text = e.results[0][0].transcript;
      if (currentTargetField) {
        currentTargetField.value =
          currentTargetField.value.trim() !== ''
            ? currentTargetField.value + ' ' + text
            : text;
        currentTargetField.dispatchEvent(new Event('input'));
      }
    };

    recognition.onerror = function (e) {
      console.warn('[Dictation] Erro:', e.error);
      if (e.error === 'not-allowed') {
        if (!isSecureContext()) {
          alert(
            '\uD83C\uDFA4 Microfone bloqueado pelo navegador.\n\n' +
            'Esta p\u00e1gina est\u00e1 sendo aberta como arquivo local (file://).\n' +
            'O reconhecimento de voz S\u00d3 funciona se a p\u00e1gina estiver online\n' +
            '(HTTPS) ou em localhost.\n\n' +
            '\uD83D\uDC49 Publique no GitHub Pages ou use "npx serve" para testar.'
          );
        } else {
          alert(
            '\uD83C\uDFA4 Acesso ao microfone negado.\n\n' +
            'Clique no \u00edcone de "cadeado" na barra de endere\u00e7o do navegador\n' +
            'e permita o microfone para este site.'
          );
        }
      }
      resetMicButtons();
    };

    recognition.onend = function () {
      resetMicButtons();
    };
  }

  function updateSpeechStatus(available, reason) {
    document.querySelectorAll('.btn-mic').forEach(function (btn) {
      btn.title = available
        ? 'Clique para ditar por voz'
        : 'Ditado por voz indispon\u00edvel' + (reason ? ' \u2014 ' + reason : '');
      btn.style.opacity = available ? '1' : '0.5';
      btn.disabled = !available;
    });
    var badge = document.getElementById('speechBadge');
    if (!badge) return;
    if (available) {
      badge.textContent = '\uD83C\uDFA4 Dicta\u00e7\u00e3o dispon\u00edvel';
      badge.className = 'speech-badge available';
    } else {
      badge.textContent = '\uD83C\uDFA4 Dicta\u00e7\u00e3o indispon\u00edvel';
      badge.className = 'speech-badge unavailable';
    }
  }

  window.startDictation = function (fieldId, button) {
    if (!speechSupported || !recognition) {
      tryInitSpeech();
    }
    if (!speechSupported || !recognition) {
      var msg = '\uD83C\uDFA4 Ditado por voz n\u00e3o dispon\u00edvel neste navegador.\n\n';
      if (!isSecureContext()) {
        msg += 'A p\u00e1gina precisa estar em HTTPS ou localhost para\n' +
               'que o microfone funcione.\n\n\uD83D\uDC49 Publique no GitHub Pages.';
      } else {
        msg += 'Tente usar Chrome, Edge ou Safari.';
      }
      alert(msg);
      return;
    }
    if (button.classList.contains('recording')) {
      try { recognition.stop(); } catch (e) {}
      return;
    }
    resetMicButtons();
    currentTargetField = document.getElementById(fieldId);
    button.classList.add('recording');
    button.innerText = '\uD83D\uDED1';
    try {
      recognition.start();
    } catch (e) {
      console.warn('[Dictation] start() lan\u00e7ou erro:', e);
      resetMicButtons();
      alert(
        '\uD83C\uDFA4 N\u00e3o foi poss\u00edvel iniciar o reconhecimento de voz.\n\n' +
        'Verifique:\n' +
        '\u2022 O microfone est\u00e1 conectado e liberado\n' +
        '\u2022 A p\u00e1gina est\u00e1 em HTTPS ou localhost\n' +
        '\u2022 Nenhum outro app est\u00e1 usando o microfone'
      );
    }
  };

  function resetMicButtons() {
    document.querySelectorAll('.btn-mic').forEach(function (btn) {
      btn.classList.remove('recording');
      btn.innerText = '\uD83C\uDFA4';
    });
  }

  /* ===================================================================
     PROMPT GENERATION
     =================================================================== */

  function formatarData(dataStr) {
    if (!dataStr) return '';
    var partes = dataStr.split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
  }

  window.gerarPrompt = function () {
    salvarCamposAtuais();

    var faculdade = document.getElementById('faculdadeNome').value;
    var professora = document.getElementById('professoraNome').value;
    var dataFormato = formatarData(
      document.getElementById('dataPlantao').value
    );
    var dia = document.getElementById('diaEstagio').value;
    var area = document.getElementById('estagioArea').value;
    var integrantes = document.getElementById('grupoIntegrantes').value;
    var hospital = document.getElementById('hospitalNome').value;
    var hospitalDesc = document.getElementById('hospitalDescricao').value;
    var setoresAcoes = document.getElementById('setoresAcoes').value;
    var ocorrenciasExtra = document.getElementById('ocorrenciasExtra').value;
    var dificuldade = document.getElementById('dificuldade').value;
    var estudoTema = document.getElementById('estudoTema').value;
    var estudoLink = document.getElementById('estudoLink').value;
    var dcn = document.getElementById('dcnDesenvolvida').value;
    var reflexaoSemanal = document.getElementById('reflexaoSemanal').value;
    var autoavaliacao = document.getElementById('autoavaliacao').value;
    var avaliacaoProfessor = document.getElementById('avaliacaoProfessor').value;

    var modoEstrito = document.getElementById('modoEstrito').checked;
    var perguntasIA = document.getElementById('perguntasIA').checked;
    var secaoAtividades = document.getElementById('secaoAtividades').checked;
    var secaoReflexao = document.getElementById('secaoReflexao').checked;
    var secaoPesquisa = document.getElementById('secaoPesquisa').checked;
    var secaoDcn = document.getElementById('secaoDcn').checked;
    var secaoCampo = document.getElementById('secaoCampo').checked;
    var secaoProfessor = document.getElementById('secaoProfessor').checked;
    var secaoAutoavaliacao = document.getElementById('secaoAutoavaliacao').checked;

    var temReflexao = reflexaoSemanal.trim() !== '';
    var temAutoavaliacao = autoavaliacao.trim() !== '';
    var temAvaliacaoProfessor = avaliacaoProfessor.trim() !== '';

    var extraBlock = ocorrenciasExtra.trim() !== ''
      ? '\n- Atividades paralelas/ocorr\u00eancias extras atendidas na unidade: ' +
        ocorrenciasExtra
      : '';

    var grupoBlock = integrantes.trim() !== ''
      ? 'A docente discutiu o caso e realizou as orienta\u00e7\u00f5es com o grupo composto por mim e os acad\u00eamicos: ' +
        integrantes + '.'
      : 'A docente discutiu o caso e realizou as orienta\u00e7\u00f5es de forma coletiva com o grupo de alunos em campo.';

    var reflexaoBlock = temReflexao
      ? '\n- Reflex\u00e3o semanal (fornecida pelo aluno): ' + reflexaoSemanal
      : '';

    var autoavaliacaoBlock = temAutoavaliacao
      ? '\n- Autoavalia\u00e7\u00e3o (fornecida pelo aluno): ' + autoavaliacao
      : '';

    var avaliacaoProfessorBlock = temAvaliacaoProfessor
      ? '\n- Avalia\u00e7\u00e3o do professor (fornecida pelo aluno): ' + avaliacaoProfessor
      : '';

    /* ---- Contexto normativo do DOC.md ---- */
    var docContexto =
      '\n' +
      'CONTEXTO NORMATIVO DO CURSO (seguir rigorosamente):\n' +
      '- Compet\u00eancia da UC: Assistir \u00e0 crian\u00e7a, adolescente e \u00e0 mulher nos diferentes n\u00edveis de aten\u00e7\u00e3o \u00e0 sa\u00fade, com base no racioc\u00ednio cl\u00ednico e cr\u00edtico, no Processo de Enfermagem, norteado por Teorias de Enfermagem e pr\u00e1ticas de seguran\u00e7a do paciente, utilizando as taxonomias de enfermagem.\n' +
      '- DCNs: Aten\u00e7\u00e3o \u00e0 sa\u00fade, Comunica\u00e7\u00e3o, Tomada de decis\u00e3o, Educa\u00e7\u00e3o Permanente\n' +
      '- Objetivos espec\u00edficos: Integrar os fundamentos te\u00f3ricos e metodol\u00f3gicos do Processo de Enfermagem \u00e0 pr\u00e1tica assistencial; Aplicar o Processo de Enfermagem em diferentes n\u00edveis de complexidade assistencial; Executar pr\u00e1ticas assistenciais fundamentadas em princ\u00edpios cient\u00edficos, t\u00e9cnicos, \u00e9ticos e human\u00edsticos.\n' +
      '- O Webf\u00f3lio deve conter obrigatoriamente: descri\u00e7\u00e3o detalhada das atividades, reflex\u00e3o semanal, link das pesquisas realizadas, DCNs identificadas e desenvolvidas, avalia\u00e7\u00e3o do campo, avalia\u00e7\u00e3o do professor e autoavalia\u00e7\u00e3o.\n';

    /* ---- Checklist dinâmica ---- */
    var secaoItems = [];
    var num = 0;

    num++;
    secaoItems.push(
      num + '. ' + (secaoAtividades
        ? 'DESCRI\u00c7\u00c3O DETALHADA DAS ATIVIDADES REALIZADAS EM CAMPO\n' +
          '   - Setores percorridos, procedimentos executados, condutas observadas\n' +
          '   - Exames, t\u00e9cnicas (ex: Manobras de Leopold, AU, SSVV, banho do RN)\n' +
          '   - Condi\u00e7\u00f5es cl\u00ednicas das pacientes atendidas'
        : '[DESATIVADO]')
    );

    num++;
    secaoItems.push(
      num + '. ' + (secaoReflexao
        ? 'REFLEX\u00c3O SEMANAL\n' +
          '   - Aprendizado central do plant\u00e3o\n' +
          '   - Rela\u00e7\u00e3o teoria-pr\u00e1tica vivenciada\n' +
          '   - Impacto na forma\u00e7\u00e3o acad\u00eamica e profissional'
        : '[DESATIVADO]')
    );

    num++;
    secaoItems.push(
      num + '. ' + (secaoPesquisa
        ? 'LINK DAS PESQUISAS REALIZADAS\n' +
          '   - Tema estudado advindo do ensino cl\u00ednico da especialidade\n' +
          '   - Pesquisa realizada para suprir lacuna de conhecimento identificada\n' +
          '   - Refer\u00eancia com link ativo'
        : '[DESATIVADO]')
    );

    num++;
    secaoItems.push(
      num + '. ' + (secaoDcn
        ? 'DCNs IDENTIFICADAS E DESENVOLVIDAS\n' +
          '   - Diretriz Curricular Nacional trabalhada no plant\u00e3o\n' +
          '   - Como ela se materializou no racioc\u00ednio cl\u00ednico ou tomada de decis\u00e3o'
        : '[DESATIVADO]')
    );

    num++;
    secaoItems.push(
      num + '. ' + (secaoCampo
        ? 'AVALIA\u00c7\u00c3O DO CAMPO DE EST\u00c1GIO\n' +
          '   - Estrutura f\u00edsica, organiza\u00e7\u00e3o, resolutividade'
        : '[DESATIVADO]')
    );

    num++;
    secaoItems.push(
      num + '. ' + (secaoProfessor
        ? 'AVALIA\u00c7\u00c3O DO PROFESSOR\n' +
          '   - Did\u00e1tica, dom\u00ednio t\u00e9cnico, acolhimento, suporte'
        : '[DESATIVADO]')
    );

    num++;
    secaoItems.push(
      num + '. ' + (secaoAutoavaliacao
        ? 'AUTOAVALIA\u00c7\u00c3O\n' +
          '   - Seguran\u00e7a, dificuldades, proatividade, responsabilidade'
        : '[DESATIVADO]')
    );

    var checklistDinamica = secaoItems.join('\n\n');

    /* ---- Montagem do prompt ---- */
    var promptText =
      'Atue como um tutor acad\u00eamico especialista em escrita cient\u00edfica de Enfermagem para o ' +
      faculdade + '.\n' +
      '\n' +
      'Escreva um relat\u00f3rio di\u00e1rio de est\u00e1gio (Webf\u00f3lio) rigorosamente alinhado com as regras do manual de ensino cl\u00ednico para a \u00e1rea de [' +
      area + '].\n' +
      docContexto +
      '\n' +
      (modoEstrito
        ? '\u26A0\uFE0F MODO ESTRITO ATIVADO: Utilize EXCLUSIVAMENTE as informa\u00e7\u00f5es fornecidas nos campos abaixo. N\u00c3O invente, adicione ou sugira dados cl\u00ednicos (sinais vitais, diagn\u00f3sticos, condi\u00e7\u00f5es de pacientes, procedimentos) que n\u00e3o foram explicitamente relatados pelo aluno. Mantenha-se fiel ao texto original de cada campo.\n'
        : 'Voc\u00ea pode enriquecer o relat\u00f3rio com seu conhecimento t\u00e9cnico-cient\u00edfico de enfermagem, desde que seja coerente com os dados fornecidos e com a \u00e1rea de atua\u00e7\u00e3o.\n') +
      '\n' +
      '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n' +
      '\u26A0\uFE0F SE\u00c7\u00d5ES DO RELAT\u00d3RIO:\n' +
      '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n' +
      '\n' +
      'O relat\u00f3rio DEVE conter, OBRIGATORIAMENTE, TODOS os seguintes itens:\n' +
      '\n' +
      checklistDinamica +
      '\n' +
      '\n' +
      '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n' +
      'DADOS BRUTOS COLETADOS EM CAMPO:\n' +
      '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n' +
      '\n' +
      '- Temporalidade: ' + dia + ' dia de est\u00e1gio, realizado em ' + dataFormato + '.\n' +
      '- Local/Especialidade: ' + hospital + ' | Setor/\u00c1rea: ' + area + '.\n' +
      '- Supervisor Pedag\u00f3gico: Professora ' + professora + '. ' + grupoBlock + '\n' +
      '- Atividades, Setores e Condutas: ' + setoresAcoes + extraBlock + '\n' +
      '- Dificuldade Pr\u00e1tica (Lacuna de Conhecimento): ' + dificuldade + '\n' +
      '- Objeto de Estudo Te\u00f3rico: ' + estudoTema + '\n' +
      '- Link da Pesquisa Realizada: ' + estudoLink + '\n' +
      '- Diretriz Curricular (DCN) em Destaque: ' + dcn + '\n' +
      '- Infraestrutura avaliada do Campo: ' + hospitalDesc +
      reflexaoBlock + autoavaliacaoBlock + avaliacaoProfessorBlock +
      '\n' +
      '\n' +
      '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n' +
      'REGRAS DE CONSTRU\u00c7\u00c3O TEXTUAL (Siga exatamente a estrutura de 5 par\u00e1grafos + Refer\u00eancias):\n' +
      '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n' +
      '\n';

    /* ---- Parágrafos condicionais ---- */
    var paragrafos = [];

    if (secaoAtividades) {
      paragrafos.push(
        'Par\u00e1grafo 1 e 2 \u2014 ATIVIDADES EM CAMPO (itens 1 e 2 da checklist):\n' +
        'Iniciar com: "No ' + dia + ' dia de est\u00e1gio em ' + area +
        ', realizado em ' + dataFormato + ', realizei o reconhecimento de campo/atividades no ' +
        hospital + '..."\n' +
        'Descreva detalhadamente TODOS os setores percorridos (ex: Centro Obst\u00e9trico, ' +
        'Triagem, Alojamento Conjunto, Unidade de Interna\u00e7\u00e3o), din\u00e2micas observadas, ' +
        'exames, condi\u00e7\u00f5es cl\u00ednicas e a\u00e7\u00f5es de enfermagem executadas com base nas suas ' +
        'anota\u00e7\u00f5es (' + setoresAcoes + ').\n' +
        (ocorrenciasExtra.trim()
          ? 'Se houver ocorr\u00eancias extras inseridas (' + ocorrenciasExtra +
            '), mescle-as de forma fluida e t\u00e9cnica.\n'
          : '') +
        'Encerre destacando a discuss\u00e3o cl\u00ednica e a retomada pr\u00e1tica guiada pela ' +
        'Professora ' + professora + ' \u00e0 beira do leito.\n'
      );
    }

    if (secaoPesquisa) {
      paragrafos.push(
        'Par\u00e1grafo 3 \u2014 LACUNA DE CONHECIMENTO, PESQUISA E LINK CIENT\u00cdFICO (itens 3 e 4):\n' +
        'Iniciar com: "A dificuldade identificada no dia esteve relacionada a..."\n' +
        'Exponha a lacuna t\u00e9cnica baseada em (' + dificuldade + ').\n' +
        'Conecte imediatamente com a Pr\u00e1tica Baseada em Evid\u00eancias, citando:\n' +
        '"Diante disso, realizei a busca e leitura de [' + estudoTema +
        '], dispon\u00edvel em: ' + estudoLink +
        ', com a finalidade de aprimorar meu conhecimento..."\n' +
        'Justifique a import\u00e2ncia t\u00e9cnica desse estudo para a seguran\u00e7a assistencial.\n'
      );
    }

    if (secaoReflexao || secaoDcn) {
      var par4 = 'Par\u00e1grafo 4 \u2014 REFLEX\u00c3O SEMANAL E DCNs (itens 5 e 6):\n';
      if (secaoReflexao) {
        par4 +=
          'Iniciar com: "Na reflex\u00e3o semanal, identifiquei como ponto central a import\u00e2ncia de..."\n' +
          'Sintetize o aprendizado central do plant\u00e3o.' +
          (temReflexao ? ' Incorpore a reflex\u00e3o fornecida: ' + reflexaoSemanal : '') +
          '\n';
      }
      if (secaoDcn) {
        par4 +=
          'Conecte de forma expl\u00edcita o desenvolvimento da DCN [' + dcn +
          '] e como ela se materializou na tomada de decis\u00e3o ou no aprimoramento do racioc\u00ednio cl\u00ednico.\n' +
          'Cite o Parecer CNE/CES n\u00ba 64/2026 como refer\u00eancia normativa das DCNs de Enfermagem.\n';
      }
      paragrafos.push(par4);
    }

    if (secaoCampo || secaoProfessor || secaoAutoavaliacao) {
      var par5 = 'Par\u00e1grafo 5 \u2014 AVALIA\u00c7\u00d5ES (itens 7, 8 e 9 \u2014 campo, professor e autoavalia\u00e7\u00e3o):\n';
      if (secaoCampo) {
        par5 +=
          'AVALIA\u00c7\u00c3O DO CAMPO: Descreva a avalia\u00e7\u00e3o do campo de est\u00e1gio baseado em: "' +
          hospitalDesc + '".\n';
      }
      if (secaoProfessor) {
        par5 +=
          'AVALIA\u00c7\u00c3O DO PROFESSOR: Avalie a conduta da Professora ' + professora +
          ', exaltando seu dom\u00ednio, disponibilidade e suporte para constru\u00e7\u00e3o da autonomia discente.' +
          (temAvaliacaoProfessor ? ' Incorpore a avalia\u00e7\u00e3o fornecida: ' + avaliacaoProfessor : '') +
          '\n';
      }
      if (secaoAutoavaliacao) {
        par5 +=
          'AUTOAVALIA\u00c7\u00c3O: Finalize com sua autoavalia\u00e7\u00e3o pessoal (seguran\u00e7a, dificuldades, ' +
          'cautela, responsabilidade, proatividade frente \u00e0s demandas).' +
          (temAutoavaliacao ? ' Incorpore a autoavalia\u00e7\u00e3o fornecida: ' + autoavaliacao : '') +
          '\n';
      }
      paragrafos.push(par5);
    }

    promptText += paragrafos.join('\n');

    promptText +=
      '\n' +
      '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n' +
      'REFER\u00caNCIAS BIBLIOGR\u00c1FICAS (Gerar em formato ABNT):\n' +
      '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n' +
      '1. Refer\u00eancia do material estudado: [' + estudoTema +
      '], incluindo o link ativo: ' + estudoLink + '.\n' +
      '2. Refer\u00eancia padr\u00e3o obrigat\u00f3ria:\n' +
      '   BRASIL. Conselho Nacional de Educa\u00e7\u00e3o. C\u00e2mara de Educa\u00e7\u00e3o Superior. ' +
      'Parecer CNE/CES n\u00ba 64/2026. Revis\u00e3o das Diretrizes Curriculares Nacionais ' +
      'para os Cursos de Gradua\u00e7\u00e3o em Enfermagem. Bras\u00edlia, DF, 2026.\n' +
      '\n' +
      perguntasIA
        ? '\n' +
          '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n' +
          'INSTRU\u00c7\u00c3O DE REVIS\u00c3O PR\u00c9VIA:\n' +
          '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n' +
          '\n' +
          'Antes de gerar o relat\u00f3rio final, analise criticamente todos os dados fornecidos acima.\n' +
          'Identifique:\n' +
          '- Informa\u00e7\u00f5es incompletas ou vagas que precisam de detalhamento\n' +
          '- Dados contradit\u00f3rios ou que n\u00e3o fazem sentido clinicamente\n' +
          '- Lacunas t\u00e9cnicas que deveriam ser preenchidas\n' +
          '- Termos que podem estar incorretos ou mal empregados\n' +
          '- Qualquer ponto que comprometa a qualidade acad\u00eamica do relat\u00f3rio\n' +
          '\n' +
          'Fa\u00e7a no M\u00cdNIMO 5 perguntas diretas ao aluno para esclarecer esses pontos. ' +
          'As perguntas devem ser espec\u00edficas (n\u00e3o gen\u00e9ricas) e baseadas nos dados reais fornecidos.\n' +
          '\n' +
          'Exemplos de perguntas:\n' +
          '- "Voc\u00ea mencionou [procedimento X]. Poderia descrever detalhadamente como foi executado?"\n' +
          '- "Sobre [condi\u00e7\u00e3o cl\u00ednica Y], quais sinais vitais foram avaliados?"\n' +
          '- "O termo [termo Z] parece at\u00edpico para este contexto. Voc\u00ea confirma ou gostaria de corrigir?"\n' +
          '\n' +
          'Ap\u00f3s o aluno responder TODAS as perguntas, gere o relat\u00f3rio final completo ' +
          'incorporando os dados originais e as respostas fornecidas, seguindo todas as regras acima.\n'
        : '\n' +
          'Gere exclusivamente o relat\u00f3rio estruturado final com as refer\u00eancias, sem qualquer ' +
          'introdu\u00e7\u00e3o ou coment\u00e1rio informal antes ou depois da resposta.\n';

    var resultArea = document.getElementById('promptResult');
    resultArea.value = promptText;
    document.getElementById('outputArea').style.display = 'block';
    document.getElementById('outputArea').scrollIntoView({ behavior: 'smooth' });
  };

  /* ===================================================================
     COPY & CLEAR
     =================================================================== */

  window.copiarTexto = function () {
    var copyText = document.getElementById('promptResult');
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard
      .writeText(copyText.value)
      .then(function () {
        mostrarToast('Prompt copiado com sucesso!');
      })
      .catch(function () {
        alert('Prompt copiado com sucesso! Pronto para colar na sua IA.');
      });
  };

  window.limparFormulario = function () {
    document.getElementById('reportForm').reset();
    document.getElementById('outputArea').style.display = 'none';
    document.getElementById('promptResult').value = '';
    if (document.getElementById('nomeRelatorio')) {
      document.getElementById('nomeRelatorio').value = '';
    }

    var hoje = new Date();
    var dataInput = document.getElementById('dataPlantao');
    if (dataInput && !dataInput.value) {
      dataInput.value = hoje.getFullYear() + '-' +
        String(hoje.getMonth() + 1).padStart(2, '0') + '-' +
        String(hoje.getDate()).padStart(2, '0');
    }

    autoSalvar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  function mostrarToast(mensagem) {
    var toast = document.getElementById('feedbackToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'feedbackToast';
      toast.className = 'feedback-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = mensagem;
    toast.style.display = 'block';
    setTimeout(function () {
      toast.style.display = 'none';
    }, 3000);
  }

  /* ===================================================================
     INIT
     =================================================================== */

  document.addEventListener('DOMContentLoaded', function () {
    var hoje = new Date();
    var ano = hoje.getFullYear();
    var mes = String(hoje.getMonth() + 1).padStart(2, '0');
    var dia = String(hoje.getDate()).padStart(2, '0');
    var dataInput = document.getElementById('dataPlantao');
    if (dataInput && !dataInput.value) {
      dataInput.value = ano + '-' + mes + '-' + dia;
    }

    /* Restaurar sessão e tema */
    var state = lerAppState();
    if (state && state.theme) {
      aplicarTema(state.theme);
    }
    restaurarSessao();

    /* Auto-save listeners */
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

    /* Enable/disable excluir button based on checkboxes */
    document.addEventListener('change', function (e) {
      if (e.target.classList.contains('sessao-check')) {
        var checks = document.querySelectorAll('.sessao-check:checked');
        document.getElementById('btnExcluirSelecionadas').disabled =
          checks.length === 0;
      }
    });

    /* Inicializar speech */
    tryInitSpeech();
  });

})();
