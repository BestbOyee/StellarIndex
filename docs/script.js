document.addEventListener("DOMContentLoaded", () => {
  const samplePlanets = [
    { name: "Kepler-186 f", esi: 0.92, rad: "1.17 R🜨", period: "129.9 days", dist: "178.5 pc", temp: "3755 K", method: "Transit" },
    { name: "TRAPPIST-1 e", esi: 0.85, rad: "0.92 R🜨", period: "6.1 days", dist: "12.1 pc", temp: "2566 K", method: "Transit" },
    { name: "Proxima Cen b", esi: 0.87, rad: "1.08 R🜨", period: "11.2 days", dist: "1.3 pc", temp: "3042 K", method: "Radial Velocity" },
    { name: "Kepler-452 b", esi: 0.83, rad: "1.63 R🜨", period: "384.8 days", dist: "550.0 pc", temp: "5757 K", method: "Transit" },
    { name: "Gliese 667 C f", esi: 0.77, rad: "1.50 R🜨", period: "39.0 days", dist: "7.2 pc", temp: "3350 K", method: "Radial Velocity" },
    { name: "HD 209458 b", esi: 0.12, rad: "13.8 R🜨", period: "3.5 days", dist: "47.0 pc", temp: "6091 K", method: "Transit" },
    { name: "WASP-12 b", esi: 0.05, rad: "19.0 R🜨", period: "1.1 days", dist: "427.0 pc", temp: "6300 K", method: "Transit" }
  ];

  const searchInput = document.getElementById("demoSearchInput");
  const esiFilter = document.getElementById("demoEsiFilter");
  const planetListEl = document.getElementById("demoPlanetList");
  const telemetryPanel = document.getElementById("demoTelemetryPanel");

  function renderList() {
    const query = searchInput.value.toLowerCase();
    const filterVal = esiFilter.value;

    const filtered = samplePlanets.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(query) || p.method.toLowerCase().includes(query);
      let matchesEsi = true;
      if (filterVal === "high") matchesEsi = p.esi >= 0.7;
      if (filterVal === "moderate") matchesEsi = p.esi >= 0.4 && p.esi < 0.7;
      return matchesSearch && matchesEsi;
    });

    planetListEl.innerHTML = "";

    if (filtered.length === 0) {
      planetListEl.innerHTML = `<li style="justify-content:center; color:#8b949e;">No exoplanets found.</li>`;
      return;
    }

    filtered.forEach((planet, idx) => {
      const li = document.createElement("li");
      
      let badgeClass = "esi-badge-low";
      if (planet.esi >= 0.7) badgeClass = "esi-badge-high";
      else if (planet.esi >= 0.4) badgeClass = "esi-badge-mod";

      li.innerHTML = `
        <span class="demo-item-name">${planet.name}</span>
        <span class="demo-esi-badge ${badgeClass}">ESI ${planet.esi.toFixed(2)}</span>
      `;

      li.addEventListener("click", () => {
        document.querySelectorAll("#demoPlanetList li").forEach(el => el.classList.remove("active"));
        li.classList.add("active");
        renderTelemetry(planet);
      });

      // Auto-select first result by default
      if (idx === 0) {
        li.classList.add("active");
        renderTelemetry(planet);
      }

      planetListEl.appendChild(li);
    });
  }

  function renderTelemetry(planet) {
    let statusColor = "#f85149";
    let statusLabel = "Low Habitability";
    if (planet.esi >= 0.7) { statusColor = "#3fb950"; statusLabel = "High Habitability Candidate"; }
    else if (planet.esi >= 0.4) { statusColor = "#d29922"; statusLabel = "Moderate Candidate"; }

    telemetryPanel.innerHTML = `
      <div style="margin-bottom: 12px; font-weight: 700; color: #58a6ff; font-size: 1.1rem; border-bottom: 1px solid #21262d; padding-bottom: 8px;">
        🔭 ${planet.name} <span style="font-size: 0.75rem; color: ${statusColor}; font-weight: normal; margin-left: 8px;">● ${statusLabel}</span>
      </div>
      <div class="demo-telemetry-grid">
        <div class="demo-telemetry-item">
          <div class="demo-telemetry-label">ESI Score</div>
          <div class="demo-telemetry-val" style="color: ${statusColor};">${planet.esi.toFixed(2)}</div>
        </div>
        <div class="demo-telemetry-item">
          <div class="demo-telemetry-label">Radius</div>
          <div class="demo-telemetry-val">${planet.rad}</div>
        </div>
        <div class="demo-telemetry-item">
          <div class="demo-telemetry-label">Orbital Period</div>
          <div class="demo-telemetry-val">${planet.period}</div>
        </div>
        <div class="demo-telemetry-item">
          <div class="demo-telemetry-label">Distance</div>
          <div class="demo-telemetry-val">${planet.dist}</div>
        </div>
        <div class="demo-telemetry-item">
          <div class="demo-telemetry-label">Stellar Temp</div>
          <div class="demo-telemetry-val">${planet.temp}</div>
        </div>
        <div class="demo-telemetry-item">
          <div class="demo-telemetry-label">Discovery Method</div>
          <div class="demo-telemetry-val">${planet.method}</div>
        </div>
      </div>
    `;
  }

  searchInput.addEventListener("input", renderList);
  esiFilter.addEventListener("change", renderList);

  renderList();
});