'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface RiskSummaryClientProps {
  riskCounts: {
    HIGH: number
    MEDIUM: number
    LOW: number
    CLEAR: number
  }
}

export default function RiskSummaryClient({ riskCounts }: RiskSummaryClientProps) {
  const riskData = [
    { name: 'HIGH', count: riskCounts.HIGH, color: '#ef4444' },
    { name: 'MEDIUM', count: riskCounts.MEDIUM, color: '#f59e0b' },
    { name: 'LOW', count: riskCounts.LOW, color: '#eab308' },
    { name: 'CLEAR', count: riskCounts.CLEAR, color: '#22c55e' },
  ]

  return (
    <div className="h-[200px] mt-4 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={riskData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip 
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} 
            contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} 
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
            {riskData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
