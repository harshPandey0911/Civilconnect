import React, { useState, useEffect, useLayoutEffect } from 'react';
import { FiDollarSign, FiArrowUp, FiArrowDown, FiClock, FiBell } from 'react-icons/fi';
import { workerTheme as themeColors } from '../../../../theme';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import workerWalletService from '../../../../services/workerWalletService';
import { toast } from 'react-hot-toast';
import LogoLoader from '../../../../components/common/LogoLoader';

const Wallet = () => {
  const [loading, setLoading] = useState(true);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [wallet, setWallet] = useState({
    balance: 0,
    pendingPayout: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const bgStyle = themeColors.backgroundGradient;

    if (html) html.style.background = bgStyle;
    if (body) body.style.background = bgStyle;
    if (root) root.style.background = bgStyle;

    return () => {
      if (html) html.style.background = '';
      if (body) body.style.background = '';
      if (root) root.style.background = '';
    };
  }, []);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [walletRes, txnRes] = await Promise.all([
        workerWalletService.getWallet(),
        workerWalletService.getTransactions({ limit: 50 })
      ]);

      if (walletRes.success) {
        setWallet(walletRes.data);
      }

      if (txnRes.success) {
        setTransactions(txnRes.data || []);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async (bookingId) => {
    if (payoutLoading) return;
    try {
      setPayoutLoading(bookingId);
      await workerWalletService.requestPayout(bookingId);
      toast.success('Payout request sent to vendor');
    } catch (error) {
      toast.error(error.message || 'Failed to request payout');
    } finally {
      setPayoutLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    if (filter === 'all') return true;
    return txn.type === filter;
  });

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'worker_payment':
        return <FiArrowDown className="w-5 h-5 text-green-500" />;
      case 'cash_collected':
        return <FiArrowUp className="w-5 h-5 text-red-500" />;
      default:
        return <FiDollarSign className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTransactionLabel = (type) => {
    switch (type) {
      case 'worker_payment':
        return 'Payment Received';
      case 'cash_collected':
        return 'Cash Collected';
      default:
        return type.replace('_', ' ');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return <LogoLoader />;
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: themeColors.backgroundGradient }}>
      <Header title="My Wallet" />

      <main className="px-4 py-6">
        {/* Balance Card */}
        <div className="rounded-2xl p-6 shadow-xl relative overflow-hidden mb-6 bg-gradient-to-br from-teal-600 to-teal-800">
          <div className="relative z-10 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Available Balance</p>
                <p className="text-3xl font-bold mb-4">₹{wallet.balance?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <FiDollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="w-full bg-white/10 text-white py-2 rounded-xl font-medium text-xs text-center border border-white/20">
              Payments are managed by your Vendor
            </div>
          </div>
        </div>

        {/* Pending Payouts List */}
        {wallet.pendingBookings?.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold text-gray-800 mb-4 px-1">Pending Payments</h3>
            <div className="space-y-3">
              {wallet.pendingBookings.map(booking => (
                <div key={booking._id} className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 flex justify-between items-center">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm mb-0.5">{booking.serviceName}</p>
                    <p className="text-xs text-gray-500 font-medium mb-1">Booking #{booking.bookingNumber}</p>
                    <p className="text-[10px] text-gray-400">
                      Completed: {new Date(booking.completedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRequestPayout(booking._id)}
                    disabled={payoutLoading === booking._id}
                    className="flex-shrink-0 px-3 py-2 bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 hover:bg-orange-100"
                  >
                    {payoutLoading === booking._id ? (
                      <span className="w-3 h-3 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <FiBell className="w-3.5 h-3.5" />
                        Ask Vendor
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'all', label: 'All' },
            { id: 'worker_payment', label: 'Payments' },
            { id: 'cash_collected', label: 'Cash Collected' },
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${filter === filterOption.id
                ? 'text-white'
                : 'bg-white text-gray-700'
                }`}
              style={
                filter === filterOption.id
                  ? {
                    background: themeColors.button,
                    boxShadow: `0 2px 8px ${themeColors.button}40`,
                  }
                  : {
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }
              }
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {/* Transactions/Ledger */}
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Transaction History</h3>
          {filteredTransactions.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-md">
              <FiDollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 font-semibold mb-2">No transactions yet</p>
              <p className="text-sm text-gray-500">Your payments will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((txn) => (
                <div
                  key={txn._id}
                  className="bg-white rounded-xl p-4 shadow-md border-l-4"
                  style={{
                    borderLeftColor: txn.type === 'cash_collected' ? '#DC2626' : '#10B981'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: txn.type === 'cash_collected' ? '#FEE2E2' : '#D1FAE5'
                      }}
                    >
                      {getTransactionIcon(txn.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-gray-900 text-sm">
                          {getTransactionLabel(txn.type)}
                        </p>
                        <p className={`text-lg font-bold ${txn.type === 'cash_collected' ? 'text-red-600' : 'text-green-600'
                          }`}>
                          {txn.type === 'cash_collected' ? 'Collected' : '+'} ₹{Math.abs(txn.amount).toLocaleString()}
                        </p>
                      </div>

                      <p className="text-xs text-gray-600 truncate mb-1">{txn.description}</p>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{formatDate(txn.createdAt)}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${txn.status === 'completed' ? 'bg-green-100 text-green-700' :
                          txn.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {txn.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Wallet;
