
import React, { useMemo } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Building2, AlertOctagon, Activity, ArrowDownLeft, Check, Clock, Package, IndianRupee } from 'lucide-react';
import { DealStatus } from '../../../types';

interface DashboardTabProps {
    setActiveTab: (tab: any) => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ setActiveTab }) => {
    const { users, deals, transactions } = useApp();

    const totalUsers = users.length;
    // Disputed deals now imply Returns/Issues
    const disputedDeals = deals.filter(d => d.status === DealStatus.DISPUTED);
    
    // Payments to verify (Incoming)
    const pendingDeposits = transactions.filter(t => t.status === 'PENDING' && t.type === 'ESCROW_LOCK');
    
    // Orders Ready to Ship (Paid but not shipped)
    const ordersToShip = deals.filter(d => d.status === DealStatus.PAID);

    // --- RECENT SIGNUPS ---
    const recentSignups = useMemo(() => {
        return users
            .filter(u => u.createdAt) 
            .sort((a,b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
            .slice(0, 5);
    }, [users]);

    const liveActionFeed = useMemo(() => {
        const feed: any[] = [];

        pendingDeposits.forEach(tx => {
            feed.push({ id: tx.id, type: 'PAYMENT', title: `Verify Payment`, desc: `₹${tx.amount.toLocaleString()} - ${tx.description}`, date: tx.date, priority: 'HIGH', action: () => setActiveTab('PAYMENTS') });
        });

        ordersToShip.forEach(d => {
            feed.push({ id: d.id, type: 'SHIP', title: `Ship Order`, desc: `${d.title} (Paid)`, date: d.createdAt, priority: 'HIGH', action: () => window.location.hash = `/deal/${d.id}` });
        });

        disputedDeals.forEach(d => {
            feed.push({ id: d.id, type: 'RETURN', title: `Return Request`, desc: `${d.title} - ${d.disputeReason}`, date: d.createdAt, priority: 'URGENT', action: () => setActiveTab('DISPUTES') });
        });

        const priorityMap: Record<string, number> = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2 };
        return feed.sort((a,b) => priorityMap[b.priority] - priorityMap[a.priority] || new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [pendingDeposits, ordersToShip, disputedDeals, setActiveTab]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard title="Total Users" value={totalUsers.toString()} icon={<Building2 size={20}/>} />
                <StatCard title="Orders to Ship" value={ordersToShip.length.toString()} icon={<Package size={20}/>} alert={ordersToShip.length > 0} />
                <StatCard title="Verify Payments" value={pendingDeposits.length.toString()} icon={<IndianRupee size={20}/>} alert={pendingDeposits.length > 0} />
                <StatCard title="Return Requests" value={disputedDeals.length.toString()} icon={<AlertOctagon size={20}/>} alert={disputedDeals.length > 0} />
            </div>

            {/* PENDING ACTIONS FEED */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Activity size={18} className="text-blue-600" /> Pending Tasks
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {liveActionFeed.length} Items
                    </span>
                </div>
                
                {liveActionFeed.length === 0 ? (
                    <div className="p-10 text-center">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Check size={32} className="text-green-600" />
                        </div>
                        <p className="text-gray-500 font-bold text-sm">All clear! No pending tasks.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {liveActionFeed.map(item => {
                            const getIcon = () => {
                                switch(item.type) {
                                    case 'PAYMENT': return <ArrowDownLeft size={18} className="text-blue-600" />;
                                    case 'SHIP': return <Package size={18} className="text-purple-600" />;
                                    case 'RETURN': return <AlertOctagon size={18} className="text-red-600" />;
                                    default: return <Activity size={18} />;
                                }
                            };
                            const getBg = () => {
                                switch(item.type) {
                                    case 'PAYMENT': return 'bg-blue-50';
                                    case 'SHIP': return 'bg-purple-50';
                                    case 'RETURN': return 'bg-red-50';
                                    default: return 'bg-gray-50';
                                }
                            };

                            return (
                                <div key={item.id} className="p-4 hover:bg-gray-50 transition flex items-center justify-between gap-3 group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getBg()}`}>
                                            {getIcon()}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                                            <p className="text-xs text-gray-500 font-medium truncate max-w-[200px] sm:max-w-md">{item.desc}</p>
                                        </div>
                                    </div>
                                    <button onClick={item.action} className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-xs font-bold text-gray-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm active:scale-95 whitespace-nowrap">
                                        Action
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* --- RECENT SIGNUPS --- */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2">
                    <Clock size={18} className="text-indigo-600"/>
                    <h3 className="font-bold text-indigo-900">New Technicians (Recent)</h3>
                </div>
                {recentSignups.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-xs">No recent signups data.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {recentSignups.map(user => (
                            <div key={user.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{user.name}</p>
                                        <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                                            Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                {user.mobile && (
                                    <span className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                        {user.mobile}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, alert?: boolean }> = ({ title, value, icon, alert }) => (
    <div className={`bg-white p-5 rounded-2xl shadow-sm border ${alert ? 'border-orange-300 bg-orange-50' : 'border-gray-100'}`}>
        <div className="flex justify-between mb-2">
            <span className="text-gray-500 text-[10px] font-bold uppercase">{title}</span>
            <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        </div>
        <div className="text-2xl font-black text-slate-900">{value}</div>
    </div>
);

export default DashboardTab;
