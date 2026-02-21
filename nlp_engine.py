import os
import json
import re

# ── LLM CLASSIFICATION ──
# Supports: Google Gemini (recommended - free tier) OR OpenAI
# Set environment variable: GEMINI_API_KEY or OPENAI_API_KEY

CATEGORIES = [
    "Roads & Infrastructure",
    "Water Supply",
    "Electricity",
    "Sanitation & Waste",
    "Noise Pollution",
    "Parks & Recreation",
    "Public Transport",
    "Other"
]

DEPT_MAP = {
    "Roads & Infrastructure": "BBMP Roads Department",
    "Water Supply": "BWSSB (Water Board)",
    "Electricity": "BESCOM (Electricity Board)",
    "Sanitation & Waste": "BBMP Sanitation Department",
    "Noise Pollution": "Local Police Station",
    "Parks & Recreation": "BBMP Parks Department",
    "Public Transport": "BMTC / RTO",
    "Other": "Municipal Corporation - General"
}

PROMPT_TEMPLATE = """You are a civic grievance classification assistant for Indian municipal corporations.
Analyze the citizen complaint below and return ONLY valid JSON (no markdown, no extra text).

Categories: Roads & Infrastructure, Water Supply, Electricity, Sanitation & Waste, Noise Pollution, Parks & Recreation, Public Transport, Other

Return this exact JSON structure:
{{
  "category": "<one of the categories above>",
  "department": "<relevant department name>",
  "urgency": "<low|medium|high>",
  "summary": "<one sentence summary of the complaint>",
  "auto_reply": "<polite 2-sentence acknowledgment message starting with 'Dear Citizen,'>"
}}

Urgency guide: high = safety risk or essential service failure, medium = inconvenience, low = aesthetic/minor

Complaint: "{text}"
"""

def classify_with_gemini(text: str) -> dict:
    import urllib.request
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        raise ValueError("No GEMINI_API_KEY set")

    prompt = PROMPT_TEMPLATE.format(text=text.replace('"', "'"))
    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 300}
    }).encode()

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read())
    
    raw = data["candidates"][0]["content"]["parts"][0]["text"]
    # Strip markdown if present
    raw = re.sub(r'```json\s*|\s*```', '', raw).strip()
    return json.loads(raw)

def classify_with_openai(text: str) -> dict:
    import urllib.request
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        raise ValueError("No OPENAI_API_KEY set")

    prompt = PROMPT_TEMPLATE.format(text=text.replace('"', "'"))
    payload = json.dumps({
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1,
        "max_tokens": 300
    }).encode()

    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=payload,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"}
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read())

    raw = data["choices"][0]["message"]["content"]
    raw = re.sub(r'```json\s*|\s*```', '', raw).strip()
    return json.loads(raw)

def classify_with_rules(text: str) -> dict:
    """Keyword-based fallback classifier when no API key is set."""
    text_lower = text.lower()

    rules = [
        (["pothole", "road", "footpath", "pavement", "bridge", "traffic", "signal"], "Roads & Infrastructure"),
        (["water", "supply", "pipeline", "tap", "borewell", "sewage", "drainage"], "Water Supply"),
        (["electricity", "power", "light", "streetlight", "transformer", "bescom", "current"], "Electricity"),
        (["garbage", "waste", "trash", "dustbin", "sweeping", "drain", "smell", "dirty"], "Sanitation & Waste"),
        (["noise", "music", "loud", "sound", "party", "speaker", "night"], "Noise Pollution"),
        (["park", "garden", "tree", "bench", "playground", "open space"], "Parks & Recreation"),
        (["bus", "auto", "transport", "driver", "fare", "stop", "route"], "Public Transport"),
    ]

    category = "Other"
    for keywords, cat in rules:
        if any(kw in text_lower for kw in keywords):
            category = cat
            break

    urgency = "medium"
    if any(w in text_lower for w in ["urgent", "emergency", "danger", "accident", "injury", "sick", "no water", "3 days", "week"]):
        urgency = "high"
    elif any(w in text_lower for w in ["minor", "small", "little", "sometime"]):
        urgency = "low"

    dept = DEPT_MAP.get(category, "Municipal Corporation - General")
    return {
        "category": category,
        "department": dept,
        "urgency": urgency,
        "summary": f"Complaint regarding {category.lower()} issue reported by citizen.",
        "auto_reply": f"Dear Citizen, your complaint has been registered and forwarded to {dept}. You will receive an update within 3 working days."
    }

def classify_complaint(text: str) -> dict:
    """Main classification function — tries Gemini → OpenAI → rule-based fallback."""
    
    # Try Gemini first
    if os.environ.get("GEMINI_API_KEY"):
        try:
            result = classify_with_gemini(text)
            # Validate keys
            if all(k in result for k in ["category", "department", "urgency", "summary", "auto_reply"]):
                return result
        except Exception as e:
            print(f"[Gemini] Error: {e}")

    # Try OpenAI
    if os.environ.get("OPENAI_API_KEY"):
        try:
            result = classify_with_openai(text)
            if all(k in result for k in ["category", "department", "urgency", "summary", "auto_reply"]):
                return result
        except Exception as e:
            print(f"[OpenAI] Error: {e}")

    # Rule-based fallback (works without any API key)
    print("[NLP] Using rule-based fallback classifier")
    return classify_with_rules(text)
