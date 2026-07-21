# Culture Biotechnology Planner

Culture Biotechnology Planner is a lightweight Progressive Web App (PWA) developed for students of the Biotechnology department at **Jaypee Institute of Information Technology (JIIT)**. It provides a simple way to view batch-wise timetables, explore elective schedules, and identify free time slots without having to navigate through PDFs or spreadsheets.

The application is built as a static website using HTML, CSS, and JavaScript, making it fast, easy to maintain, and simple to deploy on any static hosting platform.

---

## Features

- View batch-wise class timetables
- Browse elective schedules
- Find free slots by day and batch
- Responsive design for desktop and mobile devices
- Installable as a Progressive Web App (PWA)
- Offline support using a Service Worker
- Graceful handling of missing or invalid timetable data

---

## Technology Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Python
- OpenPyXL
- Service Worker
- Web App Manifest

---

## Project Structure

```text
.
├── index.html          # Main application
├── style.css           # Styling
├── script.js           # Application logic
├── data.js             # Generated timetable data
├── build_data.py       # Generates data.js from Excel files
├── timetable.xlsx      # Timetable source
├── faculty.xlsx        # Faculty mappings
├── manifest.json       # PWA configuration
├── sw.js               # Service Worker
├── favicon.svg
├── icon-192.svg
└── LICENSE
```

---

## Getting Started

Clone the repository:

```bash
git clone https://github.com/your-username/culture-biotechnology-planner.git
cd culture-biotechnology-planner
```

Install the required dependency:

```bash
pip install openpyxl
```

Generate the timetable data:

```bash
python3 build_data.py
```

To automatically regenerate the data whenever the source Excel files change:

```bash
python3 build_data.py --watch
```

---

## Running Locally

Start a local server using Python:

```bash
python3 -m http.server
```

Or use Node.js:

```bash
npm install -g serve
serve .
```

You can also use any static file server such as **VS Code Live Server**.

---

## Deployment

Since the project is a static website, it can be deployed directly to platforms such as:

- GitHub Pages
- Vercel
- Netlify
- Cloudflare Pages

No build step is required.

Whenever timetable data is updated, regenerate `data.js` and update the `CACHE_NAME` in `sw.js` so users receive the latest version of the application.

---

## How It Works

```text
timetable.xlsx + faculty.xlsx
              │
              ▼
       build_data.py
              │
              ▼
           data.js
              │
              ▼
      Web Application
```

The timetable is maintained in Excel files and processed by `build_data.py`, which converts the data into a JavaScript file consumed by the frontend. This keeps the application lightweight while making timetable updates straightforward.

---

## Updating for a New Semester

1. Replace `timetable.xlsx` with the latest timetable.
2. Update `faculty.xlsx` if faculty mappings have changed.
3. Modify `MANUAL_ELECTIVES` and `SHORT_CODE_NAMES` in `build_data.py` if subject codes or electives have changed.
4. Regenerate `data.js`.

---

## License

This project is licensed under the MIT License.
