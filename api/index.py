from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import json
import os
import time
import copy
import re
import secrets
from datetime import datetime, timezone, date
from werkzeug.security import generate_password_hash, check_password_hash

import psycopg2
from psycopg2.extras import RealDictCursor, Json

load_dotenv()

app = Flask(__name__, static_folder=".")

# Suporte a CORS para conexões externas (ex: Vercel)
FRONTEND_URL = os.getenv("FRONTEND_URL", "*")
CORS(app, origins=FRONTEND_URL if FRONTEND_URL != "*" else "*")

SAVES_DIR = "saves"
USERS_FILE = "users.json"
os.makedirs(SAVES_DIR, exist_ok=True)

# -------------------------------------------------------------
# Conexão Neon.tech (PostgreSQL Serverless com suporte a JSONB)
# Se DATABASE_URL estiver configurada, conecta na nuvem.
# Se não estiver, usa arquivos JSON locais como fallback transparente.
# -------------------------------------------------------------
DATABASE_URL = (os.getenv("DATABASE_URL") or os.getenv("NEON_DATABASE_URL", "")).strip()

def get_db():
    if not DATABASE_URL:
        return None
    try:
        return psycopg2.connect(DATABASE_URL)
    except Exception as e:
        # Se channel_binding não for suportado pela libpq do ambiente, tenta sem ele
        if "channel_binding" in DATABASE_URL:
            try:
                clean_url = DATABASE_URL.replace("&channel_binding=require", "").replace("?channel_binding=require&", "?").replace("?channel_binding=require", "")
                return psycopg2.connect(clean_url)
            except Exception:
                pass
        print(f"[Neon Postgres] Falha na conexão com o banco: {e}")
        return None

DEFAULT_STATE = {
    "chakra": 0.0,
    "total_chakra_earned": 0.0,
    "clicks": 0,
    "last_saved_time": 0.0,
    "prestige_points": 0,
    "total_prestige_points": 0,
    "prestige_upgrades": {
        "clan_heritage": False,
        "forbidden_scroll": False,
        "tailed_chakra_beast": False,
        "ancestral_voice": False,
        "shadow_clone_mastery": False,
        "jonin_elite": False,
        "kage_council": False,
        "chakra_absorption": False,
        "will_of_fire": False,
        "bijuu_resonance": False,
        "anbu_shadow": False,
        "jinchuriki_bond": False,
        "rikudou_blessing": False,
        "ninja_alliance": False,
        "fourth_hokage": False,
        "hashirama_cells": False,
        "mangekyou_sharingan": False,
        "sage_contract": False,
        "eight_gates_mastery": False,
        "akatsuki_intel": False,
        "tenseigan": False,
        "byakugan": False,
        "reanimation_army": False,
        "heaven_star": False
    },
    "generators": {
        "academy_student": 0,
        "shadow_clone": 0,
        "genin": 0,
        "chunin": 0,
        "jonin": 0,
        "anbu": 0,
        "sannin": 0,
        "kage": 0,
        "jinchuriki": 0,
        "rikudou": 0,
        "toad_summon": 0,
        "slug_summon": 0,
        "snake_summon": 0,
        "sound_five": 0,
        "seven_swordsmen": 0,
        "akatsuki_member": 0,
        "taka_member": 0,
        "edo_tensei_warrior": 0,
        "hyuga_elite": 0,
        "uchiha_elite": 0,
        "senju_elite": 0,
        "otsutsuki_spirit": 0,
        "bijuu_manifestation": 0,
        "six_paths_clone": 0,
        "shinobi_alliance_division": 0,
        "kaguya_creation": 0,
        "hamura_guardian": 0,
        "indras_reincarnation": 0,
        "asuras_reincarnation": 0,
        "otsutsuki_god": 0
    },
    "upgrades": {
        "bandana_genin": False,
        "sealing_scroll": False,
        "tactical_kunai": False,
        "tree_climbing": False,
        "ninja_sandals": False,
        "chakra_concentration": False,
        "shadow_clone_scroll": False,
        "ninja_food_pill": False,
        "sharingan": False,
        "sage_mode": False,
        "kyuubi_cloak": False,
        "summoning_scroll": False,
        "choku_tomoe": False,
        "gravity_training": False,
        "reaper_seal": False,
        "kurama_mode": False,
        "blade_storm": False,
        "rasengan_mastery": False,
        "perfect_susanoo": False,
        "edo_tensei": False,
        "truth_seeking_orbs": False,
        "six_paths_sage": False,
        "infinite_tsukuyomi": False,
        "otsutsuki_power": False,
        "divine_tree": False,
        "creation_all_things": False
    },
    "achievements": {
        "first_click": False,
        "reach_100": False,
        "ten_clones": False,
        "have_kakashi": False,
        "reach_1m": False,
        "sage_master": False,
        "infinite_chakra": False,
        "clicks_1000": False,
        "first_summon": False,
        "ultimate_master": False,
        "tailed_chakra": False,
        "hero_of_konoha": False
    },
    "missions": {
        "protect_village": {"status": "idle", "end_time": 0.0},
        "infiltrate_akatsuki": {"status": "idle", "end_time": 0.0},
        "kyuubi_battle": {"status": "idle", "end_time": 0.0},
        "camp_zabuza": {"status": "idle", "end_time": 0.0, "completed": False},
        "camp_forest_death": {"status": "idle", "end_time": 0.0, "completed": False},
        "camp_orochimaru": {"status": "idle", "end_time": 0.0, "completed": False},
        "camp_final_valley": {"status": "idle", "end_time": 0.0, "completed": False}
    },
    "swords": {
        "kubikiribocho": False,
        "samehada": False,
        "kusanagi": False,
        "totsuka": False,
        "hiramekarei": False,
        "kiba": False
    },
    "equipped_sword": "",
    "bijuu": {
        "chosen": "",
        "level": 1,
        "completed_goals": []
    },
    "swords_levels": {
        "kubikiribocho": 1,
        "samehada": 1,
        "kusanagi": 1,
        "totsuka": 1,
        "hiramekarei": 1,
        "kiba": 1
    },
    "gates_unlocked": 0
}

