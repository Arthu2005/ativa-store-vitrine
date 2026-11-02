/* Armazenamento do protótipo: tudo fica no localStorage deste navegador.
   No sistema real, este papel é do banco de dados (D1) e das fotos no R2. */
(function () {
  const KEY = 'ativa-vitrine-demo-v1';
  const clone = (o) => JSON.parse(JSON.stringify(o));

  // Cópia da versão publicada: o site público só lê "pub"
  function snapshot(item) {
    const { pub, pendente, status, ...campos } = item;
    return clone(campos);
  }

  function prepare(db) {
    ['produtos', 'looks', 'colecoes'].forEach((k) => db[k].forEach((it) => {
      if (it.status === 'publicado' && !it.pub) it.pub = snapshot(it);
    }));
    return db;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const db = JSON.parse(raw);
        if (db && db.v === window.SEED.v) return prepare(db);
      }
    } catch (e) { /* armazenamento indisponível: usa os dados de exemplo */ }
    return prepare(clone(window.SEED));
  }

  function save(db) {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
      return true;
    } catch (e) {
      return false; // cheio (fotos grandes demais) ou bloqueado
    }
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) { /* nada a limpar */ }
  }

  function publish(item) {
    item.pub = snapshot(item);
    item.status = 'publicado';
    item.pendente = false;
  }

  const money = (cents) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  function waMessage(storeName, productName, cor, tam) {
    const extra = [cor && `cor ${cor}`, tam && `tamanho ${tam}`].filter(Boolean).join(', ');
    return `Olá! Vi o produto ${productName} no catálogo da ${storeName} e gostaria de consultar a disponibilidade${extra ? ` (${extra})` : ''}.`;
  }

  const DISP = {
    disponivel: 'Disponível',
    indisponivel: 'Indisponível no momento',
    consultar: 'Consultar disponibilidade'
  };

  window.Store = { KEY, load, save, reset, publish, snapshot, clone, money, waMessage, DISP };
})();
