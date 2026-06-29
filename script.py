from flask import Flask, request, jsonify, send_from_directory
import json
import os
import time
import copy

app = Flask(__name__, static_folder=".")

SAVES_DIR = "saves"
USERS_FILE = "users.json"
os.makedirs(SAVES_DIR, exist_ok=True)

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
        "ancestral_voice": False
    },
    "generators": {
        "shadow_clone": 0,
        "genin": 0,
        "chunin": 0,
        "jonin": 0,
        "anbu": 0,
        "sannin": 0,
        "kage": 0,
        "jinchuriki": 0,
        "rikudou": 0
    },
    "upgrades": {
        "bandana_genin": False,
        "ninja_food_pill": False,
        "sharingan": False,
        "sage_mode": False,
        "kyuubi_cloak": False,
        "summoning_scroll": False,
        "choku_tomoe": False,
        "gravity_training": False,
        "reaper_seal": False,
        "kurama_mode": False
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
    "shadow_clone": 1.0,
    "genin": 5.0,
    "chunin": 25.0,
    "jonin": 100.0,
    "anbu": 400.0,
    "sannin": 2000.0,
    "kage": 10000.0,
    "jinchuriki": 50000.0,
    "rikudou": 300000.0
}

def load_users():
    if not os.path.exists(USERS_FILE):
        return {}
    try:
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {}

def save_users(users):
    try:
        with open(USERS_FILE, "w") as f:
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
        
    all_upgrades = ["bandana_genin", "ninja_food_pill", "sharingan", "sage_mode", "kyuubi_cloak", "summoning_scroll", "choku_tomoe", "gravity_training", "reaper_seal", "kurama_mode"]
    if all(upgrades.get(up, False) for up in all_upgrades):
        unlock("ultimate_master")
        
    return unlocked

def load_user_save(username):
    save_path = os.path.join(SAVES_DIR, f"{username}.json")
    if not os.path.exists(save_path):
        return copy.deepcopy(DEFAULT_STATE)
    try:
        with open(save_path, "r") as f:
            state = json.load(f)
            # Guarantee structure consistency
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
    save_path = os.path.join(SAVES_DIR, f"{username}.json")
    try:
        with open(save_path, "w") as f:
            json.dump(state, f, indent=4)
    except Exception:
        pass

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(".", path)

@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    
    if not username or not password:
        return jsonify({"error": "Usuário e senha necessários"}), 400
        
    users = load_users()
    if username in users:
        return jsonify({"error": "Usuário já existe"}), 400
        
    users[username] = password
    save_users(users)
    
    # Save default state
    write_user_save(username, copy.deepcopy(DEFAULT_STATE))
    return jsonify({"status": "success"})

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    
    users = load_users()
    if username not in users or users[username] != password:
        return jsonify({"error": "Usuário ou senha incorretos"}), 400
        
    return jsonify({"status": "success", "username": username})

@app.route("/api/load", methods=["GET"])
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

if __name__ == "__main__":
    app.run(debug=True, port=5000)
