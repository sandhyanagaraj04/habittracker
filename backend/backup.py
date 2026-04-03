"""
Daily backup: downloads the Google Sheet as CSV to ~/habittracker-backups/.
Run manually:  python backup.py
Run via cron:  0 23 * * * cd /home/user/habittracker && python backend/backup.py
"""
import csv
import os
from datetime import date
from pathlib import Path

import sheets

BACKUP_DIR = Path(os.getenv("BACKUP_DIR", Path.home() / "habittracker-backups"))


def run_backup() -> str:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

    data = sheets.get_all_data()
    if not data:
        print("No data to back up.")
        return ""

    today = date.today().strftime("%Y-%m-%d")
    filepath = BACKUP_DIR / f"{today}.csv"

    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=sheets.KEYS)
        writer.writeheader()
        writer.writerows(data)

    print(f"Backup saved → {filepath}")
    return str(filepath)


if __name__ == "__main__":
    run_backup()
