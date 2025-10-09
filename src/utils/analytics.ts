/* eslint-disable no-console */

// Simple analytics service for logging events to the console.

export const logEvent = (eventName: string, params?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics Event] ${eventName}`, params || '');
  }
  // In a real application, you would send this data to a service like Google Analytics, Mixpanel, etc.
};

export const trackPageView = (path: string) => {
  logEvent('page_view', { page_path: path });
};
