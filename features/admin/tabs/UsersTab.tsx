
import React, { useState, useMemo } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Search, User as UserIcon, Eye, Trash2 } from 'lucide-react';
import { User } from '../../../types';

interface UsersTabProps {
    setSelectedUser: (user: User | null) => void;
}

const UsersTab: React.FC<UsersTabProps> = ({ setSelectedUser }) => {
    const { users, deleteUser } = useApp();
    const [userSearch, setUserSearch] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Custom Modal State for Deleting User
    const [userToDelete, setUserToDelete] = useState<{id: string, name: string} | null>(null);

    const filteredUsers = useMemo(() => {
        if (!userSearch) return users;
        const q = userSearch.toLowerCase();
        return users.filter(u => 
            (u.name || '').toLowerCase().includes(q) || 
            (u.mobile || '').includes(q) || 
            (u.shopName || '').toLowerCase().includes(q) ||
            (u.id || '').toLowerCase().includes(q)
        );
    }, [users, userSearch]);

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        setIsProcessing(true);
        try {
            await deleteUser(userToDelete.id);
            alert("User deleted successfully.");
            setUserToDelete(null);
        } catch (e) {
            alert("Failed to delete user.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Custom Confirmation Modal for Deleting User */}
            {userToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                            <Trash2 className="text-red-600" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Delete User?</h3>
                        <p className="text-sm text-center text-gray-500 mb-6">
                            WARNING: Are you sure you want to DELETE user "{userToDelete.name}"?
                            <br/><br/>
                            This will remove their profile and ALL their posted deals permanently. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setUserToDelete(null)}
                                disabled={isProcessing}
                                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteUser}
                                disabled={isProcessing}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isProcessing ? 'Deleting...' : <><Trash2 size={16} /> Delete</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search users by name, mobile or shop..."
                    className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase">
                            <tr><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Wallet</th><th className="p-4 text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-400 font-bold">No users found.</td></tr>
                            ) : (
                                filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                                    {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover"/> : <UserIcon className="p-1.5 w-full h-full text-gray-400"/>}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{u.name || 'Unknown'}</p>
                                                    <p className="text-[10px] text-gray-500">{u.mobile || u.email || 'No Contact'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded border ${u.role === 'SELLER' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{u.role}</span>
                                        </td>
                                        <td className="p-4 font-mono font-bold text-gray-700">₹{(u.walletBalance || 0).toLocaleString()}</td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button onClick={() => setSelectedUser(u)} className="p-2 hover:bg-gray-200 rounded text-gray-500"><Eye size={16}/></button>
                                            <button onClick={() => setUserToDelete({id: u.id, name: u.name || 'Unknown'})} className="p-2 hover:bg-red-50 rounded text-red-500"><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UsersTab;
