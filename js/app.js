(() => {
  const params = new URLSearchParams(location.search);
  const ux = 1; // Experiencia elegida: Teleprompter sagrado
  const STORAGE_KEY = "fr225-clase-sync-v1";
  const DURATION = (window.COURSE?.durationMin || 90) * 60;

  const els = {
    courseLabel: document.querySelector("[data-course]"),
    uxLabel: document.querySelector("[data-ux-label]"),
    slideIndex: document.querySelector("[data-slide-index]"),
    progress: document.querySelector("[data-progress]"),
    timer: document.querySelector("[data-timer]"),
    btnTimer: document.querySelector("[data-timer-toggle]"),
    btnPrev: document.querySelector("[data-prev]"),
    btnNext: document.querySelector("[data-next]"),
    btnMenu: document.querySelector("[data-menu]"),
    btnVistaMaestro: document.querySelector("[data-vista='maestro']"),
    btnVistaAlumnos: document.querySelector("[data-vista='alumnos']"),
    menu: document.querySelector("[data-side-menu]"),
    toc: document.querySelector("[data-toc]"),
    stage: document.querySelector("[data-stage]"),
    tvChrome: document.querySelector("[data-tv-chrome]"),
  };

  let vista =
    params.get("vista") ||
    (window.matchMedia("(max-width: 820px)").matches ? "maestro" : "alumnos");
  let index = 0;
  let remaining = DURATION;
  let timerRunning = false;
  let timerId = null;
  let applyingRemote = false;

  const slides = window.SLIDES || [];

  document.body.classList.add("ux-1");
  boot();

  function boot() {
    restoreState();
    setVista(vista, false);
    renderToc();
    go(index);
    bind();
    updateTimerDisplay();
    if (els.courseLabel) {
      els.courseLabel.textContent = `${COURSE.title} · ${COURSE.lessons}`;
    }
    if (els.uxLabel) {
      els.uxLabel.textContent = COURSE.experienceName || "Teleprompter sagrado";
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("keydown", onKey);
    bindFocusChrome();
  }

  function bind() {
    document.querySelectorAll("[data-prev]").forEach((btn) => {
      btn.addEventListener("click", () => go(index - 1));
    });
    document.querySelectorAll("[data-next]").forEach((btn) => {
      btn.addEventListener("click", () => go(index + 1));
    });
    els.btnTimer?.addEventListener("click", toggleTimer);
    els.btnMenu?.addEventListener("click", () => els.menu?.classList.add("open"));
    els.menu?.addEventListener("click", (e) => {
      if (e.target === els.menu) els.menu.classList.remove("open");
    });
    els.btnVistaMaestro?.addEventListener("click", () => setVista("maestro", true));
    els.btnVistaAlumnos?.addEventListener("click", () => setVista("alumnos", true));
  }

  function onKey(e) {
    if (e.key === "Escape" && document.body.classList.contains("focus-open")) {
      e.preventDefault();
      closeFocus();
      return;
    }
    if (document.body.classList.contains("focus-open")) return;
    if (e.key === "ArrowRight" || e.key === " ") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    } else if (e.key.toLowerCase() === "t") {
      toggleTimer();
    } else if (e.key.toLowerCase() === "m") {
      setVista("maestro", true);
    } else if (e.key.toLowerCase() === "a") {
      setVista("alumnos", true);
    }
  }

  function setVista(next, pushUrl) {
    vista = next === "alumnos" ? "alumnos" : "maestro";
    document.body.classList.toggle("vista-alumnos", vista === "alumnos");
    document.body.classList.toggle("vista-maestro", vista === "maestro");
    els.btnVistaMaestro?.classList.toggle("active", vista === "maestro");
    els.btnVistaAlumnos?.classList.toggle("active", vista === "alumnos");
    if (pushUrl) {
      const url = new URL(location.href);
      url.searchParams.set("vista", vista);
      url.searchParams.set("ux", "1");
      history.replaceState({}, "", url);
    }
    render();
    publish();
  }

  function go(next) {
    index = Math.max(0, Math.min(slides.length - 1, next));
    document.querySelectorAll("[data-prev]").forEach((btn) => {
      btn.disabled = index <= 0;
    });
    document.querySelectorAll("[data-next]").forEach((btn) => {
      btn.disabled = index >= slides.length - 1;
    });
    render();
    publish();
  }

  function iconSvg(name) {
    const icons = {
      estudia:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5V5.5Z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
      medita:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 8v4l2.5 2.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
      anota:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h10l4 4v12H5V4Z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M14 4v5h5M8 12h8M8 16h6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
      analiza:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="10" r="3.2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="16" cy="13" r="3.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M11.5 12.2 13.4 11" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
      actua:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 9.5 17 19 7.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      comparte:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 11h7M7 15h5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M5 6h10l4 4v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
    };
    return icons[name] || icons.medita;
  }

  function labelInvitacion(inv) {
    return (
      {
        estudia: "Estudia",
        medita: "Medita",
        anota: "Anota",
        analiza: "Analiza",
        actua: "Actúa",
        comparte: "Comparte",
      }[inv] || "Participa"
    );
  }

  function render() {
    const slide = slides[index];
    if (!slide || !els.stage) return;

    document.body.classList.remove(
      "tv-foco-pregunta",
      "tv-foco-imagen",
      "tv-foco-leer",
      "tv-foco-escritura",
      "tv-foco-cita"
    );

    if (vista === "alumnos") {
      renderAlumno(slide);
    } else {
      renderMaestro(slide);
    }

    requestAnimationFrame(() => {
      els.stage.querySelector(".slide-card, .alumno-slide")?.classList.add("enter");
    });

    if (els.slideIndex) {
      els.slideIndex.textContent = `${index + 1} / ${slides.length}`;
    }
    if (els.progress) {
      els.progress.style.width = `${((index + 1) / slides.length) * 100}%`;
    }
    if (els.tvChrome) {
      els.tvChrome.innerHTML = `
        <span class="tv-course">${escapeHtml(COURSE.title)}</span>
        <span class="tv-step">${index + 1} / ${slides.length}</span>`;
    }
    highlightToc();
  }

  function renderAlumno(slide) {
    const inv = slide.invitacionAlumno || "medita";
    const showImage = Boolean(slide.alumnoImagen && slide.imagen);
    const showCitas = slide.tvFoco === "cita" && (slide.citas || []).length;
    const showEscrituras = (slide.escrituras || []).length > 0;
    const showPregunta = Boolean(slide.preguntar);

    const escrituras = (slide.escrituras || [])
      .map(
        (e) => `
      <section class="alumno-block alumno-escritura">
        <div class="alumno-kicker">${iconSvg("estudia")}<span>Estudia</span></div>
        <h2 class="ref">${escapeHtml(e.ref)}</h2>
        <p class="verso">${escapeHtml(e.texto)}</p>
      </section>`
      )
      .join("");

    const citas = showCitas
      ? (slide.citas || [])
          .slice(0, 1)
          .map(
            (c) => `
      <section class="alumno-block alumno-cita">
        <div class="alumno-kicker">${iconSvg("medita")}<span>Reflexiona</span></div>
        <p class="verso">${escapeHtml(c.texto)}</p>
        <p class="fuente"><strong>${escapeHtml(c.autor)}</strong> · ${escapeHtml(
              c.fuente
            )}</p>
      </section>`
          )
          .join("")
      : "";

    const pregunta = showPregunta
      ? `
      <section class="alumno-block alumno-pregunta">
        <div class="alumno-kicker">${iconSvg(
          showEscrituras || showCitas ? "comparte" : inv
        )}<span>${escapeHtml(
          showEscrituras || showCitas
            ? "Comparte"
            : labelInvitacion(inv)
        )}</span></div>
        <p class="pregunta">${escapeHtml(slide.preguntar)}</p>
      </section>`
      : "";

    els.stage.innerHTML = `
      <article class="alumno-slide" data-inv="${escapeHtml(inv)}">
        <header class="alumno-header">
          <p class="alumno-meta">${escapeHtml(slide.bloque)}</p>
          <h1>${escapeHtml(slide.titulo)}</h1>
        </header>
        ${
          showImage
            ? `<div class="alumno-media"><img src="${slide.imagen}" alt="" loading="eager" /></div>`
            : ""
        }
        <div class="alumno-body">
          ${escrituras}
          ${citas}
          ${pregunta}
        </div>
      </article>`;
  }

  function renderMaestro(slide) {
    const expandIcon =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

    const escrituras = (slide.escrituras || [])
      .map(
        (e, i) => `
      <figure class="scripture-block focusable" data-focus="escritura" data-i="${i}">
        <button type="button" class="focus-btn" aria-label="Ver en grande">${expandIcon}<span>Ver en grande</span></button>
        <figcaption>${escapeHtml(e.ref)}</figcaption>
        <blockquote>${escapeHtml(e.texto)}</blockquote>
      </figure>`
      )
      .join("");

    const citas = (slide.citas || [])
      .map(
        (c, i) => `
      <figure class="quote-block focusable" data-focus="cita" data-i="${i}">
        <button type="button" class="focus-btn" aria-label="Ver en grande">${expandIcon}<span>Ver en grande</span></button>
        <blockquote>${escapeHtml(c.texto)}</blockquote>
        <figcaption>
          <strong>${escapeHtml(c.autor)}</strong>
          <span>${escapeHtml(c.fuente)}</span>
        </figcaption>
      </figure>`
      )
      .join("");

    els.stage.innerHTML = `
      <article class="slide-card mesa" data-tipo="${escapeHtml(slide.tipo)}">
        ${
          slide.imagen
            ? `<div class="slide-media focusable" data-focus="imagen">
                <button type="button" class="focus-btn" aria-label="Ver imagen en grande">${expandIcon}<span>Ver en grande</span></button>
                <img src="${slide.imagen}" alt="" loading="eager" />
              </div>`
            : ""
        }
        <div class="slide-content">
          <div class="badge-row">
            <span class="badge">${escapeHtml(slide.bloque)}</span>
            <span class="badge tipo">${escapeHtml(labelTipo(slide.tipo))}</span>
            <span class="badge soft">${slide.minutos} min</span>
            <span class="badge soft">Mesa · toca Ver en grande</span>
          </div>
          <h1 class="slide-title">${escapeHtml(slide.titulo)}</h1>
          ${
            slide.decir
              ? `<section class="block decir"><h3>Qué decir</h3><p>${escapeHtml(
                  slide.decir
                )}</p></section>`
              : ""
          }
          ${
            escrituras
              ? `<section class="block escrituras"><h3>Escrituras (texto completo)</h3>${escrituras}</section>`
              : ""
          }
          ${
            citas
              ? `<section class="block citas"><h3>Citas</h3>${citas}</section>`
              : ""
          }
          ${
            slide.preguntar
              ? `<section class="block preguntar focusable" data-focus="pregunta">
                  <button type="button" class="focus-btn" aria-label="Ver pregunta en grande">${expandIcon}<span>Ver en grande</span></button>
                  <h3>Qué preguntar / invitar</h3>
                  <p class="pregunta-text">${escapeHtml(slide.preguntar)}</p>
                </section>`
              : ""
          }
          ${
            slide.tip
              ? `<section class="block tip"><h3>Tip (solo maestro)</h3><p>${escapeHtml(
                  slide.tip
                )}</p></section>`
              : ""
          }
        </div>
      </article>`;

    bindFocusTriggers(slide);
  }

  function bindFocusTriggers(slide) {
    els.stage.querySelectorAll("[data-focus]").forEach((el) => {
      const open = () => openFocus(slide, el.getAttribute("data-focus"), el.getAttribute("data-i"));
      el.querySelector(".focus-btn")?.addEventListener("click", (e) => {
        e.stopPropagation();
        open();
      });
      // Double-click block also opens (handy on trackpad)
      el.addEventListener("dblclick", open);
    });
  }

  function openFocus(slide, kind, idx) {
    const layer = document.getElementById("focus-layer");
    const body = document.getElementById("focus-body");
    if (!layer || !body) return;
    const i = Number(idx || 0);
    let html = "";
    let textForSize = "";

    if (kind === "imagen" && slide.imagen) {
      body.className = "focus-body focus-kind-image";
      html = `<div class="focus-image"><img src="${slide.imagen}" alt="" /></div>`;
    } else if (kind === "escritura") {
      const e = (slide.escrituras || [])[i];
      if (!e) return;
      textForSize = e.texto || "";
      html = `
        <div class="focus-panel">
          <div class="focus-kicker">Escritura</div>
          <h2 class="focus-ref">${escapeHtml(e.ref)}</h2>
          <p class="focus-text">${escapeHtml(e.texto)}</p>
        </div>`;
    } else if (kind === "cita") {
      const c = (slide.citas || [])[i];
      if (!c) return;
      textForSize = c.texto || "";
      html = `
        <div class="focus-panel">
          <div class="focus-kicker">Cita</div>
          <p class="focus-text">${escapeHtml(c.texto)}</p>
          <p class="focus-source"><strong>${escapeHtml(c.autor)}</strong><br>${escapeHtml(
            c.fuente
          )}</p>
        </div>`;
    } else if (kind === "pregunta") {
      textForSize = slide.preguntar || "";
      html = `
        <div class="focus-panel">
          <div class="focus-kicker">Pregunta</div>
          <p class="focus-text focus-question">${escapeHtml(slide.preguntar)}</p>
        </div>`;
    } else {
      return;
    }

    const size = focusSizeClass(textForSize);
    if (kind !== "imagen") {
      body.className = `focus-body focus-kind-text ${size}`;
    }
    body.innerHTML = html;
    body.scrollTop = 0;
    layer.hidden = false;
    document.body.classList.add("focus-open");
  }

  function focusSizeClass(text) {
    const n = String(text || "").trim().length;
    if (n > 900) return "size-xlong";
    if (n > 520) return "size-long";
    if (n > 280) return "size-medium";
    return "size-short";
  }

  function closeFocus() {
    const layer = document.getElementById("focus-layer");
    if (layer) layer.hidden = true;
    document.body.classList.remove("focus-open");
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  function bindFocusChrome() {
    document.getElementById("focus-close")?.addEventListener("click", closeFocus);
    document.getElementById("focus-layer")?.addEventListener("click", (e) => {
      if (e.target.id === "focus-layer") closeFocus();
    });
    document.getElementById("focus-browser-fs")?.addEventListener("click", async () => {
      const layer = document.getElementById("focus-layer");
      if (!layer) return;
      try {
        if (!document.fullscreenElement) await layer.requestFullscreen();
        else await document.exitFullscreen();
      } catch (_) {}
    });
  }

  function renderToc() {
    if (!els.toc) return;
    els.toc.innerHTML = slides
      .map(
        (s, i) => `
      <button type="button" class="toc-item" data-goto="${i}">
        <strong>${i + 1}. ${escapeHtml(s.titulo)}</strong>
        <small>${escapeHtml(s.bloque)} · ${s.minutos} min</small>
      </button>`
      )
      .join("");
    els.toc.querySelectorAll("[data-goto]").forEach((btn) => {
      btn.addEventListener("click", () => {
        go(Number(btn.getAttribute("data-goto")));
        els.menu?.classList.remove("open");
      });
    });
  }

  function highlightToc() {
    els.toc?.querySelectorAll("[data-goto]").forEach((btn) => {
      btn.classList.toggle(
        "active",
        Number(btn.getAttribute("data-goto")) === index
      );
    });
  }

  function toggleTimer() {
    timerRunning = !timerRunning;
    if (timerRunning) {
      timerId = setInterval(() => {
        remaining = Math.max(0, remaining - 1);
        updateTimerDisplay();
        publish();
        if (remaining === 0) {
          timerRunning = false;
          clearInterval(timerId);
        }
      }, 1000);
    } else if (timerId) {
      clearInterval(timerId);
    }
    updateTimerDisplay();
    publish();
  }

  function updateTimerDisplay() {
    if (!els.timer) return;
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    els.timer.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    els.timer.classList.toggle("over", remaining <= 10 * 60);
    if (els.btnTimer) {
      els.btnTimer.textContent = timerRunning ? "Pausar" : "Iniciar";
    }
  }

  function publish() {
    if (applyingRemote) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ux: 1,
        index,
        remaining,
        timerRunning,
        ts: Date.now(),
      })
    );
    const url = new URL(location.href);
    url.searchParams.set("ux", "1");
    url.searchParams.set("vista", vista);
    url.searchParams.set("s", String(index));
    history.replaceState({}, "", url);
  }

  function onStorage(e) {
    if (e.key !== STORAGE_KEY || !e.newValue) return;
    try {
      const data = JSON.parse(e.newValue);
      applyingRemote = true;
      index = clampInt(data.index, 0, slides.length - 1);
      remaining = Number(data.remaining) || remaining;
      updateTimerDisplay();
      render();
      applyingRemote = false;
    } catch (_) {
      applyingRemote = false;
    }
  }

  function restoreState() {
    const fromUrl = params.get("s");
    if (fromUrl != null) index = clampInt(fromUrl, 0, slides.length - 1);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (fromUrl == null && typeof data.index === "number") {
        index = clampInt(data.index, 0, slides.length - 1);
      }
      if (typeof data.remaining === "number") remaining = data.remaining;
    } catch (_) {}
  }

  function labelTipo(tipo) {
    return (
      {
        historia: "Historia",
        escritura: "Escritura",
        caso: "Caso",
        actividad: "Actividad",
        ritual: "Apertura",
        cierre: "Cierre",
      }[tipo] || tipo
    );
  }

  function clampInt(v, min, max) {
    const n = Number.parseInt(v, 10);
    if (Number.isNaN(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  function escapeHtml(str) {
    return String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }
})();
