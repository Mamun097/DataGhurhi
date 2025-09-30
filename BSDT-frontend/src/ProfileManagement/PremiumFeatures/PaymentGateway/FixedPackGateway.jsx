import React, { useState, useEffect, useCallback } from "react";
import "./PaymentModal.css";
import PremiumPackagesModal from "../PremiumPackagesModal";
import apiClient from "../../../api";

// Payment Processing Modal Component
const PaymentProcessingModal = ({
  isOpen,
  onClose,
  getLabel,
  status,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-content">
          {status === "processing" && (
            <>
              <div className="loading-spinner large"></div>
              <h3>{getLabel("Processing Payment...")}</h3>
              <p>
                {getLabel(
                  "Please wait while we redirect you to the payment gateway."
                )}
              </p>
            </>
          )}
          {status === "success" && (
            <>
              <div className="success-icon">✅</div>
              <h3>{getLabel("Payment Successful!")}</h3>
              <p>
                {message ||
                  getLabel(
                    "Your subscription has been activated successfully."
                  )}
              </p>
              <button className="close-btn" onClick={onClose}>
                {getLabel("Close")}
              </button>
            </>
          )}
          {status === "error" && (
            <>
              <div className="error-icon">❌</div>
              <h3>{getLabel("Payment Failed")}</h3>
              <p>
                {message || getLabel("Something went wrong. Please try again.")}
              </p>
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
const usePaymentGateway = (getLabel, handleCloseModal) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userSubscription, setUserSubscription] = useState(null);
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    status: null,
    message: "",
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
    const paymentStatus = urlParams.get("payment");
    const status = urlParams.get("status");
    const tran_id = urlParams.get("tran_id");
    const packageName = urlParams.get("package");
    const errorMsg = urlParams.get("error");
    const message = urlParams.get("message");

    // Use whichever parameter is available
    const finalStatus = paymentStatus || status;

    if (finalStatus && (tran_id || finalStatus === "success")) {
      if (finalStatus === "success") {
        setPaymentModal({
          isOpen: true,
          status: "success",
          message: packageName
            ? getLabel(
              `Payment completed successfully! Your ${decodeURIComponent(
                packageName
              )} subscription is now active.`
            )
            : getLabel(
              "Payment completed successfully! Your subscription is now active."
            ),
        });
      } else if (finalStatus === "failed") {
        const failureMessage = errorMsg
          ? decodeURIComponent(errorMsg)
          : getLabel("Payment failed. Please try again.");

        setPaymentModal({
          isOpen: true,
          status: "error",
          message: failureMessage,
        });
      } else if (finalStatus === "cancelled") {
        setPaymentModal({
          isOpen: true,
          status: "error",
          message: getLabel("Payment was cancelled."),
        });
      } else if (finalStatus === "error") {
        const errorMessage = message
          ? decodeURIComponent(message)
          : getLabel("An error occurred during payment processing.");

        setPaymentModal({
          isOpen: true,
          status: "error",
          message: errorMessage,
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
      alert(getLabel("Please login to purchase a package"));
      return;
    }

    // Check if user already has an active subscription
    if (userSubscription && new Date(userSubscription.end_date) > new Date()) {
      const confirmUpgrade = window.confirm(
        getLabel(
          "You already have an active subscription. Do you want to upgrade/renew?"
        )
      );
      if (!confirmUpgrade) return;
    }

    setProcessingPayment(true);
    setPaymentModal({
      isOpen: true,
      status: "processing",
      message: "",
    });

    try {
      const response = await apiClient.post(
        "/api/payment/initiate",
        {
          packageId: packageId,
          userId: currentUser.user_id,
          customerName: currentUser.name || "Customer",
          customerEmail: currentUser.email,
          customerPhone: currentUser.contact || "01700000000",
          customerAddress: currentUser.address || "Dhaka, Bangladesh",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = response.data;

      if (response.status === 200 && data.success) {
        // Closing the modal before redirecting
        setPaymentModal({ isOpen: false, status: null, message: "" });

        // Storing the transaction ID for reference
        localStorage.setItem("pending_transaction", data.transaction_id);

        // Redirecting to SSLCommerz payment gateway
        window.location.href = data.GatewayPageURL;
      } else {
        throw new Error(data.message || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      setPaymentModal({
        isOpen: true,
        status: "error",
        message: getLabel("Failed to initiate payment. Please try again."),
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  // Handle custom package payment - Fixed implementation
  const handleBuyCustomPackage = async (customPackageData) => {
    if (!currentUser || !currentUser.user_id) {
      alert(getLabel("Please login to purchase a package"));
      return;
    }

    const { finalPrice, basePrice, items, features, validity, appliedCoupon } = customPackageData;

    // Check if final price is greater than 0
    if (finalPrice > 0) {
      alert(
        getLabel(
          "Custom package payment will be implemented soon. Please contact support for custom packages."
        )
      );
      return;
    }

    setProcessingPayment(true);

    // Show processing modal
    setPaymentModal({
      isOpen: true,
      status: "processing",
      message: "",
    });

    try {
      // 2. Add the pack to user account (subscription table)
      const currentDate = new Date();
      const endDate = new Date(currentDate.getTime() + (validity.days * 24 * 60 * 60 * 1000));

      const subscriptionData = {
        user_id: currentUser.user_id,
        tag: features.tag ? items.tag : 0,
        question: features.question ? items.question : 0,
        survey: features.survey ? items.survey : 0,
        participant_count: features.participant ? items.participant : 0,
        advanced_analysis: features.advanced_analysis,
        start_date: currentDate.toISOString(),
        end_date: endDate.toISOString(),
        cost: finalPrice,
        package_id: null // null for custom package
      };

      console.log('Creating subscription with data:', subscriptionData);

      // API call for adding subscription
      const subscriptionResponse = await apiClient.post("/api/subscription/create", subscriptionData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log('Subscription created:', subscriptionResponse.data);

      // Get subscription ID - check multiple possible response formats
      const subscriptionId = subscriptionResponse.data.subscription_id ||
        subscriptionResponse.data.id ||
        subscriptionResponse.data.subscription?.id ||
        subscriptionResponse.data.subscription?.subscription_id;

      console.log('New subscription ID:', subscriptionId);

      // 3. Add coupon usage info if coupon is applied
      if (appliedCoupon && appliedCoupon.data && subscriptionId) {
        const discountAmount = basePrice - finalPrice;

        const voucherUsedData = {
          user_id: currentUser.user_id,
          voucher_id: appliedCoupon.data.id || appliedCoupon.data.voucher_id,
          subscription_id: subscriptionId,
          purchased_at: currentDate.toISOString(),
          discount_amount: discountAmount
        };

        console.log('Recording voucher usage with data:', voucherUsedData);

        try {
          await apiClient.post("/api/voucher-used/create", voucherUsedData, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          console.log('Voucher usage recorded successfully');
        } catch (voucherError) {
          console.error('Error recording voucher usage:', voucherError);
          // Don't fail the whole process if voucher recording fails
          // Just log the error and continue
        }
      }

      // Show success message
      setPaymentModal({
        isOpen: true,
        status: "success",
        message: getLabel(
          "Custom package purchased successfully! Your subscription is now active."
        ),
      });

      // Close the parent modal (premium packages modal) after a short delay
      setTimeout(() => {
        if (handleCloseModal) {
          handleCloseModal();
        }
      }, 2000); // Close after 2 seconds

      // Refresh user data
      await getProfile();

    } catch (error) {
      console.error("Error processing custom package purchase:", error);

      // Extract meaningful error message
      let errorMessage = getLabel("Error processing purchase. Please try again.");
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setPaymentModal({
        isOpen: true,
        status: "error",
        message: errorMessage,
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  // Legacy function for backward compatibility - now just shows message
  const handleBuyCustomPackageLegacy = async () => {
    alert(
      getLabel(
        "Custom package payment will be implemented soon. Please contact support for custom packages."
      )
    );
  };

  // Close payment modal - Updated to handle parent modal closure
  const closePaymentModal = () => {
    const wasSuccess = paymentModal.status === "success";

    setPaymentModal({
      isOpen: false,
      status: null,
      message: "",
    });

    // If payment was successful and we have a parent modal close function, use it
    if (wasSuccess && handleCloseModal) {
      handleCloseModal();
    }

    // Refresh user data after successful payment
    if (wasSuccess) {
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
    handleBuyCustomPackage: handleBuyCustomPackageLegacy, // Keep legacy name for backward compatibility
    handleBuyCustomPackageWithData: handleBuyCustomPackage, // New name for data-aware function
    closePaymentModal,
    initializePaymentGateway,
    getProfile,
    PaymentProcessingModal,
  };
};

export default usePaymentGateway;