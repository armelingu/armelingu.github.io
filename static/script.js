document.addEventListener("DOMContentLoaded", () => {
  const itensMenu = document.querySelectorAll(".item-menu");
  const secoesConteudo = document.querySelectorAll(".secao-conteudo");

  /**
   * Ativa uma seção com animação
   * @param {string} nomeSecao
   * @param {boolean} atualizarUrl
   */
  function ativarSecao(nomeSecao, atualizarUrl = true) {
    const secaoAtual = document.querySelector(
      ".secao-conteudo:not([hidden])"
    );

    const proximaSecao = document.querySelector(
      `.secao-conteudo[data-secao="${nomeSecao}"]`
    );

    if (!proximaSecao || secaoAtual === proximaSecao) return;

    // anima saída
    if (secaoAtual) {
      secaoAtual.classList.add("secao-saindo");
    }

    setTimeout(() => {
      if (secaoAtual) {
        secaoAtual.hidden = true;
        secaoAtual.classList.remove("secao-saindo");
      }

      proximaSecao.hidden = false;
      proximaSecao.classList.add("secao-entrando");

      // força reflow
      proximaSecao.offsetHeight;

      proximaSecao.classList.remove("secao-entrando");
    }, 200);

    // reseta contato quando sair ou re-entrar na seção
    resetarContato();

    // menu ativo + aria-current para acessibilidade/SEO
    itensMenu.forEach(botao => {
      const eAtivo = botao.dataset.secao === nomeSecao;
      botao.classList.toggle("ativo", eAtivo);
      botao.setAttribute("aria-current", eAtivo ? "true" : "false");
    });

    // atualiza URL
    if (atualizarUrl) {
      history.pushState({ secao: nomeSecao }, "", `#${nomeSecao}`);
    }
  }

  // clique no menu
  itensMenu.forEach(botao => {
    botao.addEventListener("click", () => {
      ativarSecao(botao.dataset.secao);
    });
  });

  // ao usar voltar / avançar do navegador
  window.addEventListener("popstate", () => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      ativarSecao(hash, false);
    }
  });

  // inicialização ao carregar página
  // SEO: o HTML não usa hidden para que crawlers indexem todo o conteúdo.
  // O JS esconde as seções inativas no carregamento.
  const hashInicial = window.location.hash.replace("#", "");
  const secaoInicial =
    hashInicial ||
    document.querySelector(".item-menu.ativo")?.dataset.secao ||
    itensMenu[0].dataset.secao;

  // esconde todas as seções, depois ativa a inicial
  secoesConteudo.forEach(secao => {
    if (secao.dataset.secao !== secaoInicial) {
      secao.hidden = true;
    }
  });

  // marca o menu correto
  itensMenu.forEach(botao => {
    botao.classList.toggle("ativo", botao.dataset.secao === secaoInicial);
  });

  // =============================
  //  COPIAR EMAIL AO CLICAR
  // =============================
  document.querySelectorAll(".copiavel").forEach((botao) => {
    botao.addEventListener("click", async () => {
      const valor = botao.dataset.copiar;
      const textoOriginal = botao.textContent;

      try {
        await navigator.clipboard.writeText(valor);
        botao.textContent = idiomaAtual === "en" ? "Copied!" : "Copiado!";
      } catch {
        botao.textContent = idiomaAtual === "en" ? "Copy error" : "Erro ao copiar";
      }

      setTimeout(() => {
        botao.textContent = textoOriginal;
      }, 2000);
    });
  });

  // =============================
  //  FORMULÁRIO DE CONTATO
  // =============================
  const formulario = document.querySelector(".formulario-contato");
  const overlaySucesso = document.querySelector(".envio-sucesso");

  /**
   * Efeito typewriter — digita texto caractere por caractere
   * @param {HTMLElement} el — elemento onde digitar
   * @param {string} texto — texto completo
   * @param {number} velocidade — ms por caractere
   * @returns {Promise}
   */
  function typewriter(el, texto, velocidade = 50) {
    return new Promise(resolve => {
      el.textContent = "";
      el.classList.remove("digitado");
      let i = 0;
      const intervalo = setInterval(() => {
        el.textContent += texto[i];
        i++;
        if (i >= texto.length) {
          clearInterval(intervalo);
          el.classList.add("digitado");
          resolve();
        }
      }, velocidade);
    });
  }

  // referências extras da seção contato
  const descContato = document.querySelector(".descricao-contato");

  /**
   * Mostra a animação de sucesso pós-envio
   * Permanece até o usuário trocar de seção ou recarregar
   */
  async function mostrarSucessoEnvio() {
    if (!overlaySucesso || !formulario) return;

    const mensagemEl = overlaySucesso.querySelector(".sucesso-mensagem");
    const subEl = overlaySucesso.querySelector(".sucesso-sub");

    // esconde form e descrição, mostra overlay
    formulario.style.display = "none";
    if (descContato) descContato.style.display = "none";
    overlaySucesso.removeAttribute("hidden");
    overlaySucesso.style.display = "flex";

    // reset animação do sub
    subEl.style.animation = "none";
    subEl.offsetHeight;
    subEl.style.animation = "";

    // mensagem no idioma correto
    const msg = idiomaAtual === "en"
      ? "Gustavo has received your message!"
      : "Gustavo já recebeu sua mensagem!";

    await typewriter(mensagemEl, msg, 45);
  }

  /**
   * Reseta a seção de contato para o estado original (form visível)
   */
  function resetarContato() {
    if (!overlaySucesso || !formulario) return;

    overlaySucesso.style.display = "";
    overlaySucesso.setAttribute("hidden", "");
    formulario.style.display = "";
    if (descContato) descContato.style.display = "";
    formulario.reset();

    const botao = formulario.querySelector(".botao-enviar");
    if (botao) {
      botao.textContent = idiomaAtual === "en" ? "Send message" : "Enviar mensagem";
      botao.classList.remove("sucesso", "enviando");
      botao.disabled = false;
    }
  }

  if (formulario) {
    formulario.addEventListener("submit", async (e) => {
      e.preventDefault();

      const botao = formulario.querySelector(".botao-enviar");

      // estado: enviando
      botao.textContent = idiomaAtual === "en" ? "Sending..." : "Enviando...";
      botao.disabled = true;
      botao.classList.add("enviando");

      try {
        const resposta = await fetch(formulario.action, {
          method: "POST",
          body: new FormData(formulario),
          headers: { Accept: "application/json" },
        });

        if (resposta.ok) {
          botao.classList.remove("enviando");
          mostrarSucessoEnvio();
        } else {
          throw new Error("Erro no envio");
        }
      } catch {
        // estado: erro
        botao.textContent = idiomaAtual === "en" ? "Send error" : "Erro ao enviar";
        botao.classList.remove("enviando");
        botao.classList.add("erro");

        setTimeout(() => {
          botao.textContent = idiomaAtual === "en" ? "Send message" : "Enviar mensagem";
          botao.classList.remove("erro");
          botao.disabled = false;
        }, 3000);
      }
    });
  }

  // =============================
  //  INTERNACIONALIZAÇÃO (i18n)
  // =============================

  const traducoes = {
    pt: {
      // header
      "header.subtitle": "Desenvolvedor Backend",
      "header.cv": "Baixar CV",

      // menu
      "menu.sobre": "Sobre Mim",
      "menu.habilidades": "Habilidades",
      "menu.projetos": "Projetos",
      "menu.experiencia": "Experiência",
      "menu.formacao": "Formação",
      "menu.contato": "Contato",

      // sobre
      "sobre.titulo": "Sobre Mim",
      "sobre.p1": "Desenvolvedor backend com 2 anos de experiência construindo sistemas internos que rodam em produção. Na HBR Aviação, criei uma intranet usada diariamente por mais de 300 colaboradores, além de sistemas de gestão de ativos de TI, controle predial e automações que eliminaram processos manuais.",
      "sobre.p2": "Trabalho com Python (Flask, FastAPI), bancos relacionais (MySQL, PostgreSQL), Redis, Docker e deploy on-premise com Linux, Apache e Systemd.",
      "sobre.card_titulo": "O que eu entrego",
      "sobre.esp1": "APIs REST em Python com Flask e FastAPI",
      "sobre.esp2": "Sistemas web internos com autenticação e permissões",
      "sobre.esp3": "Integrações com ERPs (Protheus) e sistemas legados",
      "sobre.esp4": "Deploy on-premise com Docker, Apache e Systemd",
      "sobre.esp5": "Automação de processos que antes eram manuais",

      // habilidades
      "hab.titulo": "Habilidades",
      "hab.b1": "Python com Flask e FastAPI",
      "hab.b2": "Arquitetura de APIs RESTful",
      "hab.b3": "Sistemas em tempo real com WebSocket",
      "hab.banco": "Banco de Dados",
      "hab.db1": "Relacionais: MySQL, PostgreSQL, SQLite",
      "hab.db2": "Redis para cache, mensageria e estado",
      "hab.db3": "Modelagem relacional e normalização",
      "hab.infra": "Infra & Operações",
      "hab.i1": "Docker e Docker Compose",
      "hab.i2": "Linux (Ubuntu / Debian)",
      "hab.i3": "Gerenciamento com Systemd",
      "hab.frontend": "Frontend & Integrações",
      "hab.f1": "Templates server-side com Jinja2",
      "hab.f2": "Integração com ERPs corporativos",
      "hab.f3": "Orquestração de APIs externas",
      "hab.ia": "Dev com IA",
      "hab.ia_prompt": "Prompt Engineering",
      "hab.ia_code": "Code Review com IA",

      // projetos
      "proj.titulo": "Projetos",
      "proj.tag_prod": "Produção",
      "proj.tag_pessoal": "Pessoal",
      "proj.desc1": "Sistema web para cadastro, gestão e monitoramento de ativos de TI. Desenvolvido em Flask com deploy on-premise via Apache e Systemd. Usado internamente na HBR Aviação.",
      "proj.desc2": "Sistema de gestão completa de estoque de materiais prediais. Controle de entradas, saídas, fornecedores e relatórios para a equipe de facilities da HBR Aviação.",
      "proj.desc3": "Sistema de pagamentos com controle de vendas, clientes e transações. Projeto pessoal para praticar arquitetura de aplicações financeiras.",

      // experiencia
      "exp.titulo": "Experiência",
      "exp.cargo": "Desenvolvedor Backend",
      "exp.periodo": "2024 - Atual",
      "exp.desc": "Responsável pelo desenvolvimento de sistemas internos usados em produção por mais de 300 colaboradores, desde a arquitetura até o deploy em servidores on-premise.",
      "exp.ativ1": "Construí a intranet da empresa do zero — usada por 300+ usuários diariamente",
      "exp.ativ2": "Desenvolvi o Portal TI Manager para gestão e monitoramento de ativos de TI",
      "exp.ativ3": "Criei o sistema de Controle Predial para gestão de estoque de materiais",
      "exp.ativ4": "Implementei integrações com o ERP Protheus via APIs REST",
      "exp.ativ5": "Configurei deploys on-premise com Apache, Systemd e Docker",

      // formação
      "form.titulo": "Formação & Certificações",
      "form.academica": "Formação Acadêmica",
      "form.curso": "Análise e Desenvolvimento de Sistemas",
      "form.periodo": "Em andamento",
      "form.grau": "Tecnólogo",
      "form.certs_titulo": "Certificações",
      "form.cert1_emissor": "Amazon Web Services · Em preparação",
      "form.cert2_emissor": "Python Institute · Em preparação",
      "form.cert3_emissor": "Docker · Em preparação",

      // contato
      "contato.titulo": "Contato",
      "contato.desc": "Quer conversar sobre projetos, freelas ou oportunidades? Preencha o formulário abaixo!",
      "contato.label_nome": "Nome",
      "contato.ph_nome": "Seu nome completo",
      "contato.ph_email": "seu@email.com",
      "contato.label_assunto": "Assunto",
      "contato.ph_assunto": "Sobre o que você quer falar?",
      "contato.label_msg": "Mensagem",
      "contato.ph_msg": "Escreva sua mensagem aqui...",
      "contato.btn_enviar": "Enviar mensagem",
      "contato.sucesso_sub": "Responderei o mais breve possível.",

      // sidebar
      "sidebar.titulo": "Contato Rápido",
      "sidebar.localizacao": "Localização",
      "sidebar.cidade": "São Paulo, Brasil",
      "sidebar.disponibilidade": "Disponibilidade",
      "sidebar.status": "Aberto a novas oportunidades",
    },

    en: {
      // header
      "header.subtitle": "Backend Developer",
      "header.cv": "Download CV",

      // menu
      "menu.sobre": "About Me",
      "menu.habilidades": "Skills",
      "menu.projetos": "Projects",
      "menu.experiencia": "Experience",
      "menu.formacao": "Education",
      "menu.contato": "Contact",

      // sobre
      "sobre.titulo": "About Me",
      "sobre.p1": "Backend developer with 2 years of experience building internal systems that run in production. At HBR Aviation, I built an intranet used daily by over 300 employees, as well as IT asset management systems, building maintenance control and automations that eliminated manual processes.",
      "sobre.p2": "I work with Python (Flask, FastAPI), relational databases (MySQL, PostgreSQL), Redis, Docker and on-premise deployment with Linux, Apache and Systemd.",
      "sobre.card_titulo": "What I deliver",
      "sobre.esp1": "REST APIs in Python with Flask and FastAPI",
      "sobre.esp2": "Internal web systems with authentication and permissions",
      "sobre.esp3": "ERP integrations (Protheus) and legacy systems",
      "sobre.esp4": "On-premise deployment with Docker, Apache and Systemd",
      "sobre.esp5": "Automation of previously manual processes",

      // habilidades
      "hab.titulo": "Skills",
      "hab.b1": "Python with Flask and FastAPI",
      "hab.b2": "RESTful API Architecture",
      "hab.b3": "Real-time systems with WebSocket",
      "hab.banco": "Database",
      "hab.db1": "Relational: MySQL, PostgreSQL, SQLite",
      "hab.db2": "Redis for caching, messaging and state",
      "hab.db3": "Relational modeling and normalization",
      "hab.infra": "Infra & Operations",
      "hab.i1": "Docker and Docker Compose",
      "hab.i2": "Linux (Ubuntu / Debian)",
      "hab.i3": "Service management with Systemd",
      "hab.frontend": "Frontend & Integrations",
      "hab.f1": "Server-side templates with Jinja2",
      "hab.f2": "Corporate ERP integration",
      "hab.f3": "External API orchestration",
      "hab.ia": "AI-Augmented Dev",
      "hab.ia_prompt": "Prompt Engineering",
      "hab.ia_code": "AI Code Review",

      // projetos
      "proj.titulo": "Projects",
      "proj.tag_prod": "Production",
      "proj.tag_pessoal": "Personal",
      "proj.desc1": "Web system for registration, management and monitoring of IT assets. Built with Flask and deployed on-premise via Apache and Systemd. Used internally at HBR Aviation.",
      "proj.desc2": "Complete building materials inventory management system. Tracks entries, exits, suppliers and reports for the facilities team at HBR Aviation.",
      "proj.desc3": "Payment system with sales, customer and transaction management. Personal project to practice financial application architecture.",

      // experiencia
      "exp.titulo": "Experience",
      "exp.cargo": "Backend Developer",
      "exp.periodo": "2024 - Present",
      "exp.desc": "Responsible for developing internal systems used in production by over 300 employees, from architecture to deployment on on-premise servers.",
      "exp.ativ1": "Built the company intranet from scratch — used by 300+ users daily",
      "exp.ativ2": "Developed Portal TI Manager for IT asset management and monitoring",
      "exp.ativ3": "Created the Building Maintenance system for materials inventory control",
      "exp.ativ4": "Implemented integrations with Protheus ERP via REST APIs",
      "exp.ativ5": "Configured on-premise deployments with Apache, Systemd and Docker",

      // formação
      "form.titulo": "Education & Certifications",
      "form.academica": "Academic Education",
      "form.curso": "Systems Analysis and Development",
      "form.periodo": "In progress",
      "form.grau": "Associate Degree",
      "form.certs_titulo": "Certifications",
      "form.cert1_emissor": "Amazon Web Services · In preparation",
      "form.cert2_emissor": "Python Institute · In preparation",
      "form.cert3_emissor": "Docker · In preparation",

      // contato
      "contato.titulo": "Contact",
      "contato.desc": "Want to chat about projects, freelance work or opportunities? Fill out the form below!",
      "contato.label_nome": "Name",
      "contato.ph_nome": "Your full name",
      "contato.ph_email": "your@email.com",
      "contato.label_assunto": "Subject",
      "contato.ph_assunto": "What would you like to talk about?",
      "contato.label_msg": "Message",
      "contato.ph_msg": "Write your message here...",
      "contato.btn_enviar": "Send message",
      "contato.sucesso_sub": "I'll reply as soon as possible.",

      // sidebar
      "sidebar.titulo": "Quick Contact",
      "sidebar.localizacao": "Location",
      "sidebar.cidade": "São Paulo, Brazil",
      "sidebar.disponibilidade": "Availability",
      "sidebar.status": "Open to new opportunities",
    }
  };

  // idioma atual — restaura do localStorage ou usa pt como padrão
  let idiomaAtual = localStorage.getItem("portfolio-lang") || "pt";

  /**
   * Aplica todas as traduções da língua selecionada
   * @param {string} lang — "pt" ou "en"
   */
  function aplicarIdioma(lang) {
    const textos = traducoes[lang];
    if (!textos) return;

    // troca textContent de todos os [data-i18n]
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const chave = el.getAttribute("data-i18n");
      if (textos[chave] !== undefined) {
        el.textContent = textos[chave];
      }
    });

    // troca placeholder de todos os [data-i18n-placeholder]
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const chave = el.getAttribute("data-i18n-placeholder");
      if (textos[chave] !== undefined) {
        el.placeholder = textos[chave];
      }
    });

    // atualiza o atributo lang do HTML
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";

    // atualiza visual do botão
    const btnAtivo = document.querySelector(".idioma-ativo");
    const btnInativo = document.querySelector(".idioma-inativo");
    const btnIdioma = document.getElementById("btn-idioma");

    if (btnAtivo && btnInativo) {
      btnAtivo.textContent = lang.toUpperCase();
      btnInativo.textContent = lang === "pt" ? "EN" : "PT";
    }

    if (btnIdioma) {
      btnIdioma.title = lang === "pt" ? "Switch to English" : "Mudar para Português";
    }

    // CSS para badge "em preparação"
    document.documentElement.setAttribute("data-lang", lang);

    // salva preferência
    localStorage.setItem("portfolio-lang", lang);
    idiomaAtual = lang;
  }

  // botão de troca
  const btnIdioma = document.getElementById("btn-idioma");
  if (btnIdioma) {
    btnIdioma.addEventListener("click", () => {
      const novoIdioma = idiomaAtual === "pt" ? "en" : "pt";
      aplicarIdioma(novoIdioma);
    });
  }

  // aplica idioma salvo (ou padrão pt) no carregamento
  if (idiomaAtual !== "pt") {
    aplicarIdioma(idiomaAtual);
  }
});
