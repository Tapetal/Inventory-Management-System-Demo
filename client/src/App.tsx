import React, { useState, useEffect } from 'react';
import { Package, Eye, FileText, TrendingUp, Search, Filter, ArrowLeft, Download, BarChart3, X, Plus, Check, LogOut, User, Users, ClipboardList, AlertCircle, UserPlus, Mail, Shield, CheckCircle, XCircle } from 'lucide-react';

// Type Definitions
interface MockUser {
  id: string;
  email: string;
  role: 'admin' | 'staff';
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

interface MockItem {
  _id: string;
  name: string;
  description: string;
  lowStockThreshold: number;
  stockStatus: string;
}

interface Transaction {
  _id: string;
  date: string;
  itemId: MockItem;
  deposit: number;
  withdrawal: number;
  balance: number;
  unit?: string;
  createdBy: MockUser;
  isDeleted: boolean;
  createdAt: string;
}

interface DeletionRequest {
  _id: string;
  recordType: string;
  requestedBy: MockUser;
  reason: string;
  status: string;
  requestedAt: string;
}

interface ReportData {
  transactions: Transaction[];
  summary: {
    totalDeposits: number;
    totalWithdrawals: number;
    finalBalance: number;
    transactionCount: number;
  };
}

interface InventorySummaryItem {
  totalQuantity: number;
  status: string;
}

// Mock Users
const mockUsers: MockUser[] = [
  { id: '1', email: 'admin@gmail.com', role: 'admin', isActive: true, lastLogin: '2024-01-15T10:30:00', createdAt: '2024-01-01' },
  { id: '2', email: 'staff1@gmail.com', role: 'staff', isActive: true, lastLogin: '2024-01-14T15:20:00', createdAt: '2024-01-02' },
  { id: '3', email: 'staff2@gmail.com', role: 'staff', isActive: true, lastLogin: '2024-01-13T09:15:00', createdAt: '2024-01-03' },
];

// Mock Items
const mockItems: MockItem[] = [
  { _id: '1', name: 'Office Supplies', description: 'Pens, papers, staplers', lowStockThreshold: 10, stockStatus: 'normal' },
  { _id: '2', name: 'Computer Equipment', description: 'Laptops, monitors', lowStockThreshold: 5, stockStatus: 'low' },
  { _id: '3', name: 'Furniture', description: 'Desks, chairs', lowStockThreshold: 3, stockStatus: 'normal' },
  { _id: '4', name: 'Safety Equipment', description: 'Fire extinguishers', lowStockThreshold: 8, stockStatus: 'out' },
];

// Generate Mock Transactions
const generateMockTransactions = (items: MockItem[], users: MockUser[]): Transaction[] => {
  const transactions: Transaction[] = [];
  const units = ['ADMIN', 'ICT', 'FINANCE', 'OPERATIONS', 'PUBLIC RELATION', 'CLEANERS', 'DRIVERS'];
  
  items.forEach((item, itemIndex) => {
    let balance = itemIndex === 3 ? 0 : Math.floor(Math.random() * 30) + 10;
    const numTransactions = Math.floor(Math.random() * 8) + 5;
    
    for (let i = 0; i < numTransactions; i++) {
      const isDeposit = Math.random() > 0.4;
      const amount = Math.floor(Math.random() * 20) + 1;
      
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
        createdBy: users[Math.floor(Math.random() * users.length)],
        isDeleted: false,
        createdAt: transactionDate.toISOString()
      });
    }
  });
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const mockDeletionRequests: DeletionRequest[] = [
  {
    _id: '1',
    recordType: 'Transaction',
    requestedBy: mockUsers[1],
    reason: 'Duplicate entry - this transaction was recorded twice by mistake',
    status: 'pending',
    requestedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: '2',
    recordType: 'Transaction',
    requestedBy: mockUsers[2],
    reason: 'Wrong item selected - should have been Office Supplies not Computer Equipment',
    status: 'pending',
    requestedAt: new Date(Date.now() - 172800000).toISOString()
  }
];

