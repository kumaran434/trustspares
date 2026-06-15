
import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, Star, Store, Share2, Search, ArrowRight, ArrowLeft, MessageCircle, Filter, Smartphone, Tv, Car, Monitor, Lock, Users } from 'lucide-react';
import SEO from '../../components/SEO';

const VerifiedSellers: React.FC = () => {
  const { users, currentUser } = useApp();
  const navigate = useNavigate();

  // STRICT INDUSTRY FILTER
  const viewerIndustry = currentUser?.industry || 'MOBILE';

  // Filter: Show Verified Technicians (who are NOT Admin)
  // Replaced u.role === 'SELLER' with u.kycVerified (since we removed Seller role logic)
  const verifiedTechs = useMemo(() => {
      return users.filter(u => 
          u.kycVerified && 
          !u.isAdmin && 
          (u.industry === viewerIndustry || (!u.industry && viewerIndustry === 'MOBILE'))
      );
  }, [users, viewerIndustry]);

  const handleShareTech = (tech: any) => {
      const location = tech.address ? tech.address.split(',')[0] : 'India';
      
      const text = 
`👨‍🔧 *Verified Technician Profile* 

🏪 *${tech.shopName?.toUpperCase() || tech.name.toUpperCase()}*
📍 Location: ${location}
⭐ Trust Score: ${tech.trustScore}/5.0

✅ *Verified Member of TrustSpares*
`;

      const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');
  };

  const getIndustryIcon = () => {
      switch(viewerIndustry) {
          case 'MOBILE': return <Smartphone className="text-blue-600" size={24}/>;
          case 'TV_ELECTRONICS': return <Tv className="text-purple-600" size={24}/>;
          case 'AUTOMOBILE': return <Car className="text-orange-600" size={24}/>;
          case 'COMPUTER_LAPTOP': return <Monitor className="text-teal-600" size={24}/>;
          default: return <Store className="text-gray-600" size={24}/>;
      }
  };

  return (
    <div className="pb-24">
      <SEO title={`${viewerIndustry} Directory`} description={`Verified ${viewerIndustry.toLowerCase().replace('_', ' ')} technicians.`} />

      <div className="flex items-center justify-between mb-6 px-2 pt-2">
           <div className="flex items-center gap-3">
               <button onClick={() => navigate(-1)} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100">
                   <ArrowLeft size={20} className="text-gray-600" />
               </button>
               <div>
                   <h1 className="text-xl font-black text-slate-900 leading-none flex items-center gap-2">
                       {getIndustryIcon()} Technician Directory
                   </h1>
                   <p className="text-xs text-gray-500 font-bold mt-1">Verified Experts in {viewerIndustry}</p>
               </div>
           </div>
           
           {/* LOCK INDICATOR */}
           {currentUser && (
               <div className="bg-slate-100 p-2 rounded-full border border-slate-200">
                   <Lock size={16} className="text-slate-400"/>
               </div>
           )}
      </div>

      {verifiedTechs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 mx-2">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={32} className="text-gray-300"/>
              </div>
              <p className="text-gray-400 font-bold text-sm">No verified {viewerIndustry.toLowerCase()} technicians listed yet.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
              {verifiedTechs.map(tech => (
                  <div key={tech.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                      
                      {/* Decorative Background */}
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                          <Users size={80} />
                      </div>

                      <div className="flex items-start gap-4 relative z-10">
                          <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                              <img src={tech.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tech.id}`} className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 mb-1">
                                  <span className="bg-blue-100 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                      <ShieldCheck size={10}/> Verified
                                  </span>
                                  <span className="bg-orange-50 text-orange-600 text-[9px] font-bold px-2 py-0.5 rounded border border-orange-100 flex items-center gap-1">
                                      <Star size={8} fill="currentColor"/> {tech.trustScore}
                                  </span>
                              </div>
                              
                              <h3 className="font-bold text-lg text-slate-900 truncate">
                                  {tech.shopName || tech.name}
                              </h3>
                              
                              <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                                  <MapPin size={12}/> {tech.address ? tech.address.split(',')[0] : 'India'}
                              </p>
                          </div>
                      </div>

                      <div className="mt-5 relative z-10 flex gap-2">
                          <button 
                            onClick={() => navigate(`/seller/${tech.id}`)}
                            className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                          >
                              <Users size={16} /> View Profile
                          </button>
                          <button 
                            onClick={() => handleShareTech(tech)}
                            className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                          >
                              <Share2 size={16} />
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default VerifiedSellers;
