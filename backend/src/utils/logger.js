// Simple structured console logger for CampusIQ
export const logger = {
  info: (message, meta = '') => {
    console.log(`[${new Date().toISOString()}] [INFO] [CampusIQ] ${message}`, meta ? meta : '');
  },
  warn: (message, meta = '') => {
    console.warn(`[${new Date().toISOString()}] [WARN] [CampusIQ] ${message}`, meta ? meta : '');
  },
  error: (message, meta = '') => {
    console.error(`[${new Date().toISOString()}] [ERROR] [CampusIQ] ${message}`, meta ? meta : '');
  },
  debug: (message, meta = '') => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${new Date().toISOString()}] [DEBUG] [CampusIQ] ${message}`, meta ? meta : '');
    }
  }
};
