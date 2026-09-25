import { Database, ExternalLink, BookOpen, Scale, Shield, FileText, Building2, Users, Landmark } from 'lucide-react'

const legalSources = [
  {
    title: 'Indian Contract Act, 1872',
    category: 'Contract Law',
    authority: 'Ministry of Law & Justice',
    description: 'Formation, consideration, void agreements, breach remedies — foundational for all contract audits.',
    url: 'https://lddashboard.legislative.gov.in/actsofparliamentfromtheyear/indian-contract-act-1872',
    icon: Scale,
  },
  {
    title: 'Digital Personal Data Protection Act, 2023',
    category: 'Privacy / Data Protection',
    authority: 'MeitY',
    description: 'Data fiduciary obligations, consent mechanisms, cross-border data transfer rules.',
    url: 'https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf',
    icon: Shield,
  },
  {
    title: 'Information Technology Act, 2000',
    category: 'Cybersecurity / E-commerce',
    authority: 'MeitY',
    description: 'Electronic contracts, intermediary guidelines, cybersecurity obligations, Section 79 safe harbour.',
    url: 'https://www.meity.gov.in/static/uploads/2024/03/ITbill_2000.pdf',
    icon: Database,
  },
  {
    title: 'Companies Act, 2013',
    category: 'Corporate Governance',
    authority: 'Ministry of Corporate Affairs',
    description: 'Corporate governance, related-party transactions, director responsibilities.',
    url: 'https://www.mca.gov.in/content/mca/global/en/acts-rules/companies-act.html',
    icon: Building2,
  },
  {
    title: 'Consumer Protection Act, 2019',
    category: 'Consumer Rights',
    authority: 'Dept. of Consumer Affairs',
    description: 'Unfair trade practices, e-commerce consumer rights, product liability.',
    url: 'https://www.indiacode.nic.in/bitstream/123456789/12808/1/the_consumer_protection_act,_2019_no._35_of_2019_date_09.08.2019.pdf',
    icon: Users,
  },
  {
    title: 'Arbitration & Conciliation Act, 1996',
    category: 'Dispute Resolution',
    authority: 'Ministry of Law & Justice',
    description: 'Arbitration clauses, seat specification, enforcement of arbitral awards.',
    url: 'https://www.indiacode.nic.in/bitstream/123456789/1978/1/a199626.pdf',
    icon: Landmark,
  },
  {
    title: 'CGST Act, 2017',
    category: 'Tax / GST',
    authority: 'CBIC',
    description: 'GST compliance in service agreements, input tax credit, reverse charge.',
    url: 'https://cbic-gst.gov.in/pdf/CGST-Act-Updated-31082021.pdf',
    icon: FileText,
  },
  {
    title: 'Code on Wages, 2019',
    category: 'Labour',
    authority: 'Ministry of Labour & Employment',
    description: 'Wage payment obligations, employment contract requirements.',
    url: 'https://www.labour.gov.in/static/uploads/2025/06/c328da14bbb15fc4ad571dc33e7a4ab3.pdf',
    icon: Users,
  },
  {
    title: 'MSME Development Act, 2006',
    category: 'MSME',
    authority: 'Ministry of MSME',
    description: 'Payment terms for micro/small enterprises, mandatory 45-day payment cycle.',
    url: 'https://www.indiacode.nic.in/bitstream/123456789/7769/1/micro7.pdf',
    icon: Building2,
  },
  {
    title: 'Competition Act, 2002',
    category: 'Antitrust',
    authority: 'Ministry of Corporate Affairs',
    description: 'Anti-competitive clauses, abuse of dominant position, merger control.',
    url: 'https://www.indiacode.nic.in/handle/123456789/2010?locale=en',
    icon: Scale,
  },
]

export default function KnowledgeBasePage() {
  return (
    <div className="flex flex-col gap-6 stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif tracking-wide">Knowledge Base</h1>
          <p className="text-sm text-muted mt-1">Indian legal corpus powering NyayaSETU's RAG retrieval</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-accent bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-full">
          <Database size={12} />
          {legalSources.length} Sources Indexed
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 border-accent/10">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={16} className="text-accent" />
          <span className="text-sm font-medium">Master Repository</span>
        </div>
        <p className="text-sm text-muted mb-3">
          India Code — the Ministry of Law & Justice / NIC's official digital repository of all Central and State Acts, Rules, Regulations, Notifications, Circulars, and Ordinances.
        </p>
        <a href="https://www.indiacode.nic.in/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors">
          indiacode.nic.in <ExternalLink size={10} />
        </a>
      </div>

      <div className="grid gap-4">
        {legalSources.map((source) => (
          <div key={source.title} className="border border-border bg-surface rounded-xl p-5 hover:border-accent/15 transition-all hover-lift group">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                  <source.icon size={18} className="text-accent" />
                </div>
                <div>
                  <div className="font-medium text-sm group-hover:text-accent transition-colors">{source.title}</div>
                  <div className="flex items-center gap-2 mt-1 mb-2">
                    <span className="text-[10px] font-mono uppercase bg-surfaceElevated text-muted px-2 py-0.5 rounded">{source.category}</span>
                    <span className="text-[10px] text-muted/50">• {source.authority}</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{source.description}</p>
                </div>
              </div>
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 ml-4 text-muted/30 hover:text-accent transition-colors">
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-muted/40 italic text-center pt-4">
        All legal sources verified from official Indian government repositories. NyayaSETU does not fabricate citations.
      </div>
    </div>
  )
}
