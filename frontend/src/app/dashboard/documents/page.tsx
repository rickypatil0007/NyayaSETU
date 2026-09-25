'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/client'
import { FileText, ArrowRight, Upload, Eye } from 'lucide-react'

export default function DocumentsPage() {
  const [audits, setAudits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('audits')
          .select('id, name, created_at, status')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
        setAudits(data || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="flex flex-col gap-6 stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif tracking-wide">Documents</h1>
          <p className="text-sm text-muted mt-1">Your uploaded contracts and regulatory documents</p>
        </div>
        <Link href="/dashboard#upload-section" className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-medium px-4 py-2 rounded-lg transition-all text-sm">
          <Upload size={14} /> Upload
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-16 w-full rounded-xl" />
          <div className="skeleton h-16 w-full rounded-xl" />
        </div>
      ) : audits.length > 0 ? (
        <div className="grid gap-4">
          {audits.map((doc) => (
            <Link key={doc.id} href={`/dashboard/reports/${doc.id}`} className="flex items-center justify-between border border-border bg-surface rounded-xl px-6 py-5 hover:border-accent/20 transition-all group hover-lift">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <FileText size={18} className="text-accent" />
                </div>
                <div>
                  <div className="text-sm font-medium group-hover:text-accent transition-colors">{doc.name}</div>
                  <div className="text-xs text-muted mt-0.5">{new Date(doc.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono px-2.5 py-1 rounded-full ${
                  doc.status === 'COMPLETED' ? 'risk-low' : 
                  doc.status === 'ESCALATED' ? 'risk-high' : 
                  'bg-surfaceElevated text-muted border border-border'
                }`}>
                  {doc.status}
                </span>
                <Eye size={14} className="text-muted/30 group-hover:text-accent transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-xl p-16 text-center">
          <FileText size={40} className="text-muted/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No documents yet</h3>
          <p className="text-sm text-muted max-w-md mx-auto mb-6">
            Upload a contract, SLA, or regulatory document from the Dashboard to begin building your document library.
          </p>
          <Link href="/dashboard#upload-section" className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-medium px-5 py-2.5 rounded-lg transition-all text-sm">
            <Upload size={14} /> Upload Document
          </Link>
        </div>
      )}
    </div>
  )
}
