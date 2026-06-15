import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Crown, CircleCheck, CircleX, Zap, Shield } from 'lucide-react';
import { SUBSCRIPTION_TEXT } from './subscriptionConstants';

const Subscription: React.FC = () => {
  const { currentUser, subscribeToPro } = useApp();
  const navigate = useNavigate();

  const handleUpgrade = async () => {
      if (!currentUser) return;
      if (currentUser.walletBalance < 149) {
          alert("Insufficient Wallet Balance. Please add money to wallet first.");
          navigate('/wallet');
          return;
      }
      
      const success = await subscribeToPro();
      if (success) {
          alert("Welcome to Pro Club! You can now contact unlimited sellers freely.");
          navigate('/');
      }
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
          <h2 className="text-2xl font-bold text-gray-900">{SUBSCRIPTION_TEXT.HEADER_TITLE}</h2>
          <p className="text-gray-500 text-sm">{SUBSCRIPTION_TEXT.HEADER_SUBTITLE}</p>
      </div>

      {/* Free Plan */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 opacity-75 grayscale">
          <div className="flex justify-between items-start mb-4">
              <div>
                  <h3 className="font-bold text-lg text-gray-700">{SUBSCRIPTION_TEXT.FREE_PLAN.TITLE}</h3>
                  <p className="text-2xl font-bold text-gray-900">{SUBSCRIPTION_TEXT.FREE_PLAN.PRICE}</p>
              </div>
              <div className="bg-gray-100 p-2 rounded-full">
                  <Shield size={20} className="text-gray-500" />
              </div>
          </div>
          <ul className="space-y-3 mb-6">
              {SUBSCRIPTION_TEXT.FREE_PLAN.FEATURES.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      {feat.type === 'check' ? <CircleCheck size={16} className="text-green-500" /> : <CircleX size={16} className="text-red-400" />}
                      {feat.text}
                  </li>
              ))}
          </ul>
          <button disabled className="w-full bg-gray-100 text-gray-500 font-bold py-3 rounded-lg cursor-not-allowed">
              {SUBSCRIPTION_TEXT.FREE_PLAN.BUTTON_TEXT}
          </button>
      </div>

      {/* PRO Plan */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-xl relative overflow-hidden transform scale-105 border-2 border-yellow-500">
          <div className="absolute top-0 right-0 bg-yellow-500 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-bl-lg">
              {SUBSCRIPTION_TEXT.PRO_PLAN.BADGE}
          </div>
          
          <div className="flex justify-between items-start mb-4">
              <div>
                  <h3 className="font-bold text-lg text-yellow-400 flex items-center gap-2">
                      <Crown size={20} fill="currentColor" /> {SUBSCRIPTION_TEXT.PRO_PLAN.TITLE}
                  </h3>
                  <p className="text-3xl font-bold mt-1">{SUBSCRIPTION_TEXT.PRO_PLAN.PRICE}<span className="text-sm font-normal text-slate-400">{SUBSCRIPTION_TEXT.PRO_PLAN.PERIOD}</span></p>
              </div>
          </div>

          <ul className="space-y-3 mb-8">
              {SUBSCRIPTION_TEXT.PRO_PLAN.FEATURES.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                      <div className="bg-green-500/20 p-1 rounded-full"><CircleCheck size={14} className="text-green-400" /></div>
                      <span>{feat.text}</span>
                  </li>
              ))}
          </ul>

          {currentUser?.isProMember ? (
              <button disabled className="w-full bg-green-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                  <CircleCheck size={18} /> {SUBSCRIPTION_TEXT.PRO_PLAN.BUTTON_ACTIVE}
              </button>
          ) : (
              <button onClick={handleUpgrade} className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-yellow-500/20">
                  <Zap size={18} fill="currentColor" /> {SUBSCRIPTION_TEXT.PRO_PLAN.BUTTON_ACTIVATE}
              </button>
          )}
          <p className="text-[10px] text-center text-slate-400 mt-3">{SUBSCRIPTION_TEXT.PRO_PLAN.NOTE}</p>
      </div>

    </div>
  );
};

export default Subscription;