CPS_MAP = {
    "academy_student": 0.5,
    "shadow_clone": 0.5,
    "genin": 2.0,
    "chunin": 10.0,
    "jonin": 50.0,
    "anbu": 200.0,
    "sannin": 1000.0,
    "kage": 5000.0,
    "jinchuriki": 25000.0,
    "rikudou": 150000.0,
    "toad_summon": 500000.0,
    "slug_summon": 1500000.0,
    "snake_summon": 4000000.0,
    "sound_five": 12000000.0,
    "seven_swordsmen": 35000000.0,
    "akatsuki_member": 100000000.0,
    "taka_member": 300000000.0,
    "edo_tensei_warrior": 1000000000.0,
    "hyuga_elite": 3500000000.0,
    "uchiha_elite": 12000000000.0,
    "senju_elite": 40000000000.0,
    "otsutsuki_spirit": 150000000000.0,
    "bijuu_manifestation": 600000000000.0,
    "six_paths_clone": 2500000000000.0,
    "shinobi_alliance_division": 10000000000000.0,
    "kaguya_creation": 50000000000000.0,
    "hamura_guardian": 250000000000000.0,
    "indras_reincarnation": 1200000000000000.0,
    "asuras_reincarnation": 6000000000000000.0,
    "otsutsuki_god": 30000000000000000.0
}

def load_users():
    if DATABASE_URL:
        conn = get_db()
        if conn:
            try:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT * FROM users")
                    rows = cur.fetchall()
                    users = {}
                    for r in rows:
                        ukey = r["username_key"]
                        user_obj = {
                            "ninjaId": r.get("ninja_id") or 0,
                            "fullName": r.get("full_name") or "",
                            "username": r.get("username") or ukey,
                            "email": r.get("email") or "",
                            "birthDate": r.get("birth_date") or "",
                            "passwordHash": r.get("password_hash") or "",
                            "createdAt": r.get("created_at").isoformat() if r.get("created_at") else "",
                        }
                        if r.get("auth_value"):
                            user_obj["auth_value"] = r["auth_value"]
                        extra_data = r.get("data") or {}
                        if isinstance(extra_data, dict):
                            for ek, ev in extra_data.items():
                                if ek not in user_obj:
                                    user_obj[ek] = ev
                        users[ukey] = user_obj
                    return users
            except Exception as e:
                print(f"[Neon Postgres] Erro em load_users: {e}")
            finally:
                conn.close()

    if not os.path.exists(USERS_FILE):
        return {}
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def save_users(users):
    if DATABASE_URL:
        conn = get_db()
        if conn:
            try:
                with conn.cursor() as cur:
                    for ukey, udata in users.items():
                        ukey_lower = ukey.lower()
                        if isinstance(udata, dict):
                            cur.execute("""
                                INSERT INTO users (username_key, username, full_name, email, birth_date, password_hash, ninja_id, data)
                                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                                ON CONFLICT (username_key) DO UPDATE SET
                                    username = EXCLUDED.username,
                                    full_name = EXCLUDED.full_name,
                                    email = EXCLUDED.email,
                                    birth_date = EXCLUDED.birth_date,
                                    password_hash = EXCLUDED.password_hash,
                                    ninja_id = EXCLUDED.ninja_id,
                                    data = EXCLUDED.data;
                            """, (
                                ukey_lower,
                                udata.get("username", ukey),
                                udata.get("fullName", ""),
                                udata.get("email", ""),
                                udata.get("birthDate", ""),
                                udata.get("passwordHash", ""),
                                udata.get("ninjaId", 0),
                                Json(udata)
                            ))
                        else:
                            cur.execute("""
                                INSERT INTO users (username_key, username, auth_value)
                                VALUES (%s, %s, %s)
                                ON CONFLICT (username_key) DO UPDATE SET
                                    username = EXCLUDED.username,
                                    auth_value = EXCLUDED.auth_value;
                            """, (ukey_lower, ukey, str(udata)))
                    conn.commit()
            except Exception as e:
                print(f"[Neon Postgres] Erro em save_users: {e}")
            finally:
                conn.close()

    try:
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(users, f, indent=4)
    except Exception:
        pass

