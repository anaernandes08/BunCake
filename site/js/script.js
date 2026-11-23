/* ===== BunCake - script.js ===== */

// Produtos do cardápio (preços fictícios)
const PRODUTOS = [
  { id: 1, nome: "Ninho com Coco",    img: "Imagens/bolo-ninho-coco.jpg",     preco: 12, desc: "Bolo de chocolate, creme de leite ninho e coco ralado." },
  { id: 2, nome: "Chocolate Crocante", img: "Imagens/bolo-chocolate.jpg",      preco: 14, desc: "Mousse de chocolate, brigadeiro, creme e lascas de chocolate." },
  { id: 3, nome: "Maracujá com Coco",  img: "Imagens/bolo-maracuja.jpg",       preco: 12, desc: "Massa branca, creme de baunilha, pedaços de fruta e coco." },
  { id: 4, nome: "Doce de Leite",      img: "Imagens/bolo-doce-de-leite.jpg",  preco: 13, desc: "Massa amanteigada recheada com doce de leite cremoso." },
  { id: 5, nome: "Açaí com Ninho",     img: "Imagens/bolo-acai.jpg",           preco: 15, desc: "Camadas de açaí, creme de leite ninho e leite em pó." },
  { id: 6, nome: "Morango com Creme",  img: "Imagens/bolo-morango.jpg",        preco: 14, desc: "Creme de baunilha, morangos frescos, farelo de biscoito e chantilly." }
];

const $ = (id) => document.getElementById(id);
const reais = (v) => "R$ " + v.toFixed(2).replace(".", ",");


/* ---------- Armazenamento (funciona mesmo abrindo o arquivo direto no PC) ----------
   Guarda em window.name (persiste entre páginas na mesma aba) e também no localStorage. */
function lerDado(chave, padrao) {
  try {
    const w = JSON.parse(window.name);
    if (w && w.buncake && w.buncake[chave] !== undefined) return w.buncake[chave];
  } catch (e) {}
  try {
    const v = localStorage.getItem("buncake_" + chave);
    if (v) return JSON.parse(v);
  } catch (e) {}
  return padrao;
}
function guardarDado(chave, valor) {
  try {
    let w = {};
    try { w = JSON.parse(window.name) || {}; } catch (e) {}
    if (typeof w !== "object") w = {};
    w.buncake = w.buncake || {};
    w.buncake[chave] = valor;
    window.name = JSON.stringify(w);
  } catch (e) {}
  try { localStorage.setItem("buncake_" + chave, JSON.stringify(valor)); } catch (e) {}
}

/* ---------- Aviso (toast) ---------- */
function aviso(texto) {
  let t = $("toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
  t.textContent = texto;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1600);
}

/* ---------- Carrinho (salvo no navegador) ---------- */
function lerCarrinho() { return lerDado("carrinho", {}); }
function salvarCarrinho(c) { guardarDado("carrinho", c); }
function atualizarContador() {
  const c = lerCarrinho();
  const total = Object.values(c).reduce((a, b) => a + b, 0);
  const el = $("cnt");
  if (el) el.textContent = total;
}
function adicionar(id) {
  const c = lerCarrinho();
  c[id] = (c[id] || 0) + 1;
  salvarCarrinho(c);
  atualizarContador();
  aviso(PRODUTOS.find(p => p.id === id).nome + " adicionado!");
}
function alterarQtd(id, delta) {
  const c = lerCarrinho();
  c[id] = (c[id] || 0) + delta;
  if (c[id] <= 0) delete c[id];
  salvarCarrinho(c);
  atualizarContador();
  desenharCarrinho();
}
function desenharCarrinho() {
  const box = $("items");
  if (!box) return;
  const c = lerCarrinho();
  const ids = Object.keys(c);
  if (!ids.length) {
    box.innerHTML = "<p class='centro'>Seu carrinho está vazio.</p>";
    $("total").textContent = "";
    return;
  }
  let soma = 0;
  box.innerHTML = ids.map(id => {
    const p = PRODUTOS.find(x => x.id == id);
    const sub = p.preco * c[id];
    soma += sub;
    return `<div class="row">
      <img src="${p.img}" alt="">
      <div class="nome"><b>${p.nome}</b><br>${reais(p.preco)}</div>
      <div class="qtd">
        <button onclick="alterarQtd(${p.id}, -1)" aria-label="Diminuir">−</button>
        ${c[id]}
        <button onclick="alterarQtd(${p.id}, 1)" aria-label="Aumentar">+</button>
      </div>
      <b>${reais(sub)}</b>
    </div>`;
  }).join("");
  $("total").textContent = "Total: " + reais(soma);
}
function finalizarCompra() {
  if (!Object.keys(lerCarrinho()).length) return aviso("Carrinho vazio");
  salvarCarrinho({});
  atualizarContador();
  desenharCarrinho();
  aviso("Pedido de teste enviado!");
}

/* ---------- Cardápio ---------- */
function desenharCardapio() {
  const menu = $("menu");
  if (!menu) return;
  menu.innerHTML = PRODUTOS.map(p => `
    <article class="card">
      <img src="${p.img}" alt="Bolo de pote ${p.nome}">
      <div class="card-info">
        <h3>${p.nome}</h3>
        <small>${p.desc}</small>
        <span class="price">${reais(p.preco)}</span>
        <button class="bnt bnt-default" onclick="adicionar(${p.id})">Adicionar ao carrinho</button>
      </div>
    </article>`).join("");
}

/* ---------- Acessibilidade (preferências salvas) ---------- */
let prefs = lerDado("acc", { fonte: 100, ativos: [] });

function salvarPrefs() { guardarDado("acc", prefs); }
function alvo(classe) { return classe === "gray" ? document.documentElement : document.body; }

function aplicarPrefs() {
  document.documentElement.style.setProperty("--fs", prefs.fonte + "%");
  const lvl = $("lvl");
  if (lvl) lvl.textContent = prefs.fonte + "%";
  prefs.ativos.forEach(c => alvo(c).classList.add(c));
  document.querySelectorAll("[data-acc]").forEach(b => {
    b.classList.toggle("on", prefs.ativos.includes(b.dataset.acc));
  });
}
function mudarFonte(delta) {
  prefs.fonte = Math.min(150, Math.max(80, prefs.fonte + delta));
  salvarPrefs();
  aplicarPrefs();
}
function alternar(classe) {
  const i = prefs.ativos.indexOf(classe);
  if (i >= 0) { prefs.ativos.splice(i, 1); alvo(classe).classList.remove(classe); }
  else prefs.ativos.push(classe);
  salvarPrefs();
  aplicarPrefs();
}
function restaurar() {
  prefs.ativos.forEach(c => alvo(c).classList.remove(c));
  prefs = { fonte: 100, ativos: [] };
  salvarPrefs();
  aplicarPrefs();
}

/* ---------- Contato ---------- */
function enviarContato(e) {
  e.preventDefault();
  e.target.reset();
  aviso("Mensagem enviada (teste)!");
}

/* ---------- Início ---------- */
document.addEventListener("DOMContentLoaded", () => {
  aplicarPrefs();
  atualizarContador();
  desenharCardapio();
  desenharCarrinho();
});
