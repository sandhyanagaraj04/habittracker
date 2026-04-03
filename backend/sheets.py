import os
import pickle
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

SPREADSHEET_ID = os.getenv("SPREADSHEET_ID", "1AKDObiI1KD9V32DCCMqaYR_sKCsg3YVreza9_N9JuUo")
SHEET_NAME = os.getenv("SHEET_NAME", "Sheet1")
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
CLIENT_SECRETS_FILE = os.getenv("CLIENT_SECRETS_FILE", "client_secrets.json")
TOKEN_FILE = os.getenv("TOKEN_FILE", "token.pickle")

# Internal key names (aligned to column order in the sheet)
COLUMN_MAP = [
    ("date",            "text"),
    ("place",           "text"),
    ("wake_up_time",    "text"),
    ("sleeping_time",   "text"),
    ("sleep_duration",  "text"),
    ("sleep_quality",   "quality"),   # "good"/"bad" or 1-5
    ("guru_pooja",      "yesno"),
    ("rayara_matha",    "yesno"),
    ("ashwat_count",    "number"),
    ("upa_yoga",        "yesno"),
    ("yoga_namaskar",   "yesno"),
    ("surya_kriya",     "yesno"),
    ("asanas",          "yesno"),
    ("sck_1",           "yesno"),
    ("shambhavi_1",     "yesno"),
    ("ishanga",         "yesno"),
    ("naadi_shuddhi",   "yesno"),
    ("miracle_of_mind", "yesno"),
    ("shoonya_1",       "yesno"),
    ("shoonya_2",       "yesno"),
    ("sck_2",           "yesno"),
    ("shambhavi_2",     "yesno"),
    ("crash_course",    "yesno"),
    ("sukha_kriya",     "yesno"),
    ("aum_chanting",    "yesno"),
    ("hanuman_chalisa", "yesno"),
    ("hrhk",            "yesno"),
    ("gym",             "yesno"),
    ("workout",         "yesno"),
    ("steps",           "number"),
    ("heart_points",    "number"),
    ("aum_namo",        "yesno"),
    ("devi_stuti",      "yesno"),
    ("devi_dandam",     "yesno"),
    ("reading",         "yesno"),
    ("which_book",      "text"),
    ("words_pages",     "text"),
    ("reading_minutes", "number"),
    ("breakfast_food",  "text"),
    ("lunch_food",      "text"),
    ("snack_food",      "text"),
    ("dinner_food",     "text"),
    ("breakfast_notes", "text"),
    ("lunch_notes",     "text"),
    ("snack_notes",     "text"),
    ("dinner_notes",    "text"),
    ("bhairavi",        "yesno"),
    ("sunlight",        "yesno"),
    ("walk_breakfast",  "yesno"),
    ("walk_lunch",      "yesno"),
    ("walk_dinner",     "yesno"),
    ("supplements",     "yesno"),
    ("ekadashi",        "yesno"),
    ("writing",         "yesno"),
]

KEYS = [k for k, _ in COLUMN_MAP]
TYPES = {k: t for k, t in COLUMN_MAP}

YES_NO_KEYS = {k for k, t in COLUMN_MAP if t == "yesno"}
NUMERIC_KEYS = {k for k, t in COLUMN_MAP if t == "number"}

QUALITY_MAP = {"good": 4, "great": 5, "ok": 3, "bad": 2, "poor": 1, "excellent": 5}


def _get_credentials():
    creds = None
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, "rb") as f:
            creds = pickle.load(f)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_FILE, SCOPES)
            flow.redirect_uri = "urn:ietf:wg:oauth:2.0:oob"
            auth_url, _ = flow.authorization_url(prompt="consent")
            print(f"\nVisit this URL to authorise:\n\n{auth_url}\n")
            code = input("Paste the authorisation code here: ").strip()
            flow.fetch_token(code=code)
            creds = flow.credentials
        with open(TOKEN_FILE, "wb") as f:
            pickle.dump(creds, f)
    return creds


def _get_service():
    return build("sheets", "v4", credentials=_get_credentials())


def _normalize_row(raw: list) -> dict:
    padded = raw + [""] * (len(KEYS) - len(raw))
    entry = dict(zip(KEYS, padded))

    for key in YES_NO_KEYS:
        val = str(entry.get(key, "")).strip().lower()
        entry[key] = val in ("yes", "y", "true", "1", "✓", "x")

    for key in NUMERIC_KEYS:
        try:
            entry[key] = float(str(entry.get(key, "") or "0").replace(",", ""))
        except ValueError:
            entry[key] = 0.0

    # Sleep quality: normalize to 1-5
    sq = str(entry.get("sleep_quality", "")).strip().lower()
    if sq in QUALITY_MAP:
        entry["sleep_quality"] = QUALITY_MAP[sq]
    else:
        try:
            entry["sleep_quality"] = float(sq)
        except ValueError:
            entry["sleep_quality"] = None

    return entry


def get_all_data() -> list[dict]:
    service = _get_service()
    result = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=SPREADSHEET_ID, range=f"{SHEET_NAME}!A:BB")
        .execute()
    )
    values = result.get("values", [])
    if not values or len(values) < 2:
        return []
    return [_normalize_row(row) for row in values[1:] if row]


def get_dates() -> list[str]:
    service = _get_service()
    result = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=SPREADSHEET_ID, range=f"{SHEET_NAME}!A:A")
        .execute()
    )
    return [r[0] if r else "" for r in result.get("values", [])]


def write_entry(date_str: str, data: dict) -> dict:
    service = _get_service()
    dates = get_dates()

    if date_str in dates:
        row_index = dates.index(date_str) + 1  # 1-based sheet row
    else:
        row_index = len(dates) + 1

    row_values = []
    for key in KEYS:
        val = data.get(key, "")
        if isinstance(val, bool):
            val = "Yes" if val else "No"
        elif val is None:
            val = ""
        row_values.append(str(val))

    service.spreadsheets().values().update(
        spreadsheetId=SPREADSHEET_ID,
        range=f"{SHEET_NAME}!A{row_index}",
        valueInputOption="USER_ENTERED",
        body={"values": [row_values]},
    ).execute()

    return {"success": True, "row": row_index}
