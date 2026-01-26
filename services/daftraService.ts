
/**
 * Daftra API Service for Dhool Dental Clinic
 * Manage API Keys via Settings View
 */

// Helper to get the base URL dynamically or fallback to default
const getBaseUrl = () => {
    let domain = localStorage.getItem('daftra_domain') || 'dhool.daftra.com';
    // Remove protocol if user pasted it
    domain = domain.replace('https://', '').replace('http://', '').replace(/\/$/, '');
    return `https://${domain}/api2`;
};

export const daftraApi = {
  getApiKey: () => localStorage.getItem('daftra_api_key') || '',
  getDomain: () => localStorage.getItem('daftra_domain') || 'dhool.daftra.com',
  
  setConfig: (key: string, domain: string) => {
    localStorage.setItem('daftra_api_key', key);
    localStorage.setItem('daftra_domain', domain);
  },

  getHeaders: () => ({
    'API-KEY': localStorage.getItem('daftra_api_key') || '',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }),

  checkConnection: async () => {
    const key = localStorage.getItem('daftra_api_key');
    if (!key) return false;

    try {
      const response = await fetch(`${getBaseUrl()}/clients?limit=1`, {
        method: 'GET',
        headers: {
            'API-KEY': key,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
      });
      
      if (response.status === 401) {
        console.warn('Daftra API: 401 Unauthorized. Please verify API Key in Settings.');
        return false;
      }
      
      return response.ok;
    } catch (error) {
      console.warn('Daftra connection check failed (Offline or Network Error).');
      return false;
    }
  },

  getPatients: async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/clients`, {
        method: 'GET',
        headers: daftraApi.getHeaders()
      });
      if (!response.ok) throw new Error(`Daftra API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Daftra Fetch Error:', error);
      return null;
    }
  },

  createClient: async (patient: { name: string; phone: string; email?: string }) => {
    try {
      const response = await fetch(`${getBaseUrl()}/clients`, {
        method: 'POST',
        headers: daftraApi.getHeaders(),
        body: JSON.stringify({
          Client: {
            first_name: patient.name,
            phone1: patient.phone,
            email: patient.email || ''
          }
        })
      });
      if (!response.ok) throw new Error(`Daftra API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Daftra Client Creation Error:', error);
      return null;
    }
  },

  createInvoice: async (invoiceData: { amount: number; notes: string; client_id?: number }) => {
    try {
      const response = await fetch(`${getBaseUrl()}/invoices`, {
        method: 'POST',
        headers: daftraApi.getHeaders(),
        body: JSON.stringify({
          Invoice: {
            client_id: invoiceData.client_id || 1, 
            status: 1, 
            invoice_items: [
              {
                item: "Clinical Service / Pharmacy",
                unit_price: invoiceData.amount,
                quantity: 1
              }
            ],
            notes: invoiceData.notes
          }
        })
      });
      if (!response.ok) throw new Error(`Daftra API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Daftra Invoice Error:', error);
      return null;
    }
  }
};
