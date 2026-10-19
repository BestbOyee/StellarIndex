document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("previewCanvas");
    if (!canvas) return;
  
    const ctx = canvas.getContext("2d");
    let selectedPlanet = "kepler";
  
    const planetData = {
      kepler: { name: "Kepler-186 f", depth: 0.02, color: "#58a6ff" },
      trappist: { name: "TRAPPIST-1 e", depth: 0.035, color: "#3fb950" },
      proxima: { name: "Proxima Cen b", depth: 0.015, color: "#d29922" }
    };
  
    const buttons = document.querySelectorAll(".planet-btn");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedPlanet = btn.getAttribute("data-planet");
        drawPreview();
      });
    });
  
    function drawPreview() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
  
      ctx.clearRect(0, 0, width, height);
  
      // Background Grid
      ctx.strokeStyle = "rgba(48, 54, 61, 0.4)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
  
      const current = planetData[selectedPlanet];
      const baselineY = height * 0.35;
      const dipMagnitude = current.depth * 1500;
  
      ctx.strokeStyle = current.color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = current.color;
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
      ctx.font = "12px sans-serif";
      ctx.fillText(`Simulated Transit Dip: ${current.name}`, 16, 24);
    }
  
    window.addEventListener("resize", drawPreview);
    drawPreview();
  });