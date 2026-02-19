Rider Experience Measurement Toolkit (Portfolio Project)
======================================================

What this is
------------
A fully interactive, UX-focused single-page AI-style analytics platform for rider experience measurement.

Included capabilities:
- Interactive KPI journey tree (Activation, First Ride Success, Ride Quality, Safety/Compliance, Support Resolution, Retention)
- Dynamic segmentation filters (market, vehicle type, cohort, time-of-day) that update KPI values and prioritization
- Visual KPI trend chart for rapid signal scanning
- Prioritization engine (impact x feasibility x urgency)
- Practical local market playbook with failure modes, mitigation guidance, and escalation paths
- Animated WebGL background with reduced-motion accessibility handling
- Keyboard-accessible controls, semantic sections, and skip-link navigation

Run locally
-----------
Option A (Python)
1) Open a terminal in this folder
2) Run: `python3 -m http.server 8080`
3) Open: `http://localhost:8080`

Option B (Node)
1) Open a terminal in this folder
2) Run: `npx serve .`
3) Open the URL printed in the terminal

Main files
----------
- index.html  -> UX structure, sections, semantic accessibility, and controls
- styles.css  -> visual system, responsive behavior, and component styling
- script.js   -> data model, interactivity, filtering, chart rendering, and WebGL shader animation