def calculate_cps(state):
    generators = state.get("generators", {})
    upgrades = state.get("upgrades", {})
    p_upgrades = state.get("prestige_upgrades", {})
    
    total_cps = 0.0
    for gen, count in generators.items():
        base_cps = CPS_MAP.get(gen, 0.0)
        multiplier = 1.0
        
        if gen == "shadow_clone" and upgrades.get("ninja_food_pill"):
            multiplier *= 2.0
        elif gen == "genin" and upgrades.get("gravity_training"):
            multiplier *= 2.0
        elif gen == "chunin" and upgrades.get("gravity_training"):
            multiplier *= 2.0
        elif gen == "jonin":
            if upgrades.get("sharingan"):
                multiplier *= 2.0
            if upgrades.get("choku_tomoe"):
                multiplier *= 2.0
        elif gen == "anbu":
            if upgrades.get("sharingan"):
                multiplier *= 2.0
            if upgrades.get("choku_tomoe"):
                multiplier *= 2.0
        elif gen == "sannin" and upgrades.get("summoning_scroll"):
            multiplier *= 2.0
        elif gen == "kage" and upgrades.get("summoning_scroll"):
            multiplier *= 2.0
        elif gen == "jinchuriki" and upgrades.get("summoning_scroll"):
            multiplier *= 2.0
        elif gen == "rikudou" and upgrades.get("summoning_scroll"):
            multiplier *= 2.0
            
        total_cps += count * base_cps * multiplier
        
    if upgrades.get("sage_mode"):
        total_cps *= 3.0
    if upgrades.get("kurama_mode"):
        total_cps *= 4.0
        
    # Prestige bonus
    if p_upgrades.get("forbidden_scroll"):
        total_cps *= 1.25
        
    # Swords bonus
    equipped_sword = state.get("equipped_sword", "")
    swords_levels = state.get("swords_levels", {})
    sword_level = swords_levels.get(equipped_sword, 1) if equipped_sword else 1
    sword_mult = 1.0 + (sword_level - 1) * 0.25
    
    if equipped_sword == "samehada":
        total_cps *= (1.0 + 0.10 * sword_mult)
    elif equipped_sword == "totsuka":
        total_cps *= (1.0 + 0.20 * sword_mult)
        
    # Bijuu multiplier
    bijuu_level = state.get("bijuu", {}).get("level", 1)
    if state.get("bijuu", {}).get("chosen"):
        multipliers = [1.0, 1.0, 1.5, 2.5, 5.0, 10.0]
        mult_index = min(bijuu_level, len(multipliers) - 1)
        total_cps *= multipliers[mult_index]

    return total_cps

def calculate_click_power(state, cps):
    upgrades = state.get("upgrades", {})
    p_upgrades = state.get("prestige_upgrades", {})
    
    click_power = 1.0
    if upgrades.get("bandana_genin"):
        click_power *= 1.5  # nerfed from 2.0
    if upgrades.get("kyuubi_cloak"):
        click_power += 0.005 * cps  # nerfed from 0.01
    if upgrades.get("reaper_seal"):
        click_power += 0.02 * cps  # nerfed from 0.05
        
    # Prestige click upgrades
    if p_upgrades.get("clan_heritage"):
        click_power *= 1.25  # nerfed from 1.5
    if p_upgrades.get("tailed_chakra_beast"):
        click_power += 0.01 * cps  # nerfed from 0.02
        
    # Swords click upgrades
    equipped_sword = state.get("equipped_sword", "")
    swords_levels = state.get("swords_levels", {})
    sword_level = swords_levels.get(equipped_sword, 1) if equipped_sword else 1
    sword_mult = 1.0 + (sword_level - 1) * 0.25
    
    if equipped_sword == "kubikiribocho":
        click_power += (0.01 * cps * sword_mult)
    elif equipped_sword == "kusanagi":
        click_power *= (1.0 + 0.5 * sword_mult)
        
    # Bijuu multiplier
    bijuu_level = state.get("bijuu", {}).get("level", 1)
    if state.get("bijuu", {}).get("chosen"):
        multipliers = [1.0, 1.0, 1.5, 2.5, 5.0, 10.0]
        mult_index = min(bijuu_level, len(multipliers) - 1)
        click_power *= multipliers[mult_index]

    return click_power

def check_achievements(state):
    achievements = state.setdefault("achievements", {})
    total_earned = state.get("total_chakra_earned", 0.0)
    clicks = state.get("clicks", 0)
    generators = state.get("generators", {})
    upgrades = state.get("upgrades", {})
    
    unlocked = []
    
    def unlock(key):
        if not achievements.get(key, False):
            achievements[key] = True
            unlocked.append(key)
            
    if clicks >= 1:
        unlock("first_click")
    if total_earned >= 100:
        unlock("reach_100")
    if generators.get("shadow_clone", 0) >= 10:
        unlock("ten_clones")
    if generators.get("jonin", 0) >= 1:
        unlock("have_kakashi")
    if total_earned >= 1000000:
        unlock("reach_1m")
    if upgrades.get("sage_mode"):
        unlock("sage_master")
    if total_earned >= 10000000:
        unlock("infinite_chakra")
        
    if clicks >= 1000:
        unlock("clicks_1000")
    if generators.get("sannin", 0) >= 1:
        unlock("first_summon")
    if total_earned >= 100000000:
        unlock("tailed_chakra")
    if total_earned >= 1000000000:
        unlock("hero_of_konoha")
        
    all_upgrades = ["bandana_genin", "ninja_food_pill", "sharingan", "sage_mode", "kyuubi_cloak", "summoning_scroll", "choku_tomoe", "gravity_training", "reaper_seal", "kurama_mode", "blade_storm", "rasengan_mastery", "perfect_susanoo", "edo_tensei", "truth_seeking_orbs", "six_paths_sage", "infinite_tsukuyomi", "otsutsuki_power", "divine_tree", "creation_all_things"]
    if all(upgrades.get(up, False) for up in all_upgrades):
        unlock("ultimate_master")
        
    return unlocked

