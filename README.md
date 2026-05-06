# 🌌 Project Aether: Autonomous Agent Command Center

**Project Aether** is a state-of-the-art Observability, Governance, and Orchestration platform for LLM-based autonomous agents. Built for enterprise-grade security and transparency, it transforms agentic workflows from "black boxes" into fully audited, simulated, and coordinated swarms.

---

## ✨ Massive Feature Expansion

### 🌌 Aether Nexus: Multi-Agent Swarm Orchestration
Nexus elevates Aether from a single-agent tool into a high-fidelity coordination hub.
- **Neural Swarm Manager**: Decomposes complex goals into sub-tasks for specialized agents (**Researcher**, **Analyst**, **Validator**).
- **SVG Graph Engine**: A bespoke real-time visualization of agent topology with animated "glow-arcs" and "data packets" showing inter-agent traffic.
- **Inter-Agent Governance**: Every message between swarm nodes is intercepted and audited by **The Sentry**.

### 🏗️ Aether Mirror: The Digital Twin Sandbox
A stateful simulation environment for safe "pre-flight" validation of agentic actions.
- **Virtualized World Engine**: Mocks entire file systems and databases with **Snapshot & Restore** (Rollback) capabilities.
- **Environment Explorer**: A blueprint-style browser for navigating virtual file systems with real-time "dirty state" tracking.
- **Impact Radar**: Visualizes the "Blast Radius" of agent actions, mapping File Pressure, Data Entropy, and Integrity Risk.

### 🔥 The Forge: Adversarial Red-Teaming
A proactive stress-testing suite to harden agents against sophisticated attacks.
- **Adversarial Batch Generation**: Uses Gemini to generate "High-Heat" jailbreaks, prompt injections, and PII harvesting attempts.
- **Security Analytics**: Real-time Risk Scoring and Vulnerability Heatmaps (Radar Charts) to quantify system resilience.
- **Red-Team Console**: A tactical terminal for launching large-scale adversarial simulations.

---

## 🛠️ Core Governance & Observability

### 🛡️ The Sentry (Governance Layer)
- **Input Guardrails**: Real-time interception of prompts to prevent secret/API key leaks.
- **Output Redaction**: Automatic detection and redaction of PII in agent responses.
- **Policy Enforcement**: Block requests that violate predefined safety boundaries.

### 🧠 Aether Flow (Observability)
- **Real-time Tracing**: Visualizing the "Thought Chain" via WebSockets with zero latency.
- **State Inspection**: Deep dive into the data passed between each stage of the agentic process.
- **Glassmorphic Dashboard**: A premium UI built with Next.js 14, Framer Motion, and Vanilla CSS.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, TypeScript, Vanilla CSS, Framer Motion, Recharts, Lucide Icons.
- **Backend**: FastAPI, Python, Google Generative AI, WebSockets, Asyncio.
- **Security**: Custom PII/Secret detection and multi-agent governance protocols.

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your GEMINI_API_KEY to .env
python main.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to access the Command Center.

---

## 👨‍💻 Author
**Arnav Bhardwaj** - [GitHub](https://github.com/Arnav-Bhardwaj1)

---
*Developed as a high-complexity demonstration of AI Orchestration, Security Middleware, and Modern Fullstack Engineering.*

