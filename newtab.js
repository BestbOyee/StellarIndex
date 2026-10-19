let allPlanets = [];
let selectedPlanet = null;

document.addEventListener("DOMContentLoaded", () => {
  loadPlanets();
  setupEventListeners();
});

function loadPlanets() {
  chrome.storage.local.get(["exoplanetDatabase"], (result) => {
    if (result.exoplanetDatabase && result.exoplanetDatabase.length > 0) {
      allPlanets = result.exoplanetDatabase;
      document.getElementById("totalLoaded").textContent = `DATASET: ${allPlanets.length} EXOPLANETS`;
      filterAndRenderPlanets();
    } else {
      document.getElementById("totalLoaded").textContent = "DATASET: FALLBACK MODE";
      allPlanets = [
        { pl_name: "Kepler-186 f", discoverymethod: "Transit", disc_year: 2014, pl_rade: 1.17, pl_orbper: 129.9, st_teff: 3755, sy_dist: 178.5 },
        { pl_name: "TRAPPIST-1 e", discoverymethod: "Transit", disc_year: 2017, pl_rade: 0.92, pl_orbper: 6.1, st_teff: 2566, sy_dist: 12.1 },
        { pl_name: "Proxima Cen b", discoverymethod: "Radial Velocity", disc_year: 2016, pl_rade: 1.08, pl_orbper: 11.2, st_teff: 3042, sy_dist: 1.3 }
      ];
      filterAndRenderPlanets();
    }
  });
}

function setupEventListeners() {
  const searchInput = document.getElementById("searchInput");
  const distFilter = document.getElementById("distFilter");
  const radFilter = document.getElementById("radFilter");
  const resetBtn = document.getElementById("resetFilters");

  searchInput.addEventListener("input", filterAndRenderPlanets);
  distFilter.addEventListener("input", (e) => {
    document.getElementById("distVal").textContent = e.target.value;
    filterAndRenderPlanets();
  });
  radFilter.addEventListener("input", (e) => {
    document.getElementById("radVal").textContent = e.target.value;
    filterAndRenderPlanets();
  });
  resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    distFilter.value = 3000;
    radFilter.value = 0.1;
    document.getElementById("distVal").textContent = "3000";
    document.getElementById("radVal").textContent = "0.1";
    filterAndRenderPlanets();
  });
}

function filterAndRenderPlanets() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const maxDist = parseFloat(document.getElementById("distFilter").value);
  const minRad = parseFloat(document.getElementById("radFilter").value);

  const filtered = allPlanets.filter(p => {
    const matchesQuery = p.pl_name.toLowerCase().includes(query);
    const matchesDist = !p.sy_dist || p.sy_dist <= maxDist;
    const matchesRad = !p.pl_rade || p.pl_rade >= minRad;
    return matchesQuery && matchesDist && matchesRad;
  });

  document.getElementById("resultCount").textContent = filtered.length;
  renderPlanetList(filtered.slice(0, 100));
}

function renderPlanetList(planets) {
  const listEl = document.getElementById("planetList");
  listEl.innerHTML = "";

  if (planets.length === 0) {
    listEl.innerHTML = `<li style="text-align: center; color: #8b949e;">No exoplanets match filter parameters.</li>`;
    return;
  }

  planets.forEach(planet => {
    const li = document.createElement("li");
    if (selectedPlanet && selectedPlanet.pl_name === planet.pl_name) {
      li.classList.add("active");
    }
    li.innerHTML = `
      <div class="planet-item-title">${planet.pl_name}</div>
      <div class="planet-item-sub">Discovered: ${planet.disc_year || 'N/A'} (${planet.discoverymethod || 'Unknown'})</div>
    `;
    li.addEventListener("click", () => {
      selectPlanet(planet);
      document.querySelectorAll("#planetList li").forEach(el => el.classList.remove("active"));
      li.classList.add("active");
    });
    listEl.appendChild(li);
  });
}

function selectPlanet(planet) {
  selectedPlanet = planet;
  document.getElementById("targetNameBadge").textContent = planet.pl_name;

  const detailsEl = document.getElementById("planetDetails");
  detailsEl.innerHTML = `
    <div class="telemetric-metric">
      <div class="metric-label">Radius</div>
      <div class="metric-value">${planet.pl_rade ? planet.pl_rade + " R🜨" : "N/A"}</div>
    </div>
    <div class="telemetric-metric">
      <div class="metric-label">Orbital Period</div>
      <div class="metric-value">${planet.pl_orbper ? planet.pl_orbper + " days" : "N/A"}</div>
    </div>
    <div class="telemetric-metric">
      <div class="metric-label">Distance from Earth</div>
      <div class="metric-value">${planet.sy_dist ? planet.sy_dist + " pc" : "N/A"}</div>
    </div>
    <div class="telemetric-metric">
      <div class="metric-label">Stellar Temp</div>
      <div class="metric-value">${planet.st_teff ? planet.st_teff + " K" : "N/A"}</div>
    </div>
  `;

  renderTransitLightCurve(planet);
}

function renderTransitLightCurve(planet) {
  const canvas = document.getElementById("transitCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (width === 0 || height === 0) return;

  canvas.width = width;
  canvas.height = height;

  ctx.clearRect(0, 0, width, height);

  // Background grid
  ctx.strokeStyle = "rgba(48, 54, 61, 0.5)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y < height; y += 30) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }

  let depth = 0.01;
  if (planet.pl_rade) {
    depth = Math.min(0.05, Math.max(0.002, (planet.pl_rade / 15) * 0.03));
  }

  const baselineY = height * 0.35;
  const dipMagnitude = depth * 1500;

  ctx.strokeStyle = "#58a6ff";
  ctx.lineWidth = 2.5;
  ctx.shadowColor = "#58a6ff";
  ctx.shadowBlur = 10;
  ctx.beginPath();

  for (let x = 0; x <= width; x++) {
    let dx = x - width / 2;
    let fluxDrop = 0;
    if (Math.abs(dx) < 60) {
      fluxDrop = dipMagnitude;
    } else if (Math.abs(dx) >= 60 && Math.abs(dx) < 80) {
      let slopeFactor = (80 - Math.abs(dx)) / 20;
      fluxDrop = dipMagnitude * slopeFactor;
    }

    let y = baselineY + fluxDrop;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#8b949e";
  ctx.font = "10px sans-serif";
  ctx.fillText("Normalized Flux (1.0)", 12, 20);
  ctx.fillText("Time (Orbital Phase)", width - 110, height - 12);
}