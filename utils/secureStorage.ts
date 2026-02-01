
// Simple XOR Cipher + Base64 for local data obfuscation and security
const SECRET = "DHOOL_CLINIC_SECURE_2025_KEY_X9_CLINICAL_SYSTEM";

export const secureStorage = {
  setItem: (key: string, data: any) => {
    try {
      const stringData = JSON.stringify(data);
      // XOR Cipher + Base64 Encoding
      const encrypted = btoa(stringData.split('').map((c, i) => 
        String.fromCharCode(c.charCodeAt(0) ^ SECRET.charCodeAt(i % SECRET.length))
      ).join(''));
      localStorage.setItem(key, encrypted);
    } catch (e) {
      console.warn("Encryption failed, falling back to plain text", e);
      localStorage.setItem(key, JSON.stringify(data));
    }
  },

  getItem: (key: string) => {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    try {
      // Attempt Decryption
      const decrypted = atob(item).split('').map((c, i) => 
        String.fromCharCode(c.charCodeAt(0) ^ SECRET.charCodeAt(i % SECRET.length))
      ).join('');
      return JSON.parse(decrypted);
    } catch (e) {
      // Fallback: Data might be plain text (migration from old version)
      try {
        const plain = JSON.parse(item);
        // Auto-migrate to encrypted format for next time
        secureStorage.setItem(key, plain);
        return plain;
      } catch (e2) {
        return null;
      }
    }
  },

  removeItem: (key: string) => localStorage.removeItem(key)
};
