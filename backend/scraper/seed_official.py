import os
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

def reset_and_seed():
    print("🧹 Limpiando base de datos de datos falsos...")
    # Borramos en orden inverso por las llaves foráneas
    supabase.table("goals").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    supabase.table("matches").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    supabase.table("teams").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    supabase.table("groups").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()

    print("🏗️ Construyendo estructura oficial 2026...")

    # 1. Crear Grupos (A al L - 12 grupos para 48 equipos)
    groups = []
    for letter in "ABCDEFGHIJKL":
        groups.append({"name": f"Grupo {letter}", "stage": "Fase de Grupos"})
    
    group_res = supabase.table("groups").insert(groups).execute()
    group_data = group_res.data

    # 2. Insertar Partidos Reales de Apertura
    # Partido Inaugural: México vs Canadá
    mex_id = supabase.table("teams").insert({"name": "México", "group_id": group_data[0]["id"]}).execute().data[0]["id"]
    can_id = supabase.table("teams").insert({"name": "Canadá", "group_id": group_data[0]["id"]}).execute().data[0]["id"]
    
    supabase.table("matches").insert({
        "home_team_id": mex_id,
        "away_team_id": can_id,
        "match_date": "2026-06-11T16:00:00Z",
        "stadium": "Estadio Azteca",
        "status": "SCHEDULED"
    }).execute()

    # 3. Crear Slots para Eliminatorias (Ejemplo Octavos)
    # Creamos equipos virtuales para los placeholders
    print("📅 Creando slots de eliminatorias...")
    elim_stage_id = supabase.table("groups").insert({"name": "Eliminatorias", "stage": "Knockout"}).execute().data[0]["id"]
    
    slots = []
    for g in "ABCDEFGHIJKL":
        slots.append({"name": f"1° Grupo {g}", "group_id": elim_stage_id})
        slots.append({"name": f"2° Grupo {g}", "group_id": elim_stage_id})
    
    slots_res = supabase.table("teams").insert(slots).execute()
    all_slots = slots_res.data

    # Creamos los partidos de eliminación con fechas estimadas
    # Ejemplo: 1° Grupo A vs 2° Grupo B
    for i in range(0, len(all_slots), 2):
        if i + 1 < len(all_slots):
            supabase.table("matches").insert({
                "home_team_id": all_slots[i]["id"],
                "away_team_id": all_slots[i+1]["id"],
                "match_date": "2026-06-28T14:00:00Z", # Fecha estimada
                "stadium": "TBD",
                "status": "SCHEDULED"
            }).execute()


    print("✅ Base de datos sincronizada con estructura oficial y slots de eliminatorias.")

if __name__ == "__main__":
    reset_and_seed()
