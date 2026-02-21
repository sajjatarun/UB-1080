from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import sqlite3
import json
import os
import time
from datetime import datetime
from nlp_engine import classify_complaint

app = FastAPI(title="GrievanceGPT API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "grievances.db"

# ── DB SETUP ──
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_id TEXT UNIQUE,
            citizen_name TEXT,
            citizen_phone TEXT,
            complaint_text TEXT NOT NULL,
            category TEXT,
            department TEXT,
            urgency TEXT DEFAULT 'medium',
            summary TEXT,
            auto_reply TEXT,
            status TEXT DEFAULT 'Open',
            location TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    """)
    conn.commit()
    conn.close()
    seed_demo_data()

def seed_demo_data():
    conn = get_db()
    count = conn.execute("SELECT COUNT(*) FROM complaints").fetchone()[0]
    if count > 0:
        conn.close()
        return

    demo_complaints = [
        ("Rajesh Kumar", "9876543210", "There is a massive pothole on MG Road near Indiranagar signal. Two bikes have already fallen. Please fix urgently!", "Roads & Infrastructure", "BBMP Roads Dept", "high", "Pothole on MG Road near Indiranagar causing accidents", "Dear Rajesh Kumar, your complaint about road infrastructure has been registered and forwarded to BBMP Roads Department. Ticket: GRV-001", "In Progress", "MG Road, Indiranagar"),
        ("Priya Sharma", "9845123456", "No water supply in our area for the past 3 days. Koramangala 4th Block residents are suffering. Please restore water immediately.", "Water Supply", "BWSSB", "high", "Water supply disruption in Koramangala 4th Block for 3 days", "Dear Priya Sharma, your water supply complaint has been escalated to BWSSB on priority. Ticket: GRV-002", "Open", "Koramangala 4th Block"),
        ("Mohammed Irfan", "9731234567", "Street lights on 12th Main Road have not been working for 2 weeks. The area is very dark and unsafe at night.", "Electricity", "BESCOM", "medium", "Street light outage on 12th Main Road for 2 weeks", "Dear Mohammed Irfan, your complaint has been registered with BESCOM for immediate inspection. Ticket: GRV-003", "Resolved", "12th Main Road"),
        ("Lakshmi Devi", "9900011111", "Garbage has not been collected from our street for 5 days. It is causing bad smell and health issues for residents.", "Sanitation & Waste", "BBMP Sanitation", "high", "Garbage collection failure for 5 days causing health hazard", "Dear Lakshmi Devi, your sanitation complaint has been logged. BBMP Sanitation team will clear the area within 24 hours. Ticket: GRV-004", "In Progress", "HSR Layout"),
        ("Arjun Nair", "9611223344", "Loud music and parties happening every night past 11 PM near my apartment in Whitefield. Impossible to sleep.", "Noise Pollution", "Whitefield Police", "medium", "Repeated noise violation after 11 PM in Whitefield area", "Dear Arjun Nair, your noise complaint has been forwarded to Whitefield Police Station for patrolling. Ticket: GRV-005", "Open", "Whitefield"),
        ("Sunita Rao", "9123456789", "Sewage water overflowing on the road near our school. Very unhygienic, children are getting sick.", "Sanitation & Waste", "BBMP Sanitation", "high", "Sewage overflow near school creating health emergency", "Dear Sunita Rao, sewage overflow near school has been flagged as URGENT. BBMP team dispatched. Ticket: GRV-006", "In Progress", "Jayanagar"),
        ("Vikram Singh", "9988776655", "The park in our layout has broken benches, damaged play equipment and overgrown weeds. Kids cannot play safely.", "Parks & Recreation", "BBMP Parks Dept", "low", "Park maintenance required - broken equipment and overgrowth", "Dear Vikram Singh, your complaint about park maintenance has been registered with BBMP Parks Department. Ticket: GRV-007", "Open", "Banashankari"),
        ("Meena Krishnan", "9765432109", "Auto driver misbehaved and charged extra fare. He refused to use meter and threatened me when I complained.", "Public Transport", "RTO / Traffic Police", "medium", "Auto driver misconduct and fare overcharging complaint", "Dear Meena Krishnan, your transport complaint has been registered. Please share the auto registration number for faster action. Ticket: GRV-008", "Open", "Malleshwaram"),
    ]

    for i, (name, phone, text, cat, dept, urg, summary, reply, status, loc) in enumerate(demo_complaints, 1):
        ticket = f"GRV-{str(i).zfill(3)}"
        ts = datetime.now().isoformat()
        conn.execute("""INSERT INTO complaints 
            (ticket_id, citizen_name, citizen_phone, complaint_text, category, department, urgency, summary, auto_reply, status, location, created_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (ticket, name, phone, text, cat, dept, urg, summary, reply, status, loc, ts, ts))
    conn.commit()
    conn.close()

init_db()

# ── MODELS ──
class ComplaintSubmit(BaseModel):
    citizen_name: str
    citizen_phone: Optional[str] = ""
    complaint_text: str
    location: Optional[str] = ""

class StatusUpdate(BaseModel):
    status: str
    note: Optional[str] = ""

# ── ROUTES ──
@app.get("/")
def root():
    return {"message": "GrievanceGPT API is running", "version": "1.0.0"}

@app.post("/api/complaints/submit")
async def submit_complaint(data: ComplaintSubmit):
    if len(data.complaint_text.strip()) < 10:
        raise HTTPException(400, "Complaint text too short")

    # Classify with NLP
    classification = classify_complaint(data.complaint_text)

    # Generate ticket ID
    conn = get_db()
    count = conn.execute("SELECT COUNT(*) FROM complaints").fetchone()[0]
    ticket_id = f"GRV-{str(count + 1).zfill(3)}"
    ts = datetime.now().isoformat()

    conn.execute("""INSERT INTO complaints 
        (ticket_id, citizen_name, citizen_phone, complaint_text, category, department, urgency, summary, auto_reply, status, location, created_at, updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (ticket_id, data.citizen_name, data.citizen_phone, data.complaint_text,
         classification["category"], classification["department"], classification["urgency"],
         classification["summary"], classification["auto_reply"], "Open",
         data.location, ts, ts))
    conn.commit()
    conn.close()

    return {
        "success": True,
        "ticket_id": ticket_id,
        "category": classification["category"],
        "department": classification["department"],
        "urgency": classification["urgency"],
        "auto_reply": classification["auto_reply"],
        "summary": classification["summary"]
    }

@app.get("/api/complaints")
def get_complaints(status: Optional[str] = None, category: Optional[str] = None, urgency: Optional[str] = None):
    conn = get_db()
    query = "SELECT * FROM complaints WHERE 1=1"
    params = []
    if status: query += " AND status=?"; params.append(status)
    if category: query += " AND category=?"; params.append(category)
    if urgency: query += " AND urgency=?"; params.append(urgency)
    query += " ORDER BY created_at DESC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/complaints/{ticket_id}")
def get_complaint(ticket_id: str):
    conn = get_db()
    row = conn.execute("SELECT * FROM complaints WHERE ticket_id=?", (ticket_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(404, "Complaint not found")
    return dict(row)

@app.patch("/api/complaints/{ticket_id}/status")
def update_status(ticket_id: str, data: StatusUpdate):
    allowed = ["Open", "In Progress", "Resolved", "Rejected"]
    if data.status not in allowed:
        raise HTTPException(400, f"Status must be one of {allowed}")
    conn = get_db()
    ts = datetime.now().isoformat()
    result = conn.execute(
        "UPDATE complaints SET status=?, updated_at=? WHERE ticket_id=?",
        (data.status, ts, ticket_id))
    conn.commit()
    conn.close()
    if result.rowcount == 0:
        raise HTTPException(404, "Complaint not found")
    return {"success": True, "ticket_id": ticket_id, "new_status": data.status}

@app.get("/api/stats")
def get_stats():
    conn = get_db()
    total = conn.execute("SELECT COUNT(*) FROM complaints").fetchone()[0]
    by_status = conn.execute("SELECT status, COUNT(*) as count FROM complaints GROUP BY status").fetchall()
    by_category = conn.execute("SELECT category, COUNT(*) as count FROM complaints GROUP BY category ORDER BY count DESC").fetchall()
    by_urgency = conn.execute("SELECT urgency, COUNT(*) as count FROM complaints GROUP BY urgency").fetchall()
    conn.close()
    return {
        "total": total,
        "by_status": [dict(r) for r in by_status],
        "by_category": [dict(r) for r in by_category],
        "by_urgency": [dict(r) for r in by_urgency],
    }
