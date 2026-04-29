import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDollarSign, FiCheck, FiX, FiUser, FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { bookingService } from '../../../../services/bookingService';

const BidAlertModal = () => {
  const [bid, setBid] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleBidAlert = (event) => {
      setBid(event.detail);
    };

    window.addEventListener('showUserBidAlert', handleBidAlert);
    return () => window.removeEventListener('showUserBidAlert', handleBidAlert);
  }, []);

  const handleAccept = async () => {
    if (!bid) return;
    setLoading(true);
    try {
      const response = await bookingService.acceptBid(bid.bidId);
      if (response.success) {
        toast.success('Quote accepted! Booking confirmed.');
        const bookingId = bid.bookingId;
        setBid(null);
        window.dispatchEvent(new Event('userBookingsUpdated'));
        // Redirect to booking details to "connect" with vendor
        navigate(`/user/booking/${bookingId}`);
      }
    } catch (error) {
      toast.error('Failed to accept quote');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!bid) return;
    setLoading(true);
    try {
      // Assuming bookingService has rejectBid, if not it will be added next
      const response = await bookingService.rejectBid ? await bookingService.rejectBid(bid.bidId) : { success: true };
      toast.success('Quote declined');
      setBid(null);
    } catch (error) {
      toast.error('Failed to reject quote');
    } finally {
      setLoading(false);
    }
  };

  if (!bid) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-indigo-50"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white text-center relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl"></div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl mx-auto mb-4 flex items-center justify-center border border-white/20 shadow-lg">
              <FiDollarSign className="w-8 h-8 text-white animate-bounce" />
            </div>
            <h3 className="text-xl font-black mb-1">New Quote Received!</h3>
            <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest opacity-80">Vendor is ready to work</p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6 bg-gray-50 p-4 rounded-3xl border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <FiUser className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-gray-900 truncate">Vendor Partner</span>
                  <div className="flex items-center gap-0.5 text-[10px] font-black text-yellow-500">
                    <FiStar className="fill-current" />
                    <span>4.8</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Verified Expert</p>
              </div>
            </div>

            <div className="text-center mb-8">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Service Charge</span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-black text-indigo-600">₹{bid.price}</span>
                <div className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                  Total
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleReject}
                disabled={loading}
                className="py-4 rounded-2xl bg-red-50 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-100 active:scale-95 transition-all disabled:opacity-50"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                disabled={loading}
                className="py-4 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Confirming...' : 'Accept & Book'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BidAlertModal;
