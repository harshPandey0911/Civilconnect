import React, { useState, useEffect } from 'react';
import { FiShield, FiUser, FiPhone, FiCheck, FiX, FiEye, FiDownload, FiClock, FiAlertCircle, FiSearch } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import verificationService from '../../../vendor/services/verificationService';
import Modal from '../UserCategories/components/Modal';

const PoliceVerificationManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'processed', 'all'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await verificationService.getPending();
      if (response.success) {
        setRequests(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch verification requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (vendorId, status) => {
    const adminNote = prompt(`Enter ${status} reason (optional):`);
    if (adminNote === null) return;

    setActionLoading(true);
    try {
      const response = await verificationService.updateStatus(vendorId, status, adminNote);
      if (response.success) {
        toast.success(`Verification ${status} successfully`);
        fetchRequests();
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         req.phone.includes(searchTerm) || 
                         (req.businessName && req.businessName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeTab === 'pending') {
      return matchesSearch && ['pending', 'submitted'].includes(req.policeVerification.status);
    } else if (activeTab === 'processed') {
      return matchesSearch && ['approved', 'rejected'].includes(req.policeVerification.status);
    }
    return matchesSearch;
  });

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiShield className="text-blue-600" /> Police Verification Management
          </h1>
          <p className="text-gray-500 mt-1">Review and verify vendor police clearance documents</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setActiveTab('processed')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'processed' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Processed
          </button>
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            All
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, phone or business..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShield className="text-3xl text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Requests Found</h3>
          <p className="text-gray-500 mt-1 text-sm">No verification requests match your current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <div key={request._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <FiUser className="text-blue-600 text-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-none">{request.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{request.phone}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  request.policeVerification.method === 'self' ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                }`}>
                  {request.policeVerification.method}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Business:</span>
                  <span className="font-semibold text-gray-900 truncate max-w-[150px]">{request.businessName || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-bold uppercase ${
                    request.policeVerification.status === 'approved' ? 'text-green-600' : 
                    request.policeVerification.status === 'rejected' ? 'text-red-600' : 
                    'text-amber-600'
                  }`}>{request.policeVerification.status}</span>
                </div>
                {request.policeVerification.expiryDate && request.policeVerification.status === 'pending' && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Deadline:</span>
                    <span className="text-red-600 font-semibold">{new Date(request.policeVerification.expiryDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setSelectedRequest(request); setIsModalOpen(true); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                    ['approved', 'rejected'].includes(request.policeVerification.status) 
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FiEye className="w-4 h-4" /> {['approved', 'rejected'].includes(request.policeVerification.status) ? 'View Details' : 'Review'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verification Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Verification Details"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Vendor Information</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-bold text-gray-900">{selectedRequest.name}</p>
                  <p className="text-xs text-gray-600 flex items-center gap-1"><FiPhone className="w-3 h-3" /> {selectedRequest.phone}</p>
                  <p className="text-xs text-gray-600">Email: {selectedRequest.email}</p>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">PCC Document</h4>
                {selectedRequest.policeVerification.documentUrl ? (
                  <div className="relative group">
                    <img
                      src={selectedRequest.policeVerification.documentUrl}
                      alt="PCC"
                      className="w-full h-32 object-cover rounded-xl border border-gray-200"
                    />
                    <a
                      href={selectedRequest.policeVerification.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold transition-opacity rounded-xl"
                    >
                      <FiEye className="mr-2" /> View Full
                    </a>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
                    <FiClock className="text-gray-300 text-2xl mb-2" />
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Pending Upload</p>
                  </div>
                )}
              </div>
            </div>

            {selectedRequest.policeVerification.adminNote && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-1">Admin Note</h4>
                <p className="text-xs text-gray-700 italic">"{selectedRequest.policeVerification.adminNote}"</p>
              </div>
            )}

            {!['approved', 'rejected'].includes(selectedRequest.policeVerification.status) && (
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleAction(selectedRequest._id, 'approved')}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FiCheck className="w-5 h-5" /> Approve Verification
                </button>
                <button
                  onClick={() => handleAction(selectedRequest._id, 'rejected')}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FiX className="w-5 h-5" /> Reject
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PoliceVerificationManagement;
