// SVG city rendering, inspector, scenario playback and presentation controls.
// Dependencies: js/data.js must load before this file.
const $ = (id) => document.getElementById(id);
let scenario = 0,
  step = -1,
  timer = null,
  zoom = 1;
const layout = {
  intake: [150, 330, 44, 38, "#4faabb", "Intake gate"],
  identity: [320, 237, 55, 90, "#498ebf", "Identity tower"],
  policy: [505, 155, 51, 56, "#9c83c2", "Policy office"],
  services: [366, 369, 75, 60, "#559fc1", "Service district"],
  data: [552, 285, 57, 85, "#5aabc0", "Data vault"],
  ai: [729, 244, 58, 66, "#a48bd1", "AI laboratory"],
  human: [735, 395, 52, 46, "#ab8dc9", "Decision hall"],
  audit: [558, 474, 42, 100, "#4b92a5", "Security tower"],
  outcome: [359, 530, 48, 32, "#5db49e", "Service outcome"],
  backup: [892, 474, 35, 34, "#d4a658", "Offline backup"],
  dr: [1016, 465, 43, 62, "#d4a658", "Recovery site"],
};
// SVG geometry helpers: draw brick faces and roof studs.
function poly(pts, fill, stroke = "none") {
  return `<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`;
}
function block(x, y, w, d, h, c) {
  let a = `${x},${y - h}`,
    b = `${x + w},${y + w * 0.5 - h}`,
    cc = `${x + w - d},${y + (w + d) * 0.5 - h}`,
    e = `${x - d},${y + d * 0.5 - h}`;
  let out =
    poly(
      `${e} ${cc} ${x + w - d},${y + (w + d) * 0.5} ${x - d},${y + d * 0.5}`,
      c,
    ) +
    poly(
      `${b} ${cc} ${x + w - d},${y + (w + d) * 0.5} ${x + w},${y + w * 0.5}`,
      c,
    ) +
    poly(
      `${b} ${cc} ${x + w - d},${y + (w + d) * 0.5} ${x + w},${y + w * 0.5}`,
      "#12334d55",
    ) +
    poly(`${a} ${b} ${cc} ${e}`, c) +
    poly(`${a} ${b} ${cc} ${e}`, "#ffffff44");
  for (let level = 12; level < h; level += 13)
    out += `<path d="M${x - d} ${y + d * 0.5 - level}l${w} ${w * 0.5}l${d} ${-d * 0.5}" fill="none" stroke="#163851" opacity=".16"/>`;
  for (let u = 10; u < w; u += 16)
    for (let v = 10; v < d; v += 16) {
      let xx = x + u - v,
        yy = y + (u + v) * 0.5 - h;
      out += `<ellipse cx="${xx}" cy="${yy}" rx="5.7" ry="3.2" fill="#14344944"/><path d="M${xx - 5.7} ${yy}v-3h11.4v3" fill="${c}"/><ellipse cx="${xx}" cy="${yy - 3}" rx="5.7" ry="3.2" fill="${c}" stroke="#ffffff77" stroke-width=".6"/>`;
    }
  for (let u = 8; u < w - 7; u += 14)
    for (let level = 19; level < h - 10; level += 18) {
      const xx = x - d + u,
        yy = y + d * 0.5 + u * 0.5 - level;
      out += `<path d="M${xx} ${yy}l7 3.5v7l-7 -3.5Z" fill="${(u + level) % 3 === 0 ? "#ffe3a0" : "#b4e5ef"}" opacity="${(u + level) % 3 === 0 ? ".9" : ".48"}"/>`;
    }
  return out;
}
// Build a selectable SVG component from its layout entry.
function building(id, i) {
  const [x, y, w, h, c, name] = layout[id];
  let structure =
    block(x, y, w, w, 9, "#b7c9d3") + block(x, y - 10, w - 9, w - 9, h, c);
  if (id === "services")
    structure +=
      block(x - 40, y + 24, 25, 25, 26, c) +
      block(x + 47, y + 22, 25, 25, 36, c);
  if (id === "intake")
    structure =
      block(x - 20, y, 18, 22, 48, c) +
      block(x + 24, y + 21, 18, 22, 48, c) +
      block(x - 20, y - 46, 63, 22, 13, c);
  if (id === "ai")
    structure += `<ellipse cx="${x}" cy="${y - h - 6}" rx="26" ry="15" fill="#e1d8f8" stroke="#7c68a6"/><path d="M${x - 26} ${y - h - 6}q26 -48 52 0" fill="#c4b6ea" stroke="#8c76b4"/><path d="M${x} ${y - h - 30}v24" stroke="#fff"/>`;
  if (id === "audit")
    structure += `<path d="M${x} ${y - h - 10}v-29" stroke="#36596e" stroke-width="3"/><circle cx="${x}" cy="${y - h - 41}" r="5" class="beacon campus-light" fill="#a5ffe1"/>`;
  if (id === "data" || id === "dr")
    for (let k = 0; k < 3; k++)
      structure += `<path d="M${x - w + 17} ${y - h + 35 + k * 14}l${w - 24} ${(w - 24) * 0.5}" stroke="#d7faff" stroke-width="4" opacity=".8"/>`;
  return `<g class="building" data-node="${id}" role="button" tabindex="0" aria-label="Explore ${components[id][0]}"><ellipse class="halo" cx="${x}" cy="${y + w * 0.5}" rx="${w + 18}" ry="${w * 0.55 + 9}" fill="#e9bd4140" stroke="#ddaa33" stroke-width="3"/><g class="structure" filter="url(#shadow)">${structure}</g><text class="nodeLabel" x="${x}" y="${y + w + 23}" text-anchor="middle">${name}</text><text class="subLabel" x="${x}" y="${y + w + 37}" text-anchor="middle">${String(i + 1).padStart(2, "0")} / ${id === "dr" ? "RESTORE" : id === "ai" ? "LOCAL + ADVISORY" : id === "backup" ? "ISOLATED COPIES" : "SOVEREIGN CONTROL"}</text></g>`;
}
$("buildings").innerHTML = Object.keys(layout)
  .sort((a, b) => layout[a][1] - layout[b][1])
  .map((id) => building(id, Object.keys(layout).indexOf(id)))
  .join("");
