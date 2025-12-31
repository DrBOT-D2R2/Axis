import React, { useState, useMemo } from "react";
import { useExpenses } from "../hooks/useExpenses";
import { calculateTotal, groupByCategory, formatINR } from "../utils/finance";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { Plus, Trash2, Edit3, TrendingUp, List, BarChart2 } from "lucide-react";

// Modern Palette
const COLORS = ["#5E6AD2", "#27C96E", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function Expenses() {
  const { transactions, budgetLimit, setBudgetLimit, addTransaction, deleteTransaction } = useExpenses();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'trends'

  const total = calculateTotal(transactions, "EXPENSE");
  const data = groupByCategory(transactions);
  const percent = Math.min((total / budgetLimit) * 100, 100);

  // --- TREND DATA GENERATOR ---
  const trendData = useMemo(() => {
    // Group by Date (Last 30 entries or days)
    const grouped = {};
    transactions.forEach(t => {
      const dateKey = new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      grouped[dateKey] = (grouped[dateKey] || 0) + t.amount;
    });
    
    // Convert to Array and Sort
    return Object.entries(grouped)
      .map(([date, amount]) => ({ date, amount }))
      .reverse(); // Show oldest to newest if your list is new-first
  }, [transactions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!amount) return;
    addTransaction({ amount: parseFloat(amount), category, type: "EXPENSE" });
    setAmount("");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* 1. HERO METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="premium-card p-6 flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="absolute right-0 top-0 p-16 bg-[var(--app-accent)] opacity-10 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
          <div className="relative z-10">
            <span className="text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-widest">Total Spent</span>
            <div className="text-4xl font-bold text-[var(--app-text)] mt-1 font-mono">{formatINR(total)}</div>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-xs font-medium text-[var(--app-success)]">
            <TrendingUp size={14} />
            <span>{percent < 90 ? "Within Budget" : "Budget Critical"}</span>
          </div>
        </div>

        <div className="premium-card p-6 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
             <span className="text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-widest">Monthly Limit</span>
             <button onClick={() => setIsEditing(!isEditing)} className="text-[var(--app-text-muted)] hover:text-[var(--app-accent)]"><Edit3 size={14}/></button>
          </div>
          {isEditing ? (
             <input type="number" autoFocus defaultValue={budgetLimit} onBlur={(e) => {setBudgetLimit(parseFloat(e.target.value)); setIsEditing(false)}} className="premium-input text-2xl font-mono" />
          ) : (
             <div className="text-2xl font-bold text-[var(--app-text)] font-mono">{formatINR(budgetLimit)}</div>
          )}
          <div className="w-full bg-[var(--app-bg)] h-2 rounded-full overflow-hidden mt-2">
             <div className="h-full bg-[var(--app-accent)] transition-all duration-500" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>

      {/* 2. VIEW TOGGLE */}
      <div className="flex items-center gap-4 border-b border-[var(--app-border)] pb-4">
        <button 
          onClick={() => setViewMode("list")} 
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === "list" ? "text-[var(--app-accent)]" : "text-[var(--app-text-muted)]"}`}
        >
          <List size={16} /> Transactions
        </button>
        <button 
          onClick={() => setViewMode("trends")} 
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === "trends" ? "text-[var(--app-accent)]" : "text-[var(--app-text-muted)]"}`}
        >
          <BarChart2 size={16} /> Trends & Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: DYNAMIC CONTENT (List or Chart) */}
        <div className="lg:col-span-2 space-y-4">
          
          {viewMode === "list" ? (
            <>
              {/* Add New */}
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount" className="premium-input flex-1" />
                <select value={category} onChange={e=>setCategory(e.target.value)} className="premium-input w-32 bg-[var(--app-surface)]">
                    {["Food", "Transport", "Academic", "Shopping", "Other"].map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                <button className="px-5 bg-[var(--app-accent)] text-white rounded-lg font-medium hover:opacity-90"><Plus size={20}/></button>
              </form>

              {/* List */}
              <div className="premium-card min-h-[400px]">
                <div className="divide-y divide-[var(--app-border)]">
                    {transactions.map(t => (
                      <div key={t.id} className="px-6 py-4 flex justify-between items-center hover:bg-[var(--app-surface-hover)] transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--app-bg)] border border-[var(--app-border)] flex items-center justify-center text-xs text-[var(--app-accent)] font-bold">{t.category[0]}</div>
                            <div>
                              <div className="text-sm font-medium text-[var(--app-text)]">{t.category}</div>
                              <div className="text-[10px] text-[var(--app-text-muted)]">{new Date(t.date).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-mono text-[var(--app-text)]">-{formatINR(t.amount)}</span>
                            <button onClick={() => deleteTransaction(t.id)} className="text-[var(--app-text-muted)] hover:text-[var(--app-danger)]"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </>
          ) : (
            /* TRENDS CHART VIEW */
            <div className="premium-card p-6 h-[460px] flex flex-col">
              <h3 className="text-lg font-bold text-[var(--app-text)] mb-6">Spending Trend</h3>
              <div className="flex-1 w-full">
                {trendData.length < 2 ? (
                  <div className="h-full flex items-center justify-center text-[var(--app-text-muted)]">Not enough data to graph trends.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorSplit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--app-accent)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--app-accent)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" vertical={false} />
                      <XAxis dataKey="date" stroke="var(--app-text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="var(--app-text-muted)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                      <Tooltip contentStyle={{backgroundColor: 'var(--app-surface)', borderColor: 'var(--app-border)', color:'var(--app-text)', borderRadius: '8px'}} />
                      <Area type="monotone" dataKey="amount" stroke="var(--app-accent)" fillOpacity={1} fill="url(#colorSplit)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PIE CHART (Span 1) */}
        <div className="premium-card p-6 h-[350px] flex flex-col">
           <div className="text-sm font-semibold text-[var(--app-text-muted)] mb-4">Breakdown</div>
           <div className="flex-1 -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                       {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '8px', color: 'var(--app-text)'}} formatter={(val) => formatINR(val)} />
                 </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {data.slice(0,3).map((d, i) => (
                 <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-[var(--app-text-muted)]">
                    <div className="w-2 h-2 rounded-full" style={{background: COLORS[i]}} /> {d.name}
                 </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}