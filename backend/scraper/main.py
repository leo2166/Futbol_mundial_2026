import os
from supabase import create_client, Client
from dotenv import load_dotenv
from .base import BaseScraper
from .sources.adaptors import FifaScraper, EspnScraper, GoogleScraper
from .consensus import ConsensusEngine

load_dotenv()
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# Mapeo de nombres para normalización (Consenso)
TEAM_MAP = {
    "France": "Francia",
    "Brazil": "Brasil",
    "Spain": "España",
    "USA": "Estados Unidos",
}

def run_consensus_update():
    print("🚀 Iniciando Ciclo de Consenso de Datos...")
    
    # 1. Instanciar todos los adaptadores
    scrapers: List[BaseScraper] = [
        FifaScraper(),
        EspnScraper(),
        GoogleScraper()
    ]
    
    # 2. Recolectar datos de todas las fuentes
    all_source_data = {} # { "Argentina vs Francia": [res_fifa, res_espn, res_google] }
    
    for s in scrapers:
        data = s.scrape()
        for match in data:
            # Crear una llave única para el partido basada en equipos
            key = f"{match['home_team']} vs {match['away_team']}".lower()
            if key not in all_source_data:
                all_source_data[key] = []
            all_source_data[key].append(match)

    # 3. Procesar Consenso
    engine = ConsensusEngine(normalization_map=TEAM_MAP)
    
    for match_key, results in all_source_data.items():
        print(f"Analizando consenso para: {match_key}...")
        verified_data = engine.verify_match(match_key, results)
        
        if verified_data:
            print(f"✅ Consenso alcanzado ({verified_data['confidence']}). Actualizando base de datos...")
            
            # Obtener el primer resultado para extraer IDs de equipos
            first = results[0]
            
            # Buscar IDs en Supabase (Simplificado para el demo)
            # En producción, usaríamos una función get_or_create_team
            home_res = supabase.table("teams").select("id").eq("name", engine.normalize_team(first['home_team'])).execute()
            away_res = supabase.table("teams").select("id").eq("name", engine.normalize_team(first['away_team'])).execute()
            
            if home_res.data and away_res.data:
                h_id = home_res.data[0]["id"]
                a_id = away_res.data[0]["id"]
                
                # Actualizar o Insertar en la tabla matches
                match_check = supabase.table("matches").select("id").eq("home_team_id", h_id).eq("away_team_id", a_id).execute()
                
                if match_check.data:
                    supabase.table("matches").update({
                        "home_score": verified_data["home_score"],
                        "away_score": verified_data["away_score"],
                        "status": verified_data["status"]
                    }).eq("id", match_check.data[0]["id"]).execute()
                else:
                    supabase.table("matches").insert({
                        "home_team_id": h_id,
                        "away_team_id": a_id,
                        "home_score": verified_data["home_score"],
                        "away_score": verified_data["away_score"],
                        "status": verified_data["status"],
                        "match_date": first['match_date']
                    }).execute()
        else:
            print(f"❌ Datos descartados por falta de consenso para {match_key}")

    print("
✨ Ciclo de Consenso completado.")

if __name__ == "__main__":
    run_consensus_update()
