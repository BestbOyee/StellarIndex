# 🔭 StellarIndex

**StellarIndex** is a professional-grade Google Chrome extension designed for exoplanet research, visualization, and telemetry data analysis. Built with a "Mission Control" UI aesthetic, it bridges NASA's real astronomical database directly into your browser's new tab page.

---

## 🚀 Key Features

* **Live NASA Data Caching**: Automatically syncs and caches confirmed exoplanet telemetry via the NASA Exoplanet Archive TAP API, with a robust fallback dataset for offline stability.
* **Advanced Multi-Parameter Filtering**: Filter thousands of confirmed worlds by Maximum Distance, Minimum Radius, Orbital Period, and Discovery Method.
* **Earth Similarity Index (ESI) Grading**: Automatically calculates habitability scores and categorizes candidates using color-coded badges (**Green** for high habitability, **Yellow** for moderate candidates, and **Red** for low suitability).
* **Side-by-Side Exoplanet Comparator**: Pin a primary target and compare its physical parameters side-by-side with any second exoplanet.
* **Real-Time 2D Keplerian Orbital Simulator**: An interactive canvas animation scaling revolution speed and orbit radius proportionally to each planet's actual orbital period.
* **Photometric Transit & Transmission Spectrum Viewer**: Toggle between simulated normalized stellar flux dips during planetary transit and JWST infrared molecular absorption spectra ($H_2O$, $CO_2$).
* **Dataset Exports**: Package and download custom-filtered subsets of the exoplanet archive as `.json` or `.csv` files using the Chrome downloads API.

---

## 🛠️ Tech Stack

* **Manifest V3** Chrome Extension Architecture
* **HTML5 Canvas API** for real-time physics & light curve simulations
* **Chrome Storage Local & Downloads API** for state management and file exports
* **Vanilla JavaScript (ES6+) & Modern CSS3** (Mission Control Dark Theme)

---

## 📦 Installation & Setup

1. Clone or download this repository to your local machine:
   ```bash
   git clone [https://github.com/your-username/stellar-index.git](https://github.com/your-username/stellar-index.git)