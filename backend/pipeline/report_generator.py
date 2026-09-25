import json
from typing import Dict, Any, List

class ReportGenerator:
    """
    Generates a structured report that matches the specifications in masterWork.md.
    """
    @staticmethod
    def generate_report(audit_result: Dict[str, Any], jurisdiction: str) -> Dict[str, Any]:
        """
        Formats the final compliance report from a unified audit result.
        """
        findings = audit_result.get("findings", [])
        
        # Calculate from findings (One source of truth)
        high = len([f for f in findings if f.get("final_risk", f.get("reviewer", {}).get("risk_level")) == "HIGH"])
        medium = len([f for f in findings if f.get("final_risk", f.get("reviewer", {}).get("risk_level")) == "MEDIUM"])
        low = len([f for f in findings if f.get("final_risk", f.get("reviewer", {}).get("risk_level")) == "LOW"])
        clear = len([f for f in findings if f.get("final_risk", f.get("reviewer", {}).get("risk_level")) == "CLEAR"])
        
        report = {
            "title": "CONTRACT AUDIT",
            "document": audit_result.get("filename"),
            "document_id": audit_result.get("document_id"),
            "document_hash": audit_result.get("document_hash"),
            "audit_id": audit_result.get("audit_id"),
            "jurisdiction": jurisdiction,
            "summary": {
                "risk": audit_result.get("scoring", {}).get("overall_risk", "UNKNOWN"),
                "confidence": f"{audit_result.get('scoring', {}).get('confidence_score', 0)}%",
                "total_findings": len(findings)
            },
            "finding_counts": {
                "high": high,
                "medium": medium,
                "low": low,
                "clear": clear,
            },
            "findings_detail": []
        }
        
        for finding in findings:
            reviewer = finding.get("reviewer", {})
            skeptic = finding.get("skeptic", {})
            supervisor = finding.get("supervisor", {})
            
            detail = {
                "clause_id": finding.get("clause_id"),
                "page_number": finding.get("page_number", 1),
                "exact_text": finding.get("exact_text", finding.get("clause_text")),
                "finding_type": supervisor.get("final_finding_type", reviewer.get("finding_type", "UNKNOWN")),
                "risk_level": finding.get("final_risk", finding.get("risk_level", "CLEAR")),
                "reviewer_assessment": reviewer.get("issue", "No issue detected"),
                "reasoning_summary": reviewer.get("reasoning_summary", ""),
                "exact_contract_quote": reviewer.get("exact_contract_quote", ""),
                "legal_proposition": reviewer.get("legal_proposition", ""),
                "exact_law_quote": reviewer.get("exact_law_quote", ""),
                "skeptic_challenge": skeptic.get("challenge", "Agreed with reviewer"),
                "supervisor_reason": supervisor.get("reason", "N/A"),
                "human_escalation": finding.get("human_escalation", False),
                "agents_involved": {
                    "reviewer": True,
                    "skeptic": True,
                    "supervisor": finding.get("resolution_path") == "WITH_DEBATE"
                }
            }
            report["findings_detail"].append(detail)
            
        return report

    @staticmethod
    def format_as_markdown(report: Dict[str, Any]) -> str:
        """
        Formats the JSON report as a markdown string.
        """
        md = f"# {report['title']}\n"
        md += f"**Document:** {report['document']}  \n"
        md += f"**Jurisdiction:** {report['jurisdiction']}  \n\n"
        
        md += "## Summary\n"
        md += f"- **Risk:** {report['summary']['risk']}\n"
        md += f"- **Confidence:** {report['summary']['confidence']}\n"
        md += f"- **Total Findings:** {report['summary']['total_findings']:02d}\n"
        md += f"  - {report['finding_counts']['high']:02d} High\n"
        md += f"  - {report['finding_counts']['medium']:02d} Medium\n"
        md += f"  - {report['finding_counts']['low']:02d} Low\n\n"
        
        md += "## Findings\n\n"
        for idx, f in enumerate(report["findings_detail"]):
            md += f"### Finding {idx+1}: {f['clause_id']} (Page {f['page_number']})\n"
            md += f"- **Finding Type:** {f['finding_type']}\n"
            md += f"- **Risk Level:** {f['risk_level']}\n\n"
            md += f"**Exact Clause:**\n> {f['exact_text']}\n\n"
            md += f"**Exact Contract Quote (Reviewer):**\n> {f.get('exact_contract_quote', 'N/A')}\n\n"
            md += f"**Applicable Legal Provision:**\n> {f.get('legal_proposition', 'N/A')}\n\n"
            md += f"**Exact Law Quote (Evidence):**\n> {f.get('exact_law_quote', 'N/A')}\n\n"
            md += f"- **Reviewer Assessment:** {f['reviewer_assessment']}\n"
            md += f"- **Reasoning:** {f.get('reasoning_summary', 'N/A')}\n"
            md += f"- **Skeptic Challenge:** {f['skeptic_challenge']}\n"
            md += f"- **Supervisor Decision:** {f.get('supervisor_reason', 'N/A')}\n"
            md += "- **Agents Involved:** Reviewer (✓), Skeptic (✓), Supervisor ("
            md += "✓" if f['agents_involved']['supervisor'] else "○"
            md += ")\n"
            md += f"- **Human Escalation Status:** {'Required' if f['human_escalation'] else 'Not required'}\n\n"
            md += "---\n\n"
            
        return md
