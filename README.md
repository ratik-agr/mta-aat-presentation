# Microwave Branch-Line Coupler & Printed Circular UWB Monopole Antenna
### 3D Full-Wave EM Simulation & Performance Characterization on 1.6 mm FR-4 Substrate

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Presentation-brightgreen?logo=github&style=for-the-badge)](https://ratik-agr.github.io/mta-aat-presentation/)
[![Ansys HFSS](https://img.shields.io/badge/Ansys%20HFSS-2025%20R2.4%20Student-ff6900?logo=ansys&style=for-the-badge)](#)
[![Course](https://img.shields.io/badge/Course-23EC5PCMTA%20MTA-blue?style=for-the-badge)](#)
[![B.M.S. College of Engineering](https://img.shields.io/badge/Institution-B.M.S.%20College%20of%20Engineering-darkred?style=for-the-badge)](#)

---

## 🌐 Live Interactive Presentation Deck
👉 **[View the Live Web Presentation](https://ratik-agr.github.io/mta-aat-presentation/)**  
*(Optimized for 16:9 widescreen displays. Press `F` for Fullscreen, `N` for Speaker Notes, and `O` for Slide Overview).*

---

## 📋 Academic Context & Team

- **Course:** 23EC5PCMTA — Microwave Theory and Antennas
- **Department:** Department of Electronics & Communication Engineering
- **Institution:** B.M.S. College of Engineering, Bengaluru – 560019
- **Evaluation:** Alternative Assessment Tool (AAT) & Self-Learning Activity (SLA) · June 2026
- **Faculty Supervisor & Guide:** **Dr. Shaila V. Hegde**, Professor, Dept. of ECE

### Team 1 Members
| Name | USN | Role & Contributions |
| :--- | :--- | :--- |
| **Nabi Abhishikth Zacharias** | `1BF24EC086` | Transmission Line Analysis & HFSS Simulation Setup |
| **Ratik Agrawal** | `1BF24EC118` | Interactive Engineering Deck Architecture & Synthesis Code |
| **Rohit Nair** | `1BF24EC121` | Coupler Phase Split Verification & S-Parameter Extraction |
| **Sawan Kumar** | `1BF24EC136` | UWB Cut-Off Formulation & FCC Compliance Characterization |

---

## 🎯 Executive Summary & Scope

This project presents the comparative design, closed-form transmission line synthesis, and Ansys HFSS 3D full-wave electromagnetic simulation of two planar RF/microwave components fabricated on low-cost $1.6\text{ mm}$ FR-4 substrate ($\varepsilon_r = 4.4$, $\tan\delta = 0.02$):

```
                                    ┌────────────────────────────────────────────────────────┐
                                    │  Dual-Component Comparative Study (1.6 mm FR-4)        │
                                    └──────────────────────────┬─────────────────────────────┘
                                                               │
                                ┌──────────────────────────────┴──────────────────────────────┐
                                │                                                             │
                 ▼                                                             ▼
┌─────────────────────────────────────────────────┐           ┌─────────────────────────────────────────────────┐
│ PART A: 2.4 GHz Branch-Line Quadrature Hybrid   │           │ PART B: Printed Circular UWB Monopole Antenna   │
├─────────────────────────────────────────────────┤           ├─────────────────────────────────────────────────┤
│ • Narrowband 4-Port Directional Coupler         │           │ • Multi-Octave Planar Radiator (1-Port)         │
│ • 50 Ω shunt arms (3.0 mm) & 35.4 Ω series (5.3)│           │ • Circular disc radiator (R = 13 mm)            │
│ • Centre Freq: 2.42 GHz (+0.8% junction shift)  │           │ • Truncated ground (11.5 mm, gap = 1.5 mm)      │
│ • Insertion Loss: -3.57 dB (0.56 dB FR4 loss)   │           │ • Matched Band: 3.52 GHz – 13.91 GHz (10.39 GHz)│
│ • Phase Split: 90° quadrature (P2 vs P3)        │           │ • Fractional Bandwidth: 119% (UWB ≥ 20%)        │
│ • Isolation: 26.8 dB (180° cancellation at P4)  │           │ • Peak Gain: +3.43 dB at 5 GHz (Omni-H cut)     │
└─────────────────────────────────────────────────┘           └─────────────────────────────────────────────────┘
```

---

## 🔬 Component Details & Key Results

### Part A: 2.4 GHz Branch-Line Coupler (90° Hybrid)
- **Substrate:** $1.6\text{ mm}$ FR-4 epoxy ($\varepsilon_r = 4.4$, $\tan\delta = 0.02$, copper cladding $35\ \mu\text{m}$).
- **Synthesis:** Hammerstad equations yield $50\ \Omega$ feed/shunt arms ($W = 3.0\text{ mm}$, $\lambda_g/4 = 17.1\text{ mm}$) and $35.35\ \Omega$ series arms ($W = 5.3\text{ mm}$, $\lambda_g/4 = 16.7\text{ mm}$).
- **Power Division:** Power at Port 1 divides equally between Port 2 (Through, $\angle -90^\circ$) and Port 3 (Coupled, $\angle -180^\circ$) with a precise **$90^\circ$ quadrature relative phase difference**.
- **Isolation Mechanism:** The direct path ($\lambda_g/4 = 90^\circ$) and loop path ($3\lambda_g/4 = 270^\circ$) arrive at Isolated Port 4 with a $180^\circ$ phase delta, yielding destructive interference with **$26.8\text{ dB}$ to $44.2\text{ dB}$ isolation**.
- **Dielectric Loss:** Insertion loss marker $m_3 = -3.57\text{ dB}$ (ideal is $-3.01\text{ dB}$), with the excess $0.56\text{ dB}$ ($88.0\%$ conservation efficiency) matching the theoretical loss tangent attenuation $\alpha_d \approx 0.83\text{ Np/m}$.

### Part B: Printed Circular UWB Monopole Antenna
- **Footprint:** Compact $26\times 27\times 1.6\text{ mm}^3$ board.
- **Radiator & Feed:** Circular disc radiator ($R = 13.0\text{ mm}$, center $x = -12.0\text{ mm}$) fed by a $50\ \Omega$ microstrip line ($W_f = 3.0\text{ mm}$, $L_f = 13.0\text{ mm}$).
- **Capacitive Tuning Ground:** Truncated ground plane ($L_g = 11.5\text{ mm}$, $W_g = 36.0\text{ mm}$) leaves a $1.5\text{ mm}$ coupling gap that acts as an impedance transformer, merging fundamental and higher-order modes into a continuous passband.
- **Bandwidth:** $S_{11} \le -10\text{ dB}$ from **$3.52\text{ GHz}$ to $13.91\text{ GHz}$** ($10.39\text{ GHz}$ absolute bandwidth, $\text{FBW} = 119\%$, frequency ratio $3.95:1$).
- **Regulatory Status:** Fully satisfies the US FCC UWB fractional bandwidth threshold ($\text{FBW} \ge 20\%$), covering $3.52$ to $10.6\text{ GHz}$, but requires lengthening the disc to $R \approx 14.5\text{ mm}$ to capture the lowest $3.10$ to $3.52\text{ GHz}$ FCC mask sub-band.
- **Radiation Pattern:** Doughnut-shaped omnidirectional azimuth ($H$-plane) radiation with $2\text{--}3\text{ dB}$ uniform gain across $360^\circ$ and figure-eight elevation ($E$-plane) cuts with nulls along the feed axis ($\theta = \pm 90^\circ$).

---

## 💻 Interactive Slide Deck Architecture

The interactive HTML slide presentation includes:
1. **Dynamic 16:9 Canvas Scaler Engine:** Automatically locks to a clean 16:9 aspect ratio (`1440x810 px`) on any screen size with zero vertical scrolling.
2. **Virtual RF Oscilloscope:** Real-time canvas waveform visualizer demonstrating $0^\circ$, $-90^\circ$, $-180^\circ$, and isolated cancellation signals at each port.
3. **Live Traveling Wave EM Simulator:** Interactive 2D microstrip wave propagation engine with adjustable speed and pause controls.
4. **Hammerstad Impedance Calculator:** Live reactive calculator with presets for $50\ \Omega$ and $35.4\ \Omega$ showing $Z_0$, $\varepsilon_{\text{eff}}$, $\lambda_g$, and arm length in real time.
5. **UWB Lower Cut-Off Estimator:** Dynamic quarter-wavelength estimator calculating theoretical $f_L$ against ground-to-apex path length $L$.
6. **Chart.js Interactive Vector Graphs:** Filterable S-parameter response curves ($S_{11}, S_{21}, S_{31}, S_{41}$) with exact simulation markers ($m_1$ through $m_5$).
7. **Three.js WebGL 3D Radiation Pattern:** Orbit-controlled 3D torus realized gain pattern at $5\text{ GHz}$.
8. **Presenter Notes Drawer (`N`):** Embedded oral defense talking points and viva cheat-sheets for each slide.
9. **Overview Grid (`O`):** Visual 13-slide lightbox grid for instant navigation.

---

## 📁 Repository Contents

```
mta-aat-presentation/
├── index.html                           # Root presentation deck (GitHub Pages entry point)
├── .nojekyll                            # Bypasses Jekyll processing for raw static delivery
├── README.md                            # Comprehensive project & defense documentation
│
├── css/
│   └── styles.css                       # Presentation stylesheet, typography & 16:9 grid system
│
├── js/
│   ├── presentation.js                  # Deck navigation, keyboard hooks & 16:9 canvas scaler
│   ├── simulators.js                    # Oscilloscope engine & Hammerstad / UWB live calculators
│   ├── interactive_charts.js            # S-parameter Chart.js vector renderers & marker tooltips
│   ├── chart_data.js                    # Discrete sweep S-parameter datasets (1.2–3.6 GHz & 1–15 GHz)
│   ├── three_radiation_sim.js           # Three.js WebGL 3D radiation pattern visualizer
│   ├── chart.min.js                     # Offline bundled Chart.js runtime
│   └── three.min.js                     # Offline bundled Three.js runtime
│
├── assets/
│   ├── coupler_diagram_corrected.png    # Quadrature hybrid 4-port schematic & phase diagram
│   ├── fig1B.png                        # Printed UWB monopole top-view geometry & partial ground
│   ├── fig2.jpg                         # HFSS 3D coupler pattern top view
│   ├── fig4.jpg                         # HFSS 3D Modeler tree & lumped port coordinates
│   ├── fig6.jpg                         # HFSS discrete S-parameter frequency sweep plot (m1–m5)
│   ├── fig2B.jpg                        # HFSS antenna return loss S11 sweep plot (m1–m4)
│   ├── fig3B.png                        # HFSS antenna -10 dB passband vs FCC UWB mask
│   ├── fig4B.jpg                        # HFSS 3D polar radiation plot (5 GHz)
│   └── fig5B.jpg                        # HFSS 2D elevation/azimuth polar radiation cuts
│
├── presentation/                        # Standalone presentation copy with relative paths
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── assets/
│
├── Branch_line_coupler.aedt             # Raw Ansys HFSS 2025 R2.4 simulation model (Part A)
├── UWB_Monopole_Antenna.aedt            # Raw Ansys HFSS 2025 R2.4 simulation model (Part B)
├── MTA_AAT_Report_FINAL-2.docx          # Formal academic technical report (DOCX)
└── MTA_AAT_Presentation_Enhanced.pptx   # Complementary PowerPoint presentation deck (PPTX)
```

---

## 📚 Standard References

1. **D. M. Pozar**, *Microwave Engineering*, 4th ed. Hoboken, NJ: John Wiley & Sons, 2012, ch. 7 (Power Dividers and Directional Couplers, pp. 317–360).
2. **E. Hammerstad and O. Jensen**, "Accurate models for microstrip computer-aided design," in *IEEE MTT-S Int. Microwave Symp. Dig.*, Washington, DC, 1980, pp. 407–409.
3. **C. A. Balanis**, *Antenna Theory: Analysis and Design*, 4th ed. Hoboken, NJ: John Wiley & Sons, 2016, ch. 2 & 14 (Antenna Fundamentals and Ultra-Wideband Systems).
4. **R. E. Collin**, *Foundations for Microwave Engineering*, 2nd ed. New York: IEEE Press / McGraw-Hill, 2001.
5. **Federal Communications Commission (FCC)**, "Revision of Part 15 of the Commission’s Rules Regarding Ultra-Wideband Transmission Systems," *First Report and Order*, ET Docket 98-153, FCC 02-48, Adopted Feb. 14, 2002.
6. **Ansys, Inc.**, *Ansys Electronics Desktop Student 2025 R2.4 HFSS Documentation & Solver Technical Manual*, Canonsburg, PA: Ansys Inc., 2025.
7. **H. G. Schantz**, "A brief history of UWB antennas," *IEEE Aerospace and Electronic Systems Magazine*, vol. 19, no. 4, pp. 22–26, Apr. 2004.
8. **K. P. Ray**, "Design aspects of printed monopole antennas for ultra-wide band applications," *International Journal of Antennas and Propagation*, vol. 2008, Article ID 971958, 2008.

---

## ⚖️ License & Acknowledgements

Developed as part of the academic curriculum for Course 23EC5PCMTA under the guidance of **Dr. Shaila V. Hegde** at **B.M.S. College of Engineering**, Bengaluru.
All simulation assets and analytical scripts are provided for educational and academic research evaluation.
