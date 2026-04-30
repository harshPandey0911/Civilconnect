import api from '../../../services/api';

/**
 * Get active subscription plans
 */
export const getActivePlans = async () => {
  try {
    const response = await api.get('/vendors/subscription/plans');
    return response.data;
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
};

/**
 * Create Razorpay order
 */
export const createOrder = async (planId, vendorId) => {
  try {
    const response = await api.post('/vendors/subscription/create-order', { planId, vendorId });
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Verify payment
 */
export const verifyPayment = async (paymentData) => {
  try {
    const response = await api.post('/vendors/subscription/verify-payment', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

export default {
  getActivePlans,
  createOrder,
  verifyPayment
};
