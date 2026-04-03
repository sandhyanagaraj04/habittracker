from datetime import date

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import backup
import sheets

app = FastAPI(title="Habit Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/data")
def get_all():
    try:
        return sheets.get_all_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/today")
def get_today():
    try:
        today = date.today().strftime("%Y-%m-%d")
        for row in sheets.get_all_data():
            if row.get("date") == today:
                return row
        return {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/entry")
def save_entry(entry: dict):
    try:
        date_str = entry.get("date") or date.today().strftime("%Y-%m-%d")
        return sheets.write_entry(date_str, entry)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stats")
def get_stats():
    try:
        data = sheets.get_all_data()
        if not data:
            return {}

        stats = {}
        for key in sheets.YES_NO_KEYS:
            values = [r[key] for r in data if key in r]
            completed = sum(1 for v in values if v)

            # Current streak (count from latest backwards)
            streak = 0
            for row in reversed(data):
                if row.get(key):
                    streak += 1
                else:
                    break

            stats[key] = {
                "total": len(values),
                "completed": completed,
                "rate": round(completed / len(values) * 100, 1) if values else 0,
                "streak": streak,
            }

        # Sleep averages
        sleep_rows = [r for r in data if r.get("sleep_quality") is not None]
        stats["_sleep"] = {
            "avg_quality": (
                round(sum(r["sleep_quality"] for r in sleep_rows) / len(sleep_rows), 2)
                if sleep_rows
                else None
            )
        }

        # Fitness averages
        step_rows = [r for r in data if r.get("steps", 0) > 0]
        stats["_fitness"] = {
            "avg_steps": (
                round(sum(r["steps"] for r in step_rows) / len(step_rows))
                if step_rows
                else 0
            ),
            "avg_heart_points": (
                round(
                    sum(r["heart_points"] for r in data if r.get("heart_points", 0) > 0)
                    / max(len([r for r in data if r.get("heart_points", 0) > 0]), 1)
                )
            ),
        }

        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/backup")
def trigger_backup():
    try:
        path = backup.run_backup()
        return {"success": True, "path": path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
