/* Site público. Lê só o que foi publicado no painel (ou o rascunho, no modo prévia). */
(function () {
  const preview = new URLSearchParams(location.search).has('previa');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let db, S, H, cats, products, looks, colecoes;
  const state = { cat: 'todas', cor: null, q: '' };

  const LOGO = `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="#121413"/><path d="M20 8 L31 30 H26.5 L20 17 L13.5 30 H9 Z" fill="#fff"/><path d="M7 27 Q20 17 34 24" stroke="#A3C93A" stroke-width="3.4" fill="none" stroke-linecap="round"/></svg>`;

  // Versão que o público vê: publicada; na prévia, o rascunho atual
  const view = (it) => (preview ? it : { ...it.pub, id: it.id });
  const visible = (it) => (preview ? it.status !== 'arquivado' : it.status === 'publicado' && it.pub);

  function loadData() {
    db = Store.load();
    S = db.settings; H = db.home;
    cats = db.categorias.filter((c) => c.ativa);
    const activeCats = new Set(cats.map((c) => c.id));
    products = db.produtos.filter(visible).map(view).filter((p) => activeCats.has(p.cat));
    looks = db.looks.filter(visible).map(view);
    colecoes = db.colecoes.filter(visible).map(view);
  }

  const catName = (id) => (db.categorias.find((c) => c.id === id) || {}).nome || '';
  const byId = (id) => products.find((p) => p.id === id);
  const mainImg = (p) => p.imgs[0] || { sm: '', src: '', alt: '' };
  const price = (p) => (S.mostrarPrecos && p.preco ? Store.money(p.preco) : '');

  /* ---------- blocos ---------- */
  function renderHero() {
    $('#hero').innerHTML = `
      <div class="wrap hero-grid">
        <figure class="hero-photo"><img src="${esc(H.heroImg)}" alt="${esc(S.frase2)}" width="1200" height="1600" fetchpriority="high"></figure>
        <div class="hero-type">
          <h1 aria-label="${esc(H.heroTitulo1 + ' ' + H.heroTitulo2)}"><span class="ln"><span>${esc(H.heroTitulo1)}</span></span><span class="ln"><span>${esc(H.heroTitulo2)}</span></span></h1>
          <svg class="arc" viewBox="0 0 600 70" aria-hidden="true"><path d="M8 58 Q 300 -12 592 44" stroke="#A3C93A" stroke-width="16" fill="none" stroke-linecap="round"/></svg>
        </div>
        <p class="hero-sub">${esc(H.heroSub)}<small>${esc(S.frase2)}</small></p>
        <div class="hero-ctas">
          <a class="btn" href="#catalogo"><span class="dot" aria-hidden="true"></span>${esc(H.heroCta)}</a>
          <a class="btn btn--ghost" href="#loja">${esc(H.heroCta2)}</a>
        </div>
        <div class="hero-cue" aria-hidden="true"><i></i>Role para ver</div>
      </div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => $('#hero').classList.add('is-in')));
  }

  const BLOCKS = {
    manifesto: () => `
      <section class="sec manifesto" aria-label="Manifesto">
        <div class="wrap manifesto-grid">
          <div class="reveal">
            <p class="eyebrow" style="color:#A3C93A">${esc(S.nome)}</p>
            <blockquote>${esc(S.frase1).replace(/look novo/i, (m) => `<mark>${m}</mark>`)}</blockquote>
            <p>${esc(S.frase2)} ${esc(S.sobre)}</p>
          </div>
          <figure class="reveal"><img src="img/meme-energia-sm.jpg" alt="Conjunto verde-oliva no vestiário da academia" loading="lazy" width="600" height="803"></figure>
        </div>
      </section>`,

    categorias: () => !cats.length ? '' : `
      <section class="sec" id="categorias" aria-labelledby="h-cat">
        <div class="wrap">
          <div class="sec-head reveal"><h2 class="h-sec" id="h-cat">Categorias</h2><p>Escolha por onde começar.</p></div>
          <div class="cats reveal">${cats.map((c) => {
            const n = products.filter((p) => p.cat === c.id).length;
            return `<a class="cat" href="#catalogo" data-goto-cat="${c.id}"><img src="${esc(c.img)}" alt="" loading="lazy" width="600" height="800"><span>${esc(c.nome)}<small>${n} ${n === 1 ? 'peça' : 'peças'}</small></span></a>`;
          }).join('')}</div>
        </div>
      </section>`,

    lancamentos: () => {
      const items = products.filter((p) => p.lanc);
      if (!items.length) return '';
      return `
      <section class="sec" id="lancamentos" aria-labelledby="h-lan" style="padding-top:0">
        <div class="wrap">
          <div class="sec-head reveal"><h2 class="h-sec" id="h-lan">Lançamentos</h2>
            <div class="rail-ctrl"><button class="round" type="button" aria-label="Anteriores" data-rail="-1">←</button><button class="round" type="button" aria-label="Próximos" data-rail="1">→</button></div></div>
          <div class="rail" data-rail-track>${items.map(card).join('')}</div>
        </div>
      </section>`;
    },

    catalogo: () => {
      const cores = colorPalette();
      return `
      <section class="sec" id="catalogo" aria-labelledby="h-catalogo" style="background:#fff">
        <div class="wrap">
          <div class="sec-head"><h2 class="h-sec" id="h-catalogo">Catálogo</h2><p class="count" data-count aria-live="polite"></p></div>
          <div class="filters">
            <div class="chips" role="group" aria-label="Filtrar por categoria">
              <button class="chip" type="button" data-cat="todas" aria-pressed="true">Todas</button>
              ${cats.map((c) => `<button class="chip" type="button" data-cat="${c.id}" aria-pressed="false">${esc(c.nome)}</button>`).join('')}
            </div>
            <div class="filter-row">
              <div class="colorbar" role="group" aria-label="Filtrar por cor"><span>Cor</span>${cores.map((c) => `<button class="cf" type="button" style="--c:${c.hex}" aria-pressed="false" aria-label="${esc(c.nome)}" title="${esc(c.nome)}" data-cor="${esc(c.nome)}"></button>`).join('')}</div>
              <label class="search"><span class="sr">Buscar pelo nome</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                <input type="search" placeholder="Buscar peça" data-q autocomplete="off"></label>
            </div>
          </div>
          <div class="grid" data-grid></div>
          <div class="empty" data-empty hidden><p>Nenhuma peça com esses filtros.</p><button class="btn btn--ghost btn--sm" type="button" data-clear>Limpar filtros</button></div>
          <p class="fine" style="margin-top:28px">Disponibilidade atualizada manualmente pela loja. Confirme pelo WhatsApp antes de ir.</p>
        </div>
      </section>`;
    },

    looks: () => !looks.length ? '' : `
      <section class="sec" id="looks" aria-labelledby="h-looks">
        <div class="wrap">
          <div class="sec-head reveal"><h2 class="h-sec" id="h-looks">Looks</h2><p>Combinações montadas pela loja. Toque numa peça para ver os detalhes.</p></div>
          <div class="looks">${looks.map((l) => {
            const ps = l.produtos.map(byId).filter(Boolean);
            return `<article class="look reveal">
              <figure><img src="${esc(l.img)}" alt="${esc(l.nome)}" loading="lazy"></figure>
              <div class="look-body"><h3>${esc(l.nome)}</h3><p>${esc(l.desc)}</p>
                <ul>${ps.map((p) => `<li><button type="button" data-open="${p.slug}"><img src="${esc(mainImg(p).sm)}" alt=""><span>${esc(p.nome)}</span><i aria-hidden="true">→</i></button></li>`).join('')}</ul>
                <button class="btn btn--ghost btn--sm" type="button" data-wa-look="${l.id}">Consultar o look</button></div>
            </article>`;
          }).join('')}</div>
        </div>
      </section>`,

    colecoes: () => !colecoes.length ? '' : `
      <section class="sec" id="colecoes" aria-labelledby="h-col" style="padding-top:0">
        <div class="wrap">
          <div class="sec-head reveal"><h2 class="h-sec" id="h-col">Coleções</h2></div>
          <div class="cols">${colecoes.map((c) => `
            <article class="col reveal"><img src="${esc(c.img)}" alt="" loading="lazy">
              <div class="col-body"><h3>${esc(c.nome)}</h3><p>${esc(c.desc)}</p>
                <button class="btn btn--lime btn--sm" type="button" data-goto-col="${c.id}">Ver ${c.produtos.map(byId).filter(Boolean).length} peças</button></div></article>`).join('')}</div>
        </div>
      </section>`,

    loja: () => `
      <section class="sec" id="loja" aria-labelledby="h-loja" style="background:#fff">
        <div class="wrap store">
          <figure class="reveal"><img src="img/spoiler-2-sm.jpg" alt="Interior da loja com araras de roupas fitness" loading="lazy" width="600" height="1065"></figure>
          <div class="reveal">
            <p class="eyebrow">A loja</p>
            <h2 class="h-sec" id="h-loja">Venha conhecer de perto</h2>
            <dl>
              <div><dt>Endereço</dt><dd>${esc(S.endereco)}${S.cidade ? ' · ' + esc(S.cidade) : ' <span class="pending">(cidade a confirmar)</span>'}</dd></div>
              <div><dt>Horário</dt><dd>${S.horarios ? esc(S.horarios).replace(/\n/g, '<br>') : '<span class="pending">A confirmar com a loja</span>'}</dd></div>
              <div><dt>Atendimento</dt><dd>WhatsApp ${esc(fmtPhone(S.whatsapp))} · <a href="https://www.instagram.com/${esc(S.instagram)}/" target="_blank" rel="noopener">@${esc(S.instagram)}</a></dd></div>
            </dl>
            <div class="store-ctas">
              <a class="btn" href="${esc(mapLink())}" target="_blank" rel="noopener" data-track="rota"><span class="dot" aria-hidden="true"></span>Como chegar</a>
              <button class="btn btn--ghost" type="button" data-wa-general>Falar no WhatsApp</button>
            </div>
          </div>
        </div>
      </section>`
  };

  function renderBlocks() {
    $('#blocos').innerHTML = H.blocos.filter((b) => b.ativo && BLOCKS[b.id]).map((b) => BLOCKS[b.id]()).join('');
    if ($('[data-grid]')) renderGrid(false);
  }

  function renderFooter() {
    $('#rodape').innerHTML = `
      <div class="wrap">
        <div class="ftr-grid">
          <div><a class="logo" href="#topo">${LOGO}${esc(S.nome)}</a><p style="max-width:32ch;margin-top:14px">${esc(S.frase2)}</p></div>
          <div><h4>Navegar</h4><ul><li><a href="#catalogo">Catálogo</a></li><li><a href="#lancamentos">Lançamentos</a></li><li><a href="#looks">Looks</a></li><li><a href="#loja">A loja</a></li></ul></div>
          <div><h4>Contato</h4><ul><li><button class="linkish" type="button" data-wa-general style="background:none;border:0;padding:0;color:inherit;cursor:pointer">WhatsApp ${esc(fmtPhone(S.whatsapp))}</button></li><li><a href="https://www.instagram.com/${esc(S.instagram)}/" target="_blank" rel="noopener">Instagram @${esc(S.instagram)}</a></li><li>${esc(S.endereco)}</li></ul></div>
          <div><h4>Privacidade</h4><p style="margin:0">${esc(S.privacidade)}</p></div>
        </div>
        <div class="ftr-bottom"><span>© ${new Date().getFullYear()} ${esc(S.nome)}</span><span>Vitrine digital. Não vendemos pelo site: atendimento pelo WhatsApp e na loja.</span></div>
      </div>`;
  }

  /* ---------- catálogo ---------- */
  function colorPalette() {
    const m = new Map();
    products.forEach((p) => p.cores.forEach((c) => { if (!m.has(c.nome)) m.set(c.nome, c); }));
    return [...m.values()];
  }

  function card(p) {
    const im = mainImg(p);
    const tag = p.disp === 'indisponivel' ? '<span class="tag tag--off">Indisponível</span>' : (p.lanc ? '<span class="tag">Novo</span>' : '');
    const pr = price(p);
    return `<article class="card" data-id="${p.id}">
      <button class="card-link" type="button" data-open="${p.slug}" aria-label="Ver ${esc(p.nome)}">
        <div class="card-img">${tag}<img src="${esc(im.sm)}" alt="${esc(im.alt)}" loading="lazy" width="600" height="750"></div>
        <p class="card-name">${esc(p.nome)}</p>
      </button>
      <div class="card-meta"><span>${pr ? `<span class="card-price">${pr}</span> · ` : ''}${esc(catName(p.cat))}</span>
        <span class="dots">${p.cores.map((c, i) => `<button type="button" style="--c:${c.hex}" aria-label="Ver em ${esc(c.nome)}" aria-pressed="${i === 0}" data-swap="${c.id}"></button>`).join('')}</span></div>
    </article>`;
  }

  function filtered() {
    const q = state.q.trim().toLowerCase();
    return products.filter((p) =>
      (state.cat === 'todas' || p.cat === state.cat) &&
      (!state.cor || p.cores.some((c) => c.nome === state.cor)) &&
      (!q || p.nome.toLowerCase().includes(q)));
  }

  function renderGrid(animate = true) {
    const grid = $('[data-grid]');
    const run = () => {
      const list = filtered();
      grid.innerHTML = list.map(card).join('');
      $('[data-count]').textContent = `${list.length} ${list.length === 1 ? 'peça' : 'peças'}`;
      $('[data-empty]').hidden = list.length > 0;
      if (state.cor) list.forEach((p) => { const c = p.cores.find((x) => x.nome === state.cor); if (c) swapCard(grid.querySelector(`[data-id="${p.id}"]`), p, c.id); });
      $$('.card', grid).forEach((el, i) => setTimeout(() => el.classList.add('on'), reduce ? 0 : Math.min(i, 8) * 50));
    };
    if (animate && document.startViewTransition && !reduce) document.startViewTransition(run); else run();
  }

  function swapCard(el, p, corId) {
    if (!el) return;
    $$('[data-swap]', el).forEach((b) => b.setAttribute('aria-pressed', b.dataset.swap === corId));
    const im = p.imgs.find((i) => i.cor === corId);
    const img = $('.card-img img', el);
    if (im && img.getAttribute('src') !== im.sm) {
      img.style.opacity = 0;
      setTimeout(() => { img.src = im.sm; img.alt = im.alt; img.style.opacity = 1; }, reduce ? 0 : 160);
    }
  }

  /* ---------- produto ---------- */
  function openProduct(slug, push = true) {
    const p = products.find((x) => x.slug === slug);
    if (!p) return;
    const dlg = $('#pd');
    const sel = { cor: p.cores.length === 1 ? p.cores[0] : null, tam: null, img: 0 };
    const related = products.filter((x) => x.id !== p.id && x.cat === p.cat).slice(0, 4);
    const pr = price(p);
    dlg.innerHTML = `
      <div class="pd-bar"><span class="eyebrow" style="margin:0">${esc(catName(p.cat))}</span>
        <div style="display:flex;gap:8px"><button class="round" type="button" aria-label="Copiar link da peça" data-share>↗</button><button class="round" type="button" aria-label="Fechar" data-close>×</button></div></div>
      <div class="pd-body">
        <div class="gal">
          <div class="gal-main"><img src="${esc(p.imgs[0].src)}" alt="${esc(p.imgs[0].alt)}" data-main></div>
          ${p.imgs.length > 1 ? `<div class="gal-thumbs" role="group" aria-label="Fotos">${p.imgs.map((im, i) => `<button type="button" aria-label="Foto ${i + 1}" aria-current="${i === 0}" data-img="${i}"><img src="${esc(im.sm)}" alt=""></button>`).join('')}</div>` : ''}
        </div>
        <div>
          ${p.lanc ? '<span class="tag" style="position:static;display:inline-block">Lançamento</span>' : ''}
          <h2 id="pd-title">${esc(p.nome)}</h2>
          ${pr ? `<p class="pd-price">${pr}</p>` : ''}
          <p class="pd-desc">${esc(p.desc)}</p>
          ${p.carac ? `<p class="pd-carac"><b>Características:</b> ${esc(p.carac)}</p>` : ''}
          <p class="opt-label">Cor <span data-cor-name>${sel.cor ? esc(sel.cor.nome) : 'escolha uma'}</span></p>
          <div class="opts" role="group" aria-label="Cor">${p.cores.map((c) => `<button class="cf" type="button" style="--c:${c.hex}" aria-label="${esc(c.nome)}" aria-pressed="${sel.cor === c}" data-pcor="${c.id}"></button>`).join('')}</div>
          ${p.tamanhos.length ? `<p class="opt-label">Tamanho</p><div class="opts" role="group" aria-label="Tamanho">${p.tamanhos.map((t) => `<button class="size" type="button" aria-pressed="false" data-tam="${esc(t)}">${esc(t)}</button>`).join('')}</div>` : ''}
          <div class="avail ${p.disp}"><i aria-hidden="true"></i>${Store.DISP[p.disp]}</div>
          <p class="fine">Informação atualizada manualmente pela loja.</p>
          <div class="pd-actions"><button class="btn btn--lime btn--block" type="button" data-wa-product>Consultar no WhatsApp</button></div>
        </div>
        ${related.length ? `<div class="related"><h3>Combina com</h3><div class="rail">${related.map(card).join('')}</div></div>` : ''}
      </div>`;

    const main = $('[data-main]', dlg);
    const showImg = (i) => {
      sel.img = i;
      $$('[data-img]', dlg).forEach((b) => b.setAttribute('aria-current', +b.dataset.img === i));
      main.style.opacity = 0;
      setTimeout(() => { main.src = p.imgs[i].src; main.alt = p.imgs[i].alt; main.style.opacity = 1; }, reduce ? 0 : 140);
    };
    $$('[data-img]', dlg).forEach((b) => b.addEventListener('click', () => showImg(+b.dataset.img)));
    $$('[data-pcor]', dlg).forEach((b) => b.addEventListener('click', () => {
      sel.cor = p.cores.find((c) => c.id === b.dataset.pcor);
      $$('[data-pcor]', dlg).forEach((x) => x.setAttribute('aria-pressed', x === b));
      $('[data-cor-name]', dlg).textContent = sel.cor.nome;
      const i = p.imgs.findIndex((im) => im.cor === sel.cor.id);
      if (i >= 0 && i !== sel.img) showImg(i);
    }));
    $$('[data-tam]', dlg).forEach((b) => b.addEventListener('click', () => {
      sel.tam = sel.tam === b.dataset.tam ? null : b.dataset.tam;
      $$('[data-tam]', dlg).forEach((x) => x.setAttribute('aria-pressed', x.dataset.tam === sel.tam));
    }));
    $('[data-wa-product]', dlg).addEventListener('click', () => whats(Store.waMessage(S.nome, p.nome, sel.cor && sel.cor.nome, sel.tam)));
    $('[data-close]', dlg).addEventListener('click', () => closeProduct());
    $('[data-share]', dlg).addEventListener('click', async () => {
      const url = location.href.split('#')[0] + '#p/' + p.slug;
      try { await navigator.clipboard.writeText(url); toast('Link copiado', `<p>${esc(url)}</p>`); } catch (e) { toast('Link da peça', `<p>${esc(url)}</p>`); }
    });
    if (!dlg.open) dlg.showModal();
    dlg.scrollTop = 0;
    if (push) history.pushState(null, '', '#p/' + p.slug);
  }

  function closeProduct() {
    const dlg = $('#pd');
    if (dlg.open) dlg.close();
    if (location.hash.startsWith('#p/')) history.pushState(null, '', location.pathname + location.search);
  }

  /* ---------- contato ---------- */
  function fmtPhone(n) {
    const d = String(n || '').replace(/\D/g, '').replace(/^55/, '');
    return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d;
  }
  function mapLink() {
    return S.mapa || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(S.endereco + (S.cidade ? ', ' + S.cidade : ''))}`;
  }
  // No protótipo o botão mostra a mensagem em vez de abrir a conversa com a loja de verdade
  function whats(msg) {
    const url = `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(msg)}`;
    toast('Mensagem que abriria no WhatsApp', `<p>${esc(msg)}</p><small>No site oficial, este botão abre a conversa com a loja (${esc(fmtPhone(S.whatsapp))}). No protótipo, nada é enviado.</small>`);
    return url;
  }

  let tt;
  function toast(title, html) {
    const t = $('#toast');
    // Janela aberta fica na camada de cima: o aviso precisa morar dentro dela para aparecer
    ($('dialog[open]') || document.body).appendChild(t);
    t.innerHTML = `<b>${esc(title)}</b>${html}`;
    t.classList.add('on');
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 7000);
  }

  /* ---------- eventos ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('button, a');
    if (!t) return;
    if (t.dataset.open) { e.preventDefault(); openProduct(t.dataset.open); return; }
    if (t.dataset.swap) { const card = t.closest('.card'); const p = products.find((x) => x.id === card.dataset.id); swapCard(card, p, t.dataset.swap); return; }
    if (t.dataset.cat) { state.cat = t.dataset.cat; $$('.chip[data-cat]').forEach((x) => x.setAttribute('aria-pressed', x === t)); renderGrid(); return; }
    if (t.dataset.cor) { state.cor = state.cor === t.dataset.cor ? null : t.dataset.cor; $$('[data-cor]').forEach((x) => x.setAttribute('aria-pressed', x.dataset.cor === state.cor)); renderGrid(); return; }
    if ('clear' in t.dataset) { clearFilters(); return; }
    if (t.dataset.gotoCat) { e.preventDefault(); clearFilters(false); state.cat = t.dataset.gotoCat; syncChips(); renderGrid(false); $('#catalogo').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); return; }
    if (t.dataset.gotoCol) {
      const c = colecoes.find((x) => x.id === t.dataset.gotoCol);
      clearFilters(false); renderGridSubset(c); $('#catalogo').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); return;
    }
    if (t.dataset.rail) { const tr = t.closest('section').querySelector('[data-rail-track]'); tr.scrollBy({ left: tr.clientWidth * 0.9 * +t.dataset.rail, behavior: reduce ? 'auto' : 'smooth' }); return; }
    if ('waGeneral' in t.dataset) { whats(`Olá! Vi o catálogo da ${S.nome} e queria tirar uma dúvida.`); return; }
    if (t.dataset.waLook) { const l = looks.find((x) => x.id === t.dataset.waLook); whats(`Olá! Vi o look "${l.nome}" no catálogo da ${S.nome} e gostaria de consultar a disponibilidade das peças.`); return; }
    if ('openMenu' in t.dataset) { $('#menu').showModal(); return; }
    if ('closeMenu' in t.dataset) { $('#menu').close(); }
  });

  function syncChips() { $$('.chip[data-cat]').forEach((x) => x.setAttribute('aria-pressed', x.dataset.cat === state.cat)); }
  function clearFilters(render = true) {
    state.cat = 'todas'; state.cor = null; state.q = '';
    const q = $('[data-q]'); if (q) q.value = '';
    syncChips(); $$('[data-cor]').forEach((x) => x.setAttribute('aria-pressed', 'false'));
    if (render) renderGrid();
  }
  // Coleção: mostra só as peças dela no catálogo
  function renderGridSubset(col) {
    const grid = $('[data-grid]');
    const list = col.produtos.map(byId).filter(Boolean);
    grid.innerHTML = list.map(card).join('');
    $('[data-count]').innerHTML = `Coleção ${esc(col.nome)} · ${list.length} peças · <button type="button" data-clear style="background:none;border:0;padding:0;text-decoration:underline;cursor:pointer;color:inherit">ver todas</button>`;
    $('[data-empty]').hidden = list.length > 0;
    $$('.card', grid).forEach((el) => el.classList.add('on'));
  }

  document.addEventListener('input', (e) => { if (e.target.matches('[data-q]')) { state.q = e.target.value; renderGrid(false); } });
  $('#pd').addEventListener('close', () => { if (location.hash.startsWith('#p/')) history.replaceState(null, '', location.pathname + location.search); });
  $('#pd').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeProduct(); });
  $('#menu').addEventListener('click', (e) => { if (e.target === e.currentTarget) $('#menu').close(); });
  window.addEventListener('popstate', () => { const m = location.hash.match(/^#p\/(.+)/); if (m) openProduct(m[1], false); else if ($('#pd').open) $('#pd').close(); });

  const hdr = $('#hdr');
  addEventListener('scroll', () => hdr.classList.toggle('scrolled', scrollY > 24), { passive: true });

  function observe() {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('on'); io.unobserve(en.target); } }), { threshold: 0.15 });
    $$('.reveal').forEach((el) => io.observe(el));
  }

  function render() {
    loadData();
    document.title = `${S.nome} — ${H.heroTitulo1} ${H.heroTitulo2} (protótipo)`;
    $$('[data-logo]').forEach((el) => { el.innerHTML = LOGO + esc(S.nome); });
    if (preview) {
      const bar = $('#demo-bar');
      bar.classList.add('preview');
      bar.innerHTML = 'Prévia: você está vendo os rascunhos, como ficarão depois de publicados. <a href="./">Ver o site publicado</a>';
    }
    renderHero(); renderBlocks(); renderFooter(); observe();
  }

  render();
  // Painel aberto em outra aba: o site se atualiza sozinho quando algo é publicado
  addEventListener('storage', (e) => { if (e.key === Store.KEY) { const y = scrollY; render(); scrollTo(0, y); } });
  const m = location.hash.match(/^#p\/(.+)/);
  if (m) openProduct(m[1], false);
  else if (location.hash.length > 1) { const el = document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView(); }
})();
