from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
import bcrypt
import jwt
import uuid
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
JWT_SECRET = os.environ.get('JWT_SECRET', 'change-me')

app = FastAPI(title="Aptivafit API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("aptivafit")


# ============== MODELS ==============
class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class SessionIn(BaseModel):
    session_id: str


class OnboardingData(BaseModel):
    gender: Optional[str] = None
    goal: Optional[str] = None
    experience: Optional[str] = None
    current_frequency: Optional[str] = None
    location: Optional[str] = None
    injuries: List[str] = []
    muscle_focus: List[str] = []
    age: Optional[int] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    target_weight_kg: Optional[float] = None
    duration_pref: Optional[str] = None
    setup_mode: Optional[str] = None
    organization: Optional[str] = None
    days_per_week: Optional[int] = None
    units: Optional[str] = "kg"


class WorkoutLog(BaseModel):
    plan_day: int
    duration_seconds: int
    total_volume_kg: float
    total_reps: int
    calories: int
    exercises_completed: int
    prs: List[str] = []
    notes: Optional[str] = None


class CoachMessageIn(BaseModel):
    text: str


class QuickWorkoutIn(BaseModel):
    minutes: int = 20


# ============== HELPERS ==============
def now_utc():
    return datetime.now(timezone.utc)


def make_jwt(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "iat": int(now_utc().timestamp()),
        "exp": int((now_utc() + timedelta(days=30)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ", 1)[1].strip()

    # Try JWT (email login)
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("user_id")
        if user_id:
            user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
            if user:
                return user
    except Exception:
        pass

    # Try session_token (Google)
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if session:
        exp = session.get("expires_at")
        if isinstance(exp, datetime):
            if exp.tzinfo is None:
                exp = exp.replace(tzinfo=timezone.utc)
            if exp > now_utc():
                user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0, "password_hash": 0})
                if user:
                    return user

    raise HTTPException(status_code=401, detail="Invalid or expired token")


# ============== AUTH ==============
@api_router.post("/auth/register")
async def register(data: RegisterIn):
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    user_id = f"user_{uuid.uuid4().hex[:12]}"
    pw_hash = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    user_doc = {
        "user_id": user_id,
        "email": data.email.lower(),
        "name": data.name or data.email.split("@")[0],
        "password_hash": pw_hash,
        "picture": None,
        "provider": "email",
        "created_at": now_utc(),
    }
    await db.users.insert_one(user_doc)
    token = make_jwt(user_id)
    return {
        "token": token,
        "user": {"user_id": user_id, "email": user_doc["email"], "name": user_doc["name"], "picture": None},
    }


@api_router.post("/auth/login")
async def login(data: LoginIn):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or not user.get("password_hash"):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    if not bcrypt.checkpw(data.password.encode(), user["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    token = make_jwt(user["user_id"])
    return {
        "token": token,
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user.get("name"),
            "picture": user.get("picture"),
        },
    }


@api_router.post("/auth/session")
async def google_session(data: SessionIn):
    async with httpx.AsyncClient(timeout=15) as httpc:
        r = await httpc.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": data.session_id},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session")
    body = r.json()
    email = (body.get("email") or "").lower()
    name = body.get("name")
    picture = body.get("picture")
    session_token = body.get("session_token")
    if not email or not session_token:
        raise HTTPException(status_code=401, detail="Bad session data")

    user = await db.users.find_one({"email": email})
    if user:
        user_id = user["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name or user.get("name"), "picture": picture or user.get("picture")}},
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one(
            {
                "user_id": user_id,
                "email": email,
                "name": name,
                "picture": picture,
                "provider": "google",
                "created_at": now_utc(),
            }
        )
    await db.user_sessions.insert_one(
        {
            "session_token": session_token,
            "user_id": user_id,
            "created_at": now_utc(),
            "expires_at": now_utc() + timedelta(days=7),
        }
    )
    return {
        "session_token": session_token,
        "user": {"user_id": user_id, "email": email, "name": name, "picture": picture},
    }


@api_router.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return {"user": user}


@api_router.post("/auth/logout")
async def logout(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
        await db.user_sessions.delete_many({"session_token": token})
    return {"ok": True}


# ============== ONBOARDING & PLAN ==============
@api_router.post("/onboarding/save")
async def save_onboarding(data: OnboardingData, user=Depends(get_current_user)):
    payload = data.model_dump()
    payload["user_id"] = user["user_id"]
    payload["updated_at"] = now_utc()
    await db.onboarding.update_one(
        {"user_id": user["user_id"]},
        {"$set": payload, "$setOnInsert": {"created_at": now_utc()}},
        upsert=True,
    )
    return {"ok": True}


# Exercise library — mocked with muscle groups
EXERCISE_DB = {
    "Peito": [
        {"name": "Supino Reto com Barra", "equip": "barra", "level": "iniciante"},
        {"name": "Supino Inclinado com Halteres", "equip": "halteres", "level": "intermediario"},
        {"name": "Crucifixo na Máquina", "equip": "maquina", "level": "iniciante"},
        {"name": "Flexão de Braço", "equip": "peso_corporal", "level": "iniciante"},
        {"name": "Crossover no Cabo", "equip": "cabo", "level": "intermediario"},
    ],
    "Costas": [
        {"name": "Puxada Frontal", "equip": "cabo", "level": "iniciante"},
        {"name": "Remada Curvada", "equip": "barra", "level": "intermediario"},
        {"name": "Remada Unilateral com Halter", "equip": "halteres", "level": "iniciante"},
        {"name": "Barra Fixa", "equip": "peso_corporal", "level": "avancado"},
        {"name": "Remada Baixa no Cabo", "equip": "cabo", "level": "iniciante"},
    ],
    "Ombros": [
        {"name": "Desenvolvimento com Halteres", "equip": "halteres", "level": "iniciante"},
        {"name": "Elevação Lateral", "equip": "halteres", "level": "iniciante"},
        {"name": "Elevação Frontal", "equip": "halteres", "level": "iniciante"},
        {"name": "Desenvolvimento Militar", "equip": "barra", "level": "intermediario"},
        {"name": "Face Pull", "equip": "cabo", "level": "iniciante"},
    ],
    "Bíceps": [
        {"name": "Rosca Direta com Barra", "equip": "barra", "level": "iniciante"},
        {"name": "Rosca Alternada", "equip": "halteres", "level": "iniciante"},
        {"name": "Rosca Martelo", "equip": "halteres", "level": "iniciante"},
        {"name": "Rosca Concentrada", "equip": "halteres", "level": "intermediario"},
    ],
    "Tríceps": [
        {"name": "Tríceps Corda no Cabo", "equip": "cabo", "level": "iniciante"},
        {"name": "Tríceps Testa", "equip": "barra", "level": "intermediario"},
        {"name": "Mergulho em Paralelas", "equip": "peso_corporal", "level": "intermediario"},
        {"name": "Tríceps Francês com Halter", "equip": "halteres", "level": "iniciante"},
    ],
    "Pernas": [
        {"name": "Agachamento Livre", "equip": "barra", "level": "intermediario"},
        {"name": "Leg Press 45°", "equip": "maquina", "level": "iniciante"},
        {"name": "Cadeira Extensora", "equip": "maquina", "level": "iniciante"},
        {"name": "Mesa Flexora", "equip": "maquina", "level": "iniciante"},
        {"name": "Afundo com Halteres", "equip": "halteres", "level": "intermediario"},
        {"name": "Stiff com Barra", "equip": "barra", "level": "intermediario"},
    ],
    "Glúteos": [
        {"name": "Elevação Pélvica", "equip": "barra", "level": "iniciante"},
        {"name": "Agachamento Sumô", "equip": "halteres", "level": "iniciante"},
        {"name": "Coice na Polia", "equip": "cabo", "level": "iniciante"},
        {"name": "Ponte de Glúteo", "equip": "peso_corporal", "level": "iniciante"},
    ],
    "Abdômen": [
        {"name": "Prancha", "equip": "peso_corporal", "level": "iniciante"},
        {"name": "Abdominal Supra", "equip": "peso_corporal", "level": "iniciante"},
        {"name": "Elevação de Pernas", "equip": "peso_corporal", "level": "intermediario"},
        {"name": "Abdominal na Roda", "equip": "acessorio", "level": "avancado"},
    ],
    "Panturrilhas": [
        {"name": "Panturrilha em Pé", "equip": "maquina", "level": "iniciante"},
        {"name": "Panturrilha Sentado", "equip": "maquina", "level": "iniciante"},
        {"name": "Elevação de Panturrilha com Halter", "equip": "halteres", "level": "iniciante"},
    ],
}


def _split_days(days: int, focus: List[str]) -> List[Dict[str, Any]]:
    """Split muscle groups across days."""
    focus = [f for f in focus if f and f != "Corpo Inteiro"]
    if not focus:
        focus = ["Peito", "Costas", "Ombros", "Bíceps", "Tríceps", "Pernas", "Glúteos", "Abdômen"]

    presets = {
        1: [["Corpo Inteiro"]],
        2: [["Peito", "Ombros", "Tríceps", "Abdômen"], ["Costas", "Bíceps", "Pernas", "Glúteos"]],
        3: [["Peito", "Ombros", "Tríceps"], ["Costas", "Bíceps"], ["Pernas", "Glúteos", "Abdômen"]],
        4: [["Peito", "Tríceps"], ["Costas", "Bíceps"], ["Ombros", "Abdômen"], ["Pernas", "Glúteos"]],
        5: [["Peito"], ["Costas"], ["Ombros", "Abdômen"], ["Pernas", "Panturrilhas"], ["Bíceps", "Tríceps"]],
        6: [["Peito", "Tríceps"], ["Costas", "Bíceps"], ["Pernas"], ["Ombros", "Abdômen"], ["Glúteos"], ["Panturrilhas", "Abdômen"]],
        7: [["Peito"], ["Costas"], ["Pernas"], ["Ombros"], ["Braços"], ["Glúteos", "Abdômen"], ["Corpo Inteiro"]],
    }
    d = max(1, min(7, days or 3))
    return [{"day": i + 1, "focus": groups} for i, groups in enumerate(presets[d])]


def _pick_exercises(muscle_groups: List[str], level: str, location: str, count: int) -> List[Dict[str, Any]]:
    # Filter by location -> available equipment
    equip_by_loc = {
        "academia_grande": ["barra", "halteres", "maquina", "cabo", "peso_corporal", "acessorio"],
        "academia_pequena": ["barra", "halteres", "peso_corporal", "acessorio"],
        "casa": ["halteres", "peso_corporal", "acessorio"],
        "peso_corporal": ["peso_corporal"],
    }
    allowed = equip_by_loc.get(location or "academia_grande", equip_by_loc["academia_grande"])
    result = []
    for group in muscle_groups:
        if group == "Corpo Inteiro":
            candidates = []
            for g in ["Peito", "Costas", "Pernas", "Ombros", "Abdômen"]:
                candidates += [{**e, "group": g} for e in EXERCISE_DB.get(g, [])]
        else:
            candidates = [{**e, "group": group} for e in EXERCISE_DB.get(group, [])]
        candidates = [e for e in candidates if e["equip"] in allowed]
        if level == "iniciante":
            candidates = [e for e in candidates if e["level"] != "avancado"]
        per_group = max(1, count // max(1, len(muscle_groups)))
        result += candidates[:per_group]
    return result[:count]


def _suggest_load(exercise_name: str, weight: float, level: str) -> Dict[str, Any]:
    # very simple heuristic
    level_reps = {"iniciante": (3, 12), "intermediario": (4, 10), "avancado": (4, 8), "especialista": (5, 6)}
    sets, reps = level_reps.get(level, (3, 10))
    base = max(10, round((weight or 70) * 0.3))
    name_l = exercise_name.lower()
    if "agachamento" in name_l or "leg press" in name_l or "stiff" in name_l:
        base = max(20, round((weight or 70) * 0.6))
    if "peso_corporal" in name_l or "prancha" in name_l or "flexão" in name_l or "barra fixa" in name_l:
        base = 0
    return {"sets": sets, "reps": reps, "weight_kg": base}


@api_router.post("/plan/generate")
async def generate_plan(user=Depends(get_current_user)):
    ob = await db.onboarding.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not ob:
        raise HTTPException(status_code=400, detail="Complete o onboarding primeiro")

    days = ob.get("days_per_week") or 3
    focus = ob.get("muscle_focus") or []
    level = ob.get("experience") or "iniciante"
    location = ob.get("location") or "academia_grande"
    weight = ob.get("weight_kg") or 70
    dur = ob.get("duration_pref") or "medio"
    counts = {"rapido": 3, "curto": 5, "medio": 6, "longo": 9}
    exercise_count = counts.get(dur, 6)

    day_splits = _split_days(days, focus)

    plan_days = []
    for d in day_splits:
        exs = _pick_exercises(d["focus"], level, location, exercise_count)
        exercises = []
        for e in exs:
            load = _suggest_load(e["name"], weight, level)
            exercises.append(
                {
                    "id": f"ex_{uuid.uuid4().hex[:8]}",
                    "name": e["name"],
                    "group": e["group"],
                    "equipment": e["equip"],
                    "sets": load["sets"],
                    "reps": load["reps"],
                    "weight_kg": load["weight_kg"],
                }
            )
        plan_days.append(
            {
                "day": d["day"],
                "label": " + ".join(d["focus"][:2]).upper(),
                "focus": d["focus"],
                "duration_min": {"rapido": 20, "curto": 35, "medio": 50, "longo": 75}.get(dur, 50),
                "calories": {"rapido": 180, "curto": 320, "medio": 480, "longo": 700}.get(dur, 480),
                "exercises": exercises,
            }
        )

    # Optional: enhance description via LLM (best-effort, fast)
    coach_msg = None
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"plan_{user['user_id']}",
            system_message="Você é um personal trainer motivacional. Responda em português brasileiro, em 1-2 frases curtas. NÃO use Markdown (nada de ** ou # ou *), apenas texto puro.",
        ).with_model("anthropic", "claude-sonnet-4-6")
        um = UserMessage(
            text=f"Crie uma mensagem motivacional curta para {user.get('name','atleta')} que quer {ob.get('goal','ficar mais forte')} treinando {days}x por semana. Máximo 2 frases."
        )
        coach_msg = await chat.send_message(um)
    except Exception as ex:
        logger.warning(f"LLM coach msg failed: {ex}")
        coach_msg = "Vamos começar sua jornada! Consistência é o segredo do sucesso."

    plan_doc = {
        "plan_id": f"plan_{uuid.uuid4().hex[:10]}",
        "user_id": user["user_id"],
        "days": plan_days,
        "days_per_week": days,
        "level": level,
        "coach_message": coach_msg,
        "created_at": now_utc(),
    }
    await db.plans.update_one(
        {"user_id": user["user_id"]},
        {"$set": plan_doc},
        upsert=True,
    )
    plan_doc.pop("_id", None)
    plan_doc["created_at"] = plan_doc["created_at"].isoformat()
    return plan_doc


@api_router.get("/plan/current")
async def get_plan(user=Depends(get_current_user)):
    p = await db.plans.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Plano não encontrado")
    if isinstance(p.get("created_at"), datetime):
        p["created_at"] = p["created_at"].isoformat()
    return p


@api_router.get("/exercises")
async def list_exercises():
    result = []
    for group, items in EXERCISE_DB.items():
        for e in items:
            result.append({**e, "group": group})
    return {"exercises": result, "groups": list(EXERCISE_DB.keys())}


@api_router.post("/workouts/log")
async def log_workout(data: WorkoutLog, user=Depends(get_current_user)):
    doc = data.model_dump()
    doc["user_id"] = user["user_id"]
    doc["completed_at"] = now_utc()
    doc["workout_id"] = f"wk_{uuid.uuid4().hex[:10]}"
    await db.workouts.insert_one(doc)
    doc.pop("_id", None)
    doc["completed_at"] = doc["completed_at"].isoformat()
    return doc


@api_router.get("/workouts/history")
async def workout_history(user=Depends(get_current_user)):
    items = await db.workouts.find({"user_id": user["user_id"]}, {"_id": 0}).sort("completed_at", -1).to_list(100)
    for it in items:
        if isinstance(it.get("completed_at"), datetime):
            it["completed_at"] = it["completed_at"].isoformat()
    return {"items": items, "total": len(items)}


# ============== COACH AI CHAT (Gemini 3.1 Pro) ==============
async def _build_coach_context(user_id: str) -> str:
    """Build system prompt with user profile + plan context."""
    ob = await db.onboarding.find_one({"user_id": user_id}, {"_id": 0}) or {}
    plan = await db.plans.find_one({"user_id": user_id}, {"_id": 0}) or {}
    hist_count = await db.workouts.count_documents({"user_id": user_id})

    parts = [
        "Você é o Coach IA da Aptivafit — um personal trainer virtual amigável, motivacional e técnico.",
        "Responda SEMPRE em português brasileiro. Seja direto, positivo e evite respostas longas demais.",
        "IMPORTANTE: NÃO use Markdown. Nada de ** para negrito, # para títulos, ou * para listas. Use apenas texto puro, emojis são OK.",
        "Você conhece o perfil do usuário e o plano de treino dele. Use isso para dar respostas personalizadas.",
        "Se perguntarem sobre lesões graves, dor persistente ou nutrição médica, oriente a procurar um profissional.",
        "",
        "PERFIL DO USUÁRIO:",
    ]
    if ob:
        parts.append(f"- Objetivo: {ob.get('goal', 'não informado')}")
        parts.append(f"- Nível: {ob.get('experience', 'não informado')}")
        parts.append(f"- Local de treino: {ob.get('location', 'não informado')}")
        parts.append(f"- Dias por semana: {ob.get('days_per_week', 3)}")
        parts.append(f"- Foco muscular: {', '.join(ob.get('muscle_focus', []) or ['corpo inteiro'])}")
        parts.append(f"- Idade: {ob.get('age', '?')} · Altura: {ob.get('height_cm', '?')}cm · Peso: {ob.get('weight_kg', '?')}kg")
        if ob.get("injuries"):
            parts.append(f"- Lesões/dores: {', '.join(ob['injuries'])}")
    if plan.get("days"):
        parts.append(f"\nPLANO ATUAL ({len(plan['days'])} dias):")
        for d in plan["days"]:
            parts.append(f"- Dia {d['day']} ({d.get('label','')}): {len(d.get('exercises', []))} exercícios")
    parts.append(f"\nHISTÓRICO: {hist_count} treinos concluídos.")
    return "\n".join(parts)


@api_router.get("/coach/history")
async def coach_history(user=Depends(get_current_user)):
    items = await db.coach_messages.find(
        {"user_id": user["user_id"]}, {"_id": 0}
    ).sort("created_at", 1).to_list(200)
    for it in items:
        if isinstance(it.get("created_at"), datetime):
            it["created_at"] = it["created_at"].isoformat()
    return {"items": items}


@api_router.post("/coach/chat")
async def coach_chat(data: CoachMessageIn, user=Depends(get_current_user)):
    text = (data.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Mensagem vazia")

    user_msg = {
        "user_id": user["user_id"],
        "role": "user",
        "text": text,
        "created_at": now_utc(),
    }
    await db.coach_messages.insert_one(user_msg)

    # Load prior history for multi-turn context
    prior = await db.coach_messages.find(
        {"user_id": user["user_id"]}, {"_id": 0}
    ).sort("created_at", 1).to_list(40)

    reply_text = ""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        system_msg = await _build_coach_context(user["user_id"])
        # Include recent conversation history (last 6 exchanges) in system prompt
        if len(prior) > 1:  # more than just the current user turn
            hist_lines = ["\n\nHISTÓRICO RECENTE DA CONVERSA:"]
            for m in prior[-13:-1]:  # last 12 messages excluding current
                who = "Usuário" if m["role"] == "user" else "Coach"
                hist_lines.append(f"{who}: {m['text'][:300]}")
            system_msg = system_msg + "\n".join(hist_lines)

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"coach_{user['user_id']}_{int(now_utc().timestamp())}",
            system_message=system_msg,
        ).with_model("gemini", "gemini-3.1-pro-preview")
        reply_text = await chat.send_message(UserMessage(text=text))
    except Exception as ex:
        logger.warning(f"Coach LLM error: {ex}")
        reply_text = "Desculpe, estou com dificuldade para responder agora. Tente novamente em instantes."

    assistant_msg = {
        "user_id": user["user_id"],
        "role": "assistant",
        "text": reply_text,
        "created_at": now_utc(),
    }
    await db.coach_messages.insert_one(assistant_msg)
    return {
        "reply": reply_text,
        "created_at": assistant_msg["created_at"].isoformat(),
    }


@api_router.delete("/coach/history")
async def coach_clear(user=Depends(get_current_user)):
    r = await db.coach_messages.delete_many({"user_id": user["user_id"]})
    return {"deleted": r.deleted_count}


# ============== QUICK WORKOUT (Coach IA) ==============
def _quick_workout_from_profile(minutes: int, ob: Dict[str, Any]) -> Dict[str, Any]:
    """Fallback deterministic quick workout generator."""
    # pick muscle groups by elapsed days (simple rotation)
    focus_opts = [
        ["Peito", "Tríceps"],
        ["Costas", "Bíceps"],
        ["Pernas", "Glúteos"],
        ["Ombros", "Abdômen"],
    ]
    # Rotate by day-of-year
    idx = datetime.now(timezone.utc).timetuple().tm_yday % len(focus_opts)
    focus = focus_opts[idx]

    # Honor injuries — simple removal
    injuries = [i.lower() for i in (ob.get("injuries") or [])]
    if any("ombro" in i for i in injuries):
        focus = ["Pernas", "Glúteos"] if focus_opts[idx] != focus_opts[2] else ["Costas", "Bíceps"]
    if any("joelho" in i for i in injuries) and "Pernas" in focus:
        focus = ["Costas", "Bíceps"]

    exercise_count = max(2, min(5, minutes // 5))
    level = ob.get("experience") or "iniciante"
    location = ob.get("location") or "academia_grande"
    weight = ob.get("weight_kg") or 70

    exs = _pick_exercises(focus, level, location, exercise_count)
    exercises = []
    for e in exs:
        load = _suggest_load(e["name"], weight, level)
        # Shorter sets for time-crunched workouts
        sets = max(2, min(3, load["sets"] - 1))
        exercises.append(
            {
                "id": f"qex_{uuid.uuid4().hex[:8]}",
                "name": e["name"],
                "group": e["group"],
                "equipment": e["equip"],
                "sets": sets,
                "reps": load["reps"],
                "weight_kg": load["weight_kg"],
            }
        )
    return {
        "name": f"Treino Express · {' + '.join(focus)}",
        "duration_min": minutes,
        "focus": focus,
        "exercises": exercises,
    }


@api_router.post("/coach/quick-workout")
async def quick_workout(data: QuickWorkoutIn, user=Depends(get_current_user)):
    minutes = max(5, min(45, data.minutes))
    ob = await db.onboarding.find_one({"user_id": user["user_id"]}, {"_id": 0}) or {}

    # Build deterministic base workout from profile — reliable foundation
    workout = _quick_workout_from_profile(minutes, ob)

    # Try to let Gemini pick a short motivational tagline + rename
    coach_note = None
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        system = (
            "Você é um personal trainer motivacional. Responda em 1 frase curta em português brasileiro, "
            "sem Markdown, sem asteriscos, sem #. Deve ser um incentivo direto para um treino rápido."
        )
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"quick_{user['user_id']}_{int(now_utc().timestamp())}",
            system_message=system,
        ).with_model("gemini", "gemini-3.1-pro-preview")
        focus_str = ", ".join(workout["focus"])
        msg = UserMessage(
            text=(
                f"Vou treinar {minutes} minutos focando em {focus_str}. "
                f"Mande 1 frase curta de incentivo (máx 15 palavras)."
            )
        )
        coach_note = (await chat.send_message(msg)).strip()
    except Exception as ex:
        logger.warning(f"Quick workout LLM note failed: {ex}")
        coach_note = "Vamos nessa! Treino curto, foco total."

    workout["coach_note"] = coach_note

    # Persist as current quick workout (overwrite previous)
    doc = {
        "user_id": user["user_id"],
        **workout,
        "created_at": now_utc(),
    }
    await db.quick_workouts.update_one(
        {"user_id": user["user_id"]},
        {"$set": doc},
        upsert=True,
    )

    workout["created_at"] = doc["created_at"].isoformat()
    return workout


@api_router.get("/coach/quick-workout")
async def get_quick_workout(user=Depends(get_current_user)):
    w = await db.quick_workouts.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not w:
        raise HTTPException(status_code=404, detail="Nenhum treino rápido ativo")
    if isinstance(w.get("created_at"), datetime):
        w["created_at"] = w["created_at"].isoformat()
    return w


@api_router.get("/")
async def root():
    return {"app": "Aptivafit", "status": "ok"}


# ============== STARTUP ==============
@app.on_event("startup")
async def on_start():
    try:
        await db.users.create_index("email", unique=True)
        await db.users.create_index("user_id", unique=True)
        await db.user_sessions.create_index("session_token", unique=True)
        await db.user_sessions.create_index("expires_at", expireAfterSeconds=0)
    except Exception as ex:
        logger.warning(f"index setup: {ex}")


@app.on_event("shutdown")
async def on_stop():
    client.close()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
