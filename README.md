Here’s a `README.md` file tailored to your **Legacy Project Analyser** Next.js project:

---

````markdown
# 🧠 Legacy Project Analyser

A powerful Next.js-based application designed to analyze and manage legacy codebases using the Code Llama model via [Ollama](https://ollama.com/). This project also utilizes a PostgreSQL database with [Drizzle ORM](https://orm.drizzle.team/) for schema and migration handling.

---

## 🚀 Prerequisites

Before getting started, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18+)
- [Ollama](https://ollama.com/) installed and running
- PostgreSQL (or compatible DB) installed locally

---

## 🔧 Setup Instructions

### 1. Install and Configure Ollama

First, install **Ollama** if it's not already installed:

```bash
# Install Ollama (if needed)
# Visit https://ollama.com/download to download the correct version for your OS
````

Then, pull the required **Code Llama** model:

```bash
ollama pull codellama:7b-instruct
```

Verify that the model is installed:

```bash
ollama list
```

---

### 2. Database Setup

Create a new PostgreSQL database named `legacy_code_analyser`.

> ⚠️ Make sure your environment variables (like `DATABASE_URL`) are properly configured in a `.env` file.

Then run the following commands:

```bash
# Set up database (seed, etc.)
npm run db:setup

# Generate schema definitions
npm run db:generate

# Run migrations to create the necessary tables
npx drizzle-kit migrate
```

---

### 3. Install Dependencies

```bash
npm install
```

---

### 4. Start the Development Server

```bash
npm run dev
```

Open your browser and go to: [http://localhost:3000](http://localhost:3000)


---

## 🤖 AI Model Usage

This project uses **Code Llama 7B Instruct** for code analysis tasks. Ensure the model is available in Ollama before using the analysis features.

---

## 📜 License

MIT License

---

## 🛠 Maintainers

* Mohanapriya 

---

## 🌐 Links

* [Ollama](https://ollama.com/)
* [Code Llama](https://ai.meta.com/research/publications/code-llama/)
* [Drizzle ORM](https://orm.drizzle.team/)
* [Next.js](https://nextjs.org/)

```
