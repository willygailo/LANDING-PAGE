# 🏘️ Miniature Town Landing Page

An immersive 3D animated landing page built with Three.js, featuring a miniature town theme with golden hour lighting, a cycling character, glowing street lamps, and floating glass UI elements.

## 📸 Screenshots

![Hero View](image/screenshot-hero.png)

![Navigation Detail](image/screenshot-nav.png)

![Lightbulb Interaction](image/screenshot-bulb.png)

## 🚀 Features

- **3D Miniature Town** — Houses, trees, street lamps, mountains, and clouds rendered in Three.js
- **Animated Cyclist** — Hierarchical character model with realistic pedaling and limb animation
- **Golden Hour Lighting** — Warm directional lights, point lights, and fog for cinematic atmosphere
- **Interactive UI** — Glassmorphism navigation, floating hero card, orbital node navigation, and clickable lightbulb
- **Firefly Particles** — Ambient floating particles with additive blending
- **Mouse Parallax** — Subtle camera movement following cursor position
- **Auto-Pan Animation** — Gentle camera drift for a living, breathing feel

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Three.js r128** | 3D scene rendering |
| **HTML5** | Structure |
| **CSS3** | Glassmorphism UI, animations, responsive design |
| **JavaScript (ES6+)** | Scene logic, animations, interactions |

## 📁 Project Structure

```
LANDING PAGE/
├── index.html          # Main HTML structure
├── style.css           # All UI styling and animations
├── script.js           # Three.js scene, models, and animation loop
├── image/              # Screenshots and assets
└── README.md           # Project documentation
```

## 🏃‍♂️ Getting Started

### Prerequisites

- Any modern browser (Chrome, Firefox, Safari, Edge)
- A local HTTP server (required for Three.js to load properly)

### Running Locally

1. Open a terminal in the project directory:
   ```bash
   cd "LANDING PAGE"
   ```

2. Start a local server:
   ```bash
   python3 -m http.server 8080
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

## 🎮 Interactions

| Element | Action |
|---|---|
| **Lightbulb** | Click to toggle warm glow |
| **Nav Pills** | Click to switch active state |
| **Node Dots** | Click to navigate sections |
| **CTA Button** | Hover for glow + lift effect |
| **Mouse Move** | Parallax camera movement |

## 🎨 Design System

- **Font:** Outfit (300, 400, 500, 600, 700)
- **Primary Accent:** `#ff8c64` → `#ff6b4a` gradient
- **Glass Effect:** `backdrop-filter: blur(20-32px)`
- **Background:** `#12122a` deep navy
- **Text:** White with varying opacity (0.4–0.9)

## 👨‍💻 Developer

**Willy Jr Carnasa Gailo**

## 📄 License

© 2024 Piut, All rights reserved.
