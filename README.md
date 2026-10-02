# AI Career Intelligence Platform

An advanced, production-ready AI-powered career assistant built with **Next.js 16 (App Router)** and **Google Gemini AI SDK**. Designed to streamline the job search workflow with deep parsing, automated resume tailoring, bullet-point optimization, and interactive interview loops.

---

## 🚀 Key Features

* **AI Job Description Parser:** Instantly extracts key requirements, tech stacks, and seniority levels from raw job descriptions.
* **Smart Resume Tailoring:** Dynamically tailors resume content to align with specific target roles using structured JSON output.
* **Bullet Point Auditor & Rewriter:** Reframes experience bullets into high-impact, results-driven achievements.
* **AI Cover Letter Generator:** Crafts professional, contextual cover letters matching job requirements.
* **Interactive Interview Loop:** Simulates real technical/behavioral interview scenarios with dynamic AI-driven follow-ups.
* **Robust Error Handling & Sanitization:** Implements `safeParseJSON` and graceful fallbacks to ensure zero UI crashes from LLM response drift.
* **Modern Dark-Mode SaaS UI:** Built with Tailwind CSS, custom slate-zinc gradients, ambient glows, and progressive loading states.

---

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router, Turbopack)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **AI SDK:** `@google/genai` (Google GenAI SDK)
* **Deployment:** Vercel

---

## ⚙️ Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/ai-job-parser.git](https://github.com/YOUR_USERNAME/ai-job-parser.git)
   cd ai-job-parser


* Install Dependencies:
npm install

* Set up your environment variables:
Create a .env.local file in the root directory and add your Gemini API key:

Code snippet
GEMINI_API_KEY=your_actual_gemini_api_key_here


