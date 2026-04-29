import api from '../../../services/api';

const verificationService = {
  /**
   * Save verification method choice
   */
  saveChoice: async (vendorId, method) => {
    const response = await api.post('/vendors/verification/choice', { vendorId, method });
    return response.data;
  },

  /**
   * Upload PCC document
   */
  uploadPCC: async (vendorId, documentBase64) => {
    const response = await api.post('/vendors/verification/upload', { vendorId, documentBase64 });
    return response.data;
  },

  /**
   * Get pending verifications (Admin)
   */
  getPending: async () => {
    const response = await api.get('/vendors/verification/pending');
    return response.data;
  },

  /**
   * Update verification status (Admin)
   */
  updateStatus: async (vendorId, status, adminNote = '') => {
    const response = await api.post('/vendors/verification/update-status', { vendorId, status, adminNote });
    return response.data;
  }
};

export default verificationService;
