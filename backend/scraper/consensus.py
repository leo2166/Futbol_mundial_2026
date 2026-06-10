from typing import List, Dict, Any
from collections import Counter

class ConsensusEngine:
    """Motor que compara resultados de múltiples fuentes y determina la verdad."""
    
    def __init__(self, normalization_map: Dict[str, str] = None):
        # Mapeo para normalizar nombres: {"France": "Francia", "USA": "Estados Unidos"}
        self.normalization_map = normalization_map or {}

    def normalize_team(self, name: str) -> str:
        return self.normalization_map.get(name, name)

    def verify_match(self, match_id: str, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analiza los resultados de todas las fuentes para un partido específico.
        Retorna el resultado más común si hay consenso, de lo contrario retorna None.
        """
        if not results:
            return None

        # Creamos una firma única del resultado: "HomeScore-AwayScore-Status"
        votes = []
        for res in results:
            # Normalizamos nombres para comparar correctamente
            h = self.normalize_team(res['home_team'])
            a = self.normalize_team(res['away_team'])
            # Firma del resultado
            vote = (res['home_score'], res['away_score'], res['status'])
            votes.append(vote)

        # Contamos cuál es la firma más repetida
        counts = Counter(votes)
        winner, count = counts.most_common(1)[0]

        # Consenso: Si más del 50% de las fuentes coinciden
        if count > len(results) / 2:
            return {
                "home_score": winner[0],
                "away_score": winner[1],
                "status": winner[2],
                "confidence": f"{int((count/len(results))*100)}%"
            }
        
        print(f"⚠️ No hay consenso para el partido {match_id}. Votos: {counts}")
        return None
