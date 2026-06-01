(function () {
  'use strict';

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
      console.warn('[Dictation] Web Speech API não encontrada neste navegador.');
      updateSpeechStatus(false, 'API não suportada');
      return;
    }
    try {
      recognition = new SR();
    } catch (e) {
      console.warn('[Dictation] Erro ao criar SpeechRecognition:', e);
      updateSpeechStatus(false, 'Falha na criação');
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
            '🎤 Microfone bloqueado pelo navegador.\n\n' +
            'Esta página está sendo aberta como arquivo local (file://).\n' +
            'O reconhecimento de voz SÓ funciona se a página estiver online\n' +
            '(HTTPS) ou em localhost.\n\n' +
            '👉 Publique no GitHub Pages ou use "npx serve" para testar.'
          );
        } else {
          alert(
            '🎤 Acesso ao microfone negado.\n\n' +
            'Clique no ícone de "cadeado" na barra de endereço do navegador\n' +
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
        : 'Ditado por voz indisponível' + (reason ? ' — ' + reason : '');
      btn.style.opacity = available ? '1' : '0.5';
      btn.disabled = !available;
    });
    var badge = document.getElementById('speechBadge');
    if (!badge) return;
    if (available) {
      badge.textContent = '🎤 Dictação disponível';
      badge.className = 'speech-badge available';
    } else {
      badge.textContent = '🎤 Dictação indisponível';
      badge.className = 'speech-badge unavailable';
    }
  }

  window.startDictation = function (fieldId, button) {
    if (!speechSupported || !recognition) {
      tryInitSpeech();
    }
    if (!speechSupported || !recognition) {
      var msg = '🎤 Ditado por voz não disponível neste navegador.\n\n';
      if (!isSecureContext()) {
        msg += 'A página precisa estar em HTTPS ou localhost para\n' +
               'que o microfone funcione.\n\n👉 Publique no GitHub Pages.';
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
    button.innerText = '🛑';
    try {
      recognition.start();
    } catch (e) {
      console.warn('[Dictation] start() lançou erro:', e);
      resetMicButtons();
      alert(
        '🎤 Não foi possível iniciar o reconhecimento de voz.\n\n' +
        'Verifique:\n' +
        '• O microfone está conectado e liberado\n' +
        '• A página está em HTTPS ou localhost\n' +
        '• Nenhum outro app está usando o microfone'
      );
    }
  };

  function resetMicButtons() {
    document.querySelectorAll('.btn-mic').forEach(function (btn) {
      btn.classList.remove('recording');
      btn.innerText = '🎤';
    });
  }

  function formatarData(dataStr) {
    if (!dataStr) return '';
    const partes = dataStr.split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
  }

  window.gerarPrompt = function () {
    const faculdade = document.getElementById('faculdadeNome').value;
    const professora = document.getElementById('professoraNome').value;
    const dataFormato = formatarData(
      document.getElementById('dataPlantao').value
    );
    const dia = document.getElementById('diaEstagio').value;
    const area = document.getElementById('estagioArea').value;
    const integrantes = document.getElementById('grupoIntegrantes').value;
    const hospital = document.getElementById('hospitalNome').value;
    const hospitalDesc = document.getElementById('hospitalDescricao').value;
    const setoresAcoes = document.getElementById('setoresAcoes').value;
    const ocorrenciasExtra =
      document.getElementById('ocorrenciasExtra').value;
    const dificuldade = document.getElementById('dificuldade').value;
    const estudoTema = document.getElementById('estudoTema').value;
    const estudoLink = document.getElementById('estudoLink').value;
    const dcn = document.getElementById('dcnDesenvolvida').value;

    // Novos campos opcionais
    const reflexaoSemanal =
      document.getElementById('reflexaoSemanal').value;
    const autoavaliacao = document.getElementById('autoavaliacao').value;
    const avaliacaoProfessor =
      document.getElementById('avaliacaoProfessor').value;

    const temReflexao = reflexaoSemanal.trim() !== '';
    const temAutoavaliacao = autoavaliacao.trim() !== '';
    const temAvaliacaoProfessor = avaliacaoProfessor.trim() !== '';

    let extraBlock =
      ocorrenciasExtra.trim() !== ''
        ? '\n- Atividades paralelas/ocorrências extras atendidas na unidade: ' +
          ocorrenciasExtra
        : '';
    let grupoBlock =
      integrantes.trim() !== ''
        ? 'A docente discutiu o caso e realizou as orientações com o grupo composto por mim e os acadêmicos: ' +
          integrantes +
          '.'
        : 'A docente discutiu o caso e realizou as orientações de forma coletiva com o grupo de alunos em campo.';

    let reflexaoBlock = '';
    if (temReflexao) {
      reflexaoBlock =
        '\n- Reflexão semanal (fornecida pelo aluno): ' + reflexaoSemanal;
    }

    let autoavaliacaoBlock = '';
    if (temAutoavaliacao) {
      autoavaliacaoBlock =
        '\n- Autoavaliação (fornecida pelo aluno): ' + autoavaliacao;
    }

    let avaliacaoProfessorBlock = '';
    if (temAvaliacaoProfessor) {
      avaliacaoProfessorBlock =
        '\n- Avaliação do professor (fornecida pelo aluno): ' +
        avaliacaoProfessor;
    }

    // Montagem do prompt aprimorado
    const promptText =
      'Atue como um tutor acadêmico especialista em escrita científica de Enfermagem para o ' +
      faculdade +
      '.\n' +
      '\n' +
      'Escreva um relatório diário de estágio (Webfólio) rigorosamente alinhado com as regras do manual de ensino clínico para a área de [' +
      area +
      '].\n' +
      '\n' +
      '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n' +
      '⚠️ ATENÇÃO — SEÇÕES OBRIGATÓRIAS (NÃO OMITIR NENHUMA):\n' +
      '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n' +
      '\n' +
      'O relatório DEVE conter, OBRIGATORIAMENTE, TODOS os seguintes itens:\n' +
      '\n' +
      '1. DESCRIÇÃO DETALHADA DAS ATIVIDADES REALIZADAS EM CAMPO\n' +
      '   - Setores percorridos, procedimentos executados, condutas observadas\n' +
      '   - Exames, técnicas (ex: Manobras de Leopold, AU, SSVV, banho do RN)\n' +
      '   - Condições clínicas das pacientes atendidas\n' +
      '\n' +
      '2. REFLEXÃO SEMANAL\n' +
      '   - Aprendizado central do plantão\n' +
      '   - Relação teoria-prática vivenciada\n' +
      '   - Impacto na formação acadêmica e profissional\n' +
      '\n' +
      '3. LINK DAS PESQUISAS REALIZADAS\n' +
      '   - Tema estudado advindo do ensino clínico da especialidade\n' +
      '   - Pesquisa realizada para suprir lacuna de conhecimento identificada\n' +
      '   - Referência com link ativo\n' +
      '\n' +
      '4. DCNs IDENTIFICADAS E DESENVOLVIDAS\n' +
      '   - Diretriz Curricular Nacional trabalhada no plantão\n' +
      '   - Como ela se materializou no raciocínio clínico ou tomada de decisão\n' +
      '\n' +
      '5. AVALIAÇÃO DO CAMPO DE ESTÁGIO\n' +
      '   - Estrutura física, organização, resolutividade\n' +
      '\n' +
      '6. AVALIAÇÃO DO PROFESSOR\n' +
      '   - Didática, domínio técnico, acolhimento, suporte\n' +
      '\n' +
      '7. AUTOAVALIAÇÃO\n' +
      '   - Segurança, dificuldades, proatividade, responsabilidade\n' +
      '\n' +
      '📌 IMPORTANTE: Cada estágio tem suas particularidades — adapte o relatório ' +
      'à realidade do campo vivenciado, mas NÃO OMITA nenhuma das seções ' +
      'obrigatórias listadas acima.\n' +
      '\n' +
      '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n' +
      'DADOS BRUTOS COLETADOS EM CAMPO:\n' +
      '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n' +
      '\n' +
      '- Temporalidade: ' +
      dia +
      ' dia de estágio, realizado em ' +
      dataFormato +
      '.\n' +
      '- Local/Especialidade: ' +
      hospital +
      ' | Setor/Área: ' +
      area +
      '.\n' +
      '- Supervisor Pedagógico: Professora ' +
      professora +
      '. ' +
      grupoBlock +
      '\n' +
      '- Atividades, Setores e Condutas: ' +
      setoresAcoes +
      extraBlock +
      '\n' +
      '- Dificuldade Prática (Lacuna de Conhecimento): ' +
      dificuldade +
      '\n' +
      '- Objeto de Estudo Teórico: ' +
      estudoTema +
      '\n' +
      '- Link da Pesquisa Realizada: ' +
      estudoLink +
      '\n' +
      '- Diretriz Curricular (DCN) em Destaque: ' +
      dcn +
      '\n' +
      '- Infraestrutura avaliada do Campo: ' +
      hospitalDesc +
      reflexaoBlock +
      autoavaliacaoBlock +
      avaliacaoProfessorBlock +
      '\n' +
      '\n' +
      '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n' +
      'REGRAS DE CONSTRUÇÃO TEXTUAL (Siga exatamente a estrutura de 5 parágrafos + Referências):\n' +
      '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n' +
      '\n' +
      'Parágrafo 1 e 2 — ATIVIDADES EM CAMPO (itens 1 e 2 da checklist):\n' +
      'Iniciar com: "No ' +
      dia +
      ' dia de estágio em ' +
      area +
      ', realizado em ' +
      dataFormato +
      ', realizei o reconhecimento de campo/atividades no ' +
      hospital +
      '..."\n' +
      'Descreva detalhadamente TODOS os setores percorridos (ex: Centro Obstétrico, ' +
      'Triagem, Alojamento Conjunto, Unidade de Internação), dinâmicas observadas, ' +
      'exames, condições clínicas e ações de enfermagem executadas com base nas suas ' +
      'anotações (' +
      setoresAcoes +
      ').\n' +
      (ocorrenciasExtra.trim()
        ? 'Se houver ocorrências extras inseridas (' +
          ocorrenciasExtra +
          '), mescle-as de forma fluida e técnica.\n'
        : '') +
      'Encerre destacando a discussão clínica e a retomada prática guiada pela ' +
      'Professora ' +
      professora +
      ' à beira do leito.\n' +
      '\n' +
      'Parágrafo 3 — LACUNA DE CONHECIMENTO, PESQUISA E LINK CIENTÍFICO (itens 3 e 4):\n' +
      'Iniciar com: "A dificuldade identificada no dia esteve relacionada a..."\n' +
      'Exponha a lacuna técnica baseada em (' +
      dificuldade +
      ').\n' +
      'Conecte imediatamente com a Prática Baseada em Evidências, citando:\n' +
      '"Diante disso, realizei a busca e leitura de [' +
      estudoTema +
      '], disponível em: ' +
      estudoLink +
      ', com a finalidade de aprimorar meu conhecimento..."\n' +
      'Justifique a importância técnica desse estudo para a segurança assistencial.\n' +
      '\n' +
      'Parágrafo 4 — REFLEXÃO SEMANAL E DCNs (itens 5 e 6):\n' +
      'Iniciar com: "Na reflexão semanal, identifiquei como ponto central a importância de..."\n' +
      'Sintetize o aprendizado central do plantão.' +
      (temReflexao
        ? ' Incorpore a reflexão fornecida: ' + reflexaoSemanal
        : '') +
      '\n' +
      'Conecte de forma explícita o desenvolvimento da DCN [' +
      dcn +
      '] e como ela se ' +
      'materializou na tomada de decisão ou no aprimoramento do raciocínio clínico.\n' +
      'Cite o Parecer CNE/CES nº 64/2026 como referência normativa das DCNs de Enfermagem.\n' +
      '\n' +
      'Parágrafo 5 — AVALIAÇÕES (itens 7, 8 e 9 — campo, professor e autoavaliação):\n' +
      'AVALIAÇÃO DO CAMPO: Descreva a avaliação do campo de estágio baseado em: "' +
      hospitalDesc +
      '".\n' +
      'AVALIAÇÃO DO PROFESSOR: Avalie a conduta da Professora ' +
      professora +
      ', exaltando seu domínio, disponibilidade e suporte para construção da autonomia discente.' +
      (temAvaliacaoProfessor
        ? ' Incorpore a avaliação fornecida: ' + avaliacaoProfessor
        : '') +
      '\n' +
      'AUTOAVALIAÇÃO: Finalize com sua autoavaliação pessoal (segurança, dificuldades, ' +
      'cautela, responsabilidade, proatividade frente às demandas).' +
      (temAutoavaliacao
        ? ' Incorpore a autoavaliação fornecida: ' + autoavaliacao
        : '') +
      '\n' +
      '\n' +
      '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n' +
      'REFERÊNCIAS BIBLIOGRÁFICAS (Gerar em formato ABNT):\n' +
      '=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n' +
      '1. Referência do material estudado: [' +
      estudoTema +
      '], incluindo o link ativo: ' +
      estudoLink +
      '.\n' +
      '2. Referência padrão obrigatória:\n' +
      '   BRASIL. Conselho Nacional de Educação. Câmara de Educação Superior. ' +
      'Parecer CNE/CES nº 64/2026. Revisão das Diretrizes Curriculares Nacionais ' +
      'para os Cursos de Graduação em Enfermagem. Brasília, DF, 2026.\n' +
      '\n' +
      'Gere exclusivamente o relatório estruturado final com as referências, sem qualquer ' +
      'introdução ou comentário informal antes ou depois da resposta.';

    const resultArea = document.getElementById('promptResult');
    resultArea.value = promptText;
    document.getElementById('outputArea').style.display = 'block';
    document.getElementById('outputArea').scrollIntoView({ behavior: 'smooth' });
  };

  window.copiarTexto = function () {
    const copyText = document.getElementById('promptResult');
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
    if (
      !confirm('Tem certeza que deseja limpar todos os campos do formulário?')
    )
      return;
    document.getElementById('reportForm').reset();
    document.getElementById('outputArea').style.display = 'none';
    document.getElementById('promptResult').value = '';
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

  // Inicializa data com hoje e tenta ativar o reconhecimento de voz
  document.addEventListener('DOMContentLoaded', function () {
    var hoje = new Date();
    var ano = hoje.getFullYear();
    var mes = String(hoje.getMonth() + 1).padStart(2, '0');
    var dia = String(hoje.getDate()).padStart(2, '0');
    var dataInput = document.getElementById('dataPlantao');
    if (dataInput && !dataInput.value) {
      dataInput.value = ano + '-' + mes + '-' + dia;
    }
    // Tenta inicializar o speech recognition (atualiza o visual dos botões)
    tryInitSpeech();
  });
})();
