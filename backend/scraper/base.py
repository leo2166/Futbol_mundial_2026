from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseScraper(ABC):
    """Clase base abstracta para todos los scrapers de fuentes externas."""
    
    def __init__(self, source_name: str):
        self.source_name = source_name

    @abstractmethod
    def scrape(self) -> List[Dict[str, Any]]:
        """
        Método que debe implementar cada fuente para extraer datos.
        Debe retornar una lista de diccionarios con el formato:
        {
            'home_team': str,
            'away_team': str,
            'home_score': int,
            'away_score': int,
            'status': str, # 'SCHEDULED', 'LIVE', 'FINISHED'
            'match_date': str
        }
        """
        pass
