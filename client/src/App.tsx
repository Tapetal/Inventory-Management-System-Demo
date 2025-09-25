import React, { useState, useEffect } from 'react';
import { Package, Eye, FileText, TrendingUp, Search, Filter, ArrowLeft, Download, BarChart3, X, Plus, Check, LogOut, User } from 'lucide-react';

interface Item {
  _id: string;
  name: string;
  description?: string;
}

interface Transaction {
  _id: string;
  date: string;
  itemId: Item;
  deposit: number;
  withdrawal: number;
  balance: number;
  unit?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReportData {
  transactions: Transaction[];
  summary: {
    totalDeposits: number;
    totalWithdrawals: number;
    finalBalance: number;
    transactionCount: number;
  };
  itemSummary: Record<string, {
    deposits: number;
    withdrawals: number;
    transactions: number;
  }>;
}

const mockItems: Item[] = [
  { _id: '1', name: 'Office Supplies', description: 'General office supplies and stationery' },
  { _id: '2', name: 'Computer Equipment', description: 'Computers, laptops, monitors, etc.' },
  { _id: '3', name: 'Furniture', description: 'Office furniture and fixtures' },
  { _id: '4', name: 'Documents', description: 'Important documents and files' },
  { _id: '5', name: 'Safety Equipment', description: 'Safety gear and equipment' },
  { _id: '6', name: 'Cleaning Supplies', description: 'Cleaning materials and equipment' }
];

const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const units = ['ADMIN', 'ICT', 'FINANCE', 'OPERATIONS', 'PUBLIC RELATION', 'CLEANERS', 'DRIVERS'];
  
