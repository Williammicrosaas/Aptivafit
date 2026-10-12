"""Aptivafit backend end-to-end tests.

Covers: auth (register/login/me/protected), onboarding save,
plan generate (including LLM coach message), plan current,
exercises library, workouts log/history.
"""
import os
import uuid
import pytest
import requests
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback to frontend env (public preview URL)
    fe_env = Path(__file__).resolve().parents[2] / "frontend" / ".env"
    if fe_env.exists():
        for line in fe_env.read_text().splitlines():
            if line.startswith("EXPO_PUBLIC_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")

assert BASE_URL, "EXPO_PUBLIC_BACKEND_URL not configured"

DEMO_EMAIL = "demo@aptivafit.app"
DEMO_PASSWORD = "Aptivafit@2026"


# -------- Fixtures --------
@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def demo_token(api):
    """Register demo user if needed, then login."""
    r = api.post(f"{BASE_URL}/api/auth/register", json={
        "email": DEMO_EMAIL, "password": DEMO_PASSWORD, "name": "Demo Usuário"
    }, timeout=20)
    # Either 200 (fresh) or 400 (already exists)
    if r.status_code == 200:
        return r.json()["token"]
    lr = api.post(f"{BASE_URL}/api/auth/login", json={
        "email": DEMO_EMAIL, "password": DEMO_PASSWORD
    }, timeout=20)
    assert lr.status_code == 200, f"Demo login failed: {lr.status_code} {lr.text}"
    return lr.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(demo_token):
    return {"Authorization": f"Bearer {demo_token}", "Content-Type": "application/json"}


# -------- Health --------
class TestHealth:
    def test_root(self, api):
        r = api.get(f"{BASE_URL}/api/", timeout=15)
        assert r.status_code == 200
        assert r.json().get("status") == "ok"


