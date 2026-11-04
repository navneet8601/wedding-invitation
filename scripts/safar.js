/*
 * Safar: a wedding as a journey between two families' cities. A layout for the invite engine
 * (theme.json "layout": "safar"). It adds the journey (the two cities' paintings joined by a
 * dashed route that a small plane flies along as the guest scrolls), turns the RSVP into a
 * boarding pass and the sign-off into an airmail letter. The opening is the engine's envelope.
 * The cities come from the record: journey.from (typed by the couple) and city (the wedding's).
 */
(() => {
  const W = {
    en: { title: "The journey", lede: (a, b) => `From ${a} to ${b}: two families, one wedding.`, pass: "Boarding pass", seat: "Seat: with family" },
    hi: { title: "सफ़र", lede: (a, b) => `${a} से ${b} तक: दो परिवार, एक शादी।`, pass: "बोर्डिंग पास", seat: "सीट: परिवार के साथ" },
  };
  // Names couples type for the cities the theme has paintings of.
  const ALIAS = { bangalore: "bengaluru", bombay: "mumbai", "new-delhi": "delhi", calcutta: "kolkata", madras: "chennai", banaras: "varanasi", benares: "varanasi", kashi: "varanasi", cochin: "kochi", poona: "pune", baroda: "vadodara" };
  const slugOf = (s) => String(s || "").toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");

  function cityArt(a, name) {
    const set = a.theme.art?.cities || {};
    const s = slugOf(name);
    const hit = set[s] || set[ALIAS[s]] || set.city;
    return hit ? a.base + hit.file : null;
  }
  const to = (a) => a.pick(a.data.city);
  // A family marrying in its own city has no journey to draw ("Indore to Indore").
  const from = (a) => {
    const A = a.pick(a.data.journey?.from), B = to(a);
    return A && B && A.trim().toLocaleLowerCase() === B.trim().toLocaleLowerCase() ? "" : A;
  };

  const PLANE = `<g class="sf-plane"><path d="M0 -3.2 1 -1 5.4 1.3 5.4 2.3 1 1.2 .6 3.6 2 4.8 2 5.5 0 4.9 -2 5.5 -2 4.8 -.6 3.6 -1 1.2 -5.4 2.3 -5.4 1.3 -1 -1Z" fill="currentColor"/></g>`;

  function journey(a) {
    const w = W[a.lang] || W.en;
    const A = from(a), B = to(a);
    const fa = cityArt(a, A), fb = cityArt(a, B);
    return `<section class="sec sf-journey" id="journey">
      <h2 class="h reveal" lang="${a.lang}">${a.esc(w.title)}</h2>
      <div class="sec-orn">${a.divider()}</div>
      <p class="lede reveal" lang="${a.lang}">${a.esc(w.lede(A, B))}</p>
      <div class="sf-route">
        <figure class="sf-city from">${fa ? `<img src="${a.esc(fa)}" alt="" loading="lazy" decoding="async">` : ""}<figcaption lang="${a.lang}">${a.esc(A)}</figcaption></figure>
        <svg class="sf-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path id="sfPath" d="M24 6 C 78 22, 10 62, 76 94" fill="none" stroke="currentColor" stroke-width=".6" stroke-dasharray="2 2.4" vector-effect="non-scaling-stroke"/>
        </svg>
        <svg class="sf-fly" aria-hidden="true">${PLANE}</svg>
        <figure class="sf-city to">${fb ? `<img src="${a.esc(fb)}" alt="" loading="lazy" decoding="async">` : ""}<figcaption lang="${a.lang}">${a.esc(B)}</figcaption></figure>
      </div>
    </section>`;
  }

  function sections(a) {
    return [{ id: "journey", after: "invitation", when: () => !!from(a) && !!to(a), html: () => journey(a) }];
  }

  let unfly = null;
  function decorate(paper, a) {
    const w = W[a.lang] || W.en;
    // The plane follows the route as the journey scrolls through the screen.
    if (unfly) unfly();
    const path = paper.querySelector("#sfPath"), fly = paper.querySelector(".sf-fly"), plane = fly?.querySelector(".sf-plane");
    if (path && plane) {
      let len = path.getTotalLength();
      const route = paper.querySelector(".sf-route");
      const [fromImg, toImg] = [".sf-city.from img", ".sf-city.to img"].map((s) => paper.querySelector(s));
      // The route runs from the lower right of the home city's painting and lands on the wedding
      // city's, wherever the two paintings sit at this width (the boxes are square, so this holds
      // before the pictures load).
      const draw = () => {
        const b = route.getBoundingClientRect();
        if (!fromImg || !toImg || !b.width || !b.height) return;
        const at = (img, fx, fy) => { const r = img.getBoundingClientRect(); return [((r.left + r.width * fx - b.left) / b.width) * 100, ((r.top + r.height * fy - b.top) / b.height) * 100]; };
        const [x0, y0] = at(fromImg, 0.74, 0.7), [x1, y1] = at(toImg, 0.44, 0.5);
        const f = (v) => v.toFixed(1);
        path.setAttribute("d", `M${f(x0)} ${f(y0)} C ${f(x0 + 30)} ${f(y0 + 8)}, ${f(x1 - 34)} ${f(y1 - 30)}, ${f(x1)} ${f(y1)}`);
        len = path.getTotalLength();
        drawn = true;
      };
      // Drawn once the page is laid out (the paper is hidden under the opening at first).
      let drawn = false;
      draw();
      const place = () => {
        if (!drawn) draw();
        const r = route.getBoundingClientRect();
        const u = Math.max(0, Math.min(1, (innerHeight * 0.78 - r.top) / (r.height + innerHeight * 0.18)));
        const p = path.getPointAtLength(u * len), q = path.getPointAtLength(Math.min(len, u * len + 0.6));
        // The route is drawn stretched to its box; the plane flies in a layer measured in pixels, so
        // it stays round and points along the route.
        const W2 = route.clientWidth, H2 = route.clientHeight, sx = W2 / 100, sy = H2 / 100;
        fly.setAttribute("viewBox", `0 0 ${W2} ${H2}`);
        const ang = (Math.atan2((q.y - p.y) * sy, (q.x - p.x) * sx) * 180) / Math.PI + 90;
        plane.setAttribute("transform", `translate(${p.x * sx} ${p.y * sy}) rotate(${ang}) scale(2.3)`);
      };
      const on = () => requestAnimationFrame(place);
      const resized = () => requestAnimationFrame(() => { draw(); place(); });
      addEventListener("scroll", on, { passive: true });
      addEventListener("resize", resized);
      place();
      unfly = () => { removeEventListener("scroll", on); removeEventListener("resize", resized); };
    }
    // The reply is a boarding pass: a header with the route, and a stub with a barcode.
    const rsvp = paper.querySelector("#rsvp");
    if (rsvp && !rsvp.querySelector(".sf-pass-head")) {
      rsvp.classList.add("sf-pass");
      const form = rsvp.querySelector("#rsvpForm");
      const A = from(a), B = to(a);
      const head = document.createElement("div");
      head.className = "sf-pass-head";
      head.lang = a.lang;
      head.innerHTML = `<span>${a.esc(w.pass)}</span><b>${a.esc(A ? `${A} ✈ ${B}` : B)}</b>`;
      form?.before(head);
      const stub = document.createElement("div");
      stub.className = "sf-stub";
      stub.setAttribute("aria-hidden", "true");
      stub.innerHTML = `<i></i><span lang="${a.lang}">${a.esc(w.seat)}</span>`;
      form?.after(stub);
    }
    paper.querySelector(".signoff")?.classList.add("sf-airmail");
  }

  (window.SaathLayouts = window.SaathLayouts || {}).safar = { sections, decorate };
})();
