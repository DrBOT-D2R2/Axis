import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { X } from "lucide-react";

export default function ExerciseChart({ exerciseName, data, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="premium-card w-full max-w-lg p-6 bg-[var(--app-surface)] relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-[var(--app-text)]">{exerciseName}</h3>
            <p className="text-sm text-[var(--app-text-muted)]">Progression History</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--app-surface-hover)] rounded-full text-[var(--app-text-muted)]">
            <X size={20} />
          </button>
        </div>

        {/* Chart */}
        <div className="h-64 w-full">
          {data.length < 2 ? (
            <div className="h-full flex items-center justify-center text-[var(--app-text-muted)] flex-col gap-2">
              <p>Not enough data yet.</p>
              <span className="text-xs">Log at least 2 sessions to see trend.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--app-text-muted)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="var(--app-text-muted)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  dx={-10}
                  domain={['dataMin - 5', 'dataMax + 5']} // Smart scaling
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--app-surface)', borderColor: 'var(--app-border)', borderRadius: '8px', color: 'var(--app-text)' }}
                  itemStyle={{ color: 'var(--app-accent)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="var(--app-accent)" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: 'var(--app-surface)', strokeWidth: 2 }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}