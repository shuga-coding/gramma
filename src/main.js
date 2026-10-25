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
// чередуем мастеров: в просмотре из ленты работы идут вперемешку
const works = [];
const max = Math.max(ORDER.naya.length, ORDER.shuga.length);
for (let i = 0; i < max; i++) {
  for (const m of ["shuga", "naya"]) if (ORDER[m][i]) works.push(ORDER[m][i]);
}
const byId = Object.fromEntries(works.map(w => [w.id, w]));

// превью работы: кнопка с картинкой, без сборки HTML строкой
function thumb(w, size = [240, 320]) {
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
  return b;
}


// бесконечная лента: работы повторены пять раз, в покое лента незаметно перескакивает в среднюю копию.
// По две копии с каждой стороны — запас, чтобы и долгий свайп не упёрся в край
function makeLoop(el, list, size) {
  const kids = [0, 1, 2, 3, 4].flatMap(c => list.map(w => {
    const b = thumb(w, size);
    if (c !== 2) { b.tabIndex = -1; b.setAttribute("aria-hidden", "true"); }   // копии не попадают в обход с клавиатуры
    return b;
  }));
  el.replaceChildren(...kids);
  const loop = { el, n: list.length, w: 0 };
  const snap = el.classList.contains("car");
  loop.jump = x => {                                 // без плавной прокрутки, иначе перескок будет виден
    el.style.scrollBehavior = "auto";
    el.scrollLeft = x;
    el.style.scrollBehavior = "";
  };
  loop.measure = () => {
    const x = el.scrollLeft, old = loop.w;
    loop.w = el.children[loop.n].offsetLeft - el.children[0].offsetLeft;     // ширина одной копии
    if (!old) loop.jump(2 * loop.w);                 // старт с начала средней копии
    else if (!snap && old !== loop.w) loop.jump(x * loop.w / old);   // при смене ширины остаёмся на том же месте, без подравнивания к кадру
    // ленту с привязкой к кадрам браузер сам держит на той же работе
    loop.wrap();
  };
  loop.wrap = () => {
    const x = el.scrollLeft, w = loop.w;
    if (!w) return;
    if (x < w * 1.5) loop.jump(x + w);
    else if (x > w * 2.5) loop.jump(x - w);
  };
  let idle = 0;
  el.addEventListener("scroll", () => { clearTimeout(idle); idle = setTimeout(loop.wrap, 160); }, { passive: true });
  const wrap = el.parentElement;
  wrap.querySelector(".prev").addEventListener("click", () => el.scrollBy({ left: -el.clientWidth * 0.8, behavior: "smooth" }));
  wrap.querySelector(".next").addEventListener("click", () => el.scrollBy({ left: el.clientWidth * 0.8, behavior: "smooth" }));
  loop.measure();
  return loop;
}
const loops = [];

// ленты на первом экране
const reelPick = [
  ["shuga-20","naya-17","shuga-05","naya-11","shuga-21","naya-03","shuga-12","naya-20","shuga-06","naya-13","shuga-03"],
  ["naya-19","shuga-23","naya-02","shuga-18","naya-16","shuga-22","naya-22","shuga-14","naya-12","shuga-17"]
];
const reels = reelPick.map((ids, i) => makeLoop(document.getElementById(`reel${i + 1}`), ids.map(id => byId[id]), [240, 320]));
loops.push(...reels);

// при прокрутке страницы ленты слегка сдвигаются: верхняя влево, нижняя вправо.
// Сдвиг добавляется к тому месту, где ленту оставили руками.
const calm = matchMedia("(prefers-reduced-motion: reduce)");
const SPEED = 0.18;                                  // пикселей сдвига на пиксель прокрутки
const EASE = 0.1;                                    // доля оставшегося пути за кадр
let lastY = scrollY, raf = 0, onScreen = true;
const pos = reels.map(r => r.el.scrollLeft), push = reels.map(() => 0);
const handsOff = reels.map(() => 0);                 // до какого момента ленту не трогаем: её листают руками или она катится по инерции
new IntersectionObserver(es => { onScreen = es[0].isIntersecting; }).observe(document.querySelector(".reel"));
reels.forEach((r, i) => r.el.addEventListener("scroll", () => {
  if (Math.abs(r.el.scrollLeft - pos[i]) > 1.5) {   // ленту двигали руками (или она едет по инерции после свайпа)
    pos[i] = r.el.scrollLeft;
    push[i] = 0;
    handsOff[i] = performance.now() + 350;
  }
}, { passive: true }));
function step() {
  raf = 0;
  const y = scrollY, dy = y - lastY;                 // чтение
  lastY = y;
  if (!onScreen) { push.fill(0); return; }
  let more = false;
  const now = performance.now();
  reels.forEach((r, i) => {                          // записи
    if (now < handsOff[i]) { push[i] = 0; return; }  // не спорим с пальцем и инерцией: иначе лента дёргается
    push[i] += dy * SPEED * (i % 2 ? -1 : 1);
    if (!push[i]) return;
    const d = Math.abs(push[i]) < 0.3 ? push[i] : push[i] * EASE;
    push[i] -= d;
    pos[i] += d;
    if (pos[i] < r.w * 1.5) pos[i] += r.w; else if (pos[i] > r.w * 2.5) pos[i] -= r.w;
    r.el.scrollLeft = pos[i];
    if (push[i]) more = true;
  });
  if (more) raf = requestAnimationFrame(step);
}
addEventListener("scroll", () => {
  if (calm.matches) { lastY = scrollY; return; }
  if (!raf) raf = requestAnimationFrame(step);
}, { passive: true });

// ленты работ в карточках мастеров: сначала три выбранные работы, затем остальные
document.querySelectorAll(".thumbs.car").forEach(car => {
  const m = car.id.replace("car-", "");
  const shown = [...car.querySelectorAll("[data-open]")].map(b => b.dataset.open);
  const list = [...shown.map(id => byId[id]), ...ORDER[m].filter(w => !shown.includes(w.id))];
  loops.push(makeLoop(car, list, [240, 240]));
});

// на Android адресная строка прячется при прокрутке и меняет высоту окна — это тоже событие resize.
// Ленты зависят только от ширины, поэтому пересчитываем их лишь при смене ширины.
let lastW = innerWidth;
addEventListener("resize", () => {
  if (innerWidth === lastW) return;
  lastW = innerWidth;
  loops.forEach(l => l.measure());
  reels.forEach((r, i) => { pos[i] = r.el.scrollLeft; });
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
  list = own ? ORDER[own.dataset.list] : works;
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
