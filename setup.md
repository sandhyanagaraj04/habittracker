# Sadhana Habit Tracker — Setup Guide

## Prerequisites
- Python 3.11+
- Node.js 18+
- A Google account with the Sheet at:
  `https://docs.google.com/spreadsheets/d/1AKDObiI1KD9V32DCCMqaYR_sKCsg3YVreza9_N9JuUo`

---

## Step 1 — Google Cloud Setup (one time, ~5 minutes)

1. Go to https://console.cloud.google.com
2. Create a new project (e.g. "HabitTracker")
3. In the search bar, search **"Google Sheets API"** → Enable it
4. Go to **IAM & Admin → Service Accounts** → **Create Service Account**
   - Name: `habittracker-bot`
   - Click **Create and Continue** → Skip roles → Done
5. Click the service account you just created → **Keys** tab → **Add Key → JSON**
   - Download the JSON file
6. Rename it to `credentials.json` and place it in `backend/`
7. **Share your Google Sheet** with the service account email
   (looks like `habittracker-bot@your-project.iam.gserviceaccount.com`)
   — give it **Editor** access

---

## Step 2 — Backend

```bash
cd backend
cp .env.example .env
# Edit .env if needed (SHEET_NAME may need updating if your tab isn't "Sheet1")

pip install -r requirements.txt
uvicorn main:app --reload
```

API will be available at http://localhost:8000

---

## Step 3 — Frontend

```bash
cd frontend
npm install
npm run dev
```

App will open at http://localhost:5173

---

## Step 4 — Daily Backup (cron)

To automatically download a CSV backup every night at 11 PM:

```bash
crontab -e
```

Add this line:
```
0 23 * * * cd /home/user/habittracker && python backend/backup.py >> /home/user/habittracker-backups/backup.log 2>&1
```

Backups will be saved to `~/habittracker-backups/YYYY-MM-DD.csv`

To run a manual backup anytime:
```bash
cd backend && python backup.py
```

---

## Notes

- **Sleep quality**: Update your sheet to use numbers 1–5 going forward.
  The app handles both "good"/"bad" (historical) and 1–5 (new).
- **Duplicate meal columns**: The app maps the first set as "What I ate"
  and the second set as "Notes" for each meal.
- **Sheet tab name**: If your sheet tab isn't named "Sheet1", update
  `SHEET_NAME` in `backend/.env`.
