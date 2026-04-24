# 🌌 Project Aether: Autonomous Agent Command Center

**Project Aether** is a state-of-the-art Observability and Governance platform for LLM-based autonomous agents. Built with a focus on security, transparency, and premium user experience, it allows developers to deploy, monitor, and secure agentic workflows in real-time.

## ✨ Key Features

### 🛡️ The Sentry (Governance Layer)
- **Input Guardrails**: Real-time interception of prompts to prevent secret/API key leaks.
- **Output Redaction**: Automatic detection and redaction of PII (Personally Identifiable Information) in agent responses.
- **Policy Enforcement**: Block requests that violate predefined safety or cost boundaries.

### 🧠 Aether Flow (Observability)
- **Real-time Tracing**: Visualizing the "Thought Chain" of the agent as it moves from audit to generation.
- **WebSocket Streaming**: Live updates of pipeline status with zero latency.
- **State Inspection**: Deep dive into the data passed between each stage of the agentic process.

### 💎 Premium Aesthetics
- **Glassmorphic UI**: A modern, high-end dashboard built with Vanilla CSS and Framer Motion.
- **Responsive Tracing**: Dynamic node-based visualization of complex reasoning paths.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Vanilla CSS, Framer Motion, Lucide Icons.
- **Backend**: FastAPI (Python), Google Generative AI (Gemini 1.5 Flash), WebSockets.
- **Security**: Custom PII/Secret detection middleware.

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.9+
- Node.js 18+
- Gemini API Key ([Get one here](https://aistudio.google.com/))

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

## 🏗️ Architecture

Aether operates as a **Transparent Proxy** between the user and the LLM. 

1. **Intercept**: The Sentry scans the user prompt for sensitive data.
2. **Execute**: If safe, the prompt is sent to Gemini 1.5 Flash.
3. **Audit**: The LLM output is scanned for PII before being displayed.
4. **Broadcast**: Every step is streamed to the frontend via WebSockets for the Flow visualization.

---

## 👨‍💻 Author
**Arnav Bhardwaj** - [GitHub](https://github.com/Arnav-Bhardwaj1)

---
*Developed as a high-complexity demonstration of AI Orchestration, Security Middleware, and Modern Fullstack Engineering.*
