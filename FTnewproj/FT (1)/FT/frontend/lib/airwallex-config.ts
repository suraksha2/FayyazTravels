// Airwallex configuration
export const AIRWALLEX_CONFIG = {
  clientId: 'x2uUrKZcR8OXL3gQOICUKw',
  environment: process.env.NODE_ENV === 'production' ? 'prod' : 'demo', // Use 'demo' for development, 'prod' for production
  locale: 'en',
  enabledElements: ['payments'] as const
};

// Test cards for demo environment
export const TEST_CARDS = {
  success: {
    number: '4242 4242 4242 4242',
    expiry: '12/25',
    cvc: '123',
    name: 'Test User'
  },
  decline: {
    number: '4000 0000 0000 0002',
    expiry: '12/25', 
    cvc: '123',
    name: 'Test User'
  },
  insufficientFunds: {
    number: '4000 0000 0000 9995',
    expiry: '12/25',
    cvc: '123', 
    name: 'Test User'
  }
};

export const SUPPORTED_CURRENCIES = ['SGD', 'USD', 'EUR', 'GBP', 'AUD'] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];