export default function NSCInventoryDemo() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [currentView, setCurrentView] = useState('main');
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [items] = useState<MockItem[]>(mockItems);
  const [users] = useState<MockUser[]>(mockUsers);
  const [deletionRequests] = useState<DeletionRequest[]>(mockDeletionRequests);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setTransactions(generateMockTransactions(mockItems, mockUsers));
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    
    setTimeout(() => {
      if (loginForm.email === 'admin@gmail.com' && loginForm.password === 'Admin@1234') {
        setCurrentUser(mockUsers[0]);
        setIsAuthenticated(true);
      } else if (loginForm.email === 'staff@gmail.com' && loginForm.password === 'Staff@1234') {
        setCurrentUser(mockUsers[1]);
        setIsAuthenticated(true);
      } else {
        alert('Invalid credentials.\n\nAdmin: admin@gmail.com / Admin@1234\nStaff: staff@gmail.com / Staff@1234');
      }
      setLoginLoading(false);
    }, 1000);
  };

  const changeView = (newView: string) => {
    setCurrentView(newView);
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

  const getInventorySummary = (): Record<string, InventorySummaryItem> => {
    const itemSummary: Record<string, InventorySummaryItem> = {};
    items.forEach(item => {
      const itemTransactions = transactions.filter(t => t.itemId._id === item._id);
      const sortedTransactions = itemTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const currentBalance = sortedTransactions.length > 0 ? sortedTransactions[0].balance : 0;
      
      let status;
      if (currentBalance <= 0) status = 'No Stock';
      else if (currentBalance <= item.lowStockThreshold) status = 'Low Stock';
      else status = 'In Stock';

      itemSummary[item.name] = { totalQuantity: currentBalance, status };
    });
    return itemSummary;
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'No Stock': return 'bg-red-100 text-red-800 border border-red-200';
      case 'In Stock': return 'bg-green-100 text-green-800 border border-green-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Login Component
  const LoginForm = React.memo(() => (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-green-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Name</h2>
          <p className="text-gray-600">Inventory Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-gradient-to-r from-blue-900 to-green-800 text-white py-3 px-4 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loginLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>Admin Login:</strong></p>
            <p className="text-sm font-mono text-gray-800">admin@gmail.com</p>
            <p className="text-sm font-mono text-gray-800">Admin@1234</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2"><strong>Staff Login:</strong></p>
            <p className="text-sm font-mono text-gray-800">staff@gmail.com</p>
            <p className="text-sm font-mono text-gray-800">Staff@1234</p>
          </div>
        </div>
      </div>
    </div>
  ));

  // Header Component
  const Header = () => (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Company Name Inventory</h1>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">DEMO</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600">{currentUser?.email}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                currentUser?.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {currentUser?.role}
              </span>
            </div>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setCurrentUser(null);
                setCurrentView('main');
              }}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  // New Transaction Modal
  const NewTransactionModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [formData, setFormData] = useState({ itemId: '', stockIn: '', stockOut: '', requestingUnit: '' });
    const [showSuccess, setShowSuccess] = useState(false);
    const [itemSearch, setItemSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const units = ['ADMIN', 'ICT', 'FINANCE', 'OPERATIONS', 'PUBLIC RELATION', 'CLEANERS', 'DRIVERS'];
    const filteredItems = items.filter(item => item.name.toLowerCase().includes(itemSearch.toLowerCase()));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.itemId) return alert('Please select an item');

      const stockIn = parseInt(formData.stockIn) || 0;
      const stockOut = parseInt(formData.stockOut) || 0;

      if (stockIn <= 0 && stockOut <= 0) return alert('Please enter Stock In or Stock Out');
      if (stockOut > 0 && !formData.requestingUnit) return alert('Please select requesting unit');

      const selectedItem = items.find(item => item._id === formData.itemId);
      const currentBalance = transactions
        .filter(t => t.itemId._id === formData.itemId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.balance || 0;
      
      // Check if withdrawal would result in negative balance
      if (stockOut > 0 && currentBalance + stockIn < stockOut) {
        return alert(`Insufficient stock! Current available balance: ${currentBalance + stockIn} units`);
      }
      
      const newTransaction: Transaction = {
        _id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        itemId: selectedItem!,
        deposit: stockIn,
        withdrawal: stockOut,
        balance: currentBalance + stockIn - stockOut,
        unit: stockOut > 0 ? formData.requestingUnit : undefined,
        createdBy: currentUser!,
        isDeleted: false,
        createdAt: new Date().toISOString()
      };

      setTransactions(prev => [newTransaction, ...prev]);
      setShowSuccess(true);
      setFormData({ itemId: '', stockIn: '', stockOut: '', requestingUnit: '' });
      setItemSearch('');
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          {showSuccess ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Transaction Added!</h3>
              <div className="flex space-x-3">
                <button onClick={() => setShowSuccess(false)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Add More
                </button>
                <button onClick={() => { setShowSuccess(false); onClose(); }} className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700">
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">New Transaction</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input type="text" value={new Date().toLocaleDateString()} disabled className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium mb-2">Item</label>
                  <input
                    type="text"
                    value={itemSearch}
                    onChange={(e) => { setItemSearch(e.target.value); setShowDropdown(true); setFormData({...formData, itemId: ''}); }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Search items..."
                    required
                  />
                  {showDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredItems.map(item => (
                        <div key={item._id} onClick={() => { setItemSearch(item.name); setFormData({...formData, itemId: item._id}); setShowDropdown(false); }}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer">{item.name}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock In</label>
                  <input type="number" min="0" value={formData.stockIn} onChange={(e) => setFormData({...formData, stockIn: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Out</label>
                  <input type="number" min="0" value={formData.stockOut} onChange={(e) => setFormData({...formData, stockOut: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg" placeholder="0" />
                </div>
                {parseInt(formData.stockOut) > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Requesting Unit</label>
                    <select value={formData.requestingUnit} onChange={(e) => setFormData({...formData, requestingUnit: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg" required>
                      <option value="">Select unit...</option>
                      {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                    </select>
                  </div>
                )}
                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg">Cancel</button>
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 mr-2" />Add
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    );
  };

  // Main Dashboard
  const MainDashboard = () => {
    const dailyStats = getDailyStats();
    const pendingCount = deletionRequests.filter(r => r.status === 'pending').length;

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Store Inventory Management System</h2>
          <p className="text-gray-600">Manage your inventory transactions efficiently. This is a demo with sample data.</p>
        </div>

        {/* Inventory Operations */}
        <div>
          <div className="flex items-center mb-4">
            <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
            <h3 className="text-xl font-bold">Inventory Operations</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'New Data', desc: 'Add new inventory data', icon: Package, color: 'green', action: () => setShowNewTransactionModal(true) },
              { title: 'View Records', desc: 'View and manage records', icon: Eye, color: 'blue', action: () => changeView('view-records') },
              { title: 'Generate Report', desc: 'Create reports', icon: FileText, color: 'purple', action: () => changeView('generate-report') },
              { title: 'View Summary', desc: 'View quantities', icon: TrendingUp, color: 'orange', action: () => changeView('inventory-summary') }
            ].map((card, i) => (
              <div key={i} onClick={card.action}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all transform hover:scale-105 border-l-4 border-green-500">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <card.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold ml-4">{card.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">{card.desc}</p>
                <div className="text-green-600 font-medium text-sm">Click to {card.title.toLowerCase()} →</div>
              </div>
            ))}
          </div>
        </div>

        {/* Management */}
        <div>
          <div className="flex items-center mb-4">
            <div className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></div>
            <h3 className="text-xl font-bold">Management & Administration</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div onClick={() => changeView('my-requests')}
              className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all border-l-4 border-yellow-500">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold ml-4">My Requests</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">View your deletion requests</p>
              <div className="text-yellow-600 font-medium text-sm">View requests →</div>
            </div>

            {currentUser?.role === 'admin' && (
              <>
                <div onClick={() => changeView('user-management')}
                  className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all border-l-4 border-indigo-500">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold ml-4">User Management</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Manage users</p>
                  <div className="text-indigo-600 font-medium text-sm">Admin only →</div>
                </div>

                <div onClick={() => changeView('pending-deletions')}
                  className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all border-l-4 border-red-500 relative">
                  {pendingCount > 0 && (
                    <div className="absolute top-2 right-2">
                      <span className="flex items-center justify-center w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full">
                        {pendingCount}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold ml-4">Pending Deletions</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Review requests</p>
                  <div className="text-red-600 font-medium text-sm">{pendingCount > 0 ? `${pendingCount} pending →` : 'No pending →'}</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Today's Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Today's Statistics</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Items', value: items.length },
              { label: 'Records Today', value: dailyStats.totalTransactionsToday },
              { label: 'Stock In Today', value: dailyStats.totalStockInToday },
              { label: 'Stock Out Today', value: dailyStats.totalStockOutToday }
            ].map((stat, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">{stat.label}</h4>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // View Records
  const ViewRecords = () => {
    const [search, setSearch] = useState('');
    const [selectedItem, setSelectedItem] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filteredTransactions = transactions.filter(t => {
      const matchesSearch = t.itemId.name.toLowerCase().includes(search.toLowerCase());
      const matchesItem = selectedItem === 'all' || t.itemId._id === selectedItem;
      const matchesDateRange = (!startDate || t.date >= startDate) && (!endDate || t.date <= endDate);
      return matchesSearch && matchesItem && matchesDateRange;
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => changeView('main')} className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-4 h-4" /><span>Back to Dashboard</span>
          </button>
          <h2 className="text-2xl font-bold">View Records</h2>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg" />
            </div>
            <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} className="px-3 py-2 border rounded-lg">
              <option value="all">All Items</option>
              {items.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
            </select>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 border rounded-lg" />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Showing {filteredTransactions.length} transaction(s)</p>
            <button onClick={() => { setSearch(''); setSelectedItem('all'); setStartDate(''); setEndDate(''); }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium">Clear Filters</button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Out</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((t) => (
                    <tr key={t._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-medium">{t.itemId.name}</td>
                      <td className="px-6 py-4 text-sm text-green-600 font-medium">{t.deposit > 0 ? `+${t.deposit}` : '-'}</td>
                      <td className="px-6 py-4 text-sm text-red-600 font-medium">{t.withdrawal > 0 ? `-${t.withdrawal}` : '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{t.unit || '-'}</td>
                      <td className="px-6 py-4 text-sm font-medium">{t.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Generate Report
  const GenerateReport = () => {
    const [selectedItem, setSelectedItem] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [reportLoading, setReportLoading] = useState(false);

    const generateReport = () => {
      setReportLoading(true);
      const filteredTransactions = transactions.filter(t => {
        const matchesItem = selectedItem === 'all' || t.itemId._id === selectedItem;
        const matchesDateRange = (!startDate || t.date >= startDate) && (!endDate || t.date <= endDate);
        return matchesItem && matchesDateRange;
      });

      const totalDeposits = filteredTransactions.reduce((sum, t) => sum + t.deposit, 0);
      const totalWithdrawals = filteredTransactions.reduce((sum, t) => sum + t.withdrawal, 0);

      setTimeout(() => {
        setReportData({
          transactions: filteredTransactions.slice(0, 10),
          summary: {
            totalDeposits,
            totalWithdrawals,
            finalBalance: totalDeposits - totalWithdrawals,
            transactionCount: filteredTransactions.length
          }
        });
        setReportLoading(false);
      }, 1000);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => changeView('main')} className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-4 h-4" /><span>Back</span>
          </button>
          <h2 className="text-2xl font-bold">Generate Report</h2>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Report Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Item</label>
              <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="all">All Items</option>
                {items.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <button onClick={generateReport} disabled={reportLoading}
            className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {reportLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Generating...
              </div>
            ) : (<><BarChart3 className="w-4 h-4 inline mr-2" />Generate Report</>)}
          </button>
        </div>

        {reportData && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <h3 className="text-xl font-bold mb-2">
                {selectedItem === 'all' ? 'Inventory Report On All Items' : `Inventory Report On ${items.find(i => i._id === selectedItem)?.name}`}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Stock In', value: reportData.summary.totalDeposits, color: 'green' },
                { label: 'Total Stock Out', value: reportData.summary.totalWithdrawals, color: 'red' },
                { label: 'Current Balance', value: reportData.summary.finalBalance, color: 'blue' },
                { label: 'Total Transactions', value: reportData.summary.transactionCount, color: 'gray' }
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg p-6">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold ${
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'red' ? 'text-red-600' :
                    stat.color === 'blue' ? 'text-blue-600' : 'text-gray-900'
                  }`}>{stat.value.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Export Report</h3>
              <div className="flex gap-3">
                <button onClick={() => alert('PDF export (Demo)')} className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg">
                  <Download className="w-4 h-4" /><span>Export PDF</span>
                </button>
                <button onClick={() => alert('Excel export (Demo)')} className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg">
                  <Download className="w-4 h-4" /><span>Export Excel</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Inventory Summary
  const InventorySummary = () => {
    const inventorySummary = getInventorySummary();

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => changeView('main')} className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-4 h-4" /><span>Back</span>
          </button>
          <h2 className="text-2xl font-bold">Inventory Summary</h2>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-base font-medium mb-4">Status Distribution</h4>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {['In Stock', 'Low Stock', 'No Stock'].map(status => {
              const count = Object.values(inventorySummary).filter((item: InventorySummaryItem) => item.status === status).length;
              return (
                <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                    status === 'In Stock' ? 'bg-green-500' : status === 'Low Stock' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-gray-600">{status}</p>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Current Stock Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(inventorySummary).map(([itemName, itemData]) => {
                const typedItemData = itemData as InventorySummaryItem;
                return (
                  <div key={itemName} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-sm">{itemName}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClasses(typedItemData.status)}`}>
                        {typedItemData.status}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-xl font-bold">{typedItemData.totalQuantity}</span>
                      <span className="text-sm text-gray-500 ml-1">units</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // User Management
  const UserManagement = () => {
    const [showInviteModal, setShowInviteModal] = useState(false);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => changeView('main')} className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-4 h-4" /><span>Back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center">
                  <Users className="w-7 h-7 mr-3 text-blue-600" />User Management
                </h1>
                <p className="text-gray-600">Manage users and invitations</p>
              </div>
            </div>
            <button onClick={() => setShowInviteModal(true)} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
              <UserPlus className="w-4 h-4" /><span>Invite User</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: users.length, icon: Users, color: 'blue' },
            { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: Shield, color: 'purple' },
            { label: 'Staff', value: users.filter(u => u.role === 'staff').length, icon: Users, color: 'green' },
            { label: 'Pending Invites', value: 0, icon: Mail, color: 'yellow' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">All Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{user.email.charAt(0).toUpperCase()}</span>
                        </div>
                        <p className="ml-4 text-sm font-medium">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>{user.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Invite New User</h3>
                <button onClick={() => setShowInviteModal(false)}><X className="w-5 h-5" /></button>
              </div>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input type="email" className="w-full px-3 py-2 border rounded-lg" placeholder="user@gmail.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button type="button" onClick={() => { alert('Invitation sent! (Demo)'); setShowInviteModal(false); }}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Send Invitation</button>
                  <button type="button" onClick={() => setShowInviteModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Pending Deletions
  const PendingDeletions = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => changeView('main')} className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-4 h-4" /><span>Back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold">Pending Deletion Requests</h1>
            <p className="text-gray-600">Review staff deletion requests</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {deletionRequests.map((request) => (
          <div key={request._id} className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">{request.recordType} Deletion Request</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Requested by: <strong>{request.requestedBy.email}</strong> ({request.requestedBy.role})</p>
                <p>Requested: {new Date(request.requestedAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Reason:</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{request.reason}</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => alert('Request approved! (Demo)')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg">
                <CheckCircle className="w-4 h-4 mr-2" />Approve
              </button>
              <button onClick={() => alert('Request declined! (Demo)')}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg">
                <XCircle className="w-4 h-4 mr-2" />Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // My Requests
  const MyRequests = () => {
    const myRequests = deletionRequests.filter(r => r.requestedBy.id === currentUser?.id);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-4">
            <button onClick={() => changeView('main')} className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-4 h-4" /><span>Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold">My Deletion Requests</h1>
              <p className="text-gray-600">View your deletion request status</p>
            </div>
          </div>
        </div>

        {myRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No deletion requests</h3>
            <p className="text-gray-500">You haven't submitted any requests yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{request.recordType} Deletion Request</h3>
                    <p className="text-sm text-gray-600">Submitted: {new Date(request.requestedAt).toLocaleString()}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Your Reason:</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{request.reason}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'view-records': return <ViewRecords />;
      case 'generate-report': return <GenerateReport />;
      case 'inventory-summary': return <InventorySummary />;
      case 'user-management': return currentUser?.role === 'admin' ? <UserManagement /> : <MainDashboard />;
      case 'pending-deletions': return currentUser?.role === 'admin' ? <PendingDeletions /> : <MainDashboard />;
      case 'my-requests': return <MyRequests />;
      default: return <MainDashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading demo data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <LoginForm />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {renderCurrentView()}
        <NewTransactionModal isOpen={showNewTransactionModal} onClose={() => setShowNewTransactionModal(false)} />
      </main>
      
      <div className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-900 to-green-800 text-white px-4 py-3 rounded-lg shadow-lg">
        <p className="font-medium text-sm">Demo Mode</p>
        <p className="text-xs">Sample data • No backend required</p>
      </div>
    </div>
  );
}