# -------- Auth --------
class TestAuth:
    def test_register_new_user_returns_token(self, api):
        email = f"test_{uuid.uuid4().hex[:8]}@aptivafit.app"
        r = api.post(f"{BASE_URL}/api/auth/register",
                     json={"email": email, "password": "TestPass@2026", "name": "Test"}, timeout=20)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "token" in body and body["user"]["email"] == email
        assert body["user"]["user_id"].startswith("user_")

    def test_register_duplicate_returns_400(self, api, demo_token):
        _ = demo_token  # ensures demo exists
        r = api.post(f"{BASE_URL}/api/auth/register",
                     json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD}, timeout=20)
        assert r.status_code == 400

    def test_login_success(self, api, demo_token):
        _ = demo_token
        r = api.post(f"{BASE_URL}/api/auth/login",
                     json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD}, timeout=20)
        assert r.status_code == 200
        assert "token" in r.json()

    def test_login_wrong_password_returns_401(self, api):
        r = api.post(f"{BASE_URL}/api/auth/login",
                     json={"email": DEMO_EMAIL, "password": "wrong-pass"}, timeout=20)
        assert r.status_code == 401

    def test_me_without_token_returns_401(self, api):
        r = api.get(f"{BASE_URL}/api/auth/me", timeout=15)
        assert r.status_code == 401

    def test_me_with_bad_token_returns_401(self, api):
        r = api.get(f"{BASE_URL}/api/auth/me",
                    headers={"Authorization": "Bearer garbage.token.here"}, timeout=15)
        assert r.status_code == 401

    def test_me_with_valid_token_returns_user(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/auth/me", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        u = r.json()["user"]
        assert u["email"] == DEMO_EMAIL
        assert "password_hash" not in u
        assert "_id" not in u


# -------- Plan requires onboarding --------
class TestPlanRequiresOnboarding:
    def test_generate_without_onboarding_returns_400(self, api):
        """Fresh user with no onboarding data should get 400 from /plan/generate."""
        email = f"noob_{uuid.uuid4().hex[:8]}@aptivafit.app"
        rr = api.post(f"{BASE_URL}/api/auth/register",
                      json={"email": email, "password": "P@ssw0rd12345"}, timeout=20)
        assert rr.status_code == 200
        token = rr.json()["token"]
        r = api.post(f"{BASE_URL}/api/plan/generate",
                     headers={"Authorization": f"Bearer {token}"}, timeout=30)
        assert r.status_code == 400, r.text
        assert "onboarding" in r.json().get("detail", "").lower()


# -------- Onboarding + Plan --------
class TestOnboardingAndPlan:
    def test_save_onboarding_ok(self, api, auth_headers):
        payload = {
            "gender": "masculino",
            "goal": "ganhar_massa",
            "experience": "intermediario",
            "current_frequency": "3x",
            "location": "academia_grande",
            "injuries": [],
            "muscle_focus": ["Peito", "Costas", "Pernas"],
            "age": 28,
            "height_cm": 178,
            "weight_kg": 78,
            "target_weight_kg": 82,
            "duration_pref": "medio",
            "setup_mode": "auto",
            "organization": "abc",
            "days_per_week": 4,
            "units": "kg",
        }
        r = api.post(f"{BASE_URL}/api/onboarding/save", json=payload, headers=auth_headers, timeout=20)
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_generate_plan_has_days_and_exercises(self, api, auth_headers):
        r = api.post(f"{BASE_URL}/api/plan/generate", headers=auth_headers, timeout=60)
        assert r.status_code == 200, r.text
        p = r.json()
        assert p["days_per_week"] == 4
        assert isinstance(p["days"], list) and len(p["days"]) == 4
        for d in p["days"]:
            assert "focus" in d and isinstance(d["exercises"], list) and len(d["exercises"]) > 0
            ex = d["exercises"][0]
            for k in ("name", "sets", "reps", "weight_kg", "group"):
                assert k in ex, f"missing key {k}"
        # LLM coach message must be present (fallback string OR LLM output)
        assert p.get("coach_message"), "coach_message missing"
        assert isinstance(p["coach_message"], str) and len(p["coach_message"]) > 5
        assert "_id" not in p

    def test_generate_plan_no_auth_returns_401(self, api):
        r = api.post(f"{BASE_URL}/api/plan/generate", timeout=15)
        assert r.status_code == 401

    def test_get_plan_current_after_generate(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/plan/current", headers=auth_headers, timeout=20)
        assert r.status_code == 200
        p = r.json()
        assert p.get("days") and len(p["days"]) >= 1
        assert p.get("coach_message")


# -------- Exercise library --------
class TestExercises:
    def test_list_exercises_public(self, api):
        r = api.get(f"{BASE_URL}/api/exercises", timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert "exercises" in body and len(body["exercises"]) > 20
        assert "groups" in body and "Peito" in body["groups"]


# -------- Workouts --------
class TestWorkouts:
    def test_log_and_history(self, api, auth_headers):
        payload = {
            "plan_day": 1,
            "duration_seconds": 1800,
            "total_volume_kg": 3200.5,
            "total_reps": 84,
            "calories": 320,
            "exercises_completed": 5,
            "prs": ["Supino Reto com Barra"],
            "notes": "TEST_workout"
        }
        r = api.post(f"{BASE_URL}/api/workouts/log", json=payload, headers=auth_headers, timeout=20)
        assert r.status_code == 200
        w = r.json()
        assert w["workout_id"].startswith("wk_")
        assert w["total_volume_kg"] == 3200.5
        assert "_id" not in w

        # verify persistence via history
        h = api.get(f"{BASE_URL}/api/workouts/history", headers=auth_headers, timeout=20)
        assert h.status_code == 200
        items = h.json()["items"]
        assert any(it.get("workout_id") == w["workout_id"] for it in items)

    def test_workouts_history_no_auth_returns_401(self, api):
        r = api.get(f"{BASE_URL}/api/workouts/history", timeout=15)
        assert r.status_code == 401


# -------- Coach IA (Gemini 3.1 Pro via Emergent LLM Key) --------
class TestCoachAI:
    def test_coach_chat_no_auth_returns_401(self, api):
        r = api.post(f"{BASE_URL}/api/coach/chat", json={"text": "oi"}, timeout=15)
        assert r.status_code == 401

    def test_coach_history_no_auth_returns_401(self, api):
        r = api.get(f"{BASE_URL}/api/coach/history", timeout=15)
        assert r.status_code == 401

    def test_coach_clear_before_tests(self, api, auth_headers):
        # Clean slate so persistence assertions below are deterministic
        r = api.delete(f"{BASE_URL}/api/coach/history", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert "deleted" in r.json()

    def test_coach_chat_returns_portuguese_reply(self, api, auth_headers):
        r = api.post(
            f"{BASE_URL}/api/coach/chat",
            json={"text": "Como melhoro meu supino?"},
            headers=auth_headers,
            timeout=90,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert "reply" in body and isinstance(body["reply"], str)
        reply = body["reply"].strip()
        assert len(reply) > 10, f"reply too short: {reply!r}"
        # Portuguese heuristic: contain at least one typical PT token
        pt_tokens = ["supino", "você", "é", "é ", "ó", "ã", "ç", "para", "exerc", "treino", "ombro", "carga", "séri", "peito"]
        lower = reply.lower()
        assert any(tok in lower for tok in pt_tokens), f"reply not in Portuguese: {reply!r}"

    def test_coach_history_persisted(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/coach/history", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        items = r.json()["items"]
        roles = [m["role"] for m in items]
        assert "user" in roles and "assistant" in roles, f"roles={roles}"
        assert all("_id" not in m for m in items)

    def test_coach_clear_history_resets(self, api, auth_headers):
        r = api.delete(f"{BASE_URL}/api/coach/history", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["deleted"] >= 1
        g = api.get(f"{BASE_URL}/api/coach/history", headers=auth_headers, timeout=15)
        assert g.status_code == 200
        assert g.json()["items"] == []

    def test_coach_chat_empty_text_returns_400(self, api, auth_headers):
        r = api.post(f"{BASE_URL}/api/coach/chat", json={"text": "   "}, headers=auth_headers, timeout=15)
        assert r.status_code == 400

