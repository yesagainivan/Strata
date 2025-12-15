# Strata Editor Guide

Welcome to the **Strata Editor** project! This guide will help you get set up, understand our workflow, and contribute effectively.

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v20+ recommended)
- **npm** (v10+ recommended)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yesagainivan/modern_markdown_editor.git
    cd modern_markdown_editor
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```
    The app will open at `http://localhost:5173`.

## 🛠️ Development Workflow

We use a standard GitHub flow:

1.  **Fork** the repository (if you are an external contributor).
2.  Create a **Feature Branch** (`git checkout -b feature/amazing-feature`).
3.  **Commit** your changes.
4.  **Push** to your branch.
5.  Open a **Pull Request** targeting the `main` branch.

### Code Style

- We use **TypeScript** for type safety. Please ensure no implicit `any` types.
- We use **Prettier** (via standard IDE settings) for formatting.

## 🤖 CI/CD & Automation

This repository uses **GitHub Actions** to automate our workflow:

### 1. CI (`.github/workflows/ci.yml`)
- **Triggers**: On every `push` and `pull_request` to `main`.
- **What it does**:
    - Installs dependencies.
    - Runs `npm run build` to check for compilation errors.
    - **Note**: If this check fails, your PR cannot be merged.

### 2. Deployment (`.github/workflows/deploy.yml`)
- **Triggers**: On pushes to `main`.
- **What it does**:
    - Builds the application.
    - Deploys the static site to **GitHub Pages**.
- **Live Demo**: [Link to your GitHub Pages site]

## 🤝 Contributing

We welcome contributions!
- **Bug Reports**: Open an issue describing the bug and how to reproduce it.
- **Feature Requests**: Open a discussion or issue to propose new features.
- **Pull Requests**:
    - Keep changes focused and small.
    - Update documentation if you change behavior.
    - Ensure the build passes (`npm run build`).

Thank you for building with us!
