# PyPI Lens

PyPI Lens is a modern, responsive web application that provides deep insights and analytics for Python packages. It connects directly to the PyPI JSON API and PyPI Stats API to visualize release history, download trends, and detailed metadata in a clean, professional dashboard.

## ✨ Features

### 🔍 Instant Package Search

Real-time fetching of package data from the Python Package Index.

### 📊 Interactive Analytics

* **Release Velocity:** Visualize the frequency and size of updates over time using area charts.
* **Download Trends:** View recent download statistics (powered by PyPI Stats).

### 📝 Smart README Renderer

* Full Markdown support with syntax highlighting.
* **Custom Table Support:** Renders complex tables even without GFM plugins.
* **HTML Pre-processing:** Automatically converts legacy HTML tags (like centered logos) into Markdown.

### 📦 Release Explorer

* Detailed version history.
* Expandable file lists for every release.
* Direct download links for Wheels (`.whl`) and Source distributions (`.tar.gz`).
* SHA256 hash verification.

### 🎨 Modern UI/UX

* Glassmorphism-inspired design.
* Dark/Light Mode toggle with persistence.
* Fully responsive layout for mobile and desktop.

## 🛠️ Tech Stack

* **Framework:** React + Vite
* **Styling:** Tailwind CSS
* **Visualization:** Recharts
* **Icons:** Lucide React
* **Markdown:** React Markdown

## 🚀 Local Setup Guide

Follow these steps to run PyPI Lens on your local machine.

### 1. Prerequisites

Ensure you have **Node.js (v16+)** installed.

### 2. Installation

Clone the repository (or create a new Vite project):

```bash
# 1. Create the project folder
npm create vite@latest pypi-lens -- --template react
cd pypi-lens

# 2. Install dependencies
npm install
```

### 3. Install Libraries

Install the required packages for charts, styling, and utilities:

```bash
# Tailwind CSS setup
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p

# App dependencies
npm install lucide-react recharts react-markdown
```

### 4. Configure Tailwind

Update your `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add directives to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5. Run the Application

Start the development server:

```bash
npm run dev
```

Open your browser to **[http://localhost:5173](http://localhost:5173)** to start exploring Python packages!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See LICENSE for more information.
