# CampusIQ Gemini AI Student Success Copilot Setup Guide

This guide walks you through configuring and using the **Gemini AI Student Success Copilot** in CampusIQ.

---

## 1. Obtain Your Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click **"Get API key"** and create an API key in a new or existing Google Cloud project.
4. Copy your API key.

---

## 2. Configure `backend/.env`

Open your `backend/.env` file in your editor (or create one if it does not exist) and add:

```env
# Google Gemini AI API Key
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Optional: Gemini model override (defaults to gemini-flash-latest)
GEMINI_MODEL=gemini-flash-latest
```

> [!IMPORTANT]
> - Never commit `backend/.env` to Git. Both `.gitignore` and `backend/.gitignore` ensure `.env` is ignored.
> - Do not put the Gemini API key in frontend files or browser configurations.

---

## 3. Start or Restart the Backend

If your backend is already running, restart it to load the new `GEMINI_API_KEY` into `process.env`:

```bash
cd backend
npm run dev
# or: node src/server.js
```

Verify backend health at:
`http://localhost:5002/api/health`

---

## 4. How to Use the Copilot in Your Browser

1. Open the CampusIQ Dashboard at [http://localhost:5174/](http://localhost:5174/).
2. Click **Student Explorer** in the sidebar navigation.
3. Click on any student record (e.g., **Aarav Sharma - 241FA04001** or **Akash Patel - 241FA19001**) to open their comprehensive profile drawer.
4. Scroll to the **Gemini AI Student Success Copilot** panel:
   - **Quick Performance Explanation**: Click the **"Explain Performance"** button to generate an instant institutional synthesis of the student's Success Score and risk factors.
   - **Custom Q&A**: Type a specific advisory question into the input field (e.g., *"What technical electives and interview preparation should this student prioritize this semester?"*) and click **"Ask Copilot"**.
   - **Review Generated Sections**:
     - **Performance Explanation**: Narrative analyzing CGPA, attendance, and assessment drivers.
     - **Contributing Factors**: Visual breakdown of academic, attendance, and skills impacts.
     - **Prioritized Actions**: 3 to 5 concrete action items with priority badges.
     - **4-Week Milestone Roadmap**: Structured timeline with measurable goals for Weeks 1 through 4.
     - **Data Coverage & Uncertainty Advisory**: Notes identifying unrecorded metrics and explaining predictive boundaries.
5. If the student profile is unverified or unknown, the Copilot automatically disables to prevent fabricated predictions.
