import React from 'react';
import { User } from '../types';

interface SettingsViewProps {
  user: User;
  onLogout: () => void;
  onBack: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onLogout, onBack, isDarkMode, toggleDarkMode }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-gray-500 hover:text-brand-orange transition-colors"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back to Dashboard
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
        <div className="bg-brand-dark p-6 text-white">
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-gray-400 text-sm">Manage your account preferences</p>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Profile Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 mb-4">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-medium border border-gray-200 dark:border-gray-600">
                  {user.name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-medium border border-gray-200 dark:border-gray-600">
                  {user.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Phone Number</label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-medium border border-gray-200 dark:border-gray-600">
                  {user.phone || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Current Plan</label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-brand-orange font-bold border border-gray-200 dark:border-gray-600">
                  {user.subscriptionTier}
                </div>
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 mb-4">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                 <div>
                   <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                   <p className="text-xs text-gray-500 dark:text-gray-400">Receive updates about new AI tools and features</p>
                 </div>
                 <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out bg-brand-orange rounded-full cursor-pointer">
                    <span className="absolute left-6 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out transform"></span>
                 </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" onClick={toggleDarkMode}>
                 <div>
                   <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                   <p className="text-xs text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
                 </div>
                 <div className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full ${isDarkMode ? 'bg-brand-blue' : 'bg-gray-300'}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${isDarkMode ? 'left-7' : 'left-1'}`}></span>
                 </div>
              </div>
            </div>
          </section>

          {/* Account Actions */}
          <section>
             <h3 className="text-lg font-bold text-red-600 border-b border-gray-100 dark:border-gray-700 pb-2 mb-4">Danger Zone</h3>
             <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl">
               <div>
                  <p className="font-bold text-gray-900 dark:text-white">Sign Out</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">End your current session securely</p>
               </div>
               <button 
                 onClick={onLogout}
                 className="px-6 py-2 bg-white dark:bg-gray-800 border-2 border-red-500 text-red-500 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors shadow-sm"
               >
                 Log Out
               </button>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;