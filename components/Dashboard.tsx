
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { Customer, HistoryEntry, Settings, Tier, SMSLog } from '../types';
import { AnalyticsCharts } from './AnalyticsCharts';
import { SettingsPage } from './SettingsPage';
import { SMSLogViewer } from './SMSLogViewer';
import { 
  MenuIcon, PowerIcon, ChartLineIcon, PlusIcon, SearchIcon, UsersIcon, PieChartIcon, DownloadIcon,
  WalletIcon, CoinsIcon, ShoppingBagIcon, SettingsIcon, HistoryIcon, SparklesIcon, MessageIcon
} from './Icons';

type UserType = 'admin' | null;

interface DashboardProps {
  userType: UserType;
  onLogout: () => void;
  onSignIn: () => void;
}

const MOCK_CUSTOMERS: Customer[] = [
  {
    mobile: '9876543210',
    name: 'Aisha Sharma',
    pin: '9876', // First 4 digits of mobile
    points: 7500,
    totalSpent: 62000,
    spendingTier: 'Platinum',
    pointsTier: 'Platinum',
    history: [
      { date: new Date('2024-05-10').toISOString(), bill: 25000, points: 500, type: 'earn', discountApplied: 1500 },
      { date: new Date('2024-06-22').toISOString(), bill: 18000, points: 200, type: 'earn', discountApplied: 1000 },
      { date: new Date('2024-07-15').toISOString(), bill: 19000, points: -1000, type: 'redeem', discountApplied: 2500 },
    ],
  },
  {
    mobile: '8765432109',
    name: 'Rohan Verma',
    pin: '8765', // First 4 digits of mobile
    points: 1500,
    totalSpent: 12500,
    spendingTier: 'Gold',
    pointsTier: 'Gold',
    history: [
      { date: new Date('2024-06-05').toISOString(), bill: 7000, points: 700, type: 'earn', discountApplied: 350 },
      { date: new Date('2024-07-20').toISOString(), bill: 5500, points: 800, type: 'earn', discountApplied: 275 },
    ],
  },
  {
    mobile: '7654321098',
    name: 'Priya Mehta',
    pin: '7654', // First 4 digits of mobile
    points: 350,
    totalSpent: 3200,
    spendingTier: 'Silver',
    pointsTier: 'Silver',
    history: [
      { date: new Date('2024-07-18').toISOString(), bill: 3200, points: 350, type: 'earn', discountApplied: 160 },
    ],
  },
  {
    mobile: '6543210987',
    name: 'Karan Singh',
    pin: '6543', // First 4 digits of mobile
    points: 80,
    totalSpent: 950,
    spendingTier: 'Bronze',
    pointsTier: 'Bronze',
    history: [
       { date: new Date('2024-07-25').toISOString(), bill: 950, points: 80, type: 'earn', discountApplied: 0 },
    ],
  },
  {
    mobile: '5432109876',
    name: 'Sneha Gupta',
    pin: '5432', // First 4 digits of mobile
    points: 850,
    totalSpent: 4800,
    spendingTier: 'Silver',
    pointsTier: 'Bronze',
    history: [
      { date: new Date('2024-07-01').toISOString(), bill: 1200, points: 120, type: 'earn', discountApplied: 60 },
      { date: new Date('2024-07-11').toISOString(), bill: 1500, points: 150, type: 'earn', discountApplied: 75 },
      { date: new Date('2024-07-21').toISOString(), bill: 2100, points: 580, type: 'earn', discountApplied: 105 },
    ],
  },
];