$("landscape").innerHTML = [
  [170, 260],
  [220, 284],
  [270, 203],
  [455, 133],
  [835, 330],
  [465, 509],
  [658, 472],
  [787, 350],
  [288, 425],
]
  .map(
    ([x, y]) =>
      block(x, y, 14, 14, 8, "#8ba996") +
      block(x, y - 7, 11, 11, 23, "#487f76"),
  )
  .join("");

const lampPoints = [
  [100, 316],
  [212, 376],
  [285, 415],
  [443, 522],
  [642, 444],
  [819, 356],
  [917, 296],
  [615, 118],
  [387, 163],
  [304, 212],
  [191, 267],
];
$("details").innerHTML =
  lampPoints
    .map(
      ([x, y], i) =>
        `<g><ellipse cx="${x}" cy="${y + 4}" rx="12" ry="5" fill="#9ce9e5" opacity=".06"/><path d="M${x} ${y}v-22l9 -4" fill="none" stroke="#7996a8" stroke-width="2"/><path d="M${x + 6} ${y - 25}l7 -3" stroke="#d2fff0" stroke-width="3" class="campus-light"/></g>`,
    )
    .join("") +
  `<path d="M45 330L470 618L980 303" stroke="#70b8c6" stroke-width="2" fill="none" opacity=".6"/><path d="M833 496L950 566L1102 476" stroke="#b6a2e5" stroke-width="2" fill="none" opacity=".7"/><text x="205" y="477" transform="rotate(32 205 477)" fill="#91b2c8" font-size="9" letter-spacing="4">NDS · AZURE LOCAL</text><text x="889" y="538" transform="rotate(31 889 538)" fill="#b8a9d5" font-size="8" letter-spacing="2">RECOVERY ZONE</text>`;
$("scenarios").innerHTML = scenarios
  .map(
    (s, i) =>
      `<button class="tab" data-scenario="${i}">${["◈", "⊘", "✦", "↪", "↻"][i]} ${s.name}</button>`,
  )
  .join("");
