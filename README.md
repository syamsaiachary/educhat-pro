# EduChat Pro - Intelligent Hybrid University Chatbot

**EduChat Pro** is an advanced, hybrid AI chatbot designed to assist university students by combining a deterministic local knowledge base with the generative capabilities of Google's Gemini LLM.

![Status](https://img.shields.io/badge/Status-Completed-success)
![Tech](https://img.shields.io/badge/Stack-React%20|%20TypeScript%20|%20Gemini%20AI-blue)

## 📌 Project Overview

This project solves the problem of repetitive administrative queries in educational institutions. Unlike standard chatbots that rely solely on static rules or solely on expensive AI models, EduChat Pro uses a **"Local-First" Hybrid Architecture**:

1.  **Layer 1 (Instant):** A custom **TF-IDF & Cosine Similarity** NLP engine runs directly in the browser to answer common questions (fees, exams, syllabus) instantly from a verified database.
2.  **Layer 2 (Generative):** Complex or unique queries are seamlessly routed to **Google Gemini 2.5 Flash**, providing context-aware, helpful responses.
3.  **Feedback Loop:** An **Admin Panel** allows faculty to review "unanswered" AI logs and permanently add them to the knowledge base with one click, making the bot smarter over time.

## 🚀 Key Features

* **🧠 Hybrid Intelligence:** Intelligently switches between a static database and an LLM based on query complexity.
* **⚡ Custom NLP Engine:** Built-from-scratch TypeScript implementation of Vector Space Modeling (TF-IDF) and Cosine Similarity.
* **🛡️ Admin Dashboard:** A comprehensive interface to manage Intents (Q&A pairs) and review logs.
* **🪄 Auto-Generate Answers:** Admins can use Gemini to automatically draft answers for new student questions.
* **🎨 Modern UI/UX:** Built with **React**, **Tailwind CSS**, and **Framer Motion** for smooth animations.
* **💾 Local Persistence:** Uses browser LocalStorage for data persistence (Session history, Intents, Logs).
* **🔄 Context-Aware:** Maintains conversation history for accurate follow-up responses.

## 🛠️ Tech Stack

* **Frontend:** React, TypeScript
* **Styling:** Tailwind CSS
* **Icons & UI:** Lucide React, Framer Motion
* **AI Integration:** Google Generative AI SDK (Gemini 2.5 Flash)
* **Algorithms:** Custom TF-IDF, Cosine Similarity

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/educhat-pro.git](https://github.com/yourusername/educhat-pro.git)
cd educhat-pro
