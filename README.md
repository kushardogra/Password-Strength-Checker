# Password-Strength-Checker
Password Strength Checker

A full-stack Password Strength Checker application that evaluates password strength using entropy, dictionary checks, and data breach lookups, and provides actionable feedback to the user.

Project Overview

This project consists of:

**Frontend**

	* Real-time strength evaluation (length, mixed case, digits, symbols)
	* Shannon entropy calculation
	* Dictionary check against the top 10,000 common passwords
	* Dynamic ✔/✖ requirements checklist
	* SHA-256 hash visualizer
	* Dark mode toggle
	* Live HaveIBeenPwned breach checks (k-anonymity)

**Backend**


	* Flask API exposing /api/breach-check
	* Accepts SHA-1 hash prefix/suffix, queries HIBP, returns breach count
	* CORS-enabled for use from GitHub Pages
⸻

Tech Stack

	•	Frontend
	•	HTML, CSS, JavaScript (Vanilla)
	•	Web Crypto API for hashing & entropy
	•	Backend
	•	Python 3, Flask, Flask-CORS
	•	requests for API calls
	•	Gunicorn as WSGI server

⸻

Features

Core Features (MVP)

	1.	Password Input Box
	2.	Strength Meter (labels: Too Short → Very Strong)
	3.	Feedback Messages (“Too Short”, common-password warning)
	4.	Entropy Calculation (bits/char)
	5.	Dictionary Check (against common_passwords.txt)
	6.	Live UI Updates on every keystroke

Advanced Features

	•	🔄 Real-time breach check via HaveIBeenPwned (k-anonymity)
	•	🔐 SHA-256 Hash Visualizer
	•	📊 Dynamic Strength Breakdown checklist with ✔/✖ per rule
	•	🌙 Dark Mode toggle with smooth animation

⸻

Common Password List

We bundle the top 10 000 most common passwords (sourced from the SecLists GitHub repo) in docs/common_passwords.txt. If your password appears in this list, the UI warns you immediately—protecting against the weakest, most guessable choices.

	https://github.com/danielmiessler/SecLists/blob/master/Passwords/Common-Credentials/10-million-password-list-top-10000.txt

⸻

*Concepts Explained*

1. Shannon Entropy

Entropy quantifies unpredictability. We compute Shannon entropy per character:

	H = -∑ p(c) · log₂ p(c)
 where p(c) is each character’s frequency in the password. Higher bits/char means a more complex password.

2. SHA-256 Hashing

Our “Show SHA-256 Hash” feature uses the browser’s Web Crypto API to demonstrate one-way hashing. It converts your password into a fixed-length 256-bit string that cannot be reversed.

3. HaveIBeenPwned (k-Anonymity)
To check breaches without revealing your password:

	1.	SHA-1 hash the password.
	2.	Send only the first 5 hex characters (prefix) to HIBP’s /range/ endpoint.
	3.	Receive hundreds of suffixes and counts.
	4.	Compare locally to see if your full hash appears—and how many times.

4. Dynamic Requirements Checklist
Rather than a black-box meter, we show a live list:

		•	At least 8 characters
		•	Mixed lower + upper case
		•	At least one digit
		•	At least one symbol

Each rule shows ✔ in green when met or ✖ in red otherwise. Only when all pass does the label read “Very Strong”.

⸻

Folder Structure
	
	password-strength-checker/
	├── backend/                # Flask API
	│   ├── app.py
	│   └── requirements.txt
	├── docs/                   # Static frontend (GitHub Pages)
	│   ├── index.html
	│   ├── style.css
	│   ├── script.js
	│   └── common_passwords.txt
	└── README.md

⸻

Getting Started

Prerequisites

	•	Python 3.x
	•	(Optional) python3 -m http.server for serving static files

Running Locally
1.	Backend
   
		cd backend
		python3 -m venv venv
		source venv/bin/activate
		pip install -r requirements.txt
		gunicorn app:app

2.	Frontend

		cd docs
		python3 -m http.server 8000
		# Open http://localhost:8000

⸻

Deployment

Frontend (GitHub Pages)

	1.	Push the docs/ folder to the frontend branch.
	2.	On GitHub: Settings → Pages → Source = frontend branch, /docs folder.
	3.	Site URL: https://kushardogra.github.io/Password-Strength-Checker/


Backend (Render)

	1.	Connect backend branch in Render as a Web Service.
	2.	Set Root Directory to backend/.
	3.	Build: pip install -r requirements.txt
	4.	Start: gunicorn app:app
	5.	Update API_URL in docs/script.js to: https://password-strength-checker-mvlg.onrender.com

⸻

Branch Strategy

	•	frontend: UI code served via GitHub Pages
	•	backend: Flask API served via Render

⸻

