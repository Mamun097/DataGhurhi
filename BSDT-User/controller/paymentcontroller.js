const SSLCommerzPayment = require('sslcommerz-lts');
const supabase = require("../db"); // Import Supabase client
const crypto = require('crypto');

// SSLCommerz configuration for sandbox (demo)
const store_id = 'testbox'; // For demo
const store_passwd = 'qwerty'; // For demo
const is_live = false; // true for live, false for sandbox

// Fixed URLs for frontend
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:2000';

class PaymentController {
  // Initiate payment
  static async initiatePayment(req, res) {
    try {
      const { packageId, userId, customerName, customerEmail, customerPhone, customerAddress } = req.body;

      // Input validation
      if (!packageId || !userId || !customerEmail) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Fetch package details from database using Supabase
      const { data: packageData, error: packageError } = await supabase
        .from('package')
        .select('*')
        .eq('package_id', packageId)
        .single();

      if (packageError || !packageData) {
        console.error('Package fetch error:', packageError);
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      // Generate unique transaction ID
      const tran_id = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create pending transaction record using Supabase
      const { data: transactionData, error: transactionError } = await supabase
        .from('payment_transactions')
        .insert([{
          transaction_id: tran_id,
          user_id: userId,
          package_id: packageId,
          amount: packageData.discount_price,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (transactionError) {
        console.error('Transaction creation error:', transactionError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create transaction record'
        });
      }

      // SSLCommerz payment data
      const data = {
        total_amount: packageData.discount_price,
        currency: 'BDT',
        tran_id: tran_id,
        success_url: `${BACKEND_URL}/api/payment/success`,
        fail_url: `${BACKEND_URL}/api/payment/fail`,
        cancel_url: `${BACKEND_URL}/api/payment/cancel`,
        ipn_url: `${BACKEND_URL}/api/payment/ipn`,
        shipping_method: 'NO',
        product_name: packageData.title,
        product_category: 'Premium Package',
        product_profile: 'digital-goods',
        cus_name: customerName,
        cus_email: customerEmail,
        cus_add1: customerAddress,
        cus_add2: '',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: customerPhone,
        cus_fax: '',
        ship_name: customerName,
        ship_add1: customerAddress,
        ship_add2: '',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: '1000',
        ship_country: 'Bangladesh',
        value_a: packageId,
        value_b: userId,
        value_c: packageData.validity,
        value_d: `tag:${packageData.tag},question:${packageData.question},survey:${packageData.survey}`
      };

      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      const apiResponse = await sslcz.init(data);

      if (apiResponse?.GatewayPageURL) {
        return res.json({
          success: true,
          message: 'Payment initiated successfully',
          GatewayPageURL: apiResponse.GatewayPageURL,
          transaction_id: tran_id
        });
      } else {
        throw new Error('Failed to get payment gateway URL');
      }

    } catch (error) {
      console.error('Payment initiation error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to initiate payment'
      });
    }
  }

  // Payment success callback
  static async paymentSuccess(req, res) {
    try {
      const { tran_id, val_id, amount, card_type, store_amount, bank_tran_id, card_issuer } = req.body;

      console.log('Payment Success Callback:', req.body);

      // Validate transaction with SSLCommerz
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      const validation = await sslcz.validate({ val_id: val_id });

      if (validation.status === 'VALID') {
        // Update transaction status using Supabase
        const { error: updateError } = await supabase
          .from('payment_transactions')
          .update({
            status: 'completed',
            val_id: val_id,
            bank_tran_id: bank_tran_id,
            card_type: card_type,
            store_amount: store_amount,
            card_issuer: card_issuer,
            completed_at: new Date().toISOString()
          })
          .eq('transaction_id', tran_id);

        if (updateError) {
          console.error('Transaction update error:', updateError);
          throw new Error('Failed to update transaction');
        }

        // Get transaction details with package info using Supabase
        const { data: transactionData, error: fetchError } = await supabase
          .from('payment_transactions')
          .select(`
            *,
            package:package_id (
              title,
              tag,
              question,
              survey,
              validity
            )
          `)
          .eq('transaction_id', tran_id)
          .single();

        if (fetchError || !transactionData) {
          console.error('Transaction fetch error:', fetchError);
          throw new Error('Failed to fetch transaction details');
        }

        // Calculate subscription dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + transactionData.package.validity);

        // Check if user already has an active subscription
        const { data: existingSubscription, error: checkError } = await supabase
          .from('subscription')
          .select('*')
          .eq('user_id', transactionData.user_id)
          .gte('end_date', startDate.toISOString().split('T')[0])
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Subscription check error:', checkError);
        }

        if (existingSubscription) {
          // Update existing subscription by adding the new package benefits
          const { error: updateSubscriptionError } = await supabase
            .from('subscription')
            .update({
              tag: existingSubscription.tag + transactionData.package.tag,
              question: existingSubscription.question + transactionData.package.question,
              survey: existingSubscription.survey + transactionData.package.survey,
              end_date: endDate.toISOString().split('T')[0], // Extend the end date
              cost: existingSubscription.cost + transactionData.amount,
              package_id: transactionData.package_id // Update to latest package
            })
            .eq('subscription_id', existingSubscription.subscription_id);

          if (updateSubscriptionError) {
            console.error('Subscription update error:', updateSubscriptionError);
            throw new Error('Failed to update existing subscription');
          }

          console.log('Existing subscription updated successfully for user:', transactionData.user_id);
        } else {
          // Create new subscription
          const { error: subscriptionError } = await supabase
            .from('subscription')
            .insert([{
              user_id: transactionData.user_id,
              tag: transactionData.package.tag,
              question: transactionData.package.question,
              survey: transactionData.package.survey,
              start_date: startDate.toISOString().split('T')[0],
              end_date: endDate.toISOString().split('T')[0],
              cost: transactionData.amount,
              package_id: transactionData.package_id
            }]);

          if (subscriptionError) {
            console.error('Subscription creation error:', subscriptionError);
            throw new Error('Failed to create subscription');
          }

          console.log('New subscription created successfully for user:', transactionData.user_id);
        }

        // Redirect to dashboard with success message
        return res.redirect(`${FRONTEND_URL}/dashboard?payment=success&package=${encodeURIComponent(transactionData.package.title)}`);
      } else {
        // Invalid transaction
        const { error: failError } = await supabase
          .from('payment_transactions')
          .update({ status: 'failed', failed_at: new Date().toISOString() })
          .eq('transaction_id', tran_id);

        if (failError) {
          console.error('Failed transaction update error:', failError);
        }

        return res.redirect(`${FRONTEND_URL}/dashboard?payment=failed&tran_id=${tran_id}`);
      }

    } catch (error) {
      console.error('Payment success callback error:', error);
      return res.redirect(`${FRONTEND_URL}/dashboard?payment=error&message=${encodeURIComponent(error.message)}`);
    }
  }

  // Payment fail callback
  static async paymentFail(req, res) {
    try {
      const { tran_id, error } = req.body;

      console.log('Payment Fail Callback:', req.body);

      // Update transaction status using Supabase
      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update({
          status: 'failed',
          failed_at: new Date().toISOString()
        })
        .eq('transaction_id', tran_id);

      if (updateError) {
        console.error('Failed transaction update error:', updateError);
      }

      return res.redirect(`${FRONTEND_URL}/dashboard?payment=failed&tran_id=${tran_id}&error=${encodeURIComponent(error || 'Payment failed')}`);
    } catch (error) {
      console.error('Payment fail callback error:', error);
      return res.redirect(`${FRONTEND_URL}/dashboard?payment=error&message=${encodeURIComponent(error.message)}`);
    }
  }

  // Payment cancel callback
  static async paymentCancel(req, res) {
    try {
      const { tran_id } = req.body;

      console.log('Payment Cancel Callback:', req.body);

      // Update transaction status using Supabase
      const { error } = await supabase
        .from('payment_transactions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('transaction_id', tran_id);

      if (error) {
        console.error('Cancelled transaction update error:', error);
      }

      return res.redirect(`${FRONTEND_URL}/dashboard?payment=cancelled&tran_id=${tran_id}`);
    } catch (error) {
      console.error('Payment cancel callback error:', error);
      return res.redirect(`${FRONTEND_URL}/dashboard?payment=error&message=${encodeURIComponent(error.message)}`);
    }
  }

  // IPN (Instant Payment Notification) callback
  static async paymentIPN(req, res) {
    try {
      const { tran_id, val_id, status } = req.body;

      console.log('IPN Callback:', req.body);

      if (status === 'VALID') {
        // Validate with SSLCommerz
        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
        const validation = await sslcz.validate({ val_id: val_id });

        if (validation.status === 'VALID') {
          // Additional validation and processing if needed
          console.log('IPN validation successful for transaction:', tran_id);
        }
      }

      return res.status(200).send('OK');
    } catch (error) {
      console.error('IPN callback error:', error);
      return res.status(500).send('Error');
    }
  }

  // Get payment history for a user
  static async getPaymentHistory(req, res) {
    try {
      const userId = req.jwt.id; // From auth middleware

      // Fetch payment history using Supabase
      const { data: payments, error } = await supabase
        .from('payment_transactions')
        .select(`
          transaction_id,
          amount,
          status,
          created_at,
          completed_at,
          package:package_id (
            title
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Payment history fetch error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch payment history'
        });
      }

      // Format the response
      const formattedPayments = payments.map(payment => ({
        transaction_id: payment.transaction_id,
        amount: parseFloat(payment.amount) || 0,
        status: payment.status,
        created_at: payment.created_at,
        completed_at: payment.completed_at,
        package_name: payment.package?.title || 'Unknown Package'
      }));

      return res.status(200).json({
        success: true,
        message: 'Payment history retrieved successfully',
        payments: formattedPayments,
        total_payments: formattedPayments.length
      });

    } catch (error) {
      console.error('Get payment history error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error: ' + error.message
      });
    }
  }

  // Get transaction details
  static async getTransactionDetails(req, res) {
    try {
      const { transaction_id } = req.params;
      const userId = req.jwt.id;

      const { data: transaction, error } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          package:package_id (
            title,
            tag,
            question,
            survey,
            validity
          )
        `)
        .eq('transaction_id', transaction_id)
        .eq('user_id', userId)
        .single();

      if (error || !transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      return res.status(200).json({
        success: true,
        transaction: transaction
      });

    } catch (error) {
      console.error('Get transaction details error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error: ' + error.message
      });
    }
  }
}

module.exports = PaymentController;