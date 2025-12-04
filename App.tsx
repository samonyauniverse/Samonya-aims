import React, { useState, useEffect } from 'react';
import { TOOLS, COMPANY_INFO, INSPIRATION_DATA, LEGAL_CONTENT } from './constants';
import { ToolId, PricingPlan, Transaction, User } from './types';
import PricingModal from './components/PricingModal';
import SamnChat from './components/SamnChat';
import ToolLayout from './components/ToolLayout';
import AuthScreen from './components/AuthScreen';
import LegalModal from './components/LegalModal';
import SettingsView from './components/SettingsView';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [currentView, setCurrentView] = useState<ToolId | 'DASHBOARD' | 'ACCOUNT' | 'SETTINGS'>('DASHBOARD');
  const [showPricing, setShowPricing] = useState(false);
  const [legalModalType, setLegalModalType] = useState<keyof typeof LEGAL_CONTENT | null>(null);
  
  const [dailyInspiration, setDailyInspiration] = useState<{quote: string, tip: string, idea: string}>({quote: '', tip: '', idea: ''});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clientProfile, setClientProfile] = useState<Record<string, string>>({});

  // Initialize random inspiration
  useEffect(() => {
    const quote = INSPIRATION_DATA.quotes[Math.floor(Math.random() * INSPIRATION_DATA.quotes.length)];
    const tip = INSPIRATION_DATA.marketingTips[Math.floor(Math.random() * INSPIRATION_DATA.marketingTips.length)];
    const idea = INSPIRATION_DATA.designIdeas[Math.floor(Math.random() * INSPIRATION_DATA.designIdeas.length)];
    setDailyInspiration({ quote, tip, idea });
  }, []);

  // Handle Dark Mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleLogin = (details: { name: string; phone: string; method: string }) => {
    setIsLoading(true);
    // Simulate API login call
    setTimeout(() => {
      setUser({
        name: details.name,
        email: 'user@example.com', // In a real app, this comes from the provider or input
        phone: details.phone,
        credits: 6, // Free Tier Default
        subscriptionTier: 'FREE',
        lastActivity: new Date()
      });
      setTransactions([{ 
        id: 'init', 
        date: new Date(), 
        type: 'DEPOSIT', 
        description: 'Welcome Bonus', 
        amount: 6 
      }]);
      setIsLoading(false);
    }, 1500);
  };

  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
        setUser(null);
        setCurrentView('DASHBOARD');
        setTransactions([]);
        setClientProfile({});
        setIsLoading(false);
    }, 1000);
  };

  const handlePurchase = (plan: PricingPlan) => {
    if (!user) return;
    setUser(prev => prev ? ({ 
      ...prev, 
      credits: prev.credits + plan.credits,
      subscriptionTier: plan.id
    }) : null);
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date(),
      type: 'DEPOSIT',
      description: `Verified Purchase: ${plan.name}`,
      amount: plan.credits
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleSpendCredits = (amount: number, description: string): boolean => {
    if (!user) return false;
    if (user.credits < amount) {
        setShowPricing(true);
        return false;
    }
    setUser(prev => prev ? ({ ...prev, credits: prev.credits - amount }) : null);
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date(),
      type: 'USAGE',
      description: description,
      amount: -amount
    };
    setTransactions(prev => [newTransaction, ...prev]);
    return true;
  };

  const updateClientMemory = (data: Record<string, string>) => {
    const keysToSave = ['businessName', 'industry', 'audience', 'product', 'targetUser'];
    const newData: Record<string, string> = {};
    
    Object.keys(data).forEach(key => {
        if (keysToSave.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
            newData[key] = data[key];
        }
    });

    if (data['businessName']) newData['businessName'] = data['businessName'];
    if (data['industry']) newData['industry'] = data['industry'];
    if (data['audience']) newData['targetAudience'] = data['audience'];
    if (data['targetUser']) newData['targetAudience'] = data['targetUser'];

    setClientProfile(prev => ({...prev, ...newData}));
    setUser(prev => prev ? ({...prev, lastActivity: new Date()}) : null);
  };

  // Rendering Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
         <div className="w-24 h-24 bg-brand-orange rounded-3xl animate-bounce flex items-center justify-center text-white text-5xl font-bold shadow-2xl mb-6">
           S
         </div>
         <h1 className="text-3xl font-extrabold text-white tracking-widest animate-pulse">SAMONYA</h1>
         <p className="text-brand-orange text-sm font-bold tracking-[0.3em] mt-2">AIMS MARKET</p>
      </div>
    );
  }

  // Auth Screen
  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const renderCurrentTool = () => {
    switch (currentView) {
      case 'SETTINGS':
        return (
            <SettingsView 
                user={user}
                onLogout={handleLogout}
                onBack={() => setCurrentView('DASHBOARD')}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
            />
        );

      case 'ACCOUNT':
        return (
          <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in">
            <button 
              onClick={() => setCurrentView('DASHBOARD')}
              className="mb-6 flex items-center text-gray-500 hover:text-brand-orange transition-colors"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Dashboard
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">Current Balance</h3>
                  <p className={`text-4xl font-bold mt-2 ${user.credits < 5 ? 'text-red-500' : 'text-brand-orange'}`}>{user.credits}</p>
                  <p className="text-xs text-gray-400 mt-1">Credits Available</p>
               </div>
               <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">Membership</h3>
                  <p className="text-xl font-bold mt-2 text-gray-900 dark:text-white">{user.subscriptionTier}</p>
                  {user.subscriptionTier === 'FREE' && <p className="text-xs text-brand-orange mt-1 cursor-pointer hover:underline" onClick={() => setShowPricing(true)}>Activate Premium &rarr;</p>}
               </div>
               <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">Total Activity</h3>
                  <p className="text-xl font-bold mt-2 text-gray-900 dark:text-white">{transactions.filter(t => t.type === 'USAGE').length} Generations</p>
                  <p className="text-xs text-gray-400 mt-1">Lifetime usage</p>
               </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">Transaction History</h2>
                  <button 
                    onClick={() => setShowPricing(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center shadow-sm transition-all"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Top Up
                  </button>
              </div>
              
              <div className="p-0 overflow-x-auto">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-4">Date</th>
                      <th scope="col" className="px-6 py-4">Description</th>
                      <th scope="col" className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{tx.date.toLocaleDateString()} {tx.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{tx.description}</td>
                        <td className={`px-6 py-4 text-right font-bold ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case ToolId.LogoGenerator:
        return (
          <ToolLayout
            tool={TOOLS.find(t => t.id === ToolId.LogoGenerator)!}
            onBack={() => setCurrentView('DASHBOARD')}
            onRequestUpgrade={() => setShowPricing(true)}
            credits={user.credits}
            onSpendCredits={handleSpendCredits}
            userTier={user.subscriptionTier}
            clientMemory={clientProfile}
            onSuccess={updateClientMemory}
            inputs={[
              { name: 'businessName', label: 'Business Name', type: 'text', placeholder: 'e.g. Nairobi Coffees' },
              { name: 'industry', label: 'Industry', type: 'text', placeholder: 'e.g. Hospitality' },
              { name: 'style', label: 'Style Preference', type: 'select', options: ['Modern & Minimal', 'Bold & African', 'Classic & Elegant', 'Fun & Playful'] },
              { name: 'description', label: 'Brief Description', type: 'textarea', placeholder: 'Describe what you do...' },
              { name: 'existingLogo', label: 'Refine Existing Logo (Optional)', type: 'file' },
              { name: 'generateVisual', label: 'Generate Visual AI Logo Image (+2 Credits)', type: 'checkbox' }
            ]}
          />
        );
      case ToolId.SocialMedia:
        return (
          <ToolLayout
            tool={TOOLS.find(t => t.id === ToolId.SocialMedia)!}
            onBack={() => setCurrentView('DASHBOARD')}
            onRequestUpgrade={() => setShowPricing(true)}
            credits={user.credits}
            onSpendCredits={handleSpendCredits}
            userTier={user.subscriptionTier}
            clientMemory={clientProfile}
            onSuccess={updateClientMemory}
            inputs={[
              { name: 'product', label: 'Product/Service', type: 'text', placeholder: 'e.g. Handmade Soap' },
              { name: 'platform', label: 'Platform', type: 'select', options: ['Instagram', 'Facebook', 'TikTok', 'LinkedIn'] },
              { name: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Funny', 'Inspirational', 'Urgent/Sales'] },
              { name: 'audience', label: 'Target Audience', type: 'text', placeholder: 'e.g. Young moms in Nairobi' }
            ]}
          />
        );
      case ToolId.ProductDesc:
        return (
          <ToolLayout
            tool={TOOLS.find(t => t.id === ToolId.ProductDesc)!}
            onBack={() => setCurrentView('DASHBOARD')}
            onRequestUpgrade={() => setShowPricing(true)}
            credits={user.credits}
            onSpendCredits={handleSpendCredits}
            userTier={user.subscriptionTier}
            clientMemory={clientProfile}
            onSuccess={updateClientMemory}
            inputs={[
              { name: 'productName', label: 'Product Name', type: 'text', placeholder: 'e.g. Organic Shea Butter' },
              { name: 'features', label: 'Key Features', type: 'textarea', placeholder: 'List features separated by commas...' },
              { name: 'targetUser', label: 'Ideal Customer', type: 'text', placeholder: 'e.g. People with dry skin' }
            ]}
          />
        );
      case ToolId.AdCreator:
        return (
          <ToolLayout
            tool={TOOLS.find(t => t.id === ToolId.AdCreator)!}
            onBack={() => setCurrentView('DASHBOARD')}
            onRequestUpgrade={() => setShowPricing(true)}
            credits={user.credits}
            onSpendCredits={handleSpendCredits}
            userTier={user.subscriptionTier}
            clientMemory={clientProfile}
            onSuccess={updateClientMemory}
            inputs={[
              { name: 'product', label: 'Product/Offer', type: 'text', placeholder: 'e.g. 50% Off Sneakers' },
              { name: 'platform', label: 'Ad Platform', type: 'select', options: ['Facebook Ads', 'Google Ads', 'Instagram Stories'] },
              { name: 'goal', label: 'Campaign Goal', type: 'select', options: ['Sales', 'Brand Awareness', 'Lead Generation'] }
            ]}
          />
        );
      case ToolId.BrandKit:
        return (
          <ToolLayout
             tool={TOOLS.find(t => t.id === ToolId.BrandKit)!}
             onBack={() => setCurrentView('DASHBOARD')}
             onRequestUpgrade={() => setShowPricing(true)}
             credits={user.credits}
             onSpendCredits={handleSpendCredits}
             userTier={user.subscriptionTier}
             clientMemory={clientProfile}
             onSuccess={updateClientMemory}
             inputs={[
               { name: 'businessName', label: 'Business Name', type: 'text', placeholder: 'Your Brand Name' },
               { name: 'industry', label: 'Industry', type: 'text', placeholder: 'e.g. Fashion' },
               { name: 'vibe', label: 'Brand Vibe', type: 'select', options: ['Luxury', 'Eco-Friendly', 'Tech/Modern', 'Community-Focused'] }
             ]}
          />
        );
      case ToolId.VideoScript:
          return (
            <ToolLayout
              tool={TOOLS.find(t => t.id === ToolId.VideoScript)!}
              onBack={() => setCurrentView('DASHBOARD')}
              onRequestUpgrade={() => setShowPricing(true)}
              credits={user.credits}
              onSpendCredits={handleSpendCredits}
              userTier={user.subscriptionTier}
              clientMemory={clientProfile}
              onSuccess={updateClientMemory}
              inputs={[
                { name: 'topic', label: 'Video Topic', type: 'text', placeholder: 'e.g. How to use our product' },
                { name: 'platform', label: 'Platform', type: 'select', options: ['TikTok (Short)', 'Instagram Reel', 'YouTube (Long)'] },
                { name: 'tone', label: 'Tone', type: 'select', options: ['Educational', 'Entertaining', 'Viral/Trendy'] }
              ]}
            />
          );
      case ToolId.SloganGenerator:
          return (
            <ToolLayout
              tool={TOOLS.find(t => t.id === ToolId.SloganGenerator)!}
              onBack={() => setCurrentView('DASHBOARD')}
              onRequestUpgrade={() => setShowPricing(true)}
              credits={user.credits}
              onSpendCredits={handleSpendCredits}
              userTier={user.subscriptionTier}
              clientMemory={clientProfile}
              onSuccess={updateClientMemory}
              inputs={[
                { name: 'businessName', label: 'Business Name', type: 'text', placeholder: 'e.g. Nairobi Eats' },
                { name: 'industry', label: 'Industry', type: 'text', placeholder: 'e.g. Restaurant' },
                { name: 'valueProp', label: 'Key Value (Optional)', type: 'text', placeholder: 'e.g. Fast delivery, affordable' },
                { name: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Funny/Witty', 'Inspirational', 'Short & Punchy'] }
              ]}
            />
          );
      case ToolId.BusinessTools:
          return (
            <ToolLayout
              tool={TOOLS.find(t => t.id === ToolId.BusinessTools)!}
              onBack={() => setCurrentView('DASHBOARD')}
              onRequestUpgrade={() => setShowPricing(true)}
              credits={user.credits}
              onSpendCredits={handleSpendCredits}
              userTier={user.subscriptionTier}
              clientMemory={clientProfile}
              onSuccess={updateClientMemory}
              inputs={[
                { name: 'keywords', label: 'Keywords', type: 'text', placeholder: 'e.g. coffee, fast, delivery' },
                { name: 'type', label: 'Generator Type', type: 'select', options: ['Business Name', 'Startup Idea'] }
              ]}
            />
          );
      case ToolId.WebCopy:
          return (
            <ToolLayout
              tool={TOOLS.find(t => t.id === ToolId.WebCopy)!}
              onBack={() => setCurrentView('DASHBOARD')}
              onRequestUpgrade={() => setShowPricing(true)}
              credits={user.credits}
              onSpendCredits={handleSpendCredits}
              userTier={user.subscriptionTier}
              clientMemory={clientProfile}
              onSuccess={updateClientMemory}
              inputs={[
                { name: 'businessDetails', label: 'About Business', type: 'textarea', placeholder: 'What do you do?' },
                { name: 'sections', label: 'Required Sections', type: 'text', placeholder: 'e.g. Homepage, About Us, Services' }
              ]}
            />
          );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-gray-50 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => setCurrentView('DASHBOARD')}>
               <div className="w-10 h-10 bg-brand-orange rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3 shadow-md">
                 S
               </div>
               <div>
                 <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">SAMONYA</h1>
                 <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">AIMS Market</span>
               </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
               {/* Settings Icon */}
               <button 
                  onClick={() => setCurrentView('SETTINGS')}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-brand-orange transition-colors"
                  title="Settings"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
               </button>

              <div 
                onClick={() => setCurrentView('ACCOUNT')}
                className="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1 rounded-full flex items-center transition-colors border border-gray-200 dark:border-gray-600"
              >
                <span className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase mr-2 hidden sm:inline">Credits</span>
                <span className={`font-mono font-bold ${user.credits < 5 ? 'text-red-500 dark:text-red-400' : 'text-brand-orange'}`}>{user.credits}</span>
              </div>
              <button 
                onClick={() => setShowPricing(true)}
                className="bg-brand-dark hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {currentView === 'DASHBOARD' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Daily Inspiration Cards */}
            <div className="mb-12">
               <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                 <span className="mr-2">💡</span> Daily Free Inspiration
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg transform hover:-translate-y-1 transition-transform">
                     <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-2">Motivational Quote</p>
                     <p className="text-lg font-serif italic leading-relaxed">"{dailyInspiration.quote}"</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 border-l-4 border-brand-orange rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-700">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-brand-orange mb-2">Marketing Tip</p>
                     <p className="text-gray-700 dark:text-gray-300 font-medium">{dailyInspiration.tip}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 border-l-4 border-brand-blue rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-700">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-brand-blue mb-2">Design Idea</p>
                     <p className="text-gray-700 dark:text-gray-300 font-medium">{dailyInspiration.idea}</p>
                  </div>
               </div>
            </div>

            {/* Hero Section */}
            <div className="text-center mb-16 relative">
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
                Your AI Business <span className="text-brand-orange">Co-Founder</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
                Generate logos, social content, ads, and brand kits instantly. 
                Tailored for Kenyan & African businesses.
              </p>
              
              <div className="inline-block bg-white dark:bg-gray-800 px-8 py-4 rounded-full shadow-md border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowPricing(true)}>
                <span className="text-gray-500 dark:text-gray-400 font-medium mr-2">Get Started for</span>
                <span className="text-brand-orange font-bold text-xl">$1.00</span>
              </div>
            </div>

            {/* Grid of Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TOOLS.map((tool) => (
                <div 
                  key={tool.id}
                  onClick={() => setCurrentView(tool.id)}
                  className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer group transform hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className={`w-14 h-14 rounded-2xl ${tool.color} text-white flex items-center justify-center text-3xl mb-6 shadow-md group-hover:scale-110 transition-transform`}>
                    {tool.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{tool.description}</p>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-orange to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              ))}
            </div>

            {/* Trust Section */}
            <div className="mt-20 border-t border-gray-200 dark:border-gray-700 pt-10 text-center">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Secure Payments Via</p>
              <div className="flex justify-center items-center space-x-8 opacity-60 grayscale hover:grayscale-0 transition-all">
                <span className="font-bold text-xl text-green-600 dark:text-green-500">M-PESA</span>
                <span className="font-bold text-xl text-blue-800 dark:text-blue-500">PayPal</span>
                <span className="font-bold text-xl text-indigo-600 dark:text-indigo-500">Stripe</span>
              </div>
            </div>
          </div>
        ) : (
          renderCurrentTool()
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-10 mt-10 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center space-x-6 mb-8 text-sm text-gray-500 dark:text-gray-400">
            <button onClick={() => setLegalModalType('PRIVACY')} className="hover:text-brand-orange">Privacy Policy</button>
            <button onClick={() => setLegalModalType('TERMS')} className="hover:text-brand-orange">Terms of Service</button>
            <button onClick={() => setLegalModalType('REFUND')} className="hover:text-brand-orange">Refund Policy</button>
            <button onClick={() => setLegalModalType('COOKIES')} className="hover:text-brand-orange">Cookies</button>
            <button onClick={() => setLegalModalType('USER_DATA')} className="hover:text-brand-orange">User Data</button>
          </div>
          
          <div className="mb-4">
             <a href={COMPANY_INFO.whatsappLink} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-full text-sm font-bold hover:bg-green-600 transition-colors">
               <span className="mr-2">💬</span> WhatsApp Support
             </a>
          </div>

          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} {COMPANY_INFO.name}. All rights reserved.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
            Powered by Samonya Digital Universe
          </p>
        </div>
      </footer>

      {/* Chatbot */}
      <SamnChat credits={user.credits} onSpendCredits={handleSpendCredits} />

      {/* Modals */}
      <PricingModal 
        isOpen={showPricing} 
        onClose={() => setShowPricing(false)} 
        onPurchase={handlePurchase} 
      />
      <LegalModal 
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
};

export default App;