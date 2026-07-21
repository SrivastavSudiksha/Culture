# Culture Biotechnology Planner

A fast, installable **Progressive Web App (PWA)** built for **Jaypee Institute of Information Technology (JIIT)** Biotechnology students to simplify timetable management. The application provides batch-wise schedules, elective planning, and free-slot discovery through a lightweight, framework-free interface.

## ✨ Features

- 📅 Interactive timetable viewer
- 👥 Batch-wise schedule support
- 📚 Elective timetable integration
- 🔍 Free-slot lookup by day and batch
- 📱 Responsive design for desktop and mobile
- 🌐 Works offline after first visit
- 📦 Installable as a Progressive Web App (PWA)
- ⚡ Fast loading with zero backend
- 🛡️ Graceful handling of missing or invalid timetable data

---

## 🛠️ Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Python
- OpenPyXL
- Progressive Web App (Service Worker + Web App Manifest)

---

## 📂 Project Structure

```text
.
├── index.html          # Application entry point
├── style.css           # UI styling
├── script.js           # Rendering logic
├── data.js             # Generated timetable data
├── build_data.py       # Generates data.js from Excel files
├── timetable.xlsx      # Timetable source
├── faculty.xlsx        # Faculty mapping
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker
├── favicon.svg
├── icon-192.svg
└── LICENSE
```

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/your-username/culture-biotechnology-planner.git
cd culture-biotechnology-planner
```

### Install dependency

```bash
pip install openpyxl
```

### Generate timetable data

```bash
python3 build_data.py
```

Watch for changes automatically:

```bash
python3 build_data.py --watch
```

---

## 💻 Run Locally

Using Python:

```bash
python3 -m http.server
```

Or using Node:

```bash
npm install -g serve
serve .
```

You can also use **VS Code Live Server**.

---

## 🚢 Deployment

This project is a static website and can be deployed directly to:

- GitHub Pages
- Vercel
- Netlify
- Cloudflare Pages

No build step is required.

> **Note:** Whenever timetable data is updated, regenerate `data.js` and increment `CACHE_NAME` in `sw.js` so users receive the latest cached version.

---

## 🏗️ Architecture

```
Excel Files
     │
     ▼
build_data.py
     │
     ▼
data.js
     │
     ▼
Vanilla JavaScript
     │
     ▼
Progressive Web App
```

---

## ⚡ Performance

- No frontend framework
- No backend server
- Lightweight static application
- Offline-first experience
- Minimal JavaScript footprint
- Fast startup and navigation

---

## 🔄 Updating Timetable Data

When a new semester begins:

1. Replace `timetable.xlsx`
2. Update `faculty.xlsx` if required
3. Modify `MANUAL_ELECTIVES` and `SHORT_CODE_NAMES` in `build_data.py` if subject mappings change
4. Regenerate `data.js`

---

## 📄 License

This project is licensed under the MIT License.
