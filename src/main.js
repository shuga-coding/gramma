const ALT = {
  naya: ["Заяц и цветы, графика на плече","Маска ханья и дракон на бедре","Волк, графика на рёбрах","Мышь с цветком на животе","Графичные линии на руке","Античная статуя на предплечье","Рукав в чёрно-сером реализме","Цветочная графика на плече","Девушка с весами, графика на предплечье","Маска ханья с красными акцентами","Воительница в шлеме на голени","Глаз и геометрия на предплечье","Портрет девушки с микрофоном","Женский портрет с трайбл-элементами на ноге","Крылья на спине","Семейный портрет с собакой","Медведь, реализм на предплечье","Маяк в силуэте девушки","Портрет девушки с надписью","Котёнок, реализм на бедре","Лилии, графика на спине","Лицо в точечной технике"],
  shuga: ["Компас и канат на плече","Череп и вертикальная графика на бедре","Иисус в терновом венце на предплечье","Молот Тора на груди","Орёл и орнамент на груди","Неотрайбл с красным на ноге","Трайбл-рукав","Валькирия с крылом на плече","Руки в молитве с чётками","Рукав: портреты и орнамент","Неотрайбл с красным на руке и кисти","Мужской портрет, реализм","Водопад и лодка на плече","Монах на голени","Всадник на предплечье","Трайбл на коленях","Трайбл-солнце на локте","Викинг и кельтский узел на предплечье","Феникс на предплечье","Античный женский портрет с графикой на предплечье","Абстрактный блэкворк-рукав до кисти","Неотрайбл, связывающий рукав с тигром и драконом","Телевизор на птичьих лапах, реализм с красным"]
};
const WHO = { naya: "Ная", shuga: "Шуга" };
const items = m => ALT[m].map((alt, i) => ({ id: `${m}-${String(i + 1).padStart(2, "0")}`, m, alt }));
// свежие работы Шуги идут первыми
const ORDER = {
  naya: items("naya"),
  shuga: [...items("shuga").slice(19), ...items("shuga").slice(0, 19)]
};
// чередуем мастеров, чтобы в общей сетке работы шли вперемешку
const works = [];
const max = Math.max(ORDER.naya.length, ORDER.shuga.length);
for (let i = 0; i < max; i++) {
  for (const m of ["shuga", "naya"]) if (ORDER[m][i]) works.push(ORDER[m][i]);
}
const byId = Object.fromEntries(works.map(w => [w.id, w]));

// превью работы: кнопка с картинкой, без сборки HTML строкой
function thumb(w, size = [240, 320], label) {
  const b = document.createElement("button");
  b.type = "button";
  b.dataset.open = w.id;
  const img = document.createElement("img");
  img.src = `img/${w.id}-s.webp`;
  img.alt = w.alt;
  img.loading = "lazy";
  img.width = size[0];
  img.height = size[1];
  b.append(img);
  if (label) {
    const s = document.createElement("span");
    s.className = "who";
    s.textContent = label;
    b.append(s);
  }
  return b;
}


// ленты
const reelPick1 = ["shuga-20","naya-17","shuga-05","naya-11","shuga-21","naya-03","shuga-12","naya-20","shuga-06","naya-13","shuga-03"];
const reelPick2 = ["naya-19","shuga-23","naya-02","shuga-18","naya-16","shuga-22","naya-22","shuga-14","naya-12","shuga-17"];
function fillReel(el, ids) {
  el.replaceChildren(...ids.map(id => thumb(byId[id])));
}
fillReel(document.getElementById("reel1"), reelPick1);
fillReel(document.getElementById("reel2"), reelPick2);

