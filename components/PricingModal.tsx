import React, { useState } from 'react';
import { PRICING_PLANS, COMPANY_INFO } from '../constants';
import { PricingPlan } from '../types';
import { mockBackend } from '../services/mockBackend';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (plan: PricingPlan) => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onPurchase }) => {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [paymentStep, setPaymentStep] = useState<'SELECT' | 'PAY' | 'VERIFY'>('SELECT');
  const [transactionId, setTransactionId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setPaymentStep('PAY');
    setErrorMsg('');
  };

  const handleVerifyPayment = async () => {
    if (!transactionId.trim()) {
      setErrorMsg("Please enter the Transaction ID.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    // Call mock backend to verify transaction ID
    const isValid = await mockBackend.verifyTransaction(transactionId);
    
    setIsProcessing(false);

    if (isValid) {
      if (selectedPlan) {
        onPurchase(selectedPlan);
        onClose();
        // Reset state
        setPaymentStep('SELECT');
        setSelectedPlan(null);
        setTransactionId('');
      }
    } else {
      setErrorMsg("Transaction Verification Failed. Invalid ID (Use >5 chars for test).");
    }
  };

  const handleBack = () => {
    setPaymentStep('SELECT');
    setSelectedPlan(null);
    setTransactionId('');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col animate-scale-in transition-colors duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div>
            <h2 className="text-2xl font-bold text-brand-dark dark:text-white">
              {paymentStep === 'SELECT' ? 'Choose Your Plan' : 'Activate Your Subscription'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {paymentStep === 'SELECT' 
                ? 'Unlock instant access to all AI business tools.' 
                : `Complete payment for ${selectedPlan?.name}`}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {paymentStep === 'SELECT' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRICING_PLANS.map((plan: PricingPlan) => (
                <div 
                  key={plan.id} 
                  className={`border rounded-xl p-6 flex flex-col relative transition-all hover:shadow-xl hover:-translate-y-1 dark:border-gray-700 dark:bg-gray-900 ${plan.isPopular ? 'border-brand-orange bg-orange-50 dark:bg-gray-800 ring-1 ring-brand-orange' : 'border-gray-200'}`}
                >
                  {plan.isPopular && (
                    <span className="absolute top-0 right-0 bg-brand-orange text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">
                      BEST VALUE
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                  <div className="my-4">
                    <span className="text-3xl font-extrabold text-brand-blue dark:text-blue-400">{plan.priceUSD}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm block">/ month</span>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-6 text-center shadow-sm">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">You Get</p>
                    <p className="text-3xl font-black text-green-600 dark:text-green-400">{plan.credits} Credits</p>
                  </div>

                  <ul className="flex-1 space-y-3 mb-6">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                        <svg className="w-5 h-5 text-green-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                      plan.isPopular 
                        ? 'bg-brand-orange text-white hover:bg-orange-700 shadow-orange-200 dark:shadow-none shadow-lg' 
                        : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600'
                    }`}
                  >
                    Activate {plan.name}
                  </button>
                </div>
              ))}
            </div>
          )}

          {(paymentStep === 'PAY' || paymentStep === 'VERIFY') && selectedPlan && (
            <div className="max-w-2xl mx-auto">
              <button onClick={handleBack} className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-orange mb-4 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                Back to Plans
              </button>
              
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-brand-dark p-6 text-white text-center">
                  <h3 className="text-xl font-bold uppercase tracking-wider mb-2">PAYMENT REQUIRED</h3>
                  <p className="opacity-80">To unlock {selectedPlan.credits} credits ({selectedPlan.priceUSD})</p>
                </div>
                
                <div className="p-8 space-y-8">
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-4">Available Payment Methods</p>
                    
                    <div className="space-y-6">
                      <div>
                        <p className="text-lg font-bold text-gray-800 dark:text-white mb-1">1. M-PESA (STK Push / Till)</p>
                        <p className="font-mono text-2xl font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 inline-block px-4 py-2 rounded-lg">{COMPANY_INFO.mpesaTill}</p>
                        <a 
                          href={COMPANY_INFO.whatsappLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block mt-2 text-brand-orange font-bold hover:underline"
                        >
                          👉 Click here to pay via WhatsApp Support
                        </a>
                      </div>
                      
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="text-lg font-bold text-gray-800 dark:text-white mb-1">2. Email Assistance</p>
                        <p className="text-gray-600 dark:text-gray-400">{COMPANY_INFO.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                     <label className="block text-gray-700 dark:text-gray-300 font-bold mb-3">
                       After payment, enter the <span className="text-brand-orange">Transaction ID</span> (M-Pesa Code):
                     </label>
                     <div className="flex space-x-2">
                       <input 
                         type="text" 
                         value={transactionId}
                         onChange={(e) => setTransactionId(e.target.value)}
                         placeholder="e.g. QWE123TYU"
                         className="flex-1 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 text-center font-bold text-lg uppercase focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                       />
                       <button 
                         onClick={handleVerifyPayment}
                         disabled={isProcessing}
                         className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-transform transform hover:scale-105 disabled:bg-gray-400"
                       >
                         {isProcessing ? 'Verifying...' : 'ACTIVATE'}
                       </button>
                     </div>
                     {errorMsg && (
                       <p className="text-red-500 font-bold mt-2 text-sm animate-pulse">{errorMsg}</p>
                     )}
                     <p className="text-xs text-gray-400 mt-6">
                       System verifies transaction ID securely.
                     </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 text-center text-xs text-gray-400">
           Secure Payment processed by Samonya Digital Universe.
        </div>
      </div>
    </div>
  );
};

export default PricingModal;