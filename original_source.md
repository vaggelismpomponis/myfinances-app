import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus, 
  Home, 
  PieChart, 
  History, 
  CreditCard,
  ShoppingBag,
  Coffee,
  Car,
  Home as HomeIcon,
  Smartphone,
  Gift,
  MoreHorizontal,
  ArrowLeft,
  Trash2,
  X,
  LogOut,
  User,
  Cloud
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query 
} from 'firebase/firestore';

// --- Firebase Configuration & Initialization ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Components ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 ${className}`}>
    {children}
  </div>
);

const IconButton = ({ icon: Icon, onClick, active, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center space-y-1 w-full py-2 transition-colors ${
      active ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
    }`}
  >
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const CategoryIcon = ({ category, type }) => {
  const icons = {
    'Φαγητό': Coffee,
    'Σούπερ Μάρκετ': ShoppingBag,
    'Σπίτι': HomeIcon,
    'Μεταφορικά': Car,
    'Λογαριασμοί': Smartphone,
    'Διασκέδαση': Gift,
    'Μισθός': Wallet,
    'Δώρο': Gift,
    'Επενδύσεις': TrendingUp,
    'Άλλο': MoreHorizontal
  };

  const IconComponent = icons[category] || MoreHorizontal;
  
  return (
    <div className={`p-3 rounded-full ${type === 'expense' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
      <IconComponent size={20} />
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showAddModal, setShowAddModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  
  // 1. Initialize Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try custom token first (for canvas environment), else anonymous
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth error:", error);
        setAuthError("Πρόβλημα σύνδεσης με το διακομιστή.");
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch Data from Firestore
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      return;
    }

    // Path: artifacts/{appId}/users/{uid}/transactions
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort in JS (Rule: No complex Firestore queries)
      // Descending order (newest first)
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setTransactions(data);
    }, (error) => {
      console.error("Firestore error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Derived State
  const balance = useMemo(() => {
    return transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  }, [transactions]);

  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0), [transactions]);

  // Handlers
  const addTransaction = async (transaction) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), {
        ...transaction,
        date: new Date().toISOString()
      });
      setShowAddModal(false);
    } catch (e) {
      alert("Σφάλμα αποθήκευσης. Προσπάθησε ξανά.");
    }
  };

  const deleteTransaction = async (id) => {
    if (!user) return;
    if (window.confirm('Θέλεις σίγουρα να διαγράψεις αυτή τη συναλλαγή;')) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', id));
      } catch (e) {
        console.error("Error deleting:", e);
      }
    }
  };

  const handleSignOut = () => {
    if (window.confirm("Θέλεις να αποσυνδεθείς;")) {
       signOut(auth);
    }
  };

  // --- Views ---

  const LoadingView = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-medium">Σύνδεση στο Cloud...</p>
    </div>
  );

  const LoginView = () => (
     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-indigo-200 rotate-3">
          <Wallet size={40} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">MyFinances</h1>
        <p className="text-gray-500 mb-8 max-w-xs">Διαχειρίσου τα οικονομικά σου εύκολα και με ασφάλεια στο cloud.</p>
        
        <button 
          disabled={true} // Disabled in this specific demo flow as we auto-login
          className="w-full max-w-xs bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-xl shadow-sm flex items-center justify-center gap-3 relative overflow-hidden"
        >
          {/* Mock Google Button */}
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Σύνδεση με Google
        </button>
        <p className="mt-4 text-xs text-gray-400">Γίνεται αυτόματη σύνδεση για το demo...</p>
     </div>
  );

  const HomeView = () => (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Header / Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200">
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-32 h-32 bg-indigo-400 opacity-20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
             <p className="text-indigo-100 text-sm font-medium">Συνολικό Υπόλοιπο</p>
             <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-medium text-indigo-50">
               <Cloud size={10} /> Sync On
             </div>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight mb-6">
            {balance.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}
          </h1>
          
          <div className="flex gap-4">
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1 text-emerald-300">
                <div className="p-1 bg-emerald-400/20 rounded-full"><TrendingUp size={14} /></div>
                <span className="text-xs font-semibold">Έσοδα</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {totalIncome.toLocaleString('el-GR', { minimumFractionDigits: 0 })}€
              </p>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1 text-red-300">
                <div className="p-1 bg-red-400/20 rounded-full"><TrendingDown size={14} /></div>
                <span className="text-xs font-semibold">Έξοδα</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {totalExpense.toLocaleString('el-GR', { minimumFractionDigits: 0 })}€
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Wallet, label: 'Πορτοφόλι' },
          { icon: CreditCard, label: 'Κάρτες' },
          { icon: TrendingUp, label: 'Στόχοι' },
          { icon: MoreHorizontal, label: 'Περισ.' }
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2">
            <button className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:scale-105 transition-all shadow-sm border border-gray-100">
              <item.icon size={22} />
            </button>
            <span className="text-xs text-gray-500 font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-lg font-bold text-gray-800">Πρόσφατα</h2>
          <button onClick={() => setActiveTab('history')} className="text-sm text-indigo-600 font-semibold">Όλα</button>
        </div>
        
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400">Δεν υπάρχουν συναλλαγές ακόμη.</p>
            </div>
          ) : (
            transactions.slice(0, 5).map(t => (
              <TransactionItem key={t.id} transaction={t} onDelete={deleteTransaction} />
            ))
          )}
        </div>
      </div>
    </div>
  );

  const StatsView = () => {
    // Group expenses by category
    const expensesByCategory = useMemo(() => {
      const groups = {};
      transactions.filter(t => t.type === 'expense').forEach(t => {
        groups[t.category] = (groups[t.category] || 0) + t.amount;
      });
      return Object.entries(groups).sort((a, b) => b[1] - a[1]);
    }, [transactions]);

    const maxExpense = expensesByCategory.length > 0 ? expensesByCategory[0][1] : 1;

    return (
      <div className="pb-24 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Ανάλυση Εξόδων</h2>
        
        {/* Total Expense Card */}
        <Card className="mb-8 bg-gray-900 text-white border-gray-800">
           <p className="text-gray-400 text-sm mb-1">Σύνολο Εξόδων</p>
           <h3 className="text-3xl font-bold">{totalExpense.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</h3>
        </Card>

        <div className="space-y-6">
          {expensesByCategory.length === 0 ? (
            <p className="text-gray-500 text-center py-10">Δεν υπάρχουν έξοδα για ανάλυση.</p>
          ) : (
            expensesByCategory.map(([cat, amount]) => (
              <div key={cat}>
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2">
                     <CategoryIcon category={cat} type="expense" />
                     <span className="font-semibold text-gray-700">{cat}</span>
                  </div>
                  <span className="font-bold text-gray-900">{amount.toFixed(2)}€</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${(amount / maxExpense) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const HistoryView = () => (
    <div className="pb-24 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Ιστορικό</h2>
      <div className="space-y-3">
        {transactions.map(t => (
          <TransactionItem key={t.id} transaction={t} onDelete={deleteTransaction} />
        ))}
      </div>
    </div>
  );

  // --- Sub-components ---

  const TransactionItem = ({ transaction, onDelete }) => (
    <div className="group bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <CategoryIcon category={transaction.category} type={transaction.type} />
        <div>
          <p className="font-bold text-gray-800">{transaction.category}</p>
          <p className="text-xs text-gray-400">
            {new Date(transaction.date).toLocaleDateString('el-GR', { day: 'numeric', month: 'short' })} • {transaction.note || 'Χωρίς σημείωση'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`font-bold ${transaction.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>
          {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)}€
        </span>
        <button 
          onClick={() => onDelete(transaction.id)}
          className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  const AddModal = () => {
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = type === 'expense' 
      ? ['Σούπερ Μάρκετ', 'Φαγητό', 'Σπίτι', 'Μεταφορικά', 'Λογαριασμοί', 'Διασκέδαση', 'Άλλο']
      : ['Μισθός', 'Δώρο', 'Επενδύσεις', 'Άλλο'];

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!amount || !category) return;
      
      setIsSubmitting(true);
      await addTransaction({
        type,
        amount: parseFloat(amount),
        category,
        note
      });
      setIsSubmitting(false);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
        <div className="bg-white w-full max-w-md h-[90vh] sm:h-auto rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
          {/* Modal Header */}
          <div className="p-4 flex justify-between items-center border-b border-gray-100">
            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
              <X size={24} />
            </button>
            <h3 className="text-lg font-bold text-gray-800">Νέα Συναλλαγή</h3>
            <div className="w-10"></div> {/* Spacer */}
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
            {/* Type Switcher */}
            <div className="bg-gray-100 p-1 rounded-xl flex">
              <button 
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
              >
                Έξοδο
              </button>
              <button 
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
              >
                Έσοδο
              </button>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ποσό</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">€</span>
                <input 
                  type="number" 
                  step="0.01" 
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-10 pr-4 text-3xl font-bold text-gray-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-gray-300"
                  autoFocus
                />
              </div>
            </div>

            {/* Categories Grid */}
            <div>
               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Κατηγορία</label>
               <div className="grid grid-cols-3 gap-3">
                 {categories.map(cat => (
                   <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-3 px-2 rounded-xl text-sm font-medium border transition-all ${
                      category === cat 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                   >
                     {cat}
                   </button>
                 ))}
               </div>
            </div>

            {/* Note Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Σημείωση (Προαιρετικό)</label>
              <input 
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="π.χ. Καφές με φίλους"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="mt-auto pt-4">
              <button 
                type="submit"
                disabled={!amount || !category || isSubmitting}
                className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg shadow-indigo-200 transition-all flex justify-center items-center ${
                  !amount || !category ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : 'Αποθήκευση'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // --- Layout Render ---

  if (loading) return <LoadingView />;
  if (!user && !loading) return <LoginView />;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-indigo-100 flex justify-center">
      
      {/* Mobile Container Simulator */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-5">
           
           {/* Top Bar */}
           <div className="flex justify-between items-center mb-6 pt-2">
             <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Καλημέρα,</p>
                <h2 className="text-xl font-bold text-gray-900">Το Πορτοφόλι μου</h2>
             </div>
             <button 
               onClick={handleSignOut}
               className="w-10 h-10 bg-indigo-50 hover:bg-red-50 hover:text-red-500 transition-colors rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200"
               title="Αποσύνδεση"
             >
                <User size={20} />
             </button>
           </div>

           {/* View Switcher */}
           {activeTab === 'home' && <HomeView />}
           {activeTab === 'stats' && <StatsView />}
           {activeTab === 'history' && <HistoryView />}

        </div>

        {/* Floating Add Button (Center) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gray-900 hover:bg-black text-white p-4 rounded-full shadow-xl shadow-indigo-200 transition-transform active:scale-90 flex items-center justify-center"
            >
              <Plus size={28} />
            </button>
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white border-t border-gray-100 px-6 pb-6 pt-2 z-10 sticky bottom-0">
          <div className="flex justify-between items-end relative">
             <div className="flex-1 mr-8">
               <IconButton icon={Home} label="Αρχική" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
             </div>
             <div className="w-12"></div> {/* Space for FAB */}
             <div className="flex-1 ml-8">
               <IconButton icon={PieChart} label="Ανάλυση" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
             </div>
          </div>
        </div>

        {/* Modals */}
        {showAddModal && <AddModal />}
      </div>
      
      <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}