  mockItems.forEach((item, itemIndex) => {
    let balance = 0;
    const numTransactions = Math.floor(Math.random() * 8) + 5;
    
    for (let i = 0; i < numTransactions; i++) {
      const isDeposit = Math.random() > 0.4;
      const amount = Math.floor(Math.random() * 50) + 1;
      
      const deposit = isDeposit ? amount : 0;
      const withdrawal = !isDeposit ? Math.min(amount, balance) : 0;
      
      balance += deposit - withdrawal;
      
      const daysAgo = Math.floor(Math.random() * 30);
      const transactionDate = new Date();
      transactionDate.setDate(transactionDate.getDate() - daysAgo);
      
      transactions.push({
        _id: `${itemIndex}-${i}`,
        date: transactionDate.toISOString().split('T')[0],
        itemId: item,
        deposit,
        withdrawal,
        balance,
        unit: withdrawal > 0 ? units[Math.floor(Math.random() * units.length)] : undefined,
        createdAt: transactionDate.toISOString(),
        updatedAt: transactionDate.toISOString()
      });
    }
  });
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const InventoryDemo: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'view-records' | 'generate-report' | 'inventory-summary'>('main');
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [items] = useState<Item[]>(mockItems);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);

  // Add scroll reset effect for view changes
  useEffect(() => {
    // Scroll to top whenever view changes
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [currentView]);

  // Add initial scroll reset effect
  useEffect(() => {
    // Force scroll to top on component mount/page load
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setTransactions(generateMockTransactions());
      setLoading(false);
      // Ensure we're at top after loading
      window.scrollTo(0, 0);
    }, 1000);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    
    setTimeout(() => {
      if (loginForm.email === 'admin@gmail.com' && loginForm.password === 'Admin@1234') {
        setIsAuthenticated(true);
        // Scroll to top after login
        setTimeout(() => window.scrollTo(0, 0), 100);
      } else {
        alert('Invalid credentials. Use: admin@gmail.com / Admin@1234');
      }
      setLoginLoading(false);
    }, 1000);
  };

  // Enhanced view change function with scroll reset
  const changeView = (newView: typeof currentView) => {
    setCurrentView(newView);
    // Force immediate scroll to top
    window.scrollTo(0, 0);
    // Also use smooth scroll as backup
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const getDailyStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions.filter(t => t.date === today);

    return {
      totalTransactionsToday: todayTransactions.length,
      totalStockInToday: todayTransactions.reduce((sum, t) => sum + t.deposit, 0),
      totalStockOutToday: todayTransactions.reduce((sum, t) => sum + t.withdrawal, 0)
    };
  };

  const getInventorySummary = () => {
    const itemSummary: Record<string, { totalQuantity: number; status: string }> = {};

    items.forEach(item => {
      const itemTransactions = transactions.filter(t => t.itemId._id === item._id);
      const sortedTransactions = itemTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const currentBalance = sortedTransactions.length > 0 ? sortedTransactions[0].balance : 0;
      
      let status: string;
      if (currentBalance <= 0) {
        status = 'Unavailable';
      } else if (currentBalance >= 1 && currentBalance <= 10) {
        status = 'Low Stock';
      } else {
        status = 'In Stock';
      }

      itemSummary[item.name] = {
        totalQuantity: currentBalance,
        status
      };
    });

    return itemSummary;
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Unavailable':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'In Stock':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Login Component
  const LoginForm = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-8 mx-2">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-sm sm:text-base text-gray-600">Sign in to access your inventory system</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 text-sm sm:text-base"
          >
            {loginLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600 mb-2"><strong>Demo Credentials:</strong></p>
          <p className="text-xs sm:text-sm font-mono text-gray-800">Email: admin@gmail.com</p>
          <p className="text-xs sm:text-sm font-mono text-gray-800">Password: Admin@1234</p>
        </div>
      </div>
    </div>
  );

  // Header Component
  const Header = () => (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1 className="text-base sm:text-xl font-semibold text-gray-900 hidden xs:block">Inventory System</h1>
            <h1 className="text-sm font-semibold text-gray-900 xs:hidden">Inventory</h1>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">DEMO</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span className="hidden md:inline">admin@gmail.com</span>
            </div>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setCurrentView('main');
                setTimeout(() => window.scrollTo(0, 0), 100);
              }}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all text-sm"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  // FIXED: New Transaction Modal with proper centering
  const NewTransactionModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [formData, setFormData] = useState({
      itemId: '',
      stockIn: '',
      stockOut: '',
      requestingUnit: ''
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const [itemSearch, setItemSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const units = ['ADMIN', 'ICT', 'FINANCE', 'OPERATIONS', 'PUBLIC RELATION', 'CLEANERS', 'DRIVERS'];
    const filteredItems = items.filter(item => 
      item.name.toLowerCase().includes(itemSearch.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.itemId) {
        alert('Please select an item');
        return;
      }

      const stockIn = parseInt(formData.stockIn) || 0;
      const stockOut = parseInt(formData.stockOut) || 0;

      if (stockIn <= 0 && stockOut <= 0) {
        alert('Please enter either Stock In or Stock Out');
        return;
      }

      if (stockOut > 0 && !formData.requestingUnit) {
        alert('Please select a requesting unit for stock out');
        return;
      }

      const selectedItem = items.find(item => item._id === formData.itemId);
      const currentBalance = transactions
        .filter(t => t.itemId._id === formData.itemId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.balance || 0;
      
      const newBalance = currentBalance + stockIn - stockOut;
      
      const newTransaction: Transaction = {
        _id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        itemId: selectedItem!,
        deposit: stockIn,
        withdrawal: stockOut,
        balance: newBalance,
        unit: stockOut > 0 ? formData.requestingUnit : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setTransactions(prev => [newTransaction, ...prev]);
      setShowSuccess(true);
      setFormData({ itemId: '', stockIn: '', stockOut: '', requestingUnit: '' });
      setItemSearch('');
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto my-4 relative">
          {showSuccess ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Transaction Added Successfully!</h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSuccess(false)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                >
                  Add More
                </button>
                <button
                  onClick={() => { setShowSuccess(false); onClose(); }}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 text-sm sm:text-base"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">New Transaction</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Date</label>
                  <input
                    type="text"
                    value={new Date().toLocaleDateString()}
                    disabled
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>

                <div className="relative">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Item</label>
                  <input
                    type="text"
                    value={itemSearch}
                    onChange={(e) => {
                      setItemSearch(e.target.value);
                      setShowDropdown(true);
                      setFormData({...formData, itemId: ''});
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Search items..."
                    required
                  />
                  
                  {showDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-32 sm:max-h-48 overflow-y-auto">
                      {filteredItems.map(item => (
                        <div
                          key={item._id}
                          onClick={() => {
                            setItemSearch(item.name);
                            setFormData({...formData, itemId: item._id});
                            setShowDropdown(false);
                          }}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-xs sm:text-sm"
                        >
                          {item.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Stock In</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stockIn}
                    onChange={(e) => setFormData({...formData, stockIn: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Stock Out</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stockOut}
                    onChange={(e) => setFormData({...formData, stockOut: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                {parseInt(formData.stockOut) > 0 && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Requesting Unit</label>
                    <select
                      value={formData.requestingUnit}
                      onChange={(e) => setFormData({...formData, requestingUnit: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select requesting unit...</option>
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex space-x-3 pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Add Transaction</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    );
  };

  // Main Dashboard (Updated for mobile)
  const MainDashboard = () => {
    const dailyStats = getDailyStats();

    return (
      <div className="space-y-4 sm:space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">
            Store Inventory Management System
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your inventory transactions efficiently. This is a demo version with sample data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              title: 'New Data',
              description: 'Add new inventory data',
              icon: Package,
              color: 'green',
              action: () => setShowNewTransactionModal(true)
            },
            {
              title: 'View Records',
              description: 'View, search and manage records',
              icon: Eye,
              color: 'blue',
              action: () => changeView('view-records')
            },
            {
              title: 'Generate Report',
              description: 'Create reports by item or date range',
              icon: FileText,
              color: 'purple',
              action: () => changeView('generate-report')
            },
            {
              title: 'View Summary',
              description: 'View total quantities per item',
              icon: TrendingUp,
              color: 'orange',
              action: () => changeView('inventory-summary')
            }
          ].map((card, index) => (
            <div
              key={index}
              onClick={card.action}
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6 cursor-pointer hover:shadow-xl transition-all transform hover:scale-105 border-l-4 border-green-500 h-40 sm:h-48 flex flex-col justify-between"
            >
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <card.icon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 ml-3 sm:ml-4">{card.title}</h3>
              </div>
              <div className="flex-grow">
                <p className="text-sm sm:text-base font-semibold text-gray-600 mb-3 sm:mb-4">{card.description}</p>
              </div>
              <div className="text-green-600 font-medium text-xs sm:text-sm">Click to {card.title.toLowerCase()} →</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Today's Statistics</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Total Items', value: items.length },
              { label: 'Records Today', value: dailyStats.totalTransactionsToday },
              { label: 'Stock In Today', value: dailyStats.totalStockInToday },
              { label: 'Stock Out Today', value: dailyStats.totalStockOutToday }
            ].map((stat, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">{stat.label}</h4>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ViewRecords with scroll reset
  const ViewRecords = () => {
    const [search, setSearch] = useState('');
    const [selectedItem, setSelectedItem] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showInventorySummary, setShowInventorySummary] = useState(false);

    const filteredTransactions = transactions.filter(transaction => {
      const matchesSearch = transaction.itemId.name.toLowerCase().includes(search.toLowerCase());
      const matchesItem = selectedItem === 'all' || transaction.itemId._id === selectedItem;
      const matchesDateRange = (!startDate || transaction.date >= startDate) && (!endDate || transaction.date <= endDate);
      
      return matchesSearch && matchesItem && matchesDateRange;
    });

    const inventorySummary = getInventorySummary();

    const groupTransactionsByDate = () => {
      const grouped: { [key: string]: Transaction[] } = {};
      
      filteredTransactions.forEach(transaction => {
        const dateKey = new Date(transaction.date).toDateString();
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(transaction);
      });

      return grouped;
    };

    const groupedTransactions = groupTransactionsByDate();

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <button
              onClick={() => changeView('main')}
              className="flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 text-center sm:text-left">View Records</h2>
          </div>
          
          <button
            onClick={() => setShowInventorySummary(!showInventorySummary)}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all text-sm"
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">{showInventorySummary ? 'Show Transactions' : 'Show Inventory Summary'}</span>
            <span className="sm:hidden">{showInventorySummary ? 'Transactions' : 'Summary'}</span>
          </button>
        </div>

        {/* Mobile-optimized filters */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6">
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 md:grid-cols-4 sm:gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Items</option>
              {items.map(item => (
                <option key={item._id} value={item._id}>{item.name}</option>
              ))}
            </select>

            {/* FIXED: Better date inputs with labels */}
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Start Date"
              />
              <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">Start Date</label>
            </div>
            
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="End Date"
              />
              <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">End Date</label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <p className="text-xs sm:text-sm text-gray-600">
              Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedItem('all');
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {showInventorySummary ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Inventory Summary</h3>
              <p className="text-xs sm:text-sm text-gray-600">Current stock levels for all items</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(inventorySummary).map(([itemName, itemData]) => (
                    <tr key={itemName}>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-gray-900 text-xs sm:text-sm">{itemName}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 text-xs sm:text-sm">{itemData.totalQuantity.toLocaleString()}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClasses(itemData.status)}`}>
                          {itemData.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {filteredTransactions.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-sm sm:text-base text-gray-600">Try adjusting your search criteria or add new transactions.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock In</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Out</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {Object.entries(groupedTransactions)
                      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                      .map(([dateKey, dayTransactions], dayIndex) => (
                      <React.Fragment key={dateKey}>
                        {dayIndex > 0 && (
                          <tr>
                            <td colSpan={6} className="px-0 py-0">
                              <div className="w-full border-t-4 border-gray-800"></div>
                            </td>
                          </tr>
                        )}
                        
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="px-3 sm:px-6 py-2 text-xs sm:text-sm font-semibold text-gray-700 border-b border-gray-200">
                            {new Date(dateKey).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })} ({dayTransactions.length} transaction{dayTransactions.length !== 1 ? 's' : ''})
                          </td>
                        </tr>
                        
                        {dayTransactions
                          .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
                          .map((transaction) => (
                          <tr key={transaction._id} className="hover:bg-gray-50 border-b border-gray-100">
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                              {new Date(transaction.date).toLocaleDateString()}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">
                              {transaction.itemId.name}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-green-600 font-medium">
                              {transaction.deposit > 0 ? `+${transaction.deposit}` : '-'}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-red-600 font-medium">
                              {transaction.withdrawal > 0 ? `-${transaction.withdrawal}` : '-'}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">
                              {transaction.unit || '-'}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">
                              {transaction.balance}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Generate Report Component with scroll reset and FIXED date inputs
  const GenerateReport = () => {
    const [selectedItem, setSelectedItem] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [reportLoading, setReportLoading] = useState(false);

    const generateReport = () => {
      setReportLoading(true);
      
      const filteredTransactions = transactions.filter(transaction => {
        const matchesItem = selectedItem === 'all' || transaction.itemId._id === selectedItem;
        const matchesDateRange = (!startDate || transaction.date >= startDate) && (!endDate || transaction.date <= endDate);
        
        return matchesItem && matchesDateRange;
      });

      const totalDeposits = filteredTransactions.reduce((sum, t) => sum + t.deposit, 0);
      const totalWithdrawals = filteredTransactions.reduce((sum, t) => sum + t.withdrawal, 0);
      const finalBalance = totalDeposits - totalWithdrawals;

      const itemSummary: Record<string, { deposits: number; withdrawals: number; transactions: number }> = {};
      
      filteredTransactions.forEach(transaction => {
        const itemName = transaction.itemId.name;
        if (!itemSummary[itemName]) {
          itemSummary[itemName] = { deposits: 0, withdrawals: 0, transactions: 0 };
        }
        itemSummary[itemName].deposits += transaction.deposit;
        itemSummary[itemName].withdrawals += transaction.withdrawal;
        itemSummary[itemName].transactions += 1;
      });

      const report: ReportData = {
        transactions: filteredTransactions.slice(0, 10),
        summary: {
          totalDeposits,
          totalWithdrawals,
          finalBalance,
          transactionCount: filteredTransactions.length
        },
        itemSummary
      };

      setTimeout(() => {
        setReportData(report);
        setReportLoading(false);
        // Scroll to show the generated report
        setTimeout(() => {
          window.scrollTo({ top: 200, behavior: 'smooth' });
        }, 100);
      }, 1000);
    };

    const exportReport = (format: 'pdf' | 'excel') => {
      alert(`${format.toUpperCase()} export functionality would be implemented with backend API calls in the full version. This demo shows the UI and data structure.`);
    };

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => changeView('main')}
            className="flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 text-center sm:text-left">
            Generate Report
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Report Parameters</h3>

          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 mb-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Item</label>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Items</option>
                {items.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={generateReport}
            disabled={reportLoading}
            className="w-full bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {reportLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Generating...
              </div>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Generate Report
              </>
            )}
          </button>
        </div>

        {reportData && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6">
              <div className="text-center">
                <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-2">
                  {selectedItem === 'all' ? 'Inventory Report On All Items' : 
                   `Inventory Report On ${items.find(i => i._id === selectedItem)?.name || 'Unknown Item'}`}
                </h3>
                {(startDate || endDate) && (
                  <p className="text-xs sm:text-sm text-gray-600">
                    {startDate && endDate && startDate !== endDate ? 
                     `From: ${new Date(startDate).toLocaleDateString()} To: ${new Date(endDate).toLocaleDateString()}` :
                     startDate && endDate && startDate === endDate ?
                     `For: ${new Date(startDate).toLocaleDateString()}` :
                     startDate ? `From: ${new Date(startDate).toLocaleDateString()}` :
                     `Up to: ${new Date(endDate).toLocaleDateString()}`}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: 'Total Stock In', value: reportData.summary.totalDeposits, color: 'green', icon: '+' },
                { label: 'Total Stock Out', value: reportData.summary.totalWithdrawals, color: 'red', icon: '-' },
                { label: 'Net Balance', value: reportData.summary.finalBalance, color: 'blue', icon: FileText },
                { label: 'Total Transactions', value: reportData.summary.transactionCount, color: 'gray', icon: BarChart3 }
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className={`text-lg sm:text-2xl font-bold ${
                        stat.color === 'green' ? 'text-green-600' :
                        stat.color === 'red' ? 'text-red-600' :
                        stat.color === 'blue' ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`w-8 h-8 sm:w-12 sm:h-12 ${
                      stat.color === 'green' ? 'bg-green-100' :
                      stat.color === 'red' ? 'bg-red-100' :
                      stat.color === 'blue' ? 'bg-blue-100' : 'bg-gray-100'
                    } rounded-lg flex items-center justify-center`}>
                      {typeof stat.icon === 'string' ? (
                        <span className={`${
                          stat.color === 'green' ? 'text-green-600' :
                          stat.color === 'red' ? 'text-red-600' :
                          stat.color === 'blue' ? 'text-blue-600' : 'text-gray-600'
                        } text-base sm:text-xl`}>
                          {stat.icon}
                        </span>
                      ) : (
                        <stat.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${
                          stat.color === 'green' ? 'text-green-600' :
                          stat.color === 'red' ? 'text-red-600' :
                          stat.color === 'blue' ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Export Report</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => exportReport('pdf')}
                  className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Export PDF</span>
                </button>
                <button
                  onClick={() => exportReport('excel')}
                  className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Inventory Summary Component with scroll reset
  const InventorySummary = () => {
    const inventorySummary = getInventorySummary();

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => changeView('main')}
            className="flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 text-center sm:text-left">
            Inventory Summary
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Current Stock Status</h3>
            <p className="text-xs sm:text-base text-gray-600">Overview of all items and their current quantities</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {Object.entries(inventorySummary).map(([itemName, itemData]) => (
              <div key={itemName} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate pr-2">{itemName}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusClasses(itemData.status)}`}>
                    {itemData.status}
                  </span>
                </div>
                <div className="flex items-center">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2" />
                  <span className="text-lg sm:text-xl font-bold text-gray-900">
                    {itemData.totalQuantity.toLocaleString()}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 ml-1">units</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 sm:pt-6">
            <h4 className="font-medium text-gray-900 mb-4 text-sm sm:text-base">Status Distribution</h4>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {['In Stock', 'Low Stock', 'Unavailable'].map(status => {
                const count = Object.values(inventorySummary).filter(item => item.status === status).length;
                return (
                  <div key={status} className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                      status === 'In Stock' ? 'bg-green-500' :
                      status === 'Low Stock' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{status}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'view-records':
        return <ViewRecords />;
      case 'generate-report':
        return <GenerateReport />;
      case 'inventory-summary':
        return <InventorySummary />;
      default:
        return <MainDashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading demo data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {renderCurrentView()}
        <NewTransactionModal
          isOpen={showNewTransactionModal}
          onClose={() => setShowNewTransactionModal(false)}
        />
      </main>
      
      <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-xs sm:text-sm">
        <p className="font-medium">Demo Mode</p>
        <p className="text-xs">Sample data • No backend required</p>
      </div>
    </div>
  );
};

export default InventoryDemo;