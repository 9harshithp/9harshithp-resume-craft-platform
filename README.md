ResumeCraft: A Full-Stack AI-Powered Resume Platform
ResumeCraft is a modern, full-stack web application designed to help users create, manage, and share professional resumes with ease. It features a sleek, responsive user interface and a powerful backend, enhanced with AI capabilities from Google's Gemini API to provide intelligent feedback and content generation.

Live Demo & Walkthrough
As this project is hosted locally, a live demo link is not available. However, you can view a complete video walkthrough of the application's features here:

[Link to Your Video Demo - e.g., Loom, YouTube, Google Drive]

Features
Core MVP Features
Secure Authentication: User registration and login handled securely by Firebase Authentication.

Dynamic Resume Builder: An intuitive form to add and edit personal details, work experience, education, and skills.

Multiple Resume Versions: Users can create, save, and manage multiple versions of their resumes.

Centralized Dashboard: A clean dashboard to view all resume versions at a glance.

PDF Download: Download any resume version as a polished, formatted PDF.

Advanced & AI Features (Bonus)
AI Resume Coach (Gemini API): Get expert-level, actionable feedback on your entire resume to improve its impact and clarity.

AI Content Generation (Gemini API): Automatically generate compelling, professional descriptions for your work experience sections.

Multiple PDF Templates: Choose between different visual templates ('Classic' and 'Modern') to best suit the job application.

Rich Text Editing: The work experience description supports basic formatting like bold, italics, and bullet points.

Shareable Public Link: Generate a unique, public URL for any resume to share with recruiters or on professional networks.

Profile Picture Upload: Personalize resumes by uploading a profile picture, securely handled by Firebase Storage.

Tech Stack
The project is built with a modern, high-performance technology stack:

Category

Technology

Justification

Frontend

React, Tailwind CSS

For building a fast, responsive, and component-based user interface.

Backend

FastAPI (Python)

For its high performance, asynchronous capabilities, and automatic API documentation.

Database

Redis

An in-memory database chosen for its speed in reading and writing resume and user data.

Authentication

Firebase Authentication

To handle user login, registration, and security reliably and scalably.

File Storage

Firebase Storage

For securely storing user-uploaded files like profile pictures.

AI / LLM

Google Gemini API

To power the AI Coach and content generation features with a state-of-the-art language model.

Setup and Installation
Follow these steps to run the project on your local machine.

Prerequisites
Git

Python 3.8+

Docker (for running Redis)

Node.js and npm (for local frontend development)

1. Clone the Repository
git clone [https://github.com/your-username/resume-craft-platform.git](https://github.com/your-username/resume-craft-platform.git)
cd resume-craft-platform

2. Backend Setup
The backend is located in the /backend directory.

a. Start Redis Database
Make sure Docker is running, then start the Redis container:

docker run -d --name redis-resume -p 6379:6379 redis

b. Firebase Admin Credentials

⚠️ SECURITY WARNING
Your Firebase service account key (.json file) is a secret and must NEVER be committed to GitHub. The project's .gitignore file is configured to ignore .json files to prevent this.

Download your service account key from the Firebase Console.

Place the downloaded .json file inside the /backend folder.

Set the environment variable to point to this file. In your terminal, run:

# On Mac/Linux
export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/backend/your-secret-key.json"

# On Windows (CMD)
set GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\your\backend\your-secret-key.json"

Update Demo User UID: In main.py, find the DEMO_USER_UID variable and replace the placeholder with the actual UID of your demo user from the Firebase Console.

c. Install Dependencies and Run

cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

The backend will be running at http://1227.0.0.1:8000.

3. Frontend Setup
The frontend is a single React file located at /frontend/resume-platform-frontend.jsx. The easiest way to run it is with an online editor.

Go to CodeSandbox or a similar platform.

Create a new React project.

Replace the content of src/App.js with the code from resume-platform-frontend.jsx.

Add the required PDF libraries to the public/index.html file before the closing </body> tag:

<script src="[https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js](https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js)"></script>
<script src="[https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js](https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js)"></script>

Demo User for Evaluation
For easy testing and evaluation, a demo user is available. On the login screen, click the "Login as Demo User" button.

Email: hire-me@anshumat.org

Password: HireMe@2025!

This user has a pre-populated sample resume to showcase the platform's features immediately.
