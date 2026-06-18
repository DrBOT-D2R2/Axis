import React, { useState } from "react";
import { useExpenses } from "../hooks/useExpenses";
import { Plus, Trash2, Wallet, TrendingUp, PieChart, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Expenses() {
  const { expenses, budgetLimit, addExpense, deleteExpense, isLoaded } = useExpenses();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");

  const handleAdd = async () => {
    if (!amount) return;
    await addExpense(amount, category);
    setAmount("");
  };

  if (!isLoaded) return <div className="h-full flex items-center justify-center text-text-muted font-heading animate-pulse">Syncing Finances...</div>;

  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remaining = budgetLimit - totalSpent;
  const progress = Math.min((totalSpent / budgetLimit) * 100, 100);

  const categoryData = Object.entries(expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  const categories = ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Other"];

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 p-4 md:p-8 text-text">

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4">
        <div className="premium-card p-6 bg-surface lg:col-span-2">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted font-mono">Monthly Expenditure</p>
              <h2 className="text-4xl md:text-5xl font-black text-text mt-2 flex items-baseline gap-2">
                <span className="text-xl md:text-2xl text-accent font-bold">₹</span>
                {totalSpent.toLocaleString()}
              </h2>
            </div>
            <div className="p-2.5 bg-surface-hover rounded-xl text-text-muted border border-border">
              <Wallet size={20} />
            </div>
          </div>
          <div className="w-full bg-bg h-2 rounded-full overflow-hidden border border-border">
            <div 
              className={`h-full transition-all duration-500 ease-out ${progress > 90 ? 'bg-rose-500' : 'bg-text'}`} 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-3">
             <p className="text-[10px] text-text-muted font-semibold font-mono uppercase tracking-tighter">
               {Math.round(progress)}% Consumed
             </p>
             <p className="text-[10px] text-text-muted font-semibold font-mono">
               LIMIT: ₹{budgetLimit.toLocaleString()}
             </p>
          </div>
        </div>

        <div className="premium-card p-6 flex flex-col justify-center bg-surface group hover:border-text-muted/30 transition-all">
           <div className="flex items-center gap-4">
             <div className="p-3 bg-surface-hover rounded-xl text-emerald-500 border border-border group-hover:bg-emerald-500/10 transition-colors">
               <TrendingUp size={24}/>
             </div>
             <div>
               <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted font-mono">Available Balance</p>
               <h3 className={`text-2xl md:text-3xl font-black mt-1 ${remaining < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                 ₹{remaining.toLocaleString()}
               </h3>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-6">

        {/* INPUT & LIST SECTION (8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Quick Add Form */}
          <div className="premium-card p-5 bg-surface overflow-hidden relative">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full space-y-2">
                <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-widest ml-1 font-mono">Transaction Amount</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">₹</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-bg border border-border rounded-lg pl-8 pr-4 py-2.5 outline-none focus:border-text-muted text-text font-mono font-bold transition-all placeholder-text-muted/50 text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="w-full sm:w-48 space-y-2">
                <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-widest ml-1 font-mono">Category</label>
                <div className="relative group">
                   <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 outline-none focus:border-text-muted text-text font-semibold transition-all appearance-none cursor-pointer text-sm"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-hover:text-text transition-colors">
                    <PieChart size={14}/>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAdd}
                className="w-full sm:w-auto premium-button-accent py-2.5 px-5"
              >
                <Plus size={16} strokeWidth={2} /> Add
              </button>
            </div>
          </div>

          {/* LIST SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
               <h3 className="text-[10px] font-semibold text-text-muted uppercase tracking-widest font-mono">Ledger History</h3>
               <span className="text-[10px] font-semibold text-text font-mono uppercase">{expenses.length} Entries</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {expenses.map((ex) => (
                <div key={ex.id} className="group flex justify-between items-center p-3 bg-surface border border-border rounded-lg hover:border-text-muted/40 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-bg flex items-center justify-center text-text font-bold border border-border text-sm">
                      {ex.category[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-text text-sm">{ex.category}</p>
                      <p className="text-[10px] text-text-muted flex items-center gap-1 font-mono tracking-tighter mt-0.5">
                        <Calendar size={10}/> {new Date(ex.date).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-text text-sm md:text-base">₹{ex.amount.toLocaleString()}</span>
                    <button 
                      onClick={() => deleteExpense(ex.id)}
                      className="p-2 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="col-span-full text-center py-16 text-text-muted border border-dashed border-border rounded-xl bg-surface/30">
                  <div className="w-12 h-12 bg-bg rounded-full flex items-center justify-center mx-auto mb-3 border border-border">
                     <Wallet size={20}/>
                  </div>
                  <p className="text-xs font-medium">No transactions found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BREAKDOWN SECTION (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
           <div className="premium-card p-6 h-fit bg-surface sticky top-8">
            <div className="flex items-center gap-2 mb-6">
              <PieChart size={14} className="text-text-muted"/>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-text-muted font-mono">Category Breakdown</h3>
            </div>

            <div className="h-[300px] md:h-[400px]">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={90} tick={{fill: 'var(--app-text-muted)', fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'var(--app-bg)', opacity: 0.3, radius: 4}} contentStyle={{backgroundColor: 'var(--app-surface)', borderRadius: '12px', border: '1px solid var(--app-border)', color: 'var(--app-text)', fontWeight: 'bold', fontSize: '12px'}} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24} fill="var(--app-accent)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[10px] text-text-muted font-bold uppercase font-mono opacity-50">
                  <div className="mb-4">No data to display</div>
                  <div className="w-12 h-1 bg-border rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}