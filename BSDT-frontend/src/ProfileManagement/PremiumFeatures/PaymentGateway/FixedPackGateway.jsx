import React, { useState, useEffect, useCallback } from 'react';
import './PaymentModal.css';
import apiClient from '../../../api';

// Payment Processing Modal Component
const PaymentProcessingModal = ({ isOpen, onClose, getLabel, status, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-content">
          {status === 'processing' && (
            <>
              <div className="loading-spinner large"></div>
              <h3>{getLabel("Processing Payment...")}</h3>
              <p>{getLabel("Please wait while we redirect you to the payment gateway.")}</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="success-icon">✅</div>
              <h3>{getLabel("Payment Successful!")}</h3>
              <p>{message || getLabel("Your subscription has been activated successfully.")}</p>
              <button className="close-btn" onClick={onClose}>
                {getLabel("Close")}
              </button>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="error-icon">❌</div>
              <h3>{getLabel("Payment Failed")}</h3>
              <p>{message || getLabel("Something went wrong. Please try again.")}</p>
              <button className="close-btn" onClick={onClose}>
                {getLabel("Close")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Custom hook for payment functionality
const usePaymentGateway = (getLabel) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userSubscription, setUserSubscription] = useState(null);
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    status: null,
    message: ''
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  // Get user profile
  const getProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found");
      return;
    }

    try {
      const response = await apiClient.get("/api/profile", {
        headers: { Authorization: "Bearer " + token },
      });
      if (response.status === 200) {
        setCurrentUser(response.data.user);
        // Also fetch user subscription
        await fetchUserSubscription(response.data.user.user_id);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, []);

  // Fetch user subscription
  const fetchUserSubscription = async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await apiClient.get(`/api/subscription/user/${userId}`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (response.status === 200) {
        setUserSubscription(response.data.subscription);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  // Handle payment response from URL parameters
  const handlePaymentResponse = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for both 'payment' and 'status' parameters for backward compatibility
    const paymentStatus = urlParams.get('payment');
    const status = urlParams.get('status');
    const tran_id = urlParams.get('tran_id');
    const packageName = urlParams.get('package');
    const errorMsg = urlParams.get('error');
    const message = urlParams.get('message');
    
    // Use whichever parameter is available
    const finalStatus = paymentStatus || status;
    
    if (finalStatus && (tran_id || finalStatus === 'success')) {
      if (finalStatus === 'success') {
        setPaymentModal({
          isOpen: true,
          status: 'success',
          message: packageName 
            ? getLabel(`Payment completed successfully! Your ${decodeURIComponent(packageName)} subscription is now active.`)
            : getLabel('Payment completed successfully! Your subscription is now active.')
        });
      } else if (finalStatus === 'failed') {
        const failureMessage = errorMsg 
          ? decodeURIComponent(errorMsg)
          : getLabel('Payment failed. Please try again.');
        
        setPaymentModal({
          isOpen: true,
          status: 'error',
          message: failureMessage
        });
      } else if (finalStatus === 'cancelled') {
        setPaymentModal({
          isOpen: true,
          status: 'error',
          message: getLabel('Payment was cancelled.')
        });
      } else if (finalStatus === 'error') {
        const errorMessage = message 
          ? decodeURIComponent(message)
          : getLabel('An error occurred during payment processing.');
        
        setPaymentModal({
          isOpen: true,
          status: 'error',
          message: errorMessage
        });
      }
      
      // Clean up URL parameters
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [getLabel]);

  // Handle buy click for packages
  const handleBuyClick = async (packageId) => {
    if (!currentUser || !currentUser.user_id) {
      alert(getLabel('Please login to purchase a package'));
      return;
    }

    // Check if user already has an active subscription
    if (userSubscription && new Date(userSubscription.end_date) > new Date()) {
      const confirmUpgrade = window.confirm(
        getLabel('You already have an active subscription. Do you want to upgrade/renew?')
      );
      if (!confirmUpgrade) return;
    }

    setProcessingPayment(true);
    setPaymentModal({
      isOpen: true,
      status: 'processing',
      message: ''
    });

    try {
      const response = await apiClient.post('/api/payment/initiate', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          packageId: packageId,
          userId: currentUser.user_id,
          customerName: currentUser.name || 'Customer',
          customerEmail: currentUser.email,
          customerPhone: currentUser.contact || '01700000000',
          customerAddress: currentUser.address || 'Dhaka, Bangladesh'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Close the modal before redirecting
        setPaymentModal({ isOpen: false, status: null, message: '' });
        
        // Store the transaction ID for reference
        localStorage.setItem('pending_transaction', data.transaction_id);
        
        // Redirect to SSLCommerz payment gateway
        window.location.href = data.GatewayPageURL;
      } else {
        throw new Error(data.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      setPaymentModal({
        isOpen: true,
        status: 'error',
        message: error.message || getLabel('Failed to initiate payment. Please try again.')
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  // Handle custom package payment
  const handleBuyCustomPackage = async () => {
    if (!currentUser || !currentUser.user_id) {
      alert(getLabel('Please login to purchase a package'));
      return;
    }

    // For now, show a message that custom package will be implemented
    alert(getLabel('Custom package payment will be implemented soon. Please contact support for custom packages.'));
  };

  // Close payment modal
  const closePaymentModal = () => {
    setPaymentModal({
      isOpen: false,
      status: null,
      message: ''
    });
    // Refresh user data after successful payment
    if (paymentModal.status === 'success') {
      getProfile();
    }
  };

  // Initialize payment gateway when needed
  const initializePaymentGateway = (shouldHandleResponse = true) => {
    getProfile();
    if (shouldHandleResponse) {
      // Add a small delay to ensure everything is initialized
      setTimeout(handlePaymentResponse, 100);
    }
  };

  return {
    currentUser,
    userSubscription,
    paymentModal,
    processingPayment,
    handleBuyClick,
    handleBuyCustomPackage,
    closePaymentModal,
    initializePaymentGateway,
    getProfile,
    PaymentProcessingModal
  };
};

export default usePaymentGateway;