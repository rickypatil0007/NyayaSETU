export type Citation = {
  source: string;       // e.g. "Companies Act 2013, s.134"
  excerpt: string;      // short quoted/paraphrased basis (keep grounded, not invented)
  sectionId?: string;
};

export type Finding = {
  id: string;
  claim: string;             // the compliance concern the reviewer is raising
  citations: Citation[];
  raisedBy: 'reviewer';
};

export type Challenge = {
  findingId: string;
  argument: string;          // skeptic's counter-argument / loophole
  citations: Citation[];
};

export type DebateTurn = {
  round: number;
  finding: Finding;
  challenge?: Challenge;
};

export type VerdictStatus = 'upheld' | 'dismissed' | 'escalated';

export type SupervisorVerdict = {
  findingId: string;
  status: VerdictStatus;
  reasoning: string;
};

export type AuditState = {
  auditId: string;
  documentText: string;
  findings: Finding[];
  debate: DebateTurn[];
  verdicts: SupervisorVerdict[];
  status: 'running' | 'complete' | 'error';
};
