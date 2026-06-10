import os
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import date

load_dotenv()
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

def fix_data_for_demo():
    print("Insertando datos de demostración para HOY y EN VIVO...")
    
    # 1. Crear Grupo y Equipos rápidamente
    group_id = supabase.table("groups").upsert({"name": "Demo Group", "stage": "Fase de Grupos"}).execute().data[0]["id"]
    t1 = supabase.table("teams").upsert({"name": "Argentina", "group_id": group_id}).execute().data[0]["id"]
    t2 = supabase.table("teams").upsert({"name": "Francia", "group_id": group_id}).execute().data[0]["id"]
    t3 = supabase.table("teams").upsert({"name": "Brasil", "group_id": group_id}).execute().data[0]["id"]
    t4 = supabase.table("teams").upsert({"name": "España", "group_id": group_id}).execute().data[0]["id"]

    today = date.today().isoformat()

    # Partido para HOY
    supabase.table("matches").insert({
        "home_team_id": t1,
        "away_team_id": t2,
        "match_date": f"{today}T18:00:00Z",
        "stadium": "Estadio Azteca",
        "home_score": 0,
        "away_score": 0,
        "status": "SCHEDULED"
    }).execute()

    # Partido EN VIVO
    supabase.table("matches").insert({
        "home_team_id": t3,
        "away_team_id": t4,
        "match_date": f"{today}T12:00:00Z",
        "stadium": "Hard Rock Stadium",
        "home_score": 2,
        "away_score": 1,
        "status": "LIVE"
    }).execute()

    print("✅ Datos de demo insertados. Ahora 'Hoy' y 'En Vivo' funcionarán.")

if __name__ == "__main__":
    fix_data_for_demo()
