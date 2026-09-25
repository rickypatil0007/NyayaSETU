import json
from typing import Dict, Any, List

class BaselineScoreCalculator:
    """
    Calculates the baseline score (confidence and risk) for a RAG-based legal audit.
    """
    @staticmethod
    def calculate_score(findings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculates an overall risk profile and a baseline confidence score.
        Confidence is based on the relevance of the retrieved evidence and the consensus
        between the Reviewer and Skeptic agents.
        """
        if not findings:
            return {
                "overall_risk": "CLEAR",
                "confidence_score": 100,
                "risk_counts": {"HIGH": 0, "MEDIUM": 0, "LOW": 0, "CLEAR": 0}
            }

        risk_counts = {"HIGH": 0, "MEDIUM": 0, "LOW": 0, "CLEAR": 0}
        total_confidence = 0.0
        
        for finding in findings:
            # Aggregate risk
            risk = finding.get("final_risk", finding.get("risk_level", "CLEAR"))
            if risk in risk_counts:
                risk_counts[risk] += 1
            
            # Aggregate confidence
            # Evidence relevance base
            evidence_count = finding.get("evidence_retrieved", 0)
            base_confidence = min(80 + (evidence_count * 5), 95) # cap at 95 from evidence alone
            
            # Agent consensus modifier
            resolution_path = finding.get("resolution_path", "AGREEMENT")
            if resolution_path == "AGREEMENT":
                base_confidence += 5 # Bonus for agreement
            elif resolution_path == "WITH_DEBATE":
                base_confidence -= 10 # Penalty for disagreement needing supervisor
                
            total_confidence += min(base_confidence, 99)
            
        avg_confidence = round(total_confidence / len(findings))
        
        # Determine overall risk
        overall_risk = "CLEAR"
        if risk_counts["HIGH"] > 0:
            overall_risk = "HIGH"
        elif risk_counts["MEDIUM"] > 0:
            overall_risk = "MEDIUM"
        elif risk_counts["LOW"] > 0:
            overall_risk = "LOW"
            
        return {
            "overall_risk": overall_risk,
            "confidence_score": avg_confidence,
            "risk_counts": risk_counts
        }