const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: ChartLineIcon },
  { id: 'transaction', label: 'Transaction', icon: PlusIcon },
  { id: 'search', label: 'Search', icon: SearchIcon },
  { id: 'customers', label: 'Customers', icon: UsersIcon },
  { id: 'history', label: 'History', icon: HistoryIcon },
  { id: 'analytics', label: 'Analytics', icon: PieChartIcon },
  { id: 'sms', label: 'SMS Logs', icon: MessageIcon },
  { id: 'ai_analysis', label: 'AI Analysis', icon: SparklesIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

const DEFAULT_SETTINGS: Settings = {
  spendingTiers: { Platinum: 50000, Gold: 10000, Silver: 2000, Bronze: 0 },
  pointsTiers: { Platinum: 5000, Gold: 1000, Silver: 200, Bronze: 0 },
  discounts: { Platinum: 15, Gold: 10, Silver: 5, Bronze: 0 },
};

const calculateTier = (value: number, tiers: { [key in Tier]: number }): Tier => {
    if (value >= tiers.Platinum) return 'Platinum';
    if (value >= tiers.Gold) return 'Gold';
    if (value >= tiers.Silver) return 'Silver';
    return 'Bronze';
};

// TopBar Component
const TopBar: React.FC<{ onToggleSidebar: () => void, onLogout: () => void }> = React.memo(({ onToggleSidebar, onLogout }) => (
  <header className="fixed top-0 left-0 w-full h-16 bg-white/80 backdrop-blur-lg border-b border-neutral-200 flex justify-between items-center px-5 z-40">
    <div className="flex items-center gap-4">
      <button onClick={onToggleSidebar} className="text-neutral-600 hover:text-black">
        <MenuIcon className="w-6 h-6" />
      </button>
      <div className="text-xl text-black">Pay<span className="italic">Loop</span></div>
    </div>
    <div className="flex items-center gap-4">
      <div className="hidden sm:block border border-neutral-200 px-4 py-1.5 rounded-full text-xs uppercase tracking-wider text-neutral-500">
        Administrator
      </div>
      <button onClick={onLogout} className="flex items-center gap-2 border border-neutral-200 px-3 py-2 rounded-md text-sm text-neutral-500 hover:border-black hover:text-black transition-colors">
        <PowerIcon className="w-4 h-4" />
        <span className="hidden md:inline">Exit</span>
      </button>
    </div>
  </header>
));

// Sidebar Component
const Sidebar: React.FC<{ isCollapsed: boolean, activeSection: string, onNavigate: (sectionId: string) => void }> = React.memo(({ isCollapsed, activeSection, onNavigate }) => (
  <aside className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-neutral-200 z-30 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-60'}`}>
    <nav className="mt-4">
      {NAV_ITEMS.map(item => (
        <a
          key={item.id}
          href="#"
          onClick={(e) => { e.preventDefault(); onNavigate(item.id); }}
          className={`flex items-center gap-4 py-4 px-5 text-neutral-500 hover:bg-neutral-100 hover:text-black transition-colors relative ${activeSection === item.id ? 'text-black bg-neutral-100' : ''}`}
        >
          {activeSection === item.id && <div className="absolute left-0 top-0 h-full w-1 bg-black"></div>}
          <item.icon className="w-5 h-5 shrink-0" />
          <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>{item.label}</span>
        </a>
      ))}
    </nav>
  </aside>
));

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white border border-neutral-200 p-6 transition-colors hover:border-neutral-300 ${className}`}>
        {children}
    </div>
);

const StatCard: React.FC<{ label: string, value: string | number }> = ({ label, value }) => (
    <Card>
        <span className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">{label}</span>
        <div className="text-4xl text-black">{value}</div>
    </Card>
);

const Dashboard: React.FC<DashboardProps> = ({ userType, onLogout, onSignIn }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);
  const [activeSection, setActiveSection] = useState('overview');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const db = localStorage.getItem('loyaltyDB');
    const storedSettings = localStorage.getItem('loyaltySettings');
    const storedSmsLogs = localStorage.getItem('smsLogs');
    
    if (!db) {
        setCustomers(MOCK_CUSTOMERS);
        setSettings(DEFAULT_SETTINGS);
        setSmsLogs([]);
    } else {
        setCustomers(JSON.parse(db));
        setSettings(storedSettings ? JSON.parse(storedSettings) : DEFAULT_SETTINGS);
        setSmsLogs(storedSmsLogs ? JSON.parse(storedSmsLogs) : []);
    }
    
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const updatedCustomers = customers.map(c => ({
        ...c,
        spendingTier: calculateTier(c.totalSpent, settings.spendingTiers),
        pointsTier: calculateTier(c.points, settings.pointsTiers),
      }));
      localStorage.setItem('loyaltyDB', JSON.stringify(updatedCustomers));
      localStorage.setItem('loyaltySettings', JSON.stringify(settings));
      localStorage.setItem('smsLogs', JSON.stringify(smsLogs));
    }
  }, [customers, settings, smsLogs, isMounted]);

  const stats = useMemo(() => ({
    totalCustomers: customers.length,
    totalRevenue: customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0),
    totalPoints: customers.reduce((acc, c) => acc + (c.points || 0), 0),
  }), [customers]);

  const analyticsMetrics = useMemo(() => {
    const totalTxns = customers.reduce((acc, c) => acc + (c.history?.length || 0), 0);
    return {
      aov: totalTxns > 0 ? Math.round(stats.totalRevenue / totalTxns) : 0,
      totalTxns,
      topCustomers: [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5),
    };
  }, [customers, stats.totalRevenue]);
  
  const logSms = (customerName: string, mobile: string, message: string) => {
      const newLog: SMSLog = {
          date: new Date().toISOString(),
          recipientName: customerName,
          recipientMobile: mobile,
          message: message,
          status: 'Sent'
      };
      setSmsLogs(prevLogs => [newLog, ...prevLogs]);
  }

  const handleTransaction = useCallback((
    mobile: string, name: string, pin: string, 
    details: { billAmount: number, amountGiven: number, pointsToRedeem: number }
  ): boolean => {
    let success = false;
    setCustomers(prev => {
        const { billAmount, amountGiven, pointsToRedeem } = details;
        const existingCustomerIndex = prev.findIndex(c => c.mobile === mobile);

        if (existingCustomerIndex === -1) { // New Customer
             const finalBill = billAmount;
             const pointsEarned = amountGiven - finalBill;
             if (pointsEarned < 0) return prev;

             const newHistoryEntry: HistoryEntry = { date: new Date().toISOString(), bill: finalBill, points: Math.floor(pointsEarned), type: 'earn', discountApplied: 0 };
             const newCustomer: Customer = {
                mobile, name, pin, points: Math.floor(pointsEarned), totalSpent: finalBill, history: [newHistoryEntry],
                spendingTier: calculateTier(finalBill, settings.spendingTiers),
                pointsTier: calculateTier(Math.floor(pointsEarned), settings.pointsTiers),
             };
             
             // AUTOMATED SMS LOG: Welcome Message
             const welcomeMsg = `Welcome to PayLoop, ${name}! You've earned your first ${Math.floor(pointsEarned)} points.`;
             logSms(name, mobile, welcomeMsg);
             
             success = true;
             return [...prev, newCustomer];
        }
        
        const updatedCustomers = [...prev];
        const cust = { ...updatedCustomers[existingCustomerIndex] };

        const tierRank: { [key in Tier]: number } = { Bronze: 0, Silver: 1, Gold: 2, Platinum: 3 };
        const tiers: Tier[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];
        const spendingRank = tierRank[cust.spendingTier];
        const pointsRank = tierRank[cust.pointsTier];
        const finalTier = tiers[Math.max(spendingRank, pointsRank)];
        const tierDiscountPercent = settings.discounts[finalTier] || 0;
        
        const shouldApplyTierDiscount = pointsToRedeem > 0;
        const tierDiscountAmount = shouldApplyTierDiscount ? (billAmount * tierDiscountPercent) / 100 : 0;
        
        const billAfterTierDiscount = billAmount - tierDiscountAmount;
        
        const pointsRedemptionDiscount = Math.min(cust.points, pointsToRedeem, billAfterTierDiscount);

        const finalBill = billAmount - tierDiscountAmount - pointsRedemptionDiscount;
        const totalDiscountApplied = tierDiscountAmount + pointsRedemptionDiscount;

        if (amountGiven < finalBill) return prev;

        const pointsEarned = amountGiven - finalBill;
        const netPointsChange = Math.floor(pointsEarned - pointsRedemptionDiscount);
        
        const newHistoryEntry: HistoryEntry = { 
            date: new Date().toISOString(), 
            bill: finalBill, 
            points: netPointsChange, 
            type: netPointsChange >= 0 ? 'earn' : 'redeem', 
            discountApplied: totalDiscountApplied 
        };
        
        cust.points += netPointsChange;
        cust.totalSpent += finalBill;
        cust.history = cust.history ? [...cust.history, newHistoryEntry] : [newHistoryEntry];
        
        cust.spendingTier = calculateTier(cust.totalSpent, settings.spendingTiers);
        cust.pointsTier = calculateTier(cust.points, settings.pointsTiers);
        
        // AUTOMATED SMS LOG: Transaction Message
        const txMsg = `Hi ${cust.name}, thank you for your purchase of ₹${finalBill.toLocaleString()}. Your new points balance is ${cust.points.toLocaleString()}.`;
        logSms(cust.name, cust.mobile, txMsg);

        updatedCustomers[existingCustomerIndex] = cust;

        success = true;
        return updatedCustomers;
    });
    return success;
  }, [settings]);
  
  const handleExport = () => {
    let csv = "Name,Mobile,TotalSpent,Points,SpendingTier,PointsTier\n";
    customers.forEach(c => {
        csv += `${c.name},${c.mobile},${c.totalSpent},${c.points},${c.spendingTier},${c.pointsTier}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loyalty_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const PageTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h1 className="text-4xl text-black mb-8 pb-6 border-b border-neutral-200">{children}</h1>
  );

  const Section: React.FC<{id: string, children: React.ReactNode}> = ({id, children}) => (
    <section className={`${activeSection === id ? 'block' : 'hidden'} transition-opacity duration-500 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
        {children}
    </section>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <TopBar onToggleSidebar={() => setSidebarCollapsed(p => !p)} onLogout={onLogout} />
      <Sidebar isCollapsed={isSidebarCollapsed} activeSection={activeSection} onNavigate={setActiveSection} />
      <main className={`pt-24 px-4 sm:px-8 pb-8 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-16' : 'ml-60'}`}>
        <Section id="overview">
            <PageTitle>System Overview</PageTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard label="Total Users" value={stats.totalCustomers.toLocaleString()} />
                <StatCard label="Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} />
                <StatCard label="Active Points" value={stats.totalPoints.toLocaleString()} />
            </div>
        </Section>
        <Section id="transaction">
          <PageTitle>New Transaction</PageTitle>
          <TransactionForm customers={customers} onTransaction={handleTransaction} settings={settings} />
        </Section>
        <Section id="search"><PageTitle>Database Search</PageTitle><SearchSection customers={customers}/></Section>
        <Section id="customers"><PageTitle>Registered Users</PageTitle><CustomersSection customers={customers}/></Section>
        <Section id="history"><PageTitle>Transaction History</PageTitle><TransactionHistorySection customers={customers}/></Section>
        <Section id="analytics">
            <div className="flex justify-between items-end mb-8 pb-6 border-b border-neutral-200">
                <h1 className="text-4xl text-black">Intelligence Hub</h1>
                <button onClick={handleExport} className="flex items-center gap-2 bg-neutral-100 text-black px-4 py-2 rounded-md text-sm font-semibold hover:bg-neutral-200 transition-colors">
                    <DownloadIcon className="w-4 h-4" /> Export CSV
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <AnalyticsStatCard icon={WalletIcon} label="Avg. Order Value" value={`₹${analyticsMetrics.aov.toLocaleString()}`} />
                <AnalyticsStatCard icon={CoinsIcon} label="Points Liability" value={stats.totalPoints.toLocaleString()} />
                <AnalyticsStatCard icon={ShoppingBagIcon} label="Total Transactions" value={analyticsMetrics.totalTxns.toLocaleString()} />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                <Card className="xl:col-span-2 h-[350px] flex flex-col">
                  <h3 className="chart-title">Revenue Velocity</h3>
                  <div className="flex-grow w-full h-full min-h-0">
                    <AnalyticsCharts customers={customers} />
                  </div>
                </Card>
                <Card className="xl:col-span-1 h-[350px] flex flex-col">
                  <h3 className="chart-title">Customer Segments</h3>
                  <div className="flex-grow w-full h-full min-h-0">
                    <AnalyticsCharts customers={customers} chartType="pie" />
                  </div>
                </Card>
            </div>
            <Card><h3 className="chart-title">Top 5 "Whale" Customers</h3><TopCustomersTable customers={analyticsMetrics.topCustomers} /></Card>
        </Section>
        <Section id="sms"><PageTitle>SMS Logs</PageTitle><SMSLogViewer smsLogs={smsLogs}/></Section>
        <Section id="ai_analysis"><PageTitle>AI-Powered Insights</PageTitle><AIAnalysisSection customers={customers} /></Section>
        <Section id="settings"><PageTitle>System Settings</PageTitle><SettingsPage settings={settings} onSave={setSettings}/></Section>
      </main>
    </div>
  );
};

// Sub-components
const TransactionForm: React.FC<{customers: Customer[], onTransaction: Function, settings: Settings}> = ({customers, onTransaction, settings}) => {
    const [mobile, setMobile] = useState('');
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [billAmount, setBillAmount] = useState('');
    const [amountGiven, setAmountGiven] = useState('');
    const [usePoints, setUsePoints] = useState(false);
    const [error, setError] = useState('');

    const [isPinVisible, setPinVisible] = useState(false);
    const [isBillingVisible, setBillingVisible] = useState(false);
    
    const nameInputRef = useRef<HTMLInputElement>(null);
    const pinInputRef = useRef<HTMLInputElement>(null);
    const billAmountInputRef = useRef<HTMLInputElement>(null);

    const existingCustomer = useMemo(() => customers.find(c => c.mobile === mobile), [customers, mobile]);
    
    const tierRank: { [key in Tier]: number } = { Bronze: 0, Silver: 1, Gold: 2, Platinum: 3 };
    const tiers: Tier[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];

    const finalTier = useMemo<Tier>(() => {
        if (!existingCustomer) return 'Bronze';
        const spendingRank = tierRank[existingCustomer.spendingTier];
        const pointsRank = tierRank[existingCustomer.pointsTier];
        return tiers[Math.max(spendingRank, pointsRank)];
    }, [existingCustomer]);
    
    const tierDiscountPercent = useMemo(() => {
        if (!existingCustomer) return 0;
        return settings.discounts[finalTier] || 0;
    }, [existingCustomer, finalTier, settings.discounts]);

    // **NEW LOGIC**: Tier discount is only applied if 'usePoints' is checked.
    const tierDiscountAmount = useMemo(() => {
        if (!usePoints) return 0;
        return (Number(billAmount) * tierDiscountPercent) / 100;
    }, [billAmount, tierDiscountPercent, usePoints]);

    const billAfterTierDiscount = useMemo(() => {
        return Number(billAmount) - tierDiscountAmount;
    }, [billAmount, tierDiscountAmount]);

    const pointsToRedeem = useMemo(() => usePoints ? Math.min(existingCustomer?.points || 0, billAfterTierDiscount) : 0, [usePoints, existingCustomer, billAfterTierDiscount]);
    
    const totalDiscount = tierDiscountAmount + pointsToRedeem;
    
    const finalBill = useMemo(() => Math.max(0, Number(billAmount) - totalDiscount), [billAmount, totalDiscount]);
    
    const pointsEarned = useMemo(() => Math.floor(Math.max(0, Number(amountGiven) - finalBill)), [amountGiven, finalBill]);
    
    const isFormReady = isBillingVisible && billAmount && amountGiven && Number(amountGiven) >= finalBill;

    const resetForm = useCallback(() => {
        setMobile(''); setName(''); setPin(''); setBillAmount(''); setAmountGiven(''); setUsePoints(false);
        setError(''); setPinVisible(false); setBillingVisible(false);
    }, []);

    const handleMobileBlur = () => {
        if (mobile.length >= 10) {
            setError('');
            setPinVisible(true);
            if (existingCustomer) {
                setName(existingCustomer.name);
                setTimeout(() => pinInputRef.current?.focus(), 100);
            } else {
                setName('');
                setTimeout(() => nameInputRef.current?.focus(), 100);
            }
        } else {
            setPinVisible(false);
            setBillingVisible(false);
        }
    };
    
    const handlePinChange = (value: string) => {
        setPin(value);
        if (value.length === 4) {
            if((existingCustomer && existingCustomer.pin === value) || !existingCustomer) {
                setError('');
                setBillingVisible(true);
                setTimeout(() => billAmountInputRef.current?.focus(), 100);
            } else {
                setError('Incorrect PIN for existing customer.');
                setBillingVisible(false);
            }
        } else {
            setBillingVisible(false);
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!isFormReady) {
            if(Number(amountGiven) < finalBill) setError(`Amount given (₹${Number(amountGiven).toLocaleString()}) is less than the final bill of ₹${finalBill.toFixed(2)}.`);
            else setError('Please fill all required fields.');
            return;
        }

        const success = onTransaction(mobile, name, pin, { 
            billAmount: Number(billAmount), 
            amountGiven: Number(amountGiven), 
            pointsToRedeem
        });

        if (success) {
            alert('Transaction Successful!');
            resetForm();
        } else {
            setError('Transaction failed. Please check the details and try again.');
        }
    }

    return (
        <Card className="max-w-xl">
            <form onSubmit={handleSubmit} noValidate>
                {/* Customer Identification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div><label className="input-label">Mobile Number</label><input type="text" value={mobile} onChange={e => setMobile(e.target.value)} onBlur={handleMobileBlur} placeholder="Enter 10 digits..." className="input-field"/></div>
                    <div><label className="input-label">Name</label><input ref={nameInputRef} type="text" value={name} onChange={e => setName(e.target.value)} placeholder={isPinVisible && !existingCustomer ? 'Enter Name for new user' : ''} className="input-field" disabled={!!existingCustomer} required={isPinVisible && !existingCustomer}/></div>
                </div>

                {/* PIN Section (Animated) */}
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isPinVisible ? 'max-h-40 opacity-100 mt-6 pt-6 border-t border-dashed border-neutral-200' : 'max-h-0 opacity-0'}`}>
                    <label className="input-label text-center">{existingCustomer ? 'Verify Security PIN' : 'Set a New 4-Digit PIN'}</label>
                    <input ref={pinInputRef} type="password" value={pin} onChange={e => handlePinChange(e.target.value)} maxLength={4} className="input-field pin-field max-w-xs mx-auto" placeholder="••••" required/>
                </div>

                {/* Billing Section (Animated) */}
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isBillingVisible ? 'max-h-[40rem] opacity-100 mt-6 pt-6 border-t border-dashed border-neutral-200' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div><label className="input-label">Bill Amount (₹)</label><input ref={billAmountInputRef} type="number" value={billAmount} onChange={e => setBillAmount(e.target.value)} placeholder="e.g. 950" className="input-field" required/></div>
                        <div><label className="input-label">Amount Given (₹)</label><input type="number" value={amountGiven} onChange={e => setAmountGiven(e.target.value)} placeholder="e.g. 1000" className="input-field" required/></div>
                    </div>
                    {existingCustomer && (
                        <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-md mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-neutral-500 uppercase tracking-wider">Effective Tier</span>
                                <TierBadge tier={finalTier} />
                            </div>
                            <p className="text-xs text-neutral-500">
                                Based on the higher of Spending Tier ({existingCustomer.spendingTier}) and Points Tier ({existingCustomer.pointsTier}).
                            </p>
                        </div>
                    )}
                    {existingCustomer && existingCustomer.points > 0 && (
                        <div className="flex items-center justify-between bg-neutral-50 p-4 border border-neutral-200 rounded-md mb-6">
                           <label htmlFor="use-points-checkbox" className="flex-grow cursor-pointer">
                                <span className="font-semibold text-black">Redeem Points & Get Tier Discount</span>
                                <p className="text-sm text-neutral-600">Available: <span className="font-bold">{existingCustomer.points.toLocaleString()}</span> points</p>
                           </label>
                           <input 
                                id="use-points-checkbox"
                                type="checkbox" 
                                checked={usePoints}
                                onChange={(e) => setUsePoints(e.target.checked)}
                                className="w-5 h-5 rounded bg-transparent border-neutral-300 focus:ring-black text-black shrink-0"
                            />
                        </div>
                    )}
                    {/* NEW: Premium Bill Summary */}
                    <div className="bg-white p-6 border-2 border-dashed border-neutral-300 rounded-lg mt-4 space-y-4">
                        <h4 className="text-center text-lg text-black">Bill Summary</h4>
                        <div className="text-sm text-neutral-600 space-y-2 font-medium">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₹{Number(billAmount || 0).toFixed(2)}</span>
                            </div>
                            {usePoints && tierDiscountAmount > 0 && (
                                <div className="flex justify-between text-blue-600">
                                    <span>{finalTier} Tier Discount ({tierDiscountPercent}%)</span>
                                    <span>- ₹{tierDiscountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            {pointsToRedeem > 0 && (
                                <div className="flex justify-between text-red-500">
                                    <span>Points Redeemed</span>
                                    <span>- ₹{pointsToRedeem.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                        <hr className="border-dashed border-neutral-300 my-2" />
                        <div className="flex justify-between items-center font-bold text-black text-xl">
                            <span>Total Payable</span>
                            <span>₹{finalBill.toFixed(2)}</span>
                        </div>
                        {pointsEarned > 0 && <p className="text-center text-sm text-green-600 font-semibold">+ {pointsEarned.toLocaleString()} Points Earned</p>}
                        {usePoints && tierDiscountAmount > 0 && (
                            <p className="text-xs text-center text-neutral-500 pt-2">
                                Tier discount applied for redeeming points.
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-8">
                    <button type="submit" disabled={!isFormReady} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">Process Transaction</button>
                    {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
                </div>
            </form>
        </Card>
    );
};

const TIER_COLORS: { [key in Tier]: string } = { Platinum: 'bg-black text-white border-black', Gold: 'bg-neutral-700 text-white border-neutral-700', Silver: 'bg-neutral-200 text-black border-neutral-300', Bronze: 'bg-white text-neutral-500 border-neutral-300' };
const TierBadge: React.FC<{ tier: Tier }> = ({ tier }) => <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${TIER_COLORS[tier]}`}>{tier}</span>;

const SearchSection: React.FC<{customers: Customer[]}> = ({customers}) => {
    const [searchMobile, setSearchMobile] = useState('');
    const [foundCustomer, setFoundCustomer] = useState<Customer | null | undefined>(undefined);

    const handleSearch = (e?: React.FormEvent) => {
        if(e) e.preventDefault();
        setFoundCustomer(customers.find(c => c.mobile === searchMobile) || null);
    }

    return (
        <Card>
            <form onSubmit={handleSearch}><label className="input-label">Find Customer</label><div className="flex gap-4"><input type="text" value={searchMobile} onChange={e => setSearchMobile(e.target.value)} placeholder="Enter Mobile Number..." className="input-field"/><button type="submit" className="btn-secondary">Search</button></div></form>
            {foundCustomer !== undefined && (<div className="mt-6">{foundCustomer ? (
                <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-md">
                    <div className="flex justify-between items-start"><div><h3 className="text-xl font-semibold text-black">{foundCustomer.name}</h3><div className="flex gap-2 mt-2"><TierBadge tier={foundCustomer.spendingTier} /><TierBadge tier={foundCustomer.pointsTier} /></div></div><div><p className="text-neutral-500 text-right">Points: <span className="text-black font-semibold">{foundCustomer.points.toLocaleString()}</span></p><p className="text-neutral-500 text-right">Total Spent: <span className="text-black font-semibold">₹{foundCustomer.totalSpent.toLocaleString()}</span></p></div></div>
                    <h4 className="mt-6 mb-2 text-sm uppercase tracking-wider text-neutral-500">Transaction History</h4>
                    <div className="overflow-x-auto max-h-72"><table className="w-full text-left"><thead><tr><th className="table-header">Date</th><th className="table-header">Details</th><th className="table-header text-right">Points Change</th></tr></thead>
                        <tbody>{foundCustomer.history?.length > 0 ? [...foundCustomer.history].reverse().map((entry, index) => {
                            const originalBill = entry.bill + (entry.discountApplied || 0);
                            return (<tr key={index} className="border-b border-neutral-200 last:border-b-0">
                                <td className="table-cell text-xs text-neutral-500 whitespace-nowrap">{new Date(entry.date).toLocaleDateString()}</td>
                                <td className="table-cell text-xs">
                                    <p className="text-black">Bill: ₹{originalBill.toLocaleString()}</p>
                                    {entry.discountApplied ? <p className="text-red-500">Discount: -₹{entry.discountApplied.toLocaleString()}</p> : null}
                                    <p className="font-semibold text-neutral-700">Final: ₹{entry.bill.toLocaleString()}</p>
                                </td>
                                <td className={`table-cell font-semibold text-xs text-right ${entry.points >= 0 ? 'text-green-500' : 'text-red-500'}`}>{entry.points >= 0 ? `+${entry.points.toLocaleString()}` : entry.points.toLocaleString()}</td>
                            </tr>);
                        }) : (<tr><td colSpan={3} className="text-center py-4 text-neutral-400 text-sm">No history found.</td></tr>)}</tbody>
                    </table></div>
                </div>) : (<p className="text-red-500 mt-4">User not found.</p>)}</div>)}
        </Card>
    );
};

const CustomersSection: React.FC<{ customers: Customer[] }> = ({ customers }) => (
    <Card><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr><th className="table-header">Name</th><th className="table-header">Mobile</th><th className="table-header">Tiers (Spend/Points)</th><th className="table-header">Points</th><th className="table-header">Total Spend</th></tr></thead>
        <tbody>{customers.length > 0 ? customers.map(c => (<tr key={c.mobile} className="border-b border-neutral-200 last:border-b-0"><td className="table-cell">{c.name}</td><td className="table-cell font-mono">{c.mobile}</td><td className="table-cell"><div className="flex gap-2"><TierBadge tier={c.spendingTier} /><TierBadge tier={c.pointsTier} /></div></td><td className="table-cell">{c.points.toLocaleString()}</td><td className="table-cell">₹{c.totalSpent.toLocaleString()}</td></tr>)) : (<tr><td colSpan={5} className="text-center py-8 text-neutral-400">No records found.</td></tr>)}</tbody>
    </table></div></Card>
);

const TransactionHistorySection: React.FC<{ customers: Customer[] }> = ({ customers }) => {
    const allTransactions = useMemo(() => {
        return customers
            .flatMap(customer => 
                customer.history.map(entry => ({
                    ...entry,
                    customerName: customer.name,
                    mobile: customer.mobile,
                }))
            )
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [customers]);

    return (
        <Card>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="table-header">Date</th>
                            <th className="table-header">Customer</th>
                            <th className="table-header">Details</th>
                            <th className="table-header text-right">Points Change</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allTransactions.length > 0 ? allTransactions.map((entry, index) => {
                            const originalBill = entry.bill + (entry.discountApplied || 0);
                            return (
                                <tr key={`${entry.date}-${index}`} className="border-b border-neutral-200 last:border-b-0">
                                    <td className="table-cell text-xs text-neutral-500 whitespace-nowrap">
                                        {new Date(entry.date).toLocaleString()}
                                    </td>
                                    <td className="table-cell">
                                        <p className="font-semibold text-black">{entry.customerName}</p>
                                        <p className="text-xs text-neutral-500 font-mono">{entry.mobile}</p>
                                    </td>
                                    <td className="table-cell text-xs">
                                        <p className="text-black">Bill: ₹{originalBill.toLocaleString()}</p>
                                        {entry.discountApplied ? <p className="text-red-500">Discount: -₹{entry.discountApplied.toLocaleString()}</p> : null}
                                        <p className="font-semibold text-neutral-700">Final Paid: ₹{entry.bill.toLocaleString()}</p>
                                    </td>
                                    <td className={`table-cell font-semibold text-xs text-right ${entry.points >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {entry.points >= 0 ? `+${entry.points.toLocaleString()}` : entry.points.toLocaleString()}
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-neutral-400">No transactions found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const AIAnalysisSection: React.FC<{ customers: Customer[] }> = ({ customers }) => {
    const [query, setQuery] = useState('');
    const [analysisResult, setAnalysisResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalysis = async () => {
        if (!query.trim()) {
            setError("Please enter a question.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                You are an expert business analyst for a customer loyalty program.
                Analyze the following customer data and answer the user's question.
                Provide a concise, insightful, and easy-to-understand analysis. Format your response with markdown.

                CUSTOMER DATA (JSON):
                ${JSON.stringify(customers, null, 2)}

                USER QUESTION:
                "${query}"
            `;
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });
            setAnalysisResult(response.text || '');
        } catch (e) {
            console.error("AI Analysis Error:", e);
            setError("Sorry, an error occurred while generating the analysis. Please check your API key and try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const exampleQueries = [
        "Who are my top 3 most valuable customers based on total spending?",
        "What is the average spending per customer in the Gold tier?",
        "Suggest a marketing campaign to re-engage Bronze tier customers."
    ];

    return (
        <Card>
            <h3 className="text-2xl text-black">AI-Powered Business Insights</h3>
            <p className="text-neutral-500 mt-1">Ask questions about your customer data and get instant analysis.</p>
            
            <div className="mt-6">
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., Which customers haven't made a purchase in the last month?"
                    className="input-field w-full h-24 resize-none"
                    disabled={isLoading}
                />
                 <div className="text-xs text-neutral-500 mt-2">
                    Try an example:
                    <div className="flex flex-wrap gap-2 mt-1">
                        {exampleQueries.map((q, i) => (
                            <button key={i} onClick={() => setQuery(q)} className="bg-neutral-100 text-black px-2 py-1 rounded-md hover:bg-neutral-200 text-xs transition-colors" disabled={isLoading}>
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <button onClick={handleAnalysis} disabled={isLoading} className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <SparklesIcon className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`}/>
                    {isLoading ? 'Analyzing...' : 'Generate Analysis'}
                </button>
            </div>

            {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}

            {analysisResult && (
                <div className="mt-6 pt-6 border-t border-neutral-200">
                    <h4 className="text-lg text-black mb-2">Analysis Result:</h4>
                    <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-md">
                       <pre className="whitespace-pre-wrap font-sans text-sm text-black leading-relaxed">{analysisResult}</pre>
                    </div>
                </div>
            )}
        </Card>
    );
};


const AnalyticsStatCard: React.FC<{icon: React.ElementType, label: string, value: string | number}> = ({icon: Icon, label, value}) => (
    <Card className="flex items-center gap-4 p-4"><div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black"><Icon className="w-6 h-6" /></div><div><span className="block text-xs text-neutral-500 uppercase tracking-wider">{label}</span><div className="text-2xl font-semibold text-black">{value}</div></div></Card>
);

const TopCustomersTable: React.FC<{ customers: Customer[] }> = ({ customers }) => (
    <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr><th className="table-header">Rank</th><th className="table-header">Name</th><th className="table-header">Tier</th><th className="table-header">Spent</th><th className="table-header">Points</th></tr></thead>
        <tbody>{customers.length > 0 ? customers.map((c, i) => (<tr key={c.mobile} className="border-b border-neutral-200 last:border-b-0"><td className="table-cell"><span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${i<3 ? ['bg-black text-white','bg-neutral-600 text-white','bg-neutral-200 text-black'][i] : 'bg-neutral-100 text-neutral-500'}`}>{i + 1}</span></td><td className="table-cell">{c.name}</td><td className="table-cell"><TierBadge tier={c.spendingTier} /></td><td className="table-cell font-semibold text-black">₹{c.totalSpent.toLocaleString()}</td><td className="table-cell text-neutral-500">{c.points.toLocaleString()}</td></tr>)) : (<tr><td colSpan={5} className="text-center py-8 text-neutral-400">No data available.</td></tr>)}</tbody>
    </table></div>
);

export default Dashboard;

// Global styles
const GlobalStyles = () => (<style>{`.input-label{display:block;font-size:.75rem;color:#6b7280;margin-bottom:.5rem;text-transform:uppercase;letter-spacing:.05em}.input-field{width:100%;background-color:transparent;border:1px solid #d1d5db;color:black;padding:.5rem .75rem;border-radius:.375rem;transition:all .15s cubic-bezier(.4,0,.2,1)}.input-field:focus{outline:0;border-color:black;box-shadow:0 0 0 2px rgba(0,0,0,0.1)}.input-field.pin-field{text-align:center;font-size:1.5rem;letter-spacing:.5em}.btn-primary{background-color:black;color:white;font-weight:700;padding:.75rem 1.5rem;border-radius:.375rem;transition:all .2s}.btn-primary:hover{background-color:#374151}.btn-secondary{background-color:#f3f4f6;color:black;font-weight:600;padding:.5rem 1rem;border-radius:.375rem;transition:background-color .2s}.btn-secondary:hover{background-color:#e5e7eb}.table-header{padding:.75rem 1rem;font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;border-bottom:1px solid #e5e7eb}.table-cell{padding:1rem;font-size:.875rem}.chart-title{font-size:1rem;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:1rem}`}</style>);
document.head.appendChild(Object.assign(document.createElement('style'),{textContent:GlobalStyles().props.children}));