// Populate the component inspector.
function inspect(id) {
  const c = components[id];
  $("number").textContent = String(
    Object.keys(layout).indexOf(id) + 1,
  ).padStart(2, "0");
  $("component").textContent = c[0];
  $("role").textContent = c[2];
  $("control").textContent = c[3];
  $("value").textContent = c[4];
  document
    .querySelectorAll("[data-node]")
    .forEach((b) => b.classList.toggle("selected", b.dataset.node === id));
}
function stop() {
  clearInterval(timer);
  timer = null;
  $("play").textContent =
    step >= scenarios[scenario].steps.length - 1
      ? "↺ Replay journey"
      : step < 0
        ? "▶ Start journey"
        : "▶ Continue";
}
// Render the current scenario, highlighted buildings and animated routes.
function render() {
  const s = scenarios[scenario];
  $("title").textContent = s.title;
  $("description").textContent = s.desc;
  $("outcome").textContent = s.out;
  $("count").textContent =
    `JOURNEY ${scenario + 1} / ${scenarios.length} · STEP ${step + 1} OF ${s.steps.length}`;
  $("stepcopy").textContent =
    step < 0
      ? "Press Start journey to follow the data—or click any building to explore."
      : s.steps[step][1];
  $("bar").style.width = ((step + 1) / s.steps.length) * 100 + "%";
  document.querySelectorAll("[data-scenario]").forEach((b) => {
    b.classList.toggle("active", +b.dataset.scenario === scenario);
    b.setAttribute("aria-pressed", +b.dataset.scenario === scenario);
  });
  document.querySelectorAll("[data-node]").forEach((b) => {
    b.classList.remove("current", "blocked", "offline");
    for (const t of s.steps.slice(0, step + 1))
      if (t[0] === b.dataset.node && t[2]) b.classList.add(t[2]);
    if (step >= 0 && s.steps[step][0] === b.dataset.node)
      b.classList.add("current");
  });
  let paths = "",
    packets = "";
  for (let k = 1; k <= step; k++) {
    const a = layout[s.steps[k - 1][0]],
      b = layout[s.steps[k][0]];
    const d = `M${a[0]} ${a[1] + a[2] / 2}Q${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2 + 65} ${b[0]} ${b[1] + b[2] / 2}`;
    paths += `<path d="${d}" class="path" style="opacity:${k === step ? 1 : 0.23}"/>`;
    if (k === step && !matchMedia("(prefers-reduced-motion: reduce)").matches)
      packets += `<circle r="6" class="packet"><animateMotion dur="2s" repeatCount="indefinite" path="${d}"/></circle>`;
  }
  $("routes").innerHTML = paths;
  $("packets").innerHTML = packets;
  $("next").disabled = step >= s.steps.length - 1;
}
// Advance one guided step; stop automatically at the end.
function next() {
  if (step < scenarios[scenario].steps.length - 1) {
    step++;
    inspect(scenarios[scenario].steps[step][0]);
    render();
  }
  if (step === scenarios[scenario].steps.length - 1) stop();
}
document.querySelectorAll("[data-node]").forEach((b) => {
  b.onclick = () => inspect(b.dataset.node);
  b.onkeydown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      inspect(b.dataset.node);
    }
  };
});
document.querySelectorAll("[data-scenario]").forEach(
  (b) =>
    (b.onclick = () => {
      stop();
      scenario = +b.dataset.scenario;
      step = -1;
      stop();
      inspect(scenarios[scenario].steps[0][0]);
      render();
    }),
);
$("play").onclick = () => {
  if (timer) {
    stop();
    return;
  }
  if (step >= scenarios[scenario].steps.length - 1) step = -1;
  next();
  if (step < scenarios[scenario].steps.length - 1) {
    timer = setInterval(next, 5000);
    $("play").textContent = "Ⅱ Pause";
  }
};
$("next").onclick = () => {
  stop();
  next();
};
$("reset").onclick = () => {
  step = -1;
  stop();
  inspect(scenarios[scenario].steps[0][0]);
  render();
};
$("labels").onclick = () => {
  $("city").classList.toggle("hide-labels");
  $("labels").textContent = $("city").classList.contains("hide-labels")
    ? "Show labels"
    : "Hide labels";
};
function scale() {
  const w = 1120 / zoom,
    h = 690 / zoom;
  $("city").setAttribute(
    "viewBox",
    `${(1120 - w) / 2} ${(690 - h) / 2} ${w} ${h}`,
  );
}
$("zoomin").onclick = () => {
  zoom = Math.min(1.6, zoom + 0.15);
  scale();
};
$("zoomout").onclick = () => {
  zoom = Math.max(0.8, zoom - 0.15);
  scale();
};
$("home").onclick = () => {
  zoom = 1;
  scale();
};
$("present").onclick = () => {
  document.body.classList.toggle("presentation");
  $("present").textContent = document.body.classList.contains("presentation")
    ? "Exit presentation ↙"
    : "Presentation view ↗";
};
document.addEventListener("keydown", (e) => {
  if (e.target.closest('button,[role="button"]')) return;
  if (e.code === "Space") {
    e.preventDefault();
    $("play").click();
  }
  if (e.key === "ArrowRight") {
    stop();
    next();
  }
  if (e.key === "Escape" && document.body.classList.contains("presentation"))
    $("present").click();
});
inspect("intake");
render();
