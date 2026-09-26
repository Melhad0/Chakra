"""
Script de Migração Manual: JSON Local -> Neon (PostgreSQL Serverless)
===================================================================
Este script lê os arquivos 'users.json', 'rankings.json' e a pasta 'saves/'
e faz o upload seguro para o seu banco Neon PostgreSQL.

Uso:
  python scripts/migrate_to_neon.py
"""

import os
import sys
import json
from dotenv import load_dotenv

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

load_dotenv()

DATABASE_URL = (os.getenv("DATABASE_URL") or os.getenv("NEON_DATABASE_URL", "")).strip()

if not DATABASE_URL:
    print("❌ ERRO: A variável DATABASE_URL ou NEON_DATABASE_URL não foi definida no .env.")
    print("👉 Exemplo de Connection String do Neon:")
    print("   postgresql://neondb_owner:npg_xxxx@ep-cool-fog-123456.us-east-2.aws.neon.tech/neondb?sslmode=require")
    sys.exit(1)

try:
    import psycopg2
    from psycopg2.extras import Json
except ImportError:
    print("❌ ERRO: 'psycopg2' não encontrado. Execute: pip install psycopg2-binary")
    sys.exit(1)

print("🔗 Conectando ao Neon PostgreSQL...")
try:
    conn = psycopg2.connect(DATABASE_URL)
    with conn.cursor() as cur:
        cur.execute("SELECT version();")
        v = cur.fetchone()[0]
        print(f"✅ Conexão estabelecida com sucesso!\n   {v}")

        # Cria tabelas se não existirem
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
except Exception as e:
    print(f"❌ Falha ao conectar ao Neon: {e}")
    sys.exit(1)

# 1. Migração de Usuários
USERS_FILE = "users.json"
if os.path.exists(USERS_FILE):
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            users_data = json.load(f)
        count = 0
        with conn.cursor() as cur:
            for ukey, udata in users_data.items():
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
                count += 1
            conn.commit()
        print(f"👤 Usuários migrados: {count} contas sincronizadas na tabela 'users'.")
    except Exception as e:
        print(f"⚠️ Erro ao migrar usuários: {e}")
else:
    print("ℹ️ users.json não encontrado.")

# 2. Migração de Saves
SAVES_DIR = "saves"
if os.path.exists(SAVES_DIR):
    try:
        files = [f for f in os.listdir(SAVES_DIR) if f.endswith(".json")]
        count = 0
        with conn.cursor() as cur:
            for fname in files:
                uname = fname[:-5]
                fpath = os.path.join(SAVES_DIR, fname)
                with open(fpath, "r", encoding="utf-8") as f:
                    state_data = json.load(f)
                cur.execute("""
                    INSERT INTO saves (username_key, username, state, updated_at)
                    VALUES (%s, %s, %s, NOW())
                    ON CONFLICT (username_key) DO UPDATE SET
                        username = EXCLUDED.username,
                        state = EXCLUDED.state,
                        updated_at = NOW();
                """, (uname.lower(), uname, Json(state_data)))
                count += 1
            conn.commit()
        print(f"💾 Saves migrados: {count} arquivos de save sincronizados na tabela 'saves'.")
    except Exception as e:
        print(f"⚠️ Erro ao migrar saves: {e}")
else:
    print("ℹ️ Pasta saves/ não encontrada.")

# 3. Migração de Rankings
RANKINGS_FILE = "rankings.json"
if os.path.exists(RANKINGS_FILE):
    try:
        with open(RANKINGS_FILE, "r", encoding="utf-8") as f:
            rankings_data = json.load(f)
        count = 0
        with conn.cursor() as cur:
            for ukey, rdata in rankings_data.items():
                if isinstance(rdata, dict):
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
                        ukey.lower(),
                        rdata.get("username", ukey),
                        rdata.get("ninjaId", 0),
                        rdata.get("manualClicksSession", 0),
                        rdata.get("manualClicksAllTime", 0),
                        str(rdata.get("highestCpsRecord", "0")),
                        rdata.get("totalPrestiges", 0),
                        rdata.get("currentRank", "estudante")
                    ))
                    count += 1
            conn.commit()
        print(f"🏆 Rankings migrados: {count} registros sincronizados na tabela 'rankings'.")
    except Exception as e:
        print(f"⚠️ Erro ao migrar rankings: {e}")

conn.close()
print("\n🎉 Processo de migração concluído! Seus dados estão salvos no Neon PostgreSQL.")
