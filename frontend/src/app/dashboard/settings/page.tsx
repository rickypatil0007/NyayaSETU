import { Settings, Globe, Shield, Bell, Database, User } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 stagger-children">
      <div>
        <h1 className="text-2xl font-serif tracking-wide">Settings</h1>
        <p className="text-sm text-muted mt-1">Configure your compliance workspace</p>
      </div>

      {/* Jurisdiction */}
      <div className="border border-border bg-surface rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe size={18} className="text-accent" />
          <h3 className="font-medium">Default Jurisdiction</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-xs">
            <select className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent">
              <option value="india">🇮🇳 India</option>
            </select>
          </div>
          <span className="text-xs text-muted">Primary supported jurisdiction for MVP</span>
        </div>
      </div>

      {/* Audit Defaults */}
      <div className="border border-border bg-surface rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={18} className="text-accent" />
          <h3 className="font-medium">Audit Configuration</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted block mb-2">Review Intensity</label>
            <select className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent">
              <option value="comprehensive">Comprehensive</option>
              <option value="targeted">Targeted</option>
              <option value="quick">Quick Scan</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted block mb-2">Max Debate Rounds</label>
            <select className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent">
              <option value="2">2 rounds</option>
              <option value="3">3 rounds</option>
              <option value="1">1 round (fast)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Knowledge Base */}
      <div className="border border-border bg-surface rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database size={18} className="text-accent" />
          <h3 className="font-medium">Knowledge Base</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm">India Legal Knowledge Base</div>
            <div className="text-xs text-muted mt-1">10 verified Central Acts indexed • Indian Contract Act, DPDP Act, IT Act, and more</div>
          </div>
          <span className="text-xs font-mono text-success bg-success/10 border border-success/20 px-3 py-1 rounded-full">Active</span>
        </div>
      </div>

      {/* Profile */}
      <div className="border border-border bg-surface rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <User size={18} className="text-accent" />
          <h3 className="font-medium">Profile</h3>
        </div>
        <p className="text-sm text-muted">Profile management and team access settings will be available in a future release.</p>
      </div>

      <div className="text-xs text-muted/40 italic text-center pt-4">
        NyayaSETU provides AI-assisted compliance analysis for human review. It does not provide legal advice.
      </div>
    </div>
  )
}
