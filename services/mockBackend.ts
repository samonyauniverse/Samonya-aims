export const mockBackend = {
  // Simulate sending an OTP to a phone or email
  sendOTP: async (contact: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[Backend] Sending OTP to ${contact}: 1234`);
        resolve(true);
      }, 1500);
    });
  },

  // Simulate verifying the OTP
  verifyOTP: async (contact: string, code: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[Backend] Verifying OTP ${code} for ${contact}`);
        // For testing, strictly use '1234'
        if (code === '1234') {
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1500);
    });
  },

  // Simulate verifying a Payment Transaction ID
  verifyTransaction: async (transactionId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[Backend] Verifying Transaction ID: ${transactionId}`);
        // Simple mock validation: ID must be at least 5 chars long to be "valid"
        // In a real system, this would call MPesa/Stripe APIs
        if (transactionId && transactionId.length >= 5) {
          resolve(true);
        } else {
          resolve(false);
        }
      }, 2500);
    });
  }
};