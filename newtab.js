let allPlanets = [];
let selectedPlanet = null;
let pinnedPlanet = null;
let currentFilteredPlanets = []; // Track filtered dataset for export
let animationFrameId = null;
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
function startOrbitSimulation(planet) {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  
    const canvas = document.getElementById("orbitCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
  
    let angle = 0;
    const period = planet.pl_orbper || 365;
  
    // Dynamic speed: scaled smoothly so different orbital periods have visibly distinct speeds
    const speed = Math.max(0.004, Math.min(0.06, 0.4 / Math.pow(period, 0.35)));
  
    document.getElementById("orbitPeriodBadge").textContent = planet.pl_orbper ? `${planet.pl_orbper} Day Orbit` : "Keplerian Motion";
  
    function animate() {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      if (width === 0 || height === 0) return;
  
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
  
      ctx.clearRect(0, 0, width, height);
  
      const centerX = width / 2;
      const centerY = height / 2;
  
      // Dynamic orbit radius scaled proportionally based on the orbital period
      const maxAllowedRadius = Math.min(centerX, centerY) - 30;
      const periodFactor = Math.min(1.0, Math.log10(period + 1) / Math.log10(1000 + 1));
      const orbitRadius = 45 + periodFactor * (maxAllowedRadius - 45);
  
      // Draw background reference rings
      ctx.strokeStyle = "rgba(48, 54, 61, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbitRadius * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
      ctx.stroke();
  
      // Draw Glowing Host Star
      ctx.shadowColor = "#f0883e";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#ffb86c";
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
  
      const planetX = centerX + orbitRadius * Math.cos(angle);
      const planetY = centerY + orbitRadius * Math.sin(angle);
  
      // Draw Dashed Orbital Path
      ctx.strokeStyle = "rgba(88, 166, 255, 0.3)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
  
      // Draw Orbiting Exoplanet
      ctx.shadowColor = "#58a6ff";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "#58a6ff";
      ctx.beginPath();
      ctx.arc(planetX, planetY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
  
      angle += speed;
      if (angle > Math.PI * 2) angle = 0;
  
      animationFrameId = requestAnimationFrame(animate);
    }
  
    animate();
  }
function calculateESI(planet) {
  if (!planet.pl_rade) return 0.0;
  const r = planet.pl_rade;
  const radiusWeight = 1 - Math.abs((r - 1) / (r + 1));
  
  let tempWeight = 1.0;
  if (planet.st_teff) {
    if (planet.st_teff < 2400 || planet.st_teff > 7000) tempWeight = 0.5;
  }

  const esiScore = radiusWeight * tempWeight;
  return Math.max(0.0, Math.min(1.0, esiScore));
}

function setupEventListeners() {
    const searchInput = document.getElementById("searchInput");
    const distFilter = document.getElementById("distFilter");
    const radFilter = document.getElementById("radFilter");
    const periodFilter = document.getElementById("periodFilter");
    const methodFilter = document.getElementById("methodFilter");
    const habitabilityFilter = document.getElementById("habitabilityFilter");
    const resetBtn = document.getElementById("resetFilters");
    const pinCompareBtn = document.getElementById("pinCompareBtn");
    const exportJsonBtn = document.getElementById("exportJsonBtn");
    const exportCsvBtn = document.getElementById("exportCsvBtn");
  
    if (searchInput) searchInput.addEventListener("input", filterAndRenderPlanets);
    if (distFilter) distFilter.addEventListener("input", (e) => {
      document.getElementById("distVal").textContent = e.target.value;
      filterAndRenderPlanets();
    });
    if (radFilter) radFilter.addEventListener("input", (e) => {
      document.getElementById("radVal").textContent = e.target.value;
      filterAndRenderPlanets();
    });
    if (periodFilter) periodFilter.addEventListener("input", (e) => {
      document.getElementById("periodVal").textContent = e.target.value;
      filterAndRenderPlanets();
    });
    if (methodFilter) methodFilter.addEventListener("change", filterAndRenderPlanets);
    if (habitabilityFilter) habitabilityFilter.addEventListener("change", filterAndRenderPlanets);
  
    if (pinCompareBtn) {
      pinCompareBtn.addEventListener("click", () => {
        if (selectedPlanet) {
          pinnedPlanet = selectedPlanet;
          selectPlanet(selectedPlanet);
        }
      });
    }
  
    if (exportJsonBtn) exportJsonBtn.addEventListener("click", exportDataAsJSON);
    if (exportCsvBtn) exportCsvBtn.addEventListener("click", exportDataAsCSV);
  
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        if (distFilter) distFilter.value = 3000;
        if (radFilter) radFilter.value = 0.1;
        if (periodFilter) periodFilter.value = 1000;
        if (methodFilter) methodFilter.value = "all";
        if (habitabilityFilter) habitabilityFilter.checked = false;
        pinnedPlanet = null;
        
        document.getElementById("distVal").textContent = "3000";
        document.getElementById("radVal").textContent = "0.1";
        document.getElementById("periodVal").textContent = "1000";
        filterAndRenderPlanets();
      });
    }
  }

  function filterAndRenderPlanets() {
    const query = document.getElementById("searchInput")?.value.toLowerCase() || "";
    const maxDist = parseFloat(document.getElementById("distFilter")?.value) || 3000;
    const minRad = parseFloat(document.getElementById("radFilter")?.value) || 0.1;
    const maxPeriod = parseFloat(document.getElementById("periodFilter")?.value) || 1000;
    const selectedMethod = document.getElementById("methodFilter")?.value || "all";
    const onlyHabitable = document.getElementById("habitabilityFilter")?.checked || false;
  
    const filtered = allPlanets.filter(p => {
      const matchesQuery = p.pl_name.toLowerCase().includes(query);
      const matchesDist = !p.sy_dist || p.sy_dist <= maxDist;
      const matchesRad = !p.pl_rade || p.pl_rade >= minRad;
      const matchesPeriod = !p.pl_orbper || p.pl_orbper <= maxPeriod;
      const matchesMethod = selectedMethod === "all" || (p.discoverymethod && p.discoverymethod.toLowerCase() === selectedMethod.toLowerCase());
      
      const esi = calculateESI(p);
      const matchesHabitability = !onlyHabitable || esi >= 0.7;
  
      return matchesQuery && matchesDist && matchesRad && matchesPeriod && matchesMethod && matchesHabitability;
    });
  
    currentFilteredPlanets = filtered; // Store active filtered dataset
    document.getElementById("resultCount").textContent = filtered.length;
    renderPlanetList(filtered.slice(0, 100));
  }

function renderPlanetList(planets) {
  const listEl = document.getElementById("planetList");
  if (!listEl) return;
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

    const esi = calculateESI(planet);
    let esiClass = "esi-low";
    let esiText = `ESI: ${esi.toFixed(2)}`;
    
    if (esi >= 0.7) {
      esiClass = "esi-high";
    } else if (esi >= 0.4) {
      esiClass = "esi-moderate";
    }

    li.innerHTML = `
      <div class="planet-item-header">
        <span class="planet-item-title">${planet.pl_name}</span>
        <span class="esi-list-badge ${esiClass}">${esiText}</span>
      </div>
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
    
    const pinBtn = document.getElementById("pinCompareBtn");
    if (pinBtn) pinBtn.style.display = "block";
  
    const detailsEl = document.getElementById("planetDetails");
  
    // If a planet is pinned and it's different from the currently selected one, show comparison view!
    if (pinnedPlanet && pinnedPlanet.pl_name !== planet.pl_name) {
      const esiA = calculateESI(pinnedPlanet);
      const esiB = calculateESI(planet);
  
      detailsEl.innerHTML = `
        <div class="pinned-banner">
          <span>Comparing against pinned target</span>
          <button id="clearPin" class="btn-danger">Clear Pin</button>
        </div>
        <div class="comparator-container">
          <div class="compare-column">
            <div class="compare-header">📌 ${pinnedPlanet.pl_name}</div>
            <div class="compare-metric">ESI: <span>${esiA.toFixed(2)}</span></div>
            <div class="compare-metric">Radius: <span>${pinnedPlanet.pl_rade ? pinnedPlanet.pl_rade + " R🜨" : "N/A"}</span></div>
            <div class="compare-metric">Period: <span>${pinnedPlanet.pl_orbper ? pinnedPlanet.pl_orbper + " d" : "N/A"}</span></div>
            <div class="compare-metric">Distance: <span>${pinnedPlanet.sy_dist ? pinnedPlanet.sy_dist + " pc" : "N/A"}</span></div>
            <div class="compare-metric">Temp: <span>${pinnedPlanet.st_teff ? pinnedPlanet.st_teff + " K" : "N/A"}</span></div>
          </div>
          <div class="compare-column">
            <div class="compare-header">🔭 ${planet.pl_name}</div>
            <div class="compare-metric">ESI: <span>${esiB.toFixed(2)}</span></div>
            <div class="compare-metric">Radius: <span>${planet.pl_rade ? planet.pl_rade + " R🜨" : "N/A"}</span></div>
            <div class="compare-metric">Period: <span>${planet.pl_orbper ? planet.pl_orbper + " d" : "N/A"}</span></div>
            <div class="compare-metric">Distance: <span>${planet.sy_dist ? planet.sy_dist + " pc" : "N/A"}</span></div>
            <div class="compare-metric">Temp: <span>${planet.st_teff ? planet.st_teff + " K" : "N/A"}</span></div>
          </div>
        </div>
      `;
  
      document.getElementById("clearPin").addEventListener("click", () => {
        pinnedPlanet = null;
        selectPlanet(planet);
      });
  
    } else {
      // Standard Single Telemetry View
      const esi = calculateESI(planet);
      let esiClass = "esi-low";
      let esiLabel = "Low Habitability";
      if (esi >= 0.7) {
        esiClass = "esi-high";
        esiLabel = "High Habitability";
      } else if (esi >= 0.4) {
        esiClass = "esi-moderate";
        esiLabel = "Moderate Candidate";
      }
  
      let pinText = pinnedPlanet && pinnedPlanet.pl_name === planet.pl_name ? "✓ Target Pinned" : "Pin to Compare";
      if (pinBtn) pinBtn.textContent = pinText;
  
      detailsEl.innerHTML = `
        <div class="telemetric-metric" style="grid-column: span 2;">
          <div class="metric-label">Earth Similarity Index (ESI)</div>
          <div class="metric-value">
            <span class="esi-badge ${esiClass}">${esi.toFixed(2)} - ${esiLabel}</span>
          </div>
        </div>
        <div class="telemetric-metric">
          <div class="metric-label">Radius</div>
          <div class="metric-value">${planet.pl_rade ? planet.pl_rade + " R🜨" : "N/A"}</div>
        </div>
        <div class="telemetric-metric">
          <div class="metric-label">Orbital Period</div>
          <div class="metric-value">${planet.pl_orbper ? planet.pl_orbper + " days" : "N/A"}</div>
        </div>
        <div class="telemetric-metric">
          <div class="metric-label">Distance</div>
          <div class="metric-value">${planet.sy_dist ? planet.sy_dist + " pc" : "N/A"}</div>
        </div>
        <div class="telemetric-metric">
          <div class="metric-label">Stellar Temp</div>
          <div class="metric-value">${planet.st_teff ? planet.st_teff + " K" : "N/A"}</div>
        </div>
      `;
    }
  
    renderTransitLightCurve(planet);
    renderTransitLightCurve(planet);
    startOrbitSimulation(planet); // Start 2D orbital animation loop
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