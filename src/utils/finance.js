/**
 * FINANCE UTILITY
 * Pure logic for expense tracking.
 * All amounts are handled as standard numbers, but rounded to 2 decimals for display.
 */

/**
 * Calculate total amount for a list of transactions
 * @param {Array} transactions 
 * @param {string} type - 'EXPENSE' | 'INCOME' | 'ALL'
 */
export const calculateTotal = (transactions, type = 'ALL') => {
    return transactions
      .filter(t => type === 'ALL' ? true : t.type === type)
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };
  
  /**
   * Group transactions by category for Pie Charts
   * Returns: [{ name: 'Food', value: 500 }, ...]
   */
  export const groupByCategory = (transactions) => {
    const groups = {};
    
    transactions.forEach(t => {
      if (t.type === 'EXPENSE') {
        groups[t.category] = (groups[t.category] || 0) + Number(t.amount);
      }
    });
  
    return Object.keys(groups).map(category => ({
      name: category,
      value: groups[category]
    })).sort((a, b) => b.value - a.value); // Sort highest spend first
  };
  
  /**
   * Format currency (Indian Rupee)
   */
  export const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0 // Keep it clean, no paisa unless needed
    }).format(amount);
  };