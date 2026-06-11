import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import date
from typing import List, Optional

# Cargar variables de entorno
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL y SUPABASE_KEY deben estar configuradas en el archivo .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="Mundial 2026 API")

# Configuración de CORS para que el frontend (Vite) pueda hacer peticiones
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción, cambiar por la URL de Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Bienvenido a la API del Mundial 2026", "status": "online"}

@app.get("/health")
async def health_check():
    """Endpoint para verificar la salud de la API y la conexión a Supabase."""
    try:
        # Intenta una consulta simple a cualquier tabla
        res = supabase.table("groups").select("count").limit(1).execute()
        return {
            "status": "healthy", 
            "database": "connected", 
            "message": "La conexión con Supabase es correcta"
        }
    except Exception as e:
        return {
            "status": "unhealthy", 
            "database": "disconnected", 
            "error": str(e)
        }

@app.get("/matches")
async def get_matches():
    """Retorna la lista completa de partidos con nombres de equipos."""
    try:
        # Intentamos la consulta con join
        res = supabase.table("matches").select("*, home_team:home_team_id(name), away_team:away_team_id(name)").execute()
        return res.data
    except Exception as e:
        print(f"ERROR CRÍTICO en /matches: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")


@app.get("/matches/today")
async def get_matches_today():
    """Retorna los partidos programados para el día de hoy."""
    try:
        today = date.today().isoformat()
        # Filtramos desde el inicio del día hasta el final del día para evitar el error de tipo TIMESTAMPTZ
        res = supabase.table("matches").select("*, home_team:home_team_id(name), away_team:away_team_id(name)").gte("match_date", f"{today}T00:00:00Z").lte("match_date", f"{today}T23:59:59Z").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/matches/live")
async def get_matches_live():
    """Retorna los partidos que están actualmente 'EN VIVO'."""
    try:
        res = supabase.table("matches").select("*, home_team:home_team_id(name), away_team:away_team_id(name)").eq("status", "LIVE").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/matches/finished")
async def get_matches_finished():
    """Retorna los partidos que ya han finalizado."""
    try:
        res = supabase.table("matches").select("*, home_team:home_team_id(name), away_team:away_team_id(name)").eq("status", "FINISHED").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/matches/{match_id}")
async def get_match_detail(match_id: str):
    """Retorna el detalle de un partido específico."""
    try:
        res = supabase.table("matches").select("*, home_team:home_team_id(name), away_team:away_team_id(name)").eq("id", match_id).single().execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Partido no encontrado")
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/team/{name}")
async def get_matches_by_team(name: str):
    """Retorna todos los partidos de una selección específica."""
    try:
        # Primero buscamos el ID del equipo por nombre
        team_res = supabase.table("teams").select("id").ilike("name", f"%{name}%").single().execute()
        if not team_res.data:
            raise HTTPException(status_code=404, detail="Equipo no encontrado")
        
        team_id = team_res.data["id"]
        
        # Buscamos partidos donde el equipo sea local o visitante
        res = supabase.table("matches").select("*, home_team:home_team_id(name), away_team:away_team_id(name)").or_(f"home_team_id.eq.{team_id},away_team_id.eq.{team_id}").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/date/{date_str}")
async def get_matches_by_date(date_str: str):
    """
    Retorna los partidos de una fecha específica.
    Formato esperado: yyyy-mm-dd
    """
    try:
        # Filtramos desde el inicio del día hasta el final del día para evitar el error de tipo TIMESTAMPTZ
        res = supabase.table("matches").select("*, home_team:home_team_id(name), away_team:away_team_id(name)").gte("match_date", f"{date_str}T00:00:00Z").lte("match_date", f"{date_str}T23:59:59Z").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

