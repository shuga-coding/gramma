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

// ленты чуть смещаются вслед за прокруткой: медленно и с мягким догоном, чтобы не кружилась голова
const reel = document.querySelector(".reel");
const tracks = [...reel.querySelectorAll(".track")];
const calm = matchMedia("(prefers-reduced-motion: reduce)");
const SPEED = 0.18;                                  // на сколько пикселей сдвигается лента за пиксель прокрутки
const EASE = 0.08;                                   // доля пути, которую лента проходит за кадр
let travel = [], end = 1, cur = null, running = false;
function measure() {                                 // размеры меняются только при смене ширины окна
  const box = reel.getBoundingClientRect();
  end = Math.max(1, box.top + scrollY + box.height); // прокрутка, при которой ленты уходят за верх экрана
  const view = reel.clientWidth;
  travel = tracks.map(t => Math.max(0, Math.min(t.scrollWidth - view, end * SPEED)));
}
function target() {
  const p = Math.min(1, Math.max(0, scrollY / end));
  return tracks.map((t, i) => i % 2 ? -travel[i] * (1 - p) : -travel[i] * p);
}
function step() {
  const goal = target();                             // чтение
  if (!cur) cur = goal.slice();
  let moving = false;
  tracks.forEach((t, i) => {                         // записи
    const d = goal[i] - cur[i];
    if (Math.abs(d) < 0.3) cur[i] = goal[i]; else { cur[i] += d * EASE; moving = true; }
    t.style.transform = `translate3d(${cur[i].toFixed(1)}px, 0, 0)`;
  });
  running = moving;
  if (moving) requestAnimationFrame(step);
}
function kick() {
  if (calm.matches || running) return;
  running = true;
  requestAnimationFrame(step);
}
addEventListener("scroll", kick, { passive: true });
addEventListener("resize", () => { measure(); kick(); });
measure();
kick();

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
