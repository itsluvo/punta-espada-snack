(function () {
  "use strict";
  const CART_KEY = "golf-cafe-cart";
  const WA_NUMBER = "18293839858";
  const MENU = (window.GOLF_MENU || []).filter((p) => p.players);
  const CATS = window.GOLF_CATS;
  const INGS = window.OMELETTE_INGS;
  const BREADS = window.BREADS;
  const catOf = (p) => p.pcat || p.cat;

  let cart = [];
  let cat = "share";
  let sheetMode = "";
  let draft = null;

  const $ = (id) => document.getElementById(id);
  const TAX_RATE = 0.18;
  const round2 = (n) => Math.round(Number(n) * 100) / 100;
  const money = (n) => {
    const s = round2(n).toFixed(2);
    return "$" + (s.endsWith(".00") ? s.slice(0, -3) : s);
  };
  const save = () => localStorage.setItem(CART_KEY, JSON.stringify(cart));
  try { cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch (_) { cart = []; }
  if (!Array.isArray(cart)) cart = [];
  cart = cart.filter((l) => MENU.some((p) => p.id === l.id));
  save();
  const subtotal = () => cart.reduce((s, l) => s + l.price * l.qty, 0);
  const taxAmt = () => round2(subtotal() * TAX_RATE);
  const total = () => round2(subtotal() + taxAmt());
  const qty = () => cart.reduce((s, l) => s + l.qty, 0);
  const V = "20260928fairway";
  const TRACK_KEY = "golf-cafe-track";
  const STEPS = [
    { id: "new", label: "Preparing" },
    { id: "done", label: "Delivered" },
  ];
  const stepLabel = (st) => (st === "cancelled" ? "Cancelled" : (STEPS.find((s) => s.id === st) || STEPS[0]).label);
  const stepIndex = (st) => Math.max(0, STEPS.findIndex((s) => s.id === st));
  let tracked = null;
  try { tracked = JSON.parse(localStorage.getItem(TRACK_KEY) || "null"); } catch (_) { tracked = null; }
  const saveTrack = () => {
    if (tracked) localStorage.setItem(TRACK_KEY, JSON.stringify(tracked));
    else localStorage.removeItem(TRACK_KEY);
  };
  const CAT_IMG = {
    breakfast: "photos/breakfast.jpg",
    share: "photos/share.jpg",
    salads: "photos/salad.jpg",
    sandwiches: "photos/sandwich.jpg",
    chef: "photos/burger.jpg",
    grill: "photos/burger.jpg",
    burgers: "photos/burger.jpg",
    dogs: "photos/hotdog.jpg",
    tacos: "photos/tacos.jpg",
    juices: "photos/juice.jpg",
    hot: "photos/coffee.jpg",
    drinks: "photos/beer.jpg",
  };
  const ITEM_IMG = {
    croquette: "photos/croquette.jpg",
    "cheese-balls": "photos/cheese-balls.jpg",
    tequenos: "photos/tequenos.jpg",
    pasty: "photos/pasty.jpg",
    "onion-rings": "photos/onion-rings.jpg",
    "mozz-sticks": "photos/mozz-sticks.jpg",
    nachos: "photos/nachos.jpg",
    "french-club": "photos/french-club.jpg",
    caddy: "photos/caddy.jpg",
    "ham-cheese": "photos/ham-cheese.jpg",
    "english-muffin": "photos/english-muffin.jpg",
    "pesto-capresa": "photos/pesto-capresa.jpg",
    cuban: "photos/cuban.jpg",
    midnight: "photos/midnight.jpg",
    "double-bogey": "photos/double-bogey.jpg",
    "chicken-caesar-sw": "photos/chicken-caesar-sw.jpg",
    "camilo-way": "photos/camilo-way.jpg",
    wakaciutto: "photos/wakaciutto.jpg",
    "italian-sw": "photos/italian-sw.jpg",
    "chicken-honey": "photos/chicken-honey.jpg",
    "tiger-club": "photos/tiger-club.jpg",
    "hot-dog": "photos/hotdog.jpg",
    "german-dog": "photos/german-dog.jpg",
    "egg-quesadilla": "photos/egg-quesadilla.jpg",
    tacos: "photos/tacos.jpg",
    "chicken-burger": "photos/chicken-burger.jpg",
    "chicken-quesadilla": "photos/chicken-quesadilla.jpg",
    "bacon-cheese-burger": "photos/burger.jpg",
    "beef-quesadilla": "photos/beef-quesadilla.jpg",
    "beer-national": "photos/beer-national.jpg",
    "beer-import": "photos/beer-import.jpg",
    smirnoff: "photos/smirnoff.jpg",
    water: "photos/water.jpg",
    perrier: "photos/perrier.jpg",
    gatorade: "photos/gatorade.jpg",
    pellegrino: "photos/pellegrino.jpg",
    soda: "photos/soda.jpg",
    "sparkling-ice": "photos/sparkling-ice.jpg",
    "acqua-panna": "photos/acqua-panna.jpg",
    coconut: "photos/coconut.jpg",
    "red-bull": "photos/red-bull.jpg",
  };
  const photo = (p) => (ITEM_IMG[p.id] || CAT_IMG[catOf(p)] || CAT_IMG[p.cat] || "photos/sandwich.jpg") + "?v=" + V;

  function renderChips() {
    $("chips").innerHTML = CATS.map((c) =>
      `<button class="chip${c.id === cat ? " on" : ""}" data-cat="${c.id}">${c.label}</button>`
    ).join("");
    $("chips").onclick = (e) => {
      const b = e.target.closest("[data-cat]");
      if (!b) return;
      cat = b.dataset.cat;
      renderChips();
      renderList();
      $("chips").querySelector(".on")?.scrollIntoView({ inline: "center", block: "nearest" });
    };
  }

  function renderList() {
    const items = MENU.filter((p) => catOf(p) === cat);
    const label = CATS.find((c) => c.id === cat)?.label || "";
    $("list").innerHTML =
      `<div class="sec">${label}</div>` +
      items.map((p) => `
        <article class="card" data-add="${p.id}">
          <img class="pic" src="${photo(p)}" alt="" />
          <div class="body">
            <div class="card-top">
              <h3>${p.name}</h3>
              <div class="price">${money(p.price)}</div>
            </div>
            ${p.desc ? `<p>${p.desc}</p>` : ""}
            <button class="add" data-add="${p.id}">Add</button>
          </div>
        </article>`).join("");
  }

  function find(id) { return MENU.find((p) => p.id === id); }

  function openAdd(id) {
    const p = find(id);
    if (!p) return;
    draft = { id: p.id, name: p.name, price: p.price, qty: 1, note: "", pick: "", bread: p.bread ? "Baguette" : "", ings: [] };
    sheetMode = "add";
    renderSheet();
  }

  function renderSheet() {
    const el = $("sheet");
    const body = $("sheet-body");
    el.hidden = false;
    if (sheetMode === "add") {
      const p = find(draft.id);
      let extra = "";
      if (p.bread) {
        extra += `<label class="l">Bread</label><div class="opts" id="breads">` +
          BREADS.map((b) => `<button type="button" class="opt${draft.bread === b ? " on" : ""}" data-bread="${b}">${b}</button>`).join("") +
          `</div>`;
      }
      if (p.pick) {
        extra += `<label class="l">${p.pick.label}</label><div class="opts" id="picks">` +
          p.pick.choices.map((c) => `<button type="button" class="opt${draft.pick === c ? " on" : ""}" data-pick="${c}">${c}</button>`).join("") +
          `</div>`;
      }
      if (p.omelette) {
        extra += `<label class="l">Toast</label><div class="opts" id="breads">` +
          [`White toast`, `Brown toast`].map((b) => `<button type="button" class="opt${draft.bread === b ? " on" : ""}" data-bread="${b}">${b}</button>`).join("") +
          `</div><label class="l">Ingredients (max 5)</label><div class="opts" id="ings">` +
          INGS.map((g) => `<button type="button" class="opt${draft.ings.includes(g) ? " on" : ""}" data-ing="${g}">${g}</button>`).join("") +
          `</div>`;
      }
      body.innerHTML = `
        <img class="sheet-pic" src="${photo(p)}" alt="" />
        <div class="panel-pad">
        <h2 class="sheet-h">${p.name}</h2>
        <p class="note">${p.desc || ""}</p>
        ${extra}
        <label class="l">Note</label>
        <input id="d-note" placeholder="No onion, extra sauce…" value="${draft.note || ""}" />
        <label class="l">Qty</label>
        <div class="qty">
          <button type="button" id="q-">−</button>
          <strong id="q-n">${draft.qty}</strong>
          <button type="button" id="q+">+</button>
        </div>
        <button class="place" id="add-line">Add ${money(p.price * draft.qty)}</button>
        <button class="ghost" id="close-sheet">Cancel</button>
        </div>`;
      bindAdd();
      return;
    }
    if (sheetMode === "cart") {
      const lines = cart.map((l, i) => {
        const bits = [l.bread, l.pick, (l.ings || []).join(", "), l.note].filter(Boolean).join(" · ");
        const item = MENU.find((x) => x.id === l.id);
        const src = item ? photo(item) : "photos/sandwich.jpg?v=" + V;
        return `<div class="line">
          <img class="thumb" src="${src}" alt="" />
          <div>
            <div class="row"><strong>${l.qty}× ${l.name}</strong><span>${money(l.price * l.qty)}</span></div>
            ${bits ? `<div class="note">${bits}</div>` : ""}
            <button class="ghost" data-rm="${i}">Remove</button>
          </div>
        </div>`;
      }).join("");
      body.innerHTML = `
        <img class="sheet-pic" src="photos/hero.jpg?v=${V}" alt="" />
        <div class="panel-pad">
        <h2 class="sheet-h">Your order</h2>
        ${cart.length ? lines : `<p class="note">Cart is empty.</p>`}
        <div class="row" style="margin-top:12px"><span>Subtotal</span><span>${money(subtotal())}</span></div>
        <div class="row"><span>Tax 18%</span><span>${money(taxAmt())}</span></div>
        <div class="row tot"><span>Total</span><strong>${money(total())}</strong></div>
        <label class="l">Course</label>
        <div class="opts" id="course">
          <button type="button" class="opt${course === "punta-espada" ? " on" : ""}" data-course="punta-espada">Punta Espada</button>
          <button type="button" class="opt${course === "las-iguanas" ? " on" : ""}" data-course="las-iguanas">Las Iguanas</button>
        </div>
        <label class="l">Where should we bring it?</label>
        <div class="opts" id="where">
          <button type="button" class="opt${where === "hole" ? " on" : ""}" data-where="hole">On the course</button>
          <button type="button" class="opt${where === "clubhouse" ? " on" : ""}" data-where="clubhouse">Clubhouse</button>
          <button type="button" class="opt${where === "halfway" ? " on" : ""}" data-where="halfway">Halfway house</button>
        </div>
        <div id="holes-wrap" style="${where === "hole" ? "" : "display:none"}">
          <label class="l">Hole</label>
          <div class="holes" id="holes">${Array.from({ length: 18 }, (_, i) =>
            `<button type="button" class="hole${hole === i + 1 ? " on" : ""}" data-hole="${i + 1}">${i + 1}</button>`).join("")}</div>
        </div>
        <label class="l">Golf Cart number</label>
        <input id="c-cart" inputmode="numeric" placeholder="e.g. 14" value="${golfCart || ""}" />
        <label class="l">Note</label>
        <input id="c-note" placeholder="Extra note (optional)" />
        <button class="place" id="place" ${cart.length ? "" : "disabled"}>Place order · ${money(total())}</button>
        <button class="ghost" id="close-sheet">Close</button>
        </div>`;
      bindCart();
    }
    if (sheetMode === "ok") {
      const st = (tracked && tracked.status) || "new";
      const idx = stepIndex(st);
      const done = st === "done" || st === "cancelled";
      const steps = STEPS.map((s, i) => {
        const cls = st === "cancelled" ? "" : (i < idx ? "done" : i === idx ? "on" : "");
        return `<div class="step ${cls}"><i></i>${s.label}</div>`;
      }).join("");
      body.innerHTML = `<div class="ok">
        <img class="mark" src="logo.png?v=20260901pe1" alt="Punta Espada" width="88" height="88" />
        <div class="kicker${done ? "" : " live"}">${done ? stepLabel(st) : `<span class="pulse"></span> Preparing`}</div>
        <h2>Order #${(tracked && tracked.id) || draft.id}</h2>
        <p>We’ll bring it to <strong>${(tracked && tracked.where) || draft.where || "your cart"}</strong>.</p>
        ${st === "cancelled" ? `<p class="note">This order was cancelled. Ask at the snack bar if you need it again.</p>` : `<div class="steps">${steps}</div>`}
        <p class="note">${st === "done" ? "Delivered. Enjoy." : st === "cancelled" ? "" : "Kitchen is preparing it."}</p>
        <button class="place" id="close-sheet">${done ? "Done" : "Keep browsing"}</button>
      </div>`;
      $("close-sheet").onclick = closeSheet;
    }
  }

  function bindAdd() {
    $("close-sheet").onclick = closeSheet;
    $("q-").onclick = () => { draft.qty = Math.max(1, draft.qty - 1); renderSheet(); };
    $("q+").onclick = () => { draft.qty = Math.min(20, draft.qty + 1); renderSheet(); };
    $("d-note").oninput = (e) => { draft.note = e.target.value; };
    $("breads")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-bread]"); if (!b) return;
      draft.bread = b.dataset.bread; renderSheet();
    });
    $("picks")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-pick]"); if (!b) return;
      draft.pick = b.dataset.pick; renderSheet();
    });
    $("ings")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-ing]"); if (!b) return;
      const g = b.dataset.ing;
      if (draft.ings.includes(g)) draft.ings = draft.ings.filter((x) => x !== g);
      else if (draft.ings.length < 5) draft.ings.push(g);
      renderSheet();
    });
    $("add-line").onclick = () => {
      const p = find(draft.id);
      if (p.pick && !draft.pick) { alert("Pick " + p.pick.label.toLowerCase()); return; }
      cart.push({ ...draft });
      save(); renderBar(); closeSheet();
    };
  }

  let where = "hole";
  let hole = 0;
  let course = "";
  let golfCart = "";
  const LAST_KEY = "golf-cafe-last";
  try {
    const last = JSON.parse(localStorage.getItem(LAST_KEY) || "{}");
    if (last.course) course = last.course;
    if (last.where) where = last.where;
    if (last.hole) hole = +last.hole || 0;
    if (last.golfCart) golfCart = String(last.golfCart);
  } catch (_) {}
  const saveLast = () => localStorage.setItem(LAST_KEY, JSON.stringify({ course, where, hole, golfCart }));
  function bindCart() {
    $("close-sheet").onclick = closeSheet;
    $("sheet-body").onclick = (e) => {
      const rm = e.target.closest("[data-rm]");
      if (rm) { cart.splice(+rm.dataset.rm, 1); save(); renderBar(); renderSheet(); }
    };
    $("course").onclick = (e) => {
      const b = e.target.closest("[data-course]"); if (!b) return;
      course = b.dataset.course;
      [...$("course").children].forEach((x) => x.classList.toggle("on", x === b));
      saveLast();
    };
    $("where").onclick = (e) => {
      const b = e.target.closest("[data-where]"); if (!b) return;
      where = b.dataset.where;
      [...$("where").children].forEach((x) => x.classList.toggle("on", x === b));
      $("holes-wrap").style.display = where === "hole" ? "block" : "none";
      saveLast();
    };
    $("holes").onclick = (e) => {
      const b = e.target.closest("[data-hole]"); if (!b) return;
      hole = +b.dataset.hole;
      [...$("holes").children].forEach((x) => x.classList.toggle("on", x === b));
      saveLast();
    };
    $("c-cart").oninput = (e) => { golfCart = e.target.value; saveLast(); };
    $("place").onclick = placeOrder;
  }

  function waText(note) {
    const campo = course === "las-iguanas" ? "Las Iguanas" : "Punta Espada";
    const sitio = where === "hole" ? "hoyo " + hole : (where === "clubhouse" ? "casa club" : "halfway");
    const lines = cart.map((l) => {
      const bits = [l.pick, (l.ings || []).join(", "), l.note].filter(Boolean).join(" · ");
      return l.qty + "× " + l.name + " — " + money(l.price * l.qty) + (bits ? "\n   " + bits : "");
    });
    return [
      "Pedido Snack & Bar",
      campo + ", " + sitio + ", carrito " + golfCart,
      note ? "Nota: " + note : "",
      "",
      lines.join("\n"),
      "",
      "Subtotal " + money(subtotal()),
      "Impuesto " + money(taxAmt()),
      "Total " + money(total()),
    ].filter((x) => x !== "").join("\n");
  }

  async function placeOrder() {
    golfCart = ($("c-cart").value || "").trim();
    saveLast();
    if (!course) { alert("Pick a course"); return; }
    if (!golfCart) { alert("Golf Cart number, please"); return; }
    if (where === "hole" && !hole) { alert("Pick a hole"); return; }
    const waWin = window.open("", "_blank");
    const courseName = course === "las-iguanas" ? "Las Iguanas" : "Punta Espada";
    const spot = where === "hole" ? "Hole " + hole : (where === "clubhouse" ? "Clubhouse" : "Halfway house");
    const loc = courseName + " · " + spot + " · Cart " + golfCart;
    const payload = {
      name: "Cart " + golfCart,
      course: courseName,
      location: loc,
      hole: where === "hole" ? hole : 0,
      golfCart,
      cartNote: ($("c-note").value || "").trim(),
      items: cart.map((l) => ({
        id: l.id, name: l.name, price: l.price, qty: l.qty,
        bread: l.bread, pick: l.pick, ings: l.ings, note: l.note,
      })),
      subtotal: subtotal(),
      taxRate: TAX_RATE,
      tax: taxAmt(),
      total: total(),
      currency: "USD",
      brand: "punta-espada",
    };
    const btn = $("place");
    btn.disabled = true;
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      const note = payload.cartNote;
      const msg = waText(note);
      const waUrl = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
      if (waWin) waWin.location = waUrl;
      else window.location.href = waUrl;
      cart = []; save();
      tracked = { id: data.id, where: loc, status: data.status || "new" };
      saveTrack();
      draft = { id: data.id, where: loc };
      sheetMode = "ok";
      renderBar();
      renderTrack();
      renderSheet();
      pollTrack();
    } catch (_) {
      if (waWin) waWin.close();
      btn.disabled = false;
      alert("Could not send. Try again — kitchen may be offline.");
    }
  }

  function closeSheet() {
    $("sheet").hidden = true;
    sheetMode = "";
  }

  function renderBar() {
    const n = qty();
    $("bar").hidden = n === 0;
    $("bar-left").textContent = n ? n + (n === 1 ? " item" : " items") : "Cart";
    $("bar-total").textContent = money(total());
    renderTrack();
  }

  function renderTrack() {
    const el = $("track-bar");
    const phone = document.querySelector(".phone");
    const active = tracked && tracked.id && tracked.status !== "done" && tracked.status !== "cancelled";
    const show = active && qty() === 0;
    el.hidden = !show;
    phone.classList.toggle("has-track", show);
    if (!tracked || !tracked.id) return;
    $("track-kicker").textContent = "Order #" + tracked.id;
    $("track-label").textContent = stepLabel(tracked.status || "new");
  }

  let trackTimer = 0;
  async function refreshTrack() {
    if (!tracked || !tracked.id) return;
    try {
      const res = await fetch("/api/order/" + tracked.id);
      if (!res.ok) return;
      const o = await res.json();
      tracked.status = o.status || tracked.status;
      tracked.where = o.location || tracked.where;
      saveTrack();
      renderTrack();
      if (sheetMode === "ok") renderSheet();
      if (o.status === "done" || o.status === "cancelled") {
        clearInterval(trackTimer);
        trackTimer = 0;
      }
    } catch (_) {}
  }
  function pollTrack() {
    if (trackTimer) clearInterval(trackTimer);
    if (!tracked || !tracked.id) return;
    refreshTrack();
    trackTimer = setInterval(refreshTrack, 3000);
  }

  $("list").onclick = (e) => {
    const b = e.target.closest("[data-add]");
    if (b) openAdd(b.dataset.add);
  };
  $("bar").onclick = () => { sheetMode = "cart"; renderSheet(); };
  $("track-bar").onclick = () => { sheetMode = "ok"; renderSheet(); };
  $("sheet").addEventListener("click", (e) => { if (e.target.id === "sheet") closeSheet(); });

  function bindMini() {
    const hero = document.querySelector(".hero");
    const mini = document.querySelector(".mark-mini");
    if (!hero || !mini) return;
    const tick = () => mini.classList.toggle("show", hero.getBoundingClientRect().bottom < 12);
    window.addEventListener("scroll", tick, { passive: true });
    tick();
  }

  renderChips();
  renderList();
  renderBar();
  bindMini();
  if (tracked && tracked.id) pollTrack();
})();