// ленты едут вслед за прокруткой: верхняя влево, нижняя вправо
const reel = document.querySelector(".reel");
const tracks = [...reel.querySelectorAll(".track")];
const calm = matchMedia("(prefers-reduced-motion: reduce)");
let ticking = false;
function moveReels() {
  ticking = false;
  if (calm.matches) return;
  // сначала все чтения раскладки, потом все записи: иначе браузер пересчитывает страницу в каждом кадре
  const box = reel.getBoundingClientRect();
  const y = scrollY, view = reel.clientWidth;
  const widths = tracks.map(t => t.scrollWidth);
  const end = box.top + y + box.height;                // прокрутка, при которой ленты уходят за верх экрана
  const p = Math.min(1, Math.max(0, y / end));
  tracks.forEach((t, i) => {
    const travel = Math.min(widths[i] - view, end);
    const x = i % 2 ? -travel * (1 - p) : -travel * p;
    t.style.transform = `translate3d(${x}px, 0, 0)`;
  });
}
function requestMove() { if (!ticking) { ticking = true; requestAnimationFrame(moveReels); } }
addEventListener("scroll", requestMove, { passive: true });
addEventListener("resize", requestMove);
moveReels();

// сетка
const grid = document.getElementById("grid");
let current = "all";
let visible = works;
function render() {
  visible = current === "all" ? works : works.filter(w => w.m === current);
  grid.replaceChildren(...visible.map(w => thumb(w, [240, 320], WHO[w.m])));
  document.querySelectorAll(".filters button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.f === current)));
}
function setFilter(f) { current = f; render(); }
document.querySelectorAll(".filters button").forEach(b => b.addEventListener("click", () => setFilter(b.dataset.f)));
render();

// раскрытие галереи
const gal = document.getElementById("gal"), galToggle = document.getElementById("gal-toggle");
const galLabel = document.getElementById("gal-label");
const teaser = document.getElementById("teaser");
const teaserPick = ["naya-06","shuga-22","naya-09","shuga-04","naya-15","shuga-09","naya-21"];
const more = document.createElement("button");
more.type = "button";
more.className = "more";
more.id = "teaser-more";
more.append(document.getElementById("i-plus-tpl").content.cloneNode(true));
const moreText = document.createElement("span");
moreText.textContent = "открыть галерею";
more.append(moreText);
teaser.replaceChildren(...teaserPick.map(id => thumb(byId[id])), more);
more.addEventListener("click", () => setGallery(true));
function setGallery(isOpen) {
  teaser.hidden = isOpen;
  gal.classList.toggle("open", isOpen);
  gal.inert = !isOpen;
  galToggle.setAttribute("aria-expanded", String(isOpen));
  galLabel.textContent = isOpen ? "Свернуть галерею" : "Открыть галерею";
}
galToggle.addEventListener("click", () => setGallery(!gal.classList.contains("open")));
document.getElementById("gal-close").addEventListener("click", () => {
  setGallery(false);
  document.getElementById("works").scrollIntoView({ block: "start" });
});
document.querySelectorAll("[data-gal]").forEach(a => a.addEventListener("click", () => setGallery(true)));
// все работы мастера раскрываются в его карточке (без трёх, что уже показаны)
document.querySelectorAll(".mtoggle").forEach(btn => {
  const m = btn.dataset.master;
  const box = document.getElementById(`mgal-${m}`);
  const lbl = btn.querySelector(".lbl"), base = lbl.textContent;
  const shown = [...btn.closest(".master").querySelectorAll(".thumbs [data-open]")].map(b => b.dataset.open);
  const rest = ORDER[m].filter(w => !shown.includes(w.id));
  btn.addEventListener("click", () => {
    const isOpen = !box.classList.contains("open");
    if (isOpen && !box.dataset.ready) {
      box.querySelector(".thumbs").replaceChildren(...rest.map(w => thumb(w, [240, 240])));
      box.dataset.ready = "1";
    }
    box.classList.toggle("open", isOpen);
    box.inert = !isOpen;
    btn.setAttribute("aria-expanded", String(isOpen));
    lbl.textContent = isOpen ? "Свернуть" : base;
    if (!isOpen) btn.closest(".master").scrollIntoView({ block: "nearest" });
  });
});

// просмотр
const lb = document.getElementById("lb"), lbImg = document.getElementById("lb-img"), lbCap = document.getElementById("lb-cap");
let list = works, idx = 0, want = 0, dimTimer = 0;
const bigSrc = w => `img/${w.id}.webp`;
const cache = new Map();
function load(w) {                                   // одна загрузка на картинку, повторно берётся готовая
  if (!cache.has(w.id)) {
    const im = new Image();
    im.src = bigSrc(w);
    cache.set(w.id, (im.decode ? im.decode() : Promise.resolve()).catch(() => {}));
  }
  return cache.get(w.id);
}
function setShown(w, src) {
  lbImg.src = src;
  lbImg.alt = w.alt;
  lbCap.textContent = `${w.alt}. Мастер: ${WHO[w.m]}`;
}
function show(i, first) {
  idx = (i + list.length) % list.length;
  const w = list[idx], ticket = ++want;
  if (first) setShown(w, `img/${w.id}-s.webp`);      // превью уже в кэше: окно открывается сразу
  clearTimeout(dimTimer);
  dimTimer = setTimeout(() => lb.classList.add("waiting"), 300);   // приглушаем, только если ждать заметно
  load(w).then(() => {
    if (ticket !== want) return;                     // пока грузилось, пролистали дальше
    clearTimeout(dimTimer);
    lb.classList.remove("waiting");
    setShown(w, bigSrc(w));                          // прежняя работа стоит, пока новая не готова
  });
  load(list[(idx + 1) % list.length]);               // соседи подтягиваются заранее
  load(list[(idx - 1 + list.length) % list.length]);
}
function open(id, from) {
  const own = from && from.closest("[data-list]");
  list = own ? ORDER[own.dataset.list] : (from && from.closest("#grid") ? visible : works);
  show(list.findIndex(w => w.id === id), true);
  if (!lb.open) {
    lb.showModal();
    history.pushState({ lb: 1 }, "");                // окно — шаг истории: «назад» на телефоне закрывает его
  }
}
function closeLb() {
  if (history.state && history.state.lb) history.back();
  else lb.close();
}
addEventListener("popstate", () => { if (lb.open) lb.close(); });
lb.addEventListener("cancel", e => { e.preventDefault(); closeLb(); });
document.addEventListener("click", e => {
  const t = e.target.closest("[data-open]");
  if (t) open(t.dataset.open, t);
});
document.getElementById("lb-close").onclick = closeLb;
document.getElementById("lb-prev").onclick = () => show(idx - 1);
document.getElementById("lb-next").onclick = () => show(idx + 1);
lb.addEventListener("click", e => { if (e.target.classList.contains("lb-inner")) closeLb(); });
lb.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") show(idx - 1);
  if (e.key === "ArrowRight") show(idx + 1);
});
let sx = null;
lb.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
lb.addEventListener("touchend", e => {
  if (sx === null) return;
  const dx = e.changedTouches[0].clientX - sx;
  if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
  sx = null;
});

// ленты работ в карточках мастеров
document.querySelectorAll(".thumbs.car").forEach(car => {
  const m = car.id.replace("car-", "");
  const shown = [...car.querySelectorAll("[data-open]")].map(b => b.dataset.open);
  car.append(...ORDER[m].filter(w => !shown.includes(w.id)).map(w => thumb(w, [240, 240])));
  const wrap = car.closest(".car-wrap");
  const prev = wrap.querySelector(".prev"), next = wrap.querySelector(".next");
  let pending = false;
  function sync() {                                  // сначала чтения, потом записи
    pending = false;
    const x = car.scrollLeft, max = car.scrollWidth - car.clientWidth;
    prev.disabled = x <= 2;
    next.disabled = x >= max - 2;
  }
  car.addEventListener("scroll", () => { if (!pending) { pending = true; requestAnimationFrame(sync); } }, { passive: true });
  prev.addEventListener("click", () => car.scrollBy({ left: -car.clientWidth, behavior: "smooth" }));
  next.addEventListener("click", () => car.scrollBy({ left: car.clientWidth, behavior: "smooth" }));
  sync();
});
