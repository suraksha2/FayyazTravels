// Analytics tracking for enquiry events
export const trackEnquiryEvent = (eventName: string, properties: Record<string, any>) => {
  // Google Analytics 4 tracking
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, {
      event_category: 'enquiry',
      event_label: properties.packageName,
      custom_parameters: properties
    });
  }

  // Facebook Pixel tracking
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'Lead', {
      content_name: properties.packageName,
      content_category: properties.packageType,
      value: 0,
      currency: 'SGD'
    });
  }

  // Console log for development
  console.log(`📊 Analytics: ${eventName}`, properties);
};

export const enquiryAnalytics = {
  modalOpened: (packageName: string, destination: string) => {
    trackEnquiryEvent('enquiry_modal_opened', {
      packageName,
      destination,
      timestamp: new Date().toISOString()
    });
  },

  formSubmitted: (packageName: string, destination: string, customerEmail: string) => {
    trackEnquiryEvent('enquiry_form_submitted', {
      packageName,
      destination,
      customerEmail,
      timestamp: new Date().toISOString()
    });
  },

  formCompleted: (packageName: string, destination: string) => {
    trackEnquiryEvent('enquiry_form_completed', {
      packageName,
      destination,
      timestamp: new Date().toISOString()
    });
  }
};