FULL_NAME_REGEX = re.compile(r'^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)+$')
USERNAME_REGEX = re.compile(r'^[a-zA-Z0-9_]{3,20}$')
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
SPECIAL_CHAR_REGEX = re.compile(r'[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]')

def sanitize_username(username: str) -> str:
    """Evita ataques de Path Traversal sanitizando o identificador de arquivo."""
    cleaned = re.sub(r'[^a-zA-Z0-9_-]', '', str(username).strip())
    if not cleaned or ".." in cleaned:
        return "shinobi_player"
    return cleaned

def generate_unique_ninja_id(existing_ids: set) -> int:
    """Gera um inteiro criptograficamente seguro entre 1.000.000 e 99.999.999 (até 8 dígitos)."""
    max_attempts = 100
    for _ in range(max_attempts):
        candidate_id = secrets.randbelow(99999999 - 1000000 + 1) + 1000000
        if candidate_id not in existing_ids:
            return candidate_id
    raise RuntimeError("Limite de alocação de IDs atingido ou colisão excessiva.")

def get_user_save_path(username: str) -> str:
    safe_name = sanitize_username(username)
    base_dir = os.path.abspath(SAVES_DIR)
    target_path = os.path.abspath(os.path.join(base_dir, f"{safe_name}.json"))
    if not target_path.startswith(base_dir):
        raise ValueError("Tentativa de Path Traversal detectada.")
    return target_path

def load_user_save(username):
    safe_name = sanitize_username(username).lower()
    if DATABASE_URL:
        conn = get_db()
        if conn:
            try:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT state FROM saves WHERE username_key = %s", (safe_name,))
                    row = cur.fetchone()
                    if row and row.get("state"):
                        state = row["state"]
                        for key, val in DEFAULT_STATE.items():
                            if key not in state:
                                state[key] = copy.deepcopy(val)
                            elif isinstance(val, dict):
                                for subkey, subval in val.items():
                                    if subkey not in state[key]:
                                        state[key][subkey] = copy.deepcopy(subval)
                        return state
            except Exception as e:
                print(f"[Neon Postgres] Erro em load_user_save: {e}")
            finally:
                conn.close()

    try:
        save_path = get_user_save_path(username)
        if not os.path.exists(save_path):
            return copy.deepcopy(DEFAULT_STATE)
        with open(save_path, "r", encoding="utf-8") as f:
            state = json.load(f)
            for key, val in DEFAULT_STATE.items():
                if key not in state:
                    state[key] = copy.deepcopy(val)
                elif isinstance(val, dict):
                    for subkey, subval in val.items():
                        if subkey not in state[key]:
                            state[key][subkey] = copy.deepcopy(subval)
            return state
    except Exception:
        return copy.deepcopy(DEFAULT_STATE)

def write_user_save(username, state):
    safe_name = sanitize_username(username).lower()
    if DATABASE_URL:
        conn = get_db()
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute("""
                        INSERT INTO saves (username_key, username, state, updated_at)
                        VALUES (%s, %s, %s, NOW())
                        ON CONFLICT (username_key) DO UPDATE SET
                            username = EXCLUDED.username,
                            state = EXCLUDED.state,
                            updated_at = NOW();
                    """, (safe_name, username, Json(state)))
                    conn.commit()
            except Exception as e:
                print(f"[Neon Postgres] Erro em write_user_save: {e}")
            finally:
                conn.close()

    try:
        save_path = get_user_save_path(username)
        with open(save_path, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=4)
    except Exception:
        pass

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(".", path)

@app.route("/api/auth/check-username", methods=["GET"])
@app.route("/auth/check-username", methods=["GET"])
def check_username():
    raw_user = request.args.get("u") or request.args.get("username", "")
    username = raw_user.strip()
    if not username:
        return jsonify({"available": False, "message": "Nome de usuário ausente."}), 400
    if not USERNAME_REGEX.match(username):
        return jsonify({"available": False, "message": "O usuário deve ter de 3 a 20 caracteres (apenas letras, números e _)."}), 200

    users = load_users()
    uname_lower = username.lower()
    for ukey, udata in users.items():
        existing_u = (udata.get("username", ukey) if isinstance(udata, dict) else ukey).lower()
        if existing_u == uname_lower:
            return jsonify({"available": False, "message": "Este nome de usuário já está em uso."}), 200

    return jsonify({"available": True, "message": "Nome de usuário disponível para alistamento!"}), 200

@app.route("/api/auth/register", methods=["POST"])
@app.route("/auth/register", methods=["POST"])
def auth_register():
    data = request.json or {}
    full_name = data.get("fullName", "").strip()
    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    birth_date = data.get("birthDate", "").strip()
    password = data.get("password", "")
    confirm_password = data.get("confirmPassword", "")

    # Validações estritas de negócio
    if not full_name or len(full_name) < 3 or len(full_name) > 70 or not FULL_NAME_REGEX.match(full_name):
        return jsonify({
            "success": False,
            "message": "Nome completo inválido. Informe ao menos prenome e sobrenome (3 a 70 caracteres, apenas letras)."
        }), 400

    if not username or not USERNAME_REGEX.match(username):
        return jsonify({
            "success": False,
            "message": "Nome de usuário inválido. Deve ter entre 3 e 20 caracteres (apenas letras, números e _)."
        }), 400

    if not email or not EMAIL_REGEX.match(email):
        return jsonify({
            "success": False,
            "message": "E-mail inválido segundo o padrão RFC 5322."
        }), 400

    # Consistência temporal da data de nascimento
    try:
        bdate = datetime.strptime(birth_date, "%Y-%m-%d").date()
        today = date.today()
        if bdate > today:
            return jsonify({"success": False, "message": "A data de nascimento não pode estar no futuro."}), 400
        age = today.year - bdate.year - ((today.month, today.day) < (bdate.month, bdate.day))
        if age < 6:
            return jsonify({"success": False, "message": "A idade mínima para alistamento na Academia Ninja é de 6 anos."}), 400
        if age > 120:
            return jsonify({"success": False, "message": "Data de nascimento fora do limite plausível (máximo 120 anos)."}), 400
    except ValueError:
        return jsonify({"success": False, "message": "Formato de data inválido. Utilize YYYY-MM-DD."}), 400

    # Política de senha segura
    if len(password) < 8 or len(password) > 64:
        return jsonify({"success": False, "message": "A senha deve conter entre 8 e 64 caracteres."}), 400
    if not re.search(r'[A-Z]', password):
        return jsonify({"success": False, "message": "A senha deve conter ao menos uma letra maiúscula."}), 400
    if not re.search(r'[a-z]', password):
        return jsonify({"success": False, "message": "A senha deve conter ao menos uma letra minúscula."}), 400
    if not re.search(r'[0-9]', password):
        return jsonify({"success": False, "message": "A senha deve conter ao menos um número."}), 400
    if not SPECIAL_CHAR_REGEX.search(password):
        return jsonify({"success": False, "message": "A senha deve conter ao menos um caractere especial (!@#$%^&* etc.)."}), 400
    if password != confirm_password:
        return jsonify({"success": False, "message": "A confirmação de senha não coincide com a senha informada."}), 400

    users = load_users()
    uname_lower = username.lower()

    # Garantia de unicidade (case-insensitive)
    for ukey, udata in users.items():
        existing_u = (udata.get("username", ukey) if isinstance(udata, dict) else ukey).lower()
        existing_e = (udata.get("email", "") if isinstance(udata, dict) else "").lower()
        if existing_u == uname_lower:
            return jsonify({"success": False, "message": "Nome de usuário shinobi já está em uso."}), 409
        if existing_e and existing_e == email:
            return jsonify({"success": False, "message": "Este e-mail já está associado a outro registro shinobi."}), 409

    # Geração de ID numérico pseudoaleatório com prevenção de colisão
    existing_ids = {
        udata.get("ninjaId") for udata in users.values() if isinstance(udata, dict) and "ninjaId" in udata
    }
    ninja_id = generate_unique_ninja_id(existing_ids)

    # Hashing seguro com PBKDF2:SHA256
    password_hash = generate_password_hash(password, method='pbkdf2:sha256')
    created_iso = datetime.now(timezone.utc).isoformat()

    user_record = {
        "ninjaId": ninja_id,
        "fullName": full_name,
        "username": username,
        "email": email,
        "birthDate": birth_date,
        "passwordHash": password_hash,
        "createdAt": created_iso
    }

    users[uname_lower] = user_record
    save_users(users)

    # Cria o arquivo de progresso isolado do jogador
    write_user_save(username, copy.deepcopy(DEFAULT_STATE))

    token = f"shinobi_{ninja_id}_{secrets.token_hex(16)}"

    return jsonify({
        "success": True,
        "message": "Alistamento shinobi concluído com sucesso!",
        "user": {
            "ninjaId": ninja_id,
            "fullName": full_name,
            "username": username,
            "email": email,
            "birthDate": birth_date,
            "createdAt": created_iso
        },
        "token": token
    }), 201

@app.route("/api/auth/login", methods=["POST"])
@app.route("/auth/login", methods=["POST"])
def auth_login():
    data = request.json or {}
    login_identifier = data.get("loginIdentifier", "").strip()
    password = data.get("password", "")

    if not login_identifier or not password:
        return jsonify({"success": False, "message": "Identificador de acesso e senha são obrigatórios."}), 400

    users = load_users()
    ident_lower = login_identifier.lower()
    matched_user = None

    for ukey, udata in users.items():
        if isinstance(udata, dict):
            u_name = udata.get("username", ukey).lower()
            u_email = udata.get("email", "").lower()
            if u_name == ident_lower or u_email == ident_lower or ukey.lower() == ident_lower:
                matched_user = udata
                break
        else:
            # Compatibilidade e migração de registros legados
            if ukey.lower() == ident_lower:
                if udata == password:
                    existing_ids = {
                        ud.get("ninjaId") for ud in users.values() if isinstance(ud, dict) and "ninjaId" in ud
                    }
                    ninja_id = generate_unique_ninja_id(existing_ids)
                    created_iso = datetime.now(timezone.utc).isoformat()
                    migrated = {
                        "ninjaId": ninja_id,
                        "fullName": ukey,
                        "username": ukey,
                        "email": f"{ukey}@chakra.local",
                        "birthDate": "2000-01-01",
                        "passwordHash": generate_password_hash(password, method='pbkdf2:sha256'),
                        "createdAt": created_iso
                    }
                    users[ukey.lower()] = migrated
                    save_users(users)
                    matched_user = migrated
                break

    if not matched_user:
        return jsonify({"success": False, "message": "Credenciais shinobi inválidas (usuário ou senha incorretos)."}), 401

    pwd_hash = matched_user.get("passwordHash")
    if not pwd_hash or not check_password_hash(pwd_hash, password):
        return jsonify({"success": False, "message": "Credenciais shinobi inválidas (usuário ou senha incorretos)."}), 401

    ninja_id = matched_user.get("ninjaId", 1000000)
    token = f"shinobi_{ninja_id}_{secrets.token_hex(16)}"

    return jsonify({
        "success": True,
        "message": f"Bem-vindo de volta ao Cockpit, {matched_user.get('fullName', matched_user.get('username'))}!",
        "user": {
            "ninjaId": ninja_id,
            "fullName": matched_user.get("fullName", matched_user.get("username")),
            "username": matched_user.get("username"),
            "email": matched_user.get("email", ""),
            "birthDate": matched_user.get("birthDate", ""),
            "createdAt": matched_user.get("createdAt", "")
        },
        "token": token
    }), 200

# Rotas legadas mantidas para retrocompatibilidade
@app.route("/api/register", methods=["POST"])
def register():
    data = request.json or {}
    if "fullName" in data and "confirmPassword" in data:
        return auth_register()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    if not username or not password:
        return jsonify({"error": "Usuário e senha necessários"}), 400
    users = load_users()
    if username.lower() in [u.lower() for u in users.keys()]:
        return jsonify({"error": "Usuário já existe"}), 400
    existing_ids = {ud.get("ninjaId") for ud in users.values() if isinstance(ud, dict) and "ninjaId" in ud}
    ninja_id = generate_unique_ninja_id(existing_ids)
    created_iso = datetime.now(timezone.utc).isoformat()
    users[username.lower()] = {
        "ninjaId": ninja_id,
        "fullName": username,
        "username": username,
        "email": f"{username}@chakra.local",
        "birthDate": "2000-01-01",
        "passwordHash": generate_password_hash(password, method='pbkdf2:sha256'),
        "createdAt": created_iso
    }
    save_users(users)
    write_user_save(username, copy.deepcopy(DEFAULT_STATE))
    return jsonify({"status": "success", "username": username, "ninjaId": ninja_id})

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json or {}
    if "loginIdentifier" in data:
        return auth_login()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    users = load_users()
    ident_lower = username.lower()
    matched = None
    for k, v in users.items():
        if k.lower() == ident_lower:
            matched = v
            break
    if not matched:
        return jsonify({"error": "Usuário ou senha incorretos"}), 400
    if isinstance(matched, dict):
        if not check_password_hash(matched.get("passwordHash", ""), password):
            return jsonify({"error": "Usuário ou senha incorretos"}), 400
    else:
        if matched != password:
            return jsonify({"error": "Usuário ou senha incorretos"}), 400
    return jsonify({"status": "success", "username": username})

@app.route("/api/google-login", methods=["POST"])
def google_login():
    data = request.json
    username = data.get("username", "").strip()
    if not username:
        return jsonify({"error": "Nome de usuário do Google inválido"}), 400
    
    # Sanitize
    username = "".join([c for c in username if c.isalnum() or c in "._-"])
    if not username:
        username = "GoogleNinja"
        
    users = load_users()
    if username not in users:
        users[username] = "google_oauth_bypass"
        save_users(users)
        write_user_save(username, copy.deepcopy(DEFAULT_STATE))
        
    return jsonify({"status": "success", "username": username})

def decode_jwt_payload(token):
    try:
        parts = token.split('.')
        if len(parts) < 2:
            return None
        payload_b64 = parts[1]
        payload_b64 += '=' * (-len(payload_b64) % 4)
        import base64
        payload_json = base64.b64decode(payload_b64).decode('utf-8')
        import json
        return json.loads(payload_json)
    except Exception:
        return None

@app.route("/api/google-real-login", methods=["POST"])
def google_real_login():
    data = request.json
    token = data.get("token", "").strip()
    if not token:
        return jsonify({"error": "Token ausente"}), 400
        
    payload = decode_jwt_payload(token)
    if not payload:
        return jsonify({"error": "Token Google inválido"}), 400
        
    email = payload.get("email")
    name = payload.get("name")
    
    if not email:
        return jsonify({"error": "Email não retornado pelo Google"}), 400
        
    username = name if name else email.split("@")[0]
    username = "".join([c for c in username if c.isalnum() or c in "._-"])
    if not username:
        username = "GoogleNinja"
        
    users = load_users()
    if username not in users:
        users[username] = "google_oauth_bypass"
        save_users(users)
        write_user_save(username, copy.deepcopy(DEFAULT_STATE))
        
    return jsonify({"status": "success", "username": username})

@app.route("/api/load", methods=["GET"])
@app.route("/load", methods=["GET"])
def load_game():
    username = request.args.get("username", "").strip()
    if not username:
        return jsonify({"error": "User parameter required"}), 400
        
    state = load_user_save(username)
    current_time = time.time()
    last_saved = state.get("last_saved_time", 0.0)
    
    offline_chakra = 0.0
    offline_seconds = 0.0
    
    if last_saved > 0:
        offline_seconds = max(0.0, current_time - last_saved)
        cps = calculate_cps(state)
        offline_chakra = cps * offline_seconds
        state["chakra"] += offline_chakra
        state["total_chakra_earned"] += offline_chakra
        
    state["last_saved_time"] = current_time
    check_achievements(state)
    write_user_save(username, state)
    
    return jsonify({
        "state": state,
        "offline_seconds": offline_seconds,
        "offline_chakra": offline_chakra,
        "cps": calculate_cps(state),
        "click_power": calculate_click_power(state, calculate_cps(state))
    })

@app.route("/api/save", methods=["POST"])
@app.route("/save", methods=["POST"])
def save_game():
    data = request.json
    username = data.get("username", "").strip()
    client_state = data.get("state")
    
    if not username or not client_state:
        return jsonify({"error": "Invalid payload"}), 400
        
    current_time = time.time()
    client_state["last_saved_time"] = current_time
    
    cps = calculate_cps(client_state)
    click_power = calculate_click_power(client_state, cps)
    new_achievements = check_achievements(client_state)
    
    write_user_save(username, client_state)
    
    return jsonify({
        "status": "success",
        "state": client_state,
        "new_achievements": new_achievements,
        "cps": cps,
        "click_power": click_power
    })

@app.route("/api/rankings/sync", methods=["POST"])
@app.route("/rankings/sync", methods=["POST"])
def sync_ranking():
    data = request.json or {}
    username = data.get("username", "").strip()
    if not username:
        return jsonify({"error": "Nome de usuário necessário"}), 400

    users = load_users()
    matched_key = None
    for k in users.keys():
        if k.lower() == username.lower():
            matched_key = k
            break

    ranking_entry = {
        "ninjaId": data.get("ninjaId", 0),
        "username": username,
        "manualClicksSession": int(data.get("manualClicksSession", 0)),
        "manualClicksAllTime": int(data.get("manualClicksAllTime", 0)),
        "highestCpsRecord": str(data.get("highestCpsRecord", "0")),
        "totalPrestiges": int(data.get("totalPrestiges", 0)),
        "currentRank": data.get("currentRank", "estudante"),
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }

    if DATABASE_URL:
        conn = get_db()
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute("""
                        INSERT INTO rankings (username_key, username, ninja_id, manual_clicks_session, manual_clicks_all_time, highest_cps_record, total_prestiges, current_rank, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                        ON CONFLICT (username_key) DO UPDATE SET
                            username = EXCLUDED.username,
                            ninja_id = EXCLUDED.ninja_id,
                            manual_clicks_session = EXCLUDED.manual_clicks_session,
                            manual_clicks_all_time = EXCLUDED.manual_clicks_all_time,
                            highest_cps_record = EXCLUDED.highest_cps_record,
                            total_prestiges = EXCLUDED.total_prestiges,
                            current_rank = EXCLUDED.current_rank,
                            updated_at = NOW();
                    """, (
                        username.lower(),
                        username,
                        ranking_entry["ninjaId"],
                        ranking_entry["manualClicksSession"],
                        ranking_entry["manualClicksAllTime"],
                        ranking_entry["highestCpsRecord"],
                        ranking_entry["totalPrestiges"],
                        ranking_entry["currentRank"]
                    ))
                    conn.commit()
            except Exception as e:
                print(f"[Neon Postgres] Erro ao salvar ranking: {e}")
            finally:
                conn.close()

    if matched_key and isinstance(users[matched_key], dict):
        users[matched_key]["ranking"] = ranking_entry
        save_users(users)
    else:
        rankings_file = "rankings.json"
        rankings_data = {}
        if os.path.exists(rankings_file):
            try:
                with open(rankings_file, "r", encoding="utf-8") as rf:
                    rankings_data = json.load(rf)
            except Exception:
                rankings_data = {}
        rankings_data[username.lower()] = ranking_entry
        try:
            with open(rankings_file, "w", encoding="utf-8") as rf:
                json.dump(rankings_data, rf, indent=2)
        except Exception:
            pass

    return jsonify({"status": "success", "ranking": ranking_entry})

@app.route("/api/rankings/top", methods=["GET"])
@app.route("/rankings/top", methods=["GET"])
def get_top_rankings():
    if DATABASE_URL:
        conn = get_db()
        if conn:
            try:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT 
                            ninja_id AS "ninjaId",
                            username,
                            manual_clicks_session AS "manualClicksSession",
                            manual_clicks_all_time AS "manualClicksAllTime",
                            highest_cps_record AS "highestCpsRecord",
                            total_prestiges AS "totalPrestiges",
                            current_rank AS "currentRank",
                            updated_at AS "updatedAt"
                        FROM rankings
                        ORDER BY manual_clicks_all_time DESC
                        LIMIT 50;
                    """)
                    rows = cur.fetchall()
                    if rows:
                        for r in rows:
                            if r.get("updatedAt"):
                                r["updatedAt"] = r["updatedAt"].isoformat()
                        return jsonify({"status": "success", "rankings": rows})
            except Exception as e:
                print(f"[Neon Postgres] Erro em get_top_rankings: {e}")
            finally:
                conn.close()

    users = load_users()
    rankings_list = []

    for k, v in users.items():
        if isinstance(v, dict) and "ranking" in v:
            rankings_list.append(v["ranking"])

    rankings_file = "rankings.json"
    if os.path.exists(rankings_file):
        try:
            with open(rankings_file, "r", encoding="utf-8") as rf:
                extra_rankings = json.load(rf)
                existing_names = {r["username"].lower() for r in rankings_list}
                for u_key, r_val in extra_rankings.items():
                    if u_key not in existing_names:
                        rankings_list.append(r_val)
        except Exception:
            pass

    rankings_list.sort(key=lambda x: x.get("manualClicksAllTime", 0), reverse=True)
    return jsonify({"status": "success", "rankings": rankings_list[:50]})

@app.route("/api/health", methods=["GET"])
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Chakra Clicker API",
        "storage": "neon_postgres" if DATABASE_URL else "local_json",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

def auto_migrate_to_neon(conn):
    """Migra dados locais para o Neon PostgreSQL se o banco estiver vazio."""
    try:
        with conn.cursor() as cur:
            # 1. Usuários
            cur.execute("SELECT COUNT(*) FROM users;")
            user_count = cur.fetchone()[0]
            if user_count == 0 and os.path.exists(USERS_FILE):
                with open(USERS_FILE, "r", encoding="utf-8") as f:
                    local_users = json.load(f)
                if local_users:
                    print(f"[Neon Migration] Migrando {len(local_users)} contas locais para o Neon Postgres...")
                    for ukey, udata in local_users.items():
                        ukey_lower = ukey.lower()
                        if isinstance(udata, dict):
                            cur.execute("""
                                INSERT INTO users (username_key, username, full_name, email, birth_date, password_hash, ninja_id, data)
                                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                                ON CONFLICT (username_key) DO NOTHING;
                            """, (
                                ukey_lower,
                                udata.get("username", ukey),
                                udata.get("fullName", ""),
                                udata.get("email", ""),
                                udata.get("birthDate", ""),
                                udata.get("passwordHash", ""),
                                udata.get("ninjaId", 0),
                                Json(udata)
                            ))
                        else:
                            cur.execute("""
                                INSERT INTO users (username_key, username, auth_value)
                                VALUES (%s, %s, %s)
                                ON CONFLICT (username_key) DO NOTHING;
                            """, (ukey_lower, ukey, str(udata)))
                    conn.commit()
                    print("[Neon Migration] Contas migradas com sucesso!")

            # 2. Saves
            cur.execute("SELECT COUNT(*) FROM saves;")
            save_count = cur.fetchone()[0]
            if save_count == 0 and os.path.exists(SAVES_DIR):
                files = [f for f in os.listdir(SAVES_DIR) if f.endswith(".json")]
                if files:
                    print(f"[Neon Migration] Migrando {len(files)} saves locais para o Neon Postgres...")
                    for fname in files:
                        uname = fname[:-5]
                        fpath = os.path.join(SAVES_DIR, fname)
                        with open(fpath, "r", encoding="utf-8") as f:
                            save_state = json.load(f)
                        cur.execute("""
                            INSERT INTO saves (username_key, username, state)
                            VALUES (%s, %s, %s)
                            ON CONFLICT (username_key) DO NOTHING;
                        """, (uname.lower(), uname, Json(save_state)))
                    conn.commit()
                    print("[Neon Migration] Saves migrados com sucesso!")
    except Exception as e:
        print(f"[Neon Migration] Erro na migração automática: {e}")

def init_neon_tables():
    """Inicializa as tabelas no Neon Postgres se não existirem."""
    if not DATABASE_URL:
        return
    conn = get_db()
    if not conn:
        print("[Neon Postgres] Aviso: DATABASE_URL presente mas conexão indisponível. Usando fallback local.")
        return
    try:
        with conn.cursor() as cur:
            cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                username_key VARCHAR(100) PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                full_name VARCHAR(150),
                email VARCHAR(200),
                birth_date VARCHAR(20),
                password_hash TEXT,
                ninja_id BIGINT,
                auth_value TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                data JSONB DEFAULT '{}'::jsonb
            );

            CREATE TABLE IF NOT EXISTS saves (
                username_key VARCHAR(100) PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                state JSONB NOT NULL,
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS rankings (
                username_key VARCHAR(100) PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                ninja_id BIGINT DEFAULT 0,
                manual_clicks_session BIGINT DEFAULT 0,
                manual_clicks_all_time BIGINT DEFAULT 0,
                highest_cps_record TEXT DEFAULT '0',
                total_prestiges INT DEFAULT 0,
                current_rank VARCHAR(50) DEFAULT 'estudante',
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            """)
            conn.commit()
            print("[Neon Postgres] Tabelas verificadas/inicializadas com sucesso!")

        auto_migrate_to_neon(conn)
    except Exception as e:
        print(f"[Neon Postgres] Falha ao criar tabelas: {e}")
    finally:
        conn.close()

# Executa verificação inicial de tabelas no Neon
init_neon_tables()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
