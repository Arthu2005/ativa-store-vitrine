/* Painel da loja (protótipo). Mesmo fluxo do sistema real: rascunho → prévia → publicar.
   Aqui tudo é salvo no navegador; no sistema real, no banco de dados com login de verdade. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const u = (src) => (/^(data:|https?:|blob:)/.test(src || '') ? src : '../' + (src || ''));
  const uid = (p) => p + Math.random().toString(36).slice(2, 8);
  const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';
  const AUTH = 'ativa-painel-demo-sessao';
  const MAX_UPLOAD = 15 * 1024 * 1024;

  let db = Store.load();
  let guard = null; // editor com alterações não salvas

  const LOGO = `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="#000"/><path d="M20 8 L31 30 H26.5 L20 17 L13.5 30 H9 Z" fill="#fff"/><path d="M7 27 Q20 17 34 24" stroke="#A3C93A" stroke-width="3.4" fill="none" stroke-linecap="round"/></svg>`;
  const I = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICON = {
    resumo: I('<path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z"/>'),
    produtos: I('<path d="M20.4 7.6 16 4l-2 2h-4L8 4 3.6 7.6 6 11l2-1v10h8V10l2 1z"/>'),
    looks: I('<rect x="3" y="3" width="8" height="18" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>'),
    colecoes: I('<path d="M4 6h16M4 12h16M4 18h10"/>'),
    categorias: I('<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>'),
    inicio: I('<path d="m3 11 9-8 9 8v10H3z"/><path d="M9 21v-7h6v7"/>'),
    config: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    historico: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    mais: I('<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'),
    plus: I('<path d="M12 5v14M5 12h14"/>'),
    site: I('<path d="M14 3h7v7M10 14 21 3M21 14v7H3V3h7"/>'),
    sair: I('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'),
    up: I('<path d="m18 15-6-6-6 6"/>'),
    down: I('<path d="m6 9 6 6 6-6"/>'),
    left: I('<path d="m15 18-6-6 6-6"/>'),
    right: I('<path d="m9 18 6-6-6-6"/>'),
    star: I('<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>'),
    trash: I('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>'),
    dots: I('<circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>'),
    camera: I('<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>'),
    back: I('<path d="M19 12H5M12 19l-7-7 7-7"/>'),
    x: I('<path d="M18 6 6 18M6 6l12 12"/>')
  };

  const NAV = [
    ['resumo', 'Resumo'], ['produtos', 'Peças'], ['looks', 'Looks'], ['colecoes', 'Coleções'],
    ['categorias', 'Categorias'], ['inicio', 'Página inicial'], ['config', 'Configurações'], ['historico', 'Histórico']
  ];

  /* ---------- utilitários ---------- */
  function persist() {
    if (Store.save(db)) return true;
    toast('Não deu para salvar: o espaço do navegador acabou. Remova algumas fotos enviadas e tente de novo.', true);
    return false;
  }
  function log(msg) { db.log.unshift({ t: Date.now(), msg }); db.log.length = Math.min(db.log.length, 150); }

  let tt;
  function toast(msg, error = false) {
    const t = $('#toast');
    t.classList.toggle('error', error);
    $('span', t).textContent = msg;
    t.classList.add('on');
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), error ? 7000 : 3500);
  }

  function confirmBox(title, text, yes = 'Confirmar', danger = false) {
    const d = $('#confirm');
    $('h3', d).textContent = title; $('p', d).textContent = text;
    const y = $('[data-yes]', d); y.textContent = yes; y.className = danger ? 'btn btn--danger' : 'btn';
    d.showModal();
    return new Promise((res) => {
      const done = (v) => { d.close(); y.onclick = null; $('[data-no]', d).onclick = null; res(v); };
      y.onclick = () => done(true);
      $('[data-no]', d).onclick = () => done(false);
      d.oncancel = () => done(false);
    });
  }

  const catName = (id) => (db.categorias.find((c) => c.id === id) || {}).nome || 'Sem categoria';
  const prodById = (id) => db.produtos.find((p) => p.id === id);
  function uniqueSlug(base, list, selfId) {
    let s = slugify(base), n = 2;
    while (list.some((x) => x.slug === s && x.id !== selfId)) s = `${slugify(base)}-${n++}`;
    return s;
  }
  function statusBadges(it) {
    if (it.status === 'arquivado') return '<span class="badge arch">Arquivada</span>';
    if (it.status === 'publicado') return '<span class="badge pub">No site</span>' + (it.pendente ? ' <span class="badge pend">Alterações não publicadas</span>' : '');
    return '<span class="badge draft">Rascunho</span>';
  }
  function library() {
    const set = new Set();
    db.produtos.forEach((p) => p.imgs.forEach((i) => set.add(i.src)));
    [...db.categorias, ...db.looks, ...db.colecoes].forEach((x) => x.img && set.add(x.img));
    set.add(db.home.heroImg);
    return [...set].filter(Boolean);
  }

  async function resizeFile(file, max = 1000) {
    if (!file.type.startsWith('image/')) throw new Error(`"${file.name}" não é uma foto.`);
    if (file.size > MAX_UPLOAD) throw new Error(`"${file.name}" tem mais de 15 MB.`);
    const url = URL.createObjectURL(file);
    try {
      const img = new Image(); img.src = url; await img.decode();
      const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL('image/jpeg', 0.8);
    } catch (e) {
      throw new Error(`Não consegui abrir "${file.name}". Tente salvar a foto como JPG.`);
    } finally { URL.revokeObjectURL(url); }
  }

  // Escolher foto já usada na loja ou enviar uma nova
  function pickImage(current) {
    const sh = $('#sheet');
    const imgs = library();
    sh.innerHTML = `<div class="grab"></div><div style="padding:14px 16px calc(18px + env(safe-area-inset-bottom))">
      <h3 style="margin:0 0 12px">Escolher foto</h3>
      <div class="pick" role="radiogroup" aria-label="Fotos da loja">${imgs.map((s, i) => `<label><input type="radio" name="pk" value="${i}" ${s === current ? 'checked' : ''}><img src="${esc(u(s))}" alt="Foto ${i + 1}"></label>`).join('')}</div>
      <label class="btn btn--ghost btn--block" style="margin-top:12px">${ICON.camera} Enviar foto do celular<input type="file" accept="image/*" hidden data-up></label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px"><button class="btn btn--ghost" type="button" data-cancel>Cancelar</button><button class="btn" type="button" data-ok>Usar esta</button></div></div>`;
    sh.showModal();
    return new Promise((res) => {
      const done = (v) => { sh.close(); res(v); };
      $('[data-cancel]', sh).onclick = () => done(null);
      sh.oncancel = () => done(null);
      $('[data-ok]', sh).onclick = () => { const r = $('input[name=pk]:checked', sh); done(r ? imgs[+r.value] : null); };
      $('[data-up]', sh).onchange = async (e) => {
        try { done(await resizeFile(e.target.files[0])); } catch (err) { toast(err.message, true); }
      };
    });
  }

  /* ---------- login ---------- */
  function isIn() { try { return sessionStorage.getItem(AUTH) === '1'; } catch (e) { return false; } }
  function renderLogin() {
    $('#root').innerHTML = `
      <main class="login"><div class="login-card">
        <div class="brand">${LOGO}${esc(db.settings.nome)}</div>
        <h1>Painel da loja</h1>
        <p>Entre para cadastrar peças, trocar fotos e atualizar a vitrine.</p>
        <label class="field"><span>E-mail</span><input class="input" type="email" value="dona@exemplo.com.br" readonly aria-readonly="true"></label>
        <label class="field"><span>Senha</span><input class="input" type="password" value="demonstracao" readonly aria-readonly="true"></label>
        <button class="btn btn--lime btn--block" type="button" data-enter>Entrar na demonstração</button>
        <button class="btn btn--ghost btn--block" type="button" style="margin-top:8px" data-forgot>Esqueci minha senha</button>
        <p class="demo-note">Demonstração: os campos já vêm preenchidos e nada é enviado. No sistema real, o acesso é só da dona e de quem ela convidar, com recuperação de senha por e-mail.</p>
      </div></main>`;
    $('[data-enter]').onclick = () => { try { sessionStorage.setItem(AUTH, '1'); } catch (e) { /* sessão só na memória */ } location.hash = '#/resumo'; route(); };
    $('[data-forgot]').onclick = () => toast('No sistema real, enviamos um link de uso único para o seu e-mail.');
  }

  /* ---------- estrutura ---------- */
  function shell(page, title, body, opts = {}) {
    const cur = (k) => (k === page ? 'aria-current="page"' : '');
    $('#root').innerHTML = `
      <div class="app">
        <aside class="side">
          <div class="brand">${LOGO}${esc(db.settings.nome)}</div>
          <a class="btn btn--lime new" href="#/produtos/novo">${ICON.plus} Nova peça</a>
          <nav aria-label="Painel">${NAV.map(([k, n]) => `<a href="#/${k}" ${cur(k)}>${ICON[k]}${n}</a>`).join('')}</nav>
          <div class="side-foot"><a href="../" target="_blank" rel="noopener">${ICON.site}Ver o site</a><button type="button" data-logout>${ICON.sair}Sair</button></div>
        </aside>
        <header class="top">
          ${opts.back ? `<a class="icon-btn" href="${opts.back}" aria-label="Voltar">${ICON.back}</a>` : `<span class="only-mobile" style="display:flex;align-items:center;gap:8px;width:32px">${LOGO.replace('<svg', '<svg style="width:32px;height:32px"')}</span>`}
          <h1 class="top-title">${esc(title)}</h1>
          <a class="btn btn--ghost btn--sm" href="../" target="_blank" rel="noopener">Ver site</a>
        </header>
        <main class="main" id="main">${body}</main>
        <nav class="tabs" aria-label="Atalhos">
          <a href="#/resumo" ${cur('resumo')}>${ICON.resumo}Resumo</a>
          <a href="#/produtos" ${cur('produtos')}>${ICON.produtos}Peças</a>
          <a class="add" href="#/produtos/novo" aria-label="Nova peça"><span>${ICON.plus}</span>Nova</a>
          <a href="#/looks" ${cur('looks')}>${ICON.looks}Looks</a>
          <button type="button" data-more ${['colecoes', 'categorias', 'inicio', 'config', 'historico'].includes(page) ? 'aria-current="page"' : ''}>${ICON.mais}Mais</button>
        </nav>
      </div>`;
    $('[data-logout]').onclick = logout;
    $('[data-more]').onclick = () => {
      const sh = $('#sheet');
      sh.innerHTML = `<div class="grab"></div><nav aria-label="Mais opções">
        ${NAV.slice(3).map(([k, n]) => `<a href="#/${k}">${ICON[k]}${n}</a>`).join('')}
        <a href="../" target="_blank" rel="noopener">${ICON.site}Ver o site</a>
        <button type="button" data-logout2>${ICON.sair}Sair</button></nav>`;
      sh.showModal();
      $$('a', sh).forEach((a) => a.addEventListener('click', () => sh.close()));
      $('[data-logout2]', sh).onclick = () => { sh.close(); logout(); };
      sh.onclick = (e) => { if (e.target === sh) sh.close(); };
    };
    scrollTo(0, 0);
  }
  function logout() { try { sessionStorage.removeItem(AUTH); } catch (e) { /* nada */ } guard = null; location.hash = ''; renderLogin(); }

  /* ---------- resumo ---------- */
  function pageResumo() {
    const P = db.produtos;
    const n = {
      total: P.filter((p) => p.status !== 'arquivado').length,
      pub: P.filter((p) => p.status === 'publicado').length,
      draft: P.filter((p) => p.status === 'rascunho').length,
      off: P.filter((p) => p.status !== 'arquivado' && p.disp === 'indisponivel').length,
      cats: db.categorias.filter((c) => c.ativa).length,
      cols: db.colecoes.filter((c) => c.status === 'publicado').length,
      looks: db.looks.filter((l) => l.status === 'publicado').length
    };
    const pend = [...P, ...db.looks, ...db.colecoes].filter((x) => x.pendente || x.status === 'rascunho');
    shell('resumo', 'Resumo', `
      <p class="hello">Olá! Sua vitrine hoje</p>
      <p class="lede">O que está no site agora e o que falta publicar.</p>
      <div class="stats">
        <a class="stat hl" href="#/produtos?st=publicado"><b>${n.pub}</b><span>peças no site</span></a>
        <a class="stat" href="#/produtos?st=rascunho"><b>${n.draft}</b><span>rascunhos</span></a>
        <a class="stat" href="#/produtos"><b>${n.off}</b><span>indisponíveis</span></a>
        <a class="stat" href="#/produtos"><b>${n.total}</b><span>peças no total</span></a>
        <a class="stat" href="#/categorias"><b>${n.cats}</b><span>categorias ativas</span></a>
        <a class="stat" href="#/colecoes"><b>${n.cols}</b><span>coleções no site</span></a>
        <a class="stat" href="#/looks"><b>${n.looks}</b><span>looks no site</span></a>
        <div class="stat" style="background:var(--stone)"><b>—</b><span>cliques no WhatsApp: aparecem aqui quando o site estiver no ar</span></div>
      </div>
      <section class="panel"><h2>Atalhos</h2><div class="quick">
        <a class="btn btn--lime" href="#/produtos/novo">${ICON.plus} Cadastrar peça</a>
        <a class="btn btn--ghost" href="#/produtos">Atualizar disponibilidade</a>
        <a class="btn btn--ghost" href="#/inicio">Editar página inicial</a></div></section>
      <section class="panel"><h2>Esperando publicação</h2>${pend.length ? `<div class="list">${pend.map((x) => {
        const kind = db.produtos.includes(x) ? 'produtos' : db.looks.includes(x) ? 'looks' : 'colecoes';
        const img = x.imgs ? (x.imgs[0] || {}).src : x.img;
        return `<a class="item" href="#/${kind}/${x.id}" style="text-decoration:none"><div class="item-img">${img ? `<img src="${esc(u(img))}" alt="">` : ''}</div><div><p class="item-name">${esc(x.nome)}</p><div class="item-meta">${statusBadges(x)}</div></div><span class="btn btn--ghost btn--sm">Abrir</span></a>`;
      }).join('')}</div>` : '<div class="empty-state"><b>Tudo publicado.</b>Quando você salvar um rascunho, ele aparece aqui.</div>'}</section>`);
  }

  /* ---------- peças ---------- */
  const pf = { q: '', cat: '', st: '' };
  function pageProdutos(params) {
    if (params.get('st')) pf.st = params.get('st');
    shell('produtos', 'Peças', `
      <div class="toolbar">
        <input class="input" type="search" placeholder="Buscar pelo nome" value="${esc(pf.q)}" data-f="q" aria-label="Buscar pelo nome">
        <select class="select" data-f="cat" aria-label="Filtrar por categoria"><option value="">Todas as categorias</option>${db.categorias.map((c) => `<option value="${c.id}" ${pf.cat === c.id ? 'selected' : ''}>${esc(c.nome)}</option>`).join('')}</select>
        <a class="btn btn--lime" href="#/produtos/novo">${ICON.plus} Nova peça</a>
      </div>
      <div class="seg" role="radiogroup" aria-label="Situação" style="margin-bottom:14px">${[['', 'Todas'], ['publicado', 'No site'], ['rascunho', 'Rascunhos'], ['arquivado', 'Arquivadas']].map(([v, n]) => `<label><input type="radio" name="st" value="${v}" ${pf.st === v ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div>
      <div class="list" id="plist"></div>`);
    const draw = () => {
      const q = pf.q.trim().toLowerCase();
      const list = db.produtos.filter((p) => (!q || p.nome.toLowerCase().includes(q)) && (!pf.cat || p.cat === pf.cat) && (pf.st ? p.status === pf.st : p.status !== 'arquivado'));
      $('#plist').innerHTML = list.length ? list.map((p) => `
        <article class="item" data-id="${p.id}">
          <a class="item-img" href="#/produtos/${p.id}">${p.imgs[0] ? `<img src="${esc(u(p.imgs[0].src))}" alt="">` : ''}</a>
          <div><a class="item-name" href="#/produtos/${p.id}" style="text-decoration:none;display:block">${esc(p.nome)}</a>
            <div class="item-meta">${esc(catName(p.cat))} ${statusBadges(p)}${!db.categorias.find((c) => c.id === p.cat && c.ativa) ? ' <span class="badge off">Categoria desativada</span>' : ''}</div></div>
          <div class="item-extra"><label class="sr" for="d-${p.id}">Disponibilidade de ${esc(p.nome)}</label>
            <select class="select" id="d-${p.id}" data-disp>${Object.entries(Store.DISP).map(([k, v]) => `<option value="${k}" ${p.disp === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
          <div class="item-actions menu-pop"><button class="icon-btn" type="button" aria-label="Mais ações para ${esc(p.nome)}" aria-expanded="false" data-menu>${ICON.dots}</button></div>
        </article>`).join('') : `<div class="empty-state"><b>Nenhuma peça aqui.</b>${pf.q || pf.cat || pf.st ? 'Mude os filtros ou ' : ''}<a href="#/produtos/novo">cadastre uma peça</a>.</div>`;
    };
    draw();
    const main = $('#main');
    main.addEventListener('input', (e) => { if (e.target.dataset.f === 'q') { pf.q = e.target.value; draw(); } });
    main.addEventListener('change', (e) => {
      if (e.target.dataset.f === 'cat') { pf.cat = e.target.value; draw(); }
      if (e.target.name === 'st') { pf.st = e.target.value; draw(); }
      if ('disp' in e.target.dataset) {
        // Disponibilidade é tarefa do dia a dia: vale na hora, sem passar pelo rascunho
        const p = prodById(e.target.closest('[data-id]').dataset.id);
        p.disp = e.target.value; if (p.pub) p.pub.disp = p.disp;
        log(`Disponibilidade de "${p.nome}": ${Store.DISP[p.disp]}`);
        if (persist()) toast(`${p.nome}: ${Store.DISP[p.disp].toLowerCase()} — já no site`);
      }
    });
    main.addEventListener('click', async (e) => {
      const m = e.target.closest('[data-menu]');
      const a = e.target.closest('[data-act]');
      const p = a && prodById(a.closest('[data-id]').dataset.id);
      $$('.menu-pop>div', main).forEach((x) => { if (!m || x.parentElement !== m.parentElement) { x.previousElementSibling.setAttribute('aria-expanded', 'false'); x.remove(); } });
      if (m) {
        if (m.nextElementSibling) { m.nextElementSibling.remove(); m.setAttribute('aria-expanded', 'false'); return; }
        const p = prodById(m.closest('[data-id]').dataset.id);
        m.setAttribute('aria-expanded', 'true');
        m.insertAdjacentHTML('afterend', `<div role="menu">
          <button type="button" role="menuitem" data-act="edit">Editar</button>
          ${p.status === 'publicado' ? '<button type="button" role="menuitem" data-act="view">Ver no site</button>' : ''}
          <button type="button" role="menuitem" data-act="dup">Duplicar</button>
          <button type="button" role="menuitem" data-act="arch">${p.status === 'arquivado' ? 'Restaurar como rascunho' : 'Arquivar'}</button>
          <button type="button" role="menuitem" class="danger" data-act="del">Excluir</button></div>`);
        return;
      }
      if (!a || !p) return;
      if (a.dataset.act === 'edit') location.hash = `#/produtos/${p.id}`;
      if (a.dataset.act === 'view') open(`../#p/${p.pub.slug}`, '_blank', 'noopener');
      if (a.dataset.act === 'dup') {
        const c = Store.clone(p); delete c.pub; c.pendente = false;
        c.id = uid('p'); c.nome = p.nome + ' (cópia)'; c.slug = uniqueSlug(c.nome, db.produtos); c.status = 'rascunho';
        db.produtos.unshift(c); log(`Duplicou "${p.nome}"`);
        if (persist()) { toast('Cópia criada como rascunho'); location.hash = `#/produtos/${c.id}`; }
      }
      if (a.dataset.act === 'arch') {
        if (p.status === 'arquivado') { p.status = 'rascunho'; log(`Restaurou "${p.nome}"`); if (persist()) toast('Restaurada como rascunho'); }
        else if (await confirmBox(`Arquivar "${p.nome}"?`, 'Ela sai do site, mas continua guardada aqui. Dá para restaurar quando quiser.', 'Arquivar')) {
          p.status = 'arquivado'; log(`Arquivou "${p.nome}"`); if (persist()) toast('Peça arquivada — saiu do site');
        }
        draw();
      }
      if (a.dataset.act === 'del') deleteProduct(p).then((ok) => ok && draw());
    });
  }

  async function deleteProduct(p) {
    const ok = await confirmBox(`Excluir "${p.nome}"?`, 'A peça sai do site e do painel, e também dos looks e coleções em que aparece. No sistema real, ela fica 30 dias na lixeira antes de sumir de vez.', 'Excluir', true);
    if (!ok) return false;
    db.produtos = db.produtos.filter((x) => x.id !== p.id);
    [...db.looks, ...db.colecoes].forEach((g) => {
      g.produtos = g.produtos.filter((id) => id !== p.id);
      if (g.pub) g.pub.produtos = g.pub.produtos.filter((id) => id !== p.id);
    });
    log(`Excluiu "${p.nome}"`);
    if (persist()) toast('Peça excluída');
    return true;
  }

  /* ---------- editor de peça ---------- */
  function pageProduto(id) {
    const orig = id === 'novo' ? null : prodById(id);
    if (id !== 'novo' && !orig) { location.hash = '#/produtos'; return; }
    const d = orig ? Store.clone(orig) : {
      id: uid('p'), nome: '', slug: '', cat: (db.categorias[0] || {}).id || '', desc: '', carac: '',
      cores: [{ id: uid('k'), nome: '', hex: '#121413' }], tamanhos: ['P', 'M', 'G'], preco: null,
      disp: 'consultar', lanc: true, dest: false, imgs: [], status: 'rascunho'
    };
    let dirty = false;
    const touch = () => { dirty = true; guard = () => dirty; };
    const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'Único'];

    shell('produtos', orig ? 'Editar peça' : 'Nova peça', `
      <div class="status-line" id="st"></div>
      <div class="editor">
        <div>
          <section class="panel"><h2>Fotos</h2>
            <p class="lede" style="margin-bottom:12px">A primeira foto é a da vitrine. Use as setas para mudar a ordem.</p>
            <div class="photos" id="photos"></div>
            <span class="err" id="e-img" hidden>Adicione pelo menos uma foto para publicar.</span>
          </section>
          <section class="panel"><h2>Informações</h2>
            <label class="field"><span>Nome da peça</span><input class="input" data-k="nome" value="${esc(d.nome)}" maxlength="60" placeholder="Ex.: Conjunto Malibu" required><span class="err" id="e-nome" hidden>Dê um nome à peça.</span></label>
            <label class="field"><span>Categoria</span><select class="select" data-k="cat">${db.categorias.map((c) => `<option value="${c.id}" ${d.cat === c.id ? 'selected' : ''}>${esc(c.nome)}${c.ativa ? '' : ' (desativada)'}</option>`).join('')}</select></label>
            <label class="field"><span>Descrição <span class="hint">· aparece na página da peça</span></span><textarea class="textarea" data-k="desc" maxlength="400" placeholder="Conte como é a peça, do jeito que você fala com as clientes.">${esc(d.desc)}</textarea></label>
            <label class="field"><span>Tecido e características <span class="hint">· só o que for confirmado pelo fornecedor</span></span><input class="input" data-k="carac" value="${esc(d.carac)}" maxlength="120" placeholder="Ex.: Poliamida · decote nas costas"></label>
          </section>
          <section class="panel"><h2>Cores e tamanhos</h2>
            <div class="colors" id="colors"></div>
            <button class="btn btn--ghost btn--sm" type="button" data-addcolor>${ICON.plus} Adicionar cor</button>
            <p class="label" style="margin:18px 0 8px">Tamanhos</p>
            <div class="seg sizes">${SIZES.map((s) => `<label><input type="checkbox" value="${s}" data-size ${d.tamanhos.includes(s) ? 'checked' : ''}><span>${s}</span></label>`).join('')}</div>
          </section>
        </div>
        <div class="col-side">
          <section class="panel"><h2>Preço e disponibilidade</h2>
            <label class="field"><span>Preço <span class="hint">· opcional; deixe vazio para não mostrar</span></span><div class="prefix"><i>R$</i><input class="input" data-k="preco" inputmode="decimal" placeholder="0,00" value="${d.preco ? (d.preco / 100).toFixed(2).replace('.', ',') : ''}"></div></label>
            <p class="label" style="margin:0 0 8px">Disponibilidade</p>
            <div class="seg" role="radiogroup" aria-label="Disponibilidade">${Object.entries(Store.DISP).map(([k, v]) => `<label><input type="radio" name="disp" value="${k}" ${d.disp === k ? 'checked' : ''}><span><i style="background:${k === 'disponivel' ? 'var(--ok)' : k === 'indisponivel' ? 'var(--off)' : 'var(--warn)'}"></i>${v}</span></label>`).join('')}</div>
            <p class="hint" style="margin:10px 0 0">O site avisa que a informação é atualizada manualmente pela loja.</p>
          </section>
          <section class="panel"><h2>Destaques</h2>
            <label class="switch"><span><b>Lançamento</b><small>Aparece em "Lançamentos" com a etiqueta Novo</small></span><input type="checkbox" data-b="lanc" ${d.lanc ? 'checked' : ''}></label>
            <label class="switch"><span><b>Destaque</b><small>Ganha prioridade na vitrine</small></span><input type="checkbox" data-b="dest" ${d.dest ? 'checked' : ''}></label>
          </section>
          ${orig ? `<section class="panel"><h2>Outras ações</h2><div style="display:grid;gap:8px">
            ${orig.status === 'publicado' ? '<button class="btn btn--ghost" type="button" data-unpub>Tirar do site (vira rascunho)</button>' : ''}
            <button class="btn btn--danger" type="button" data-del>${ICON.trash} Excluir peça</button></div></section>` : ''}
        </div>
      </div>
      <div class="actionbar">
        <button class="btn btn--ghost" type="button" data-save>Salvar rascunho</button>
        <button class="btn btn--ghost" type="button" data-preview>Ver prévia</button>
        <button class="btn btn--lime" type="button" data-publish>Publicar no site</button>
      </div>`, { back: '#/produtos' });

    const main = $('#main');
    const drawStatus = () => {
      const cur = prodById(d.id);
      $('#st').innerHTML = cur ? `${statusBadges(cur)} <span>${dirty ? 'Você tem alterações não salvas.' : cur.status === 'publicado' && cur.pendente ? 'Salvo como rascunho. O site mostra a versão anterior até você publicar.' : ''}</span>` : '<span class="badge draft">Nova</span> <span>Ainda não salva.</span>';
    };
    const drawPhotos = () => {
      const colorOpts = (sel) => d.cores.map((c) => `<option value="${c.id}" ${sel === c.id ? 'selected' : ''}>${esc(c.nome || 'Cor sem nome')}</option>`).join('');
      $('#photos').innerHTML = d.imgs.map((im, i) => `
        <div class="photo" data-i="${i}">
          <div class="photo-img"><img src="${esc(u(im.sm || im.src))}" alt="${esc(im.alt)}">${i === 0 ? '<span class="main-flag">Vitrine</span>' : ''}</div>
          <div class="photo-tools">
            <button class="icon-btn" type="button" aria-label="Mover para a esquerda" data-mv="-1" ${i === 0 ? 'disabled' : ''}>${ICON.left}</button>
            <button class="icon-btn" type="button" aria-label="Usar como foto da vitrine" data-main ${i === 0 ? 'disabled' : ''}>${ICON.star}</button>
            <button class="icon-btn" type="button" aria-label="Mover para a direita" data-mv="1" ${i === d.imgs.length - 1 ? 'disabled' : ''}>${ICON.right}</button>
            <button class="icon-btn" type="button" aria-label="Remover foto" data-rm>${ICON.trash}</button>
          </div>
          <input class="input" data-alt value="${esc(im.alt)}" placeholder="Descreva a foto" aria-label="Descrição da foto ${i + 1} (para acessibilidade)">
          ${d.cores.length > 1 ? `<select class="select" data-imgcor aria-label="Cor mostrada na foto ${i + 1}">${colorOpts(im.cor)}</select>` : ''}
        </div>`).join('') + `
        <label class="drop" id="drop">${ICON.camera}<b>Adicionar fotos</b><span class="hint">Da galeria ou da câmera · JPG, PNG ou HEIC · até 15 MB</span><input type="file" accept="image/*" multiple hidden data-files></label>`;
    };
    const drawColors = () => {
      $('#colors').innerHTML = d.cores.map((c, i) => `
        <div class="color-row" data-ci="${i}"><input type="color" value="${esc(c.hex)}" aria-label="Tom da cor ${i + 1}" data-hex><input class="input" value="${esc(c.nome)}" placeholder="Nome da cor (ex.: Azul)" maxlength="24" aria-label="Nome da cor ${i + 1}" data-cname>
          <button class="icon-btn" type="button" aria-label="Remover cor" data-rmcolor ${d.cores.length === 1 ? 'disabled' : ''}>${ICON.x}</button></div>`).join('');
    };
    drawPhotos(); drawColors(); drawStatus();

    async function addFiles(files) {
      const list = [...files];
      if (!list.length) return;
      toast(`Preparando ${list.length} ${list.length === 1 ? 'foto' : 'fotos'}…`);
      for (const f of list) {
        try { const data = await resizeFile(f); d.imgs.push({ src: data, sm: data, alt: '', cor: d.cores[0].id }); touch(); }
        catch (err) { toast(err.message, true); }
      }
      drawPhotos(); drawStatus();
    }

    main.addEventListener('input', (e) => {
      const t = e.target;
      if (t.dataset.k) { d[t.dataset.k] = t.value; touch(); if (t.dataset.k === 'nome') { t.removeAttribute('aria-invalid'); $('#e-nome').hidden = true; } }
      if ('alt' in t.dataset) { d.imgs[+t.closest('[data-i]').dataset.i].alt = t.value; touch(); }
      if ('cname' in t.dataset) { d.cores[+t.closest('[data-ci]').dataset.ci].nome = t.value; touch(); }
      if ('hex' in t.dataset) { d.cores[+t.closest('[data-ci]').dataset.ci].hex = t.value; touch(); }
      drawStatus();
    });
    main.addEventListener('change', (e) => {
      const t = e.target;
      if (t.name === 'disp') d.disp = t.value;
      if (t.dataset.b) d[t.dataset.b] = t.checked;
      if ('size' in t.dataset) d.tamanhos = $$('[data-size]', main).filter((x) => x.checked).map((x) => x.value);
      if ('imgcor' in t.dataset) d.imgs[+t.closest('[data-i]').dataset.i].cor = t.value;
      if ('cname' in t.dataset && d.cores.length > 1) drawPhotos();
      if ('files' in t.dataset) { addFiles(t.files); return; }
      touch(); drawStatus();
    });
    main.addEventListener('dragover', (e) => { const z = e.target.closest('#drop'); if (z) { e.preventDefault(); z.classList.add('over'); } });
    main.addEventListener('dragleave', (e) => { const z = e.target.closest('#drop'); if (z) z.classList.remove('over'); });
    main.addEventListener('drop', (e) => { const z = e.target.closest('#drop'); if (z) { e.preventDefault(); z.classList.remove('over'); addFiles(e.dataTransfer.files); } });

    main.addEventListener('click', async (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const ph = b.closest('[data-i]');
      if (ph) {
        const i = +ph.dataset.i;
        if (b.dataset.mv) { const j = i + +b.dataset.mv; [d.imgs[i], d.imgs[j]] = [d.imgs[j], d.imgs[i]]; }
        if ('main' in b.dataset) d.imgs.unshift(d.imgs.splice(i, 1)[0]);
        if ('rm' in b.dataset) { if (!(await confirmBox('Remover esta foto?', 'Ela sai desta peça. Você pode enviá-la de novo depois.', 'Remover', true))) return; d.imgs.splice(i, 1); }
        touch(); drawPhotos(); drawStatus(); return;
      }
      if ('addcolor' in b.dataset) { d.cores.push({ id: uid('k'), nome: '', hex: '#A3C93A' }); touch(); drawColors(); drawPhotos(); $$('[data-cname]', main).pop().focus(); return; }
      if ('rmcolor' in b.dataset) {
        const i = +b.closest('[data-ci]').dataset.ci; const gone = d.cores.splice(i, 1)[0];
        d.imgs.forEach((im) => { if (im.cor === gone.id) im.cor = d.cores[0].id; });
        touch(); drawColors(); drawPhotos(); return;
      }
      if ('save' in b.dataset) { if (save(false)) toast('Rascunho salvo'); return; }
      if ('preview' in b.dataset) { if (save(false, true)) open(`../?previa=1#p/${d.slug}`, '_blank', 'noopener'); return; }
      if ('publish' in b.dataset) { if (save(true)) toast('Publicado — já aparece no site'); return; }
      if ('unpub' in b.dataset) {
        if (!(await confirmBox('Tirar do site?', 'A peça continua aqui como rascunho e pode voltar quando você publicar.', 'Tirar do site'))) return;
        const cur = prodById(d.id); cur.status = 'rascunho'; d.status = 'rascunho'; log(`Tirou "${cur.nome}" do site`);
        if (persist()) { toast('A peça saiu do site'); pageProduto(d.id); } return;
      }
      if ('del' in b.dataset) { if (await deleteProduct(prodById(d.id))) { guard = null; location.hash = '#/produtos'; } }
    });

    function save(publish, quiet = false) {
      d.nome = d.nome.trim();
      const errs = [];
      if (!d.nome) { errs.push('nome'); $('[data-k=nome]').setAttribute('aria-invalid', 'true'); $('#e-nome').hidden = false; }
      if (publish && !d.imgs.length) { errs.push('img'); $('#e-img').hidden = false; }
      if (errs.length) { toast(errs.includes('nome') ? 'Falta o nome da peça.' : 'Falta pelo menos uma foto para publicar.', true); (errs[0] === 'nome' ? $('[data-k=nome]') : $('#drop')).scrollIntoView({ block: 'center' }); return false; }
      $('#e-img').hidden = true;
      const priceTxt = String(d.preco ?? '').replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
      d.preco = typeof d.preco === 'number' ? d.preco : (priceTxt ? Math.round(parseFloat(priceTxt) * 100) : null);
      d.cores = d.cores.map((c, i) => ({ ...c, nome: c.nome.trim() || `Cor ${i + 1}` }));
      d.slug = uniqueSlug(d.nome, db.produtos, d.id);
      const idx = db.produtos.findIndex((x) => x.id === d.id);
      const prev = idx >= 0 ? db.produtos[idx] : null;
      const item = { ...Store.clone(d), status: prev ? prev.status : 'rascunho', pub: prev && prev.pub, pendente: prev ? prev.status === 'publicado' : false };
      if (publish) Store.publish(item);
      if (idx >= 0) db.produtos[idx] = item; else db.produtos.unshift(item);
      log(`${publish ? 'Publicou' : 'Salvou rascunho de'} "${item.nome}"`);
      if (!persist()) return false;
      Object.assign(d, Store.clone(item)); delete d.pub;
      dirty = false; guard = null;
      if (!prev) { history.replaceState(null, '', `#/produtos/${d.id}`); }
      if (!quiet) pageProduto(d.id); else drawStatus();
      return true;
    }
  }

  /* ---------- looks e coleções ---------- */
  const GROUP = {
    looks: { title: 'Looks', one: 'look', novo: 'Novo look', hint: 'Combinações de peças com uma foto. As clientes podem consultar o look inteiro pelo WhatsApp.' },
    colecoes: { title: 'Coleções', one: 'coleção', novo: 'Nova coleção', hint: 'Seleções de peças com capa, como "Vem, verão".' }
  };
  function pageGroupList(kind) {
    const G = GROUP[kind], list = db[kind];
    shell(kind, G.title, `
      <p class="lede">${G.hint}</p>
      <a class="btn btn--lime" href="#/${kind}/novo" style="margin-bottom:14px">${ICON.plus} ${G.novo}</a>
      <div class="list">${list.length ? list.map((g) => `
        <a class="item" href="#/${kind}/${g.id}" style="text-decoration:none">
          <div class="item-img">${g.img ? `<img src="${esc(u(g.img))}" alt="">` : ''}</div>
          <div><p class="item-name">${esc(g.nome)}</p><div class="item-meta">${g.produtos.length} ${g.produtos.length === 1 ? 'peça' : 'peças'} ${statusBadges(g)}</div></div>
          <span class="btn btn--ghost btn--sm">Editar</span></a>`).join('') : `<div class="empty-state"><b>Nenhum(a) ${G.one} ainda.</b>Crie o primeiro.</div>`}</div>`);
  }

  function pageGroup(kind, id) {
    const G = GROUP[kind];
    const orig = id === 'novo' ? null : db[kind].find((x) => x.id === id);
    if (id !== 'novo' && !orig) { location.hash = `#/${kind}`; return; }
    const d = orig ? Store.clone(orig) : { id: uid(kind[0]), nome: '', slug: '', desc: '', img: '', produtos: [], status: 'rascunho' };
    let dirty = false; const touch = () => { dirty = true; guard = () => dirty; };
    const prods = db.produtos.filter((p) => p.status !== 'arquivado');
    shell(kind, orig ? `Editar ${G.one}` : G.novo, `
      <div class="status-line">${orig ? statusBadges(orig) : '<span class="badge draft">Novo</span>'}</div>
      <div class="editor">
        <div>
          <section class="panel"><h2>Foto</h2>
            <div style="display:grid;grid-template-columns:120px 1fr;gap:14px;align-items:center">
              <div class="item-img" style="width:120px;height:150px" id="gimg">${d.img ? `<img src="${esc(u(d.img))}" alt="">` : ''}</div>
              <div style="display:grid;gap:8px"><button class="btn btn--ghost" type="button" data-pick>${d.img ? 'Trocar foto' : 'Escolher foto'}</button><span class="err" id="e-gimg" hidden>Escolha uma foto para publicar.</span></div></div>
          </section>
          <section class="panel"><h2>Informações</h2>
            <label class="field"><span>Nome</span><input class="input" data-k="nome" value="${esc(d.nome)}" maxlength="40"><span class="err" id="e-gnome" hidden>Dê um nome.</span></label>
            <label class="field"><span>Descrição</span><textarea class="textarea" data-k="desc" maxlength="240">${esc(d.desc)}</textarea></label>
          </section>
        </div>
        <div class="col-side">
          <section class="panel"><h2>Peças (${'<span id="gcount">' + d.produtos.length + '</span>'})</h2>
            <div class="pick pick-check">${prods.map((p) => `<label><input type="checkbox" value="${p.id}" data-gp ${d.produtos.includes(p.id) ? 'checked' : ''}><img src="${esc(u((p.imgs[0] || {}).sm || (p.imgs[0] || {}).src))}" alt=""><small>${esc(p.nome)}</small></label>`).join('')}</div>
          </section>
          ${orig ? `<section class="panel"><h2>Outras ações</h2><div style="display:grid;gap:8px">${orig.status === 'publicado' ? '<button class="btn btn--ghost" type="button" data-unpub>Tirar do site</button>' : ''}<button class="btn btn--danger" type="button" data-gdel>${ICON.trash} Excluir</button></div></section>` : ''}
        </div>
      </div>
      <div class="actionbar"><button class="btn btn--ghost" type="button" data-save>Salvar rascunho</button><a class="btn btn--ghost" href="../?previa=1#${kind}" target="_blank" rel="noopener" data-prev>Ver prévia</a><button class="btn btn--lime" type="button" data-publish>Publicar no site</button></div>`, { back: `#/${kind}` });

    const main = $('#main');
    main.addEventListener('input', (e) => { if (e.target.dataset.k) { d[e.target.dataset.k] = e.target.value; touch(); } });
    main.addEventListener('change', (e) => {
      if ('gp' in e.target.dataset) { d.produtos = $$('[data-gp]', main).filter((x) => x.checked).map((x) => x.value); $('#gcount').textContent = d.produtos.length; touch(); }
    });
    main.addEventListener('click', async (e) => {
      const b = e.target.closest('button, a');
      if (!b) return;
      if ('pick' in b.dataset) { const s = await pickImage(d.img); if (s) { d.img = s; touch(); $('#gimg').innerHTML = `<img src="${esc(u(s))}" alt="">`; b.textContent = 'Trocar foto'; } }
      if ('prev' in b.dataset) { if (!save(false, true)) e.preventDefault(); }
      if ('save' in b.dataset && save(false)) toast('Rascunho salvo');
      if ('publish' in b.dataset && save(true)) toast('Publicado — já aparece no site');
      if ('unpub' in b.dataset) { const cur = db[kind].find((x) => x.id === d.id); cur.status = 'rascunho'; log(`Tirou "${cur.nome}" do site`); if (persist()) { toast('Saiu do site'); pageGroup(kind, d.id); } }
      if ('gdel' in b.dataset && await confirmBox(`Excluir "${d.nome}"?`, 'As peças continuam no catálogo; só este agrupamento é removido.', 'Excluir', true)) {
        db[kind] = db[kind].filter((x) => x.id !== d.id); log(`Excluiu ${G.one} "${d.nome}"`); guard = null;
        if (persist()) { toast('Excluído'); location.hash = `#/${kind}`; }
      }
    });
    function save(publish, quiet = false) {
      d.nome = d.nome.trim();
      if (!d.nome) { $('#e-gnome').hidden = false; toast('Falta o nome.', true); return false; }
      if (publish && !d.img) { $('#e-gimg').hidden = false; toast('Escolha uma foto para publicar.', true); return false; }
      d.slug = uniqueSlug(d.nome, db[kind], d.id);
      const idx = db[kind].findIndex((x) => x.id === d.id);
      const prev = idx >= 0 ? db[kind][idx] : null;
      const item = { ...Store.clone(d), status: prev ? prev.status : 'rascunho', pub: prev && prev.pub, pendente: prev ? prev.status === 'publicado' : false };
      if (publish) Store.publish(item);
      if (idx >= 0) db[kind][idx] = item; else db[kind].unshift(item);
      log(`${publish ? 'Publicou' : 'Salvou rascunho de'} ${G.one} "${item.nome}"`);
      if (!persist()) return false;
      dirty = false; guard = null;
      if (!prev) history.replaceState(null, '', `#/${kind}/${d.id}`);
      if (!quiet) pageGroup(kind, d.id);
      return true;
    }
  }

  /* ---------- categorias ---------- */
  function pageCategorias() {
    const C = db.categorias;
    shell('categorias', 'Categorias', `
      <p class="lede">A ordem aqui é a ordem do site. Desativar esconde a categoria e as peças dela do site, sem apagar nada.</p>
      <div class="list" id="clist">${C.map((c, i) => {
        const n = db.produtos.filter((p) => p.cat === c.id && p.status !== 'arquivado').length;
        return `<article class="item" data-id="${c.id}" style="grid-template-columns:64px 1fr auto">
          <button class="item-img" type="button" data-cimg aria-label="Trocar foto de ${esc(c.nome)}" style="border:0;padding:0;cursor:pointer">${c.img ? `<img src="${esc(u(c.img))}" alt="">` : ''}</button>
          <div><input class="input" value="${esc(c.nome)}" maxlength="24" data-cname aria-label="Nome da categoria" style="min-height:40px;font-weight:700"><div class="item-meta" style="margin-top:4px">${n} ${n === 1 ? 'peça' : 'peças'} ${c.ativa ? '' : '<span class="badge off">Fora do site</span>'}</div></div>
          <div class="item-actions" style="flex-direction:column">
            <div style="display:flex;gap:4px"><button class="icon-btn" type="button" aria-label="Subir" data-cmv="-1" ${i === 0 ? 'disabled' : ''}>${ICON.up}</button><button class="icon-btn" type="button" aria-label="Descer" data-cmv="1" ${i === C.length - 1 ? 'disabled' : ''}>${ICON.down}</button></div>
            <label class="switch" style="padding:0;gap:8px"><small>Ativa</small><input type="checkbox" data-cativa ${c.ativa ? 'checked' : ''} aria-label="Mostrar ${esc(c.nome)} no site"></label>
          </div></article>`;
      }).join('')}</div>
      <section class="panel" style="margin-top:14px"><h2>Nova categoria</h2><div style="display:flex;gap:8px"><input class="input" id="newcat" maxlength="24" placeholder="Ex.: Tops" aria-label="Nome da nova categoria"><button class="btn" type="button" data-addcat>Criar</button></div></section>`);
    const main = $('#main');
    const cat = (el) => C.find((c) => c.id === el.closest('[data-id]').dataset.id);
    main.addEventListener('change', async (e) => {
      const t = e.target;
      if ('cname' in t.dataset) {
        const c = cat(t); const v = t.value.trim();
        if (!v) { t.value = c.nome; toast('A categoria precisa de um nome.', true); return; }
        log(`Renomeou categoria "${c.nome}" para "${v}"`); c.nome = v; c.slug = uniqueSlug(v, C, c.id); if (persist()) toast('Nome salvo');
      }
      if ('cativa' in t.dataset) {
        const c = cat(t);
        const n = db.produtos.filter((p) => p.cat === c.id && p.status === 'publicado').length;
        if (!t.checked && n && !(await confirmBox(`Desativar "${c.nome}"?`, `${n} ${n === 1 ? 'peça sai' : 'peças saem'} do site junto. Nada é apagado: ao reativar, voltam.`, 'Desativar'))) { t.checked = true; return; }
        c.ativa = t.checked; log(`${c.ativa ? 'Ativou' : 'Desativou'} a categoria "${c.nome}"`);
        if (persist()) { toast(c.ativa ? 'Categoria de volta ao site' : 'Categoria fora do site'); pageCategorias(); }
      }
    });
    main.addEventListener('click', async (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.cmv) { const i = C.indexOf(cat(b)), j = i + +b.dataset.cmv; [C[i], C[j]] = [C[j], C[i]]; log('Reordenou categorias'); if (persist()) pageCategorias(); }
      if ('cimg' in b.dataset) { const c = cat(b); const s = await pickImage(c.img); if (s) { c.img = s; log(`Trocou a foto da categoria "${c.nome}"`); if (persist()) { toast('Foto da categoria trocada'); pageCategorias(); } } }
      if ('addcat' in b.dataset) {
        const v = $('#newcat').value.trim();
        if (!v) { toast('Escreva o nome da categoria.', true); $('#newcat').focus(); return; }
        C.push({ id: uid('c'), nome: v, slug: uniqueSlug(v, C), img: '', ativa: true }); log(`Criou a categoria "${v}"`);
        if (persist()) { toast('Categoria criada'); pageCategorias(); }
      }
    });
  }

  /* ---------- página inicial ---------- */
  function pageInicio() {
    const H = db.home;
    shell('inicio', 'Página inicial', `
      <div class="callout">Os textos têm limite de tamanho para não quebrar o layout no celular. As mudanças daqui vão para o site assim que você salvar.</div>
      <div class="editor">
        <div>
          <section class="panel"><h2>Destaque do topo</h2>
            <div class="row row-2">
              <label class="field"><span>Título — linha 1</span><input class="input" data-h="heroTitulo1" value="${esc(H.heroTitulo1)}" maxlength="14"></label>
              <label class="field"><span>Título — linha 2</span><input class="input" data-h="heroTitulo2" value="${esc(H.heroTitulo2)}" maxlength="14"></label>
            </div>
            <label class="field"><span>Subtítulo</span><input class="input" data-h="heroSub" value="${esc(H.heroSub)}" maxlength="80"></label>
            <div class="row row-2">
              <label class="field"><span>Botão principal</span><input class="input" data-h="heroCta" value="${esc(H.heroCta)}" maxlength="22"></label>
              <label class="field"><span>Botão secundário</span><input class="input" data-h="heroCta2" value="${esc(H.heroCta2)}" maxlength="22"></label>
            </div>
            <div style="display:grid;grid-template-columns:120px 1fr;gap:14px;align-items:center"><div class="item-img" style="width:120px;height:150px" id="himg"><img src="${esc(u(H.heroImg))}" alt=""></div><button class="btn btn--ghost" type="button" data-hpick>Trocar foto do topo</button></div>
          </section>
        </div>
        <div class="col-side">
          <section class="panel"><h2>Blocos da página</h2><p class="lede" style="margin-bottom:10px">Mude a ordem ou esconda blocos. O topo e o rodapé ficam sempre.</p>
            <div class="blocks">${H.blocos.map((b, i) => `<div class="block" data-bi="${i}"><b>${esc(b.nome)}</b>
              <button class="icon-btn" type="button" aria-label="Subir ${esc(b.nome)}" data-bmv="-1" ${i === 0 ? 'disabled' : ''}>${ICON.up}</button>
              <button class="icon-btn" type="button" aria-label="Descer ${esc(b.nome)}" data-bmv="1" ${i === H.blocos.length - 1 ? 'disabled' : ''}>${ICON.down}</button>
              <label class="switch"><span class="sr">Mostrar ${esc(b.nome)}</span><input type="checkbox" data-bon ${b.ativo ? 'checked' : ''}></label></div>`).join('')}</div>
          </section>
        </div>
      </div>
      <div class="actionbar"><a class="btn btn--ghost" href="../" target="_blank" rel="noopener">Ver site</a><span></span><button class="btn btn--lime" type="button" data-hsave>Salvar e publicar</button></div>`);
    const main = $('#main');
    const draft = Store.clone(H);
    main.addEventListener('input', (e) => { if (e.target.dataset.h) { draft[e.target.dataset.h] = e.target.value; guard = () => true; } });
    main.addEventListener('change', (e) => { if ('bon' in e.target.dataset) { draft.blocos[+e.target.closest('[data-bi]').dataset.bi].ativo = e.target.checked; guard = () => true; } });
    main.addEventListener('click', async (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.bmv) {
        const i = +b.closest('[data-bi]').dataset.bi, j = i + +b.dataset.bmv;
        [H.blocos[i], H.blocos[j]] = [H.blocos[j], H.blocos[i]];
        [draft.blocos[i], draft.blocos[j]] = [draft.blocos[j], draft.blocos[i]];
        log('Reordenou os blocos da página inicial'); if (persist()) { toast('Ordem salva — já no site'); pageInicio(); }
      }
      if ('hpick' in b.dataset) { const s = await pickImage(draft.heroImg); if (s) { draft.heroImg = s; guard = () => true; $('#himg').innerHTML = `<img src="${esc(u(s))}" alt="">`; } }
      if ('hsave' in b.dataset) {
        for (const k of ['heroTitulo1', 'heroTitulo2', 'heroCta']) if (!String(draft[k]).trim()) { toast('Título e botão principal não podem ficar vazios.', true); return; }
        Object.assign(H, draft); log('Atualizou a página inicial'); guard = null;
        if (persist()) toast('Página inicial publicada');
      }
    });
  }

  /* ---------- configurações ---------- */
  function pageConfig() {
    const S = db.settings;
    const F = (k, label, attrs = '', hint = '') => `<label class="field"><span>${label}${hint ? ` <span class="hint">· ${hint}</span>` : ''}</span><input class="input" data-s="${k}" value="${esc(S[k])}" ${attrs}></label>`;
    shell('config', 'Configurações', `
      <div class="editor">
        <div>
          <section class="panel"><h2>Loja</h2>
            ${F('nome', 'Nome da loja', 'maxlength="40"')}
            <div class="row row-2">${F('whatsapp', 'WhatsApp', 'inputmode="tel" maxlength="20"', 'com DDD')}${F('instagram', 'Instagram', 'maxlength="30"', 'sem o @')}</div>
            ${F('endereco', 'Endereço', 'maxlength="80"')}
            <div class="row row-2">${F('cidade', 'Cidade', 'maxlength="40" placeholder="Ex.: Sete Lagoas — MG"')}${F('mapa', 'Link do mapa', 'type="url" placeholder="https://maps.app.goo.gl/…"', 'opcional')}</div>
            <label class="field"><span>Horário de funcionamento</span><textarea class="textarea" data-s="horarios" maxlength="200" placeholder="Seg a sex: 9h às 18h&#10;Sáb: 9h às 13h">${esc(S.horarios)}</textarea></label>
          </section>
          <section class="panel"><h2>Textos</h2>
            ${F('frase1', 'Frase principal', 'maxlength="60"')}${F('frase2', 'Frase de apoio', 'maxlength="60"')}
            <label class="field"><span>Sobre a loja</span><textarea class="textarea" data-s="sobre" maxlength="300">${esc(S.sobre)}</textarea></label>
            <label class="field"><span>Privacidade</span><textarea class="textarea" data-s="privacidade" maxlength="600">${esc(S.privacidade)}</textarea></label>
          </section>
        </div>
        <div class="col-side">
          <section class="panel"><h2>Vitrine</h2><label class="switch"><span><b>Mostrar preços</b><small>Só aparecem nas peças que têm preço preenchido</small></span><input type="checkbox" data-sb="mostrarPrecos" ${S.mostrarPrecos ? 'checked' : ''}></label></section>
          <section class="panel"><h2>Demonstração</h2><p class="lede" style="margin-bottom:12px">Volta o painel e o site para as peças do Instagram, apagando o que foi testado neste navegador.</p><button class="btn btn--danger btn--block" type="button" data-reset>Restaurar dados de exemplo</button></section>
        </div>
      </div>
      <div class="actionbar"><a class="btn btn--ghost" href="../#loja" target="_blank" rel="noopener">Ver no site</a><span></span><button class="btn btn--lime" type="button" data-ssave>Salvar</button></div>`);
    const main = $('#main');
    const draft = Store.clone(S);
    main.addEventListener('input', (e) => { if (e.target.dataset.s) { draft[e.target.dataset.s] = e.target.value; guard = () => true; } });
    main.addEventListener('change', (e) => { if (e.target.dataset.sb) { draft[e.target.dataset.sb] = e.target.checked; guard = () => true; } });
    main.addEventListener('click', async (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if ('ssave' in b.dataset) {
        const digits = String(draft.whatsapp).replace(/\D/g, '');
        const wa = digits.length === 10 || digits.length === 11 ? '55' + digits : digits;
        if (!/^55\d{10,11}$/.test(wa)) { toast('WhatsApp inválido: use DDD + número, ex.: (31) 99000-4933.', true); $('[data-s=whatsapp]').focus(); return; }
        if (!draft.nome.trim()) { toast('A loja precisa de um nome.', true); return; }
        draft.whatsapp = wa; draft.instagram = draft.instagram.replace(/^@/, '').trim();
        Object.assign(S, draft); log('Atualizou as configurações da loja'); guard = null;
        if (persist()) { toast('Configurações salvas — já no site'); pageConfig(); }
      }
      if ('reset' in b.dataset && await confirmBox('Restaurar dados de exemplo?', 'Tudo o que você testou neste navegador será apagado.', 'Restaurar', true)) {
        Store.reset(); db = Store.load(); guard = null; toast('Dados de exemplo restaurados'); location.hash = '#/resumo';
      }
    });
  }

  /* ---------- histórico ---------- */
  function pageHistorico() {
    const fmt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    shell('historico', 'Histórico', `<section class="panel"><h2>Alterações recentes</h2>${db.log.length ? `<ul class="log">${db.log.map((l) => `<li><time datetime="${new Date(l.t).toISOString()}">${fmt.format(l.t)}</time><span>${esc(l.msg)}</span></li>`).join('')}</ul>` : '<div class="empty-state"><b>Nada por aqui ainda.</b>Cada alteração no painel fica registrada com data e hora.</div>'}</section>
      <p class="hint" style="margin-top:10px">No sistema real, cada linha também guarda quem fez a alteração.</p>`);
  }

  /* ---------- rotas ---------- */
  let last = location.hash;
  async function route() {
    if (!isIn()) { renderLogin(); return; }
    if (guard && guard() && location.hash !== last) {
      const go = await confirmBox('Sair sem salvar?', 'As alterações desta tela ainda não foram salvas.', 'Sair sem salvar', true);
      if (!go) { history.replaceState(null, '', last); return; }
      guard = null;
    }
    db = Store.load();
    last = location.hash;
    const [path, qs] = (location.hash.replace(/^#\/?/, '') || 'resumo').split('?');
    const [a, b] = path.split('/');
    const params = new URLSearchParams(qs);
    if (a === 'produtos' && b) return pageProduto(b);
    if ((a === 'looks' || a === 'colecoes') && b) return pageGroup(a, b);
    ({ resumo: pageResumo, produtos: () => pageProdutos(params), looks: () => pageGroupList('looks'), colecoes: () => pageGroupList('colecoes'), categorias: pageCategorias, inicio: pageInicio, config: pageConfig, historico: pageHistorico }[a] || pageResumo)();
  }
  addEventListener('hashchange', route);
  addEventListener('beforeunload', (e) => { if (guard && guard()) { e.preventDefault(); e.returnValue = ''; } });
  document.addEventListener('click', (e) => { if (!e.target.closest('.menu-pop')) $$('.menu-pop>div').forEach((x) => x.remove()); });
  route();
})();
