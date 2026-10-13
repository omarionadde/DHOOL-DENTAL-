/**
 * WhatsApp Helper Utilities for Dhool Dental Clinic & Pharmacy
 */

export function cleanSomaliPhoneNumber(phone: string): string {
  if (!phone) return '';
  // Strip spaces, dashes, parentheses, plus
  let cleaned = phone.replace(/[^0-9]/g, '');

  // If starts with 00252, convert to 252
  if (cleaned.startsWith('00252')) {
    cleaned = cleaned.substring(2);
  }

  // If local format e.g. 061XXXXXXX or 062XXXXXXX or 068XXXXXXX (9-10 digits starting with 0)
  if (cleaned.startsWith('0') && cleaned.length >= 9) {
    cleaned = '252' + cleaned.substring(1);
  }

  // If starts with 61, 62, 68, 77, 90 etc. without country code (8-9 digits)
  if ((cleaned.startsWith('6') || cleaned.startsWith('7') || cleaned.startsWith('9')) && cleaned.length <= 9) {
    cleaned = '252' + cleaned;
  }

  return cleaned;
}

export function openWhatsApp(phone: string, message: string) {
  const cleanPhone = cleanSomaliPhoneNumber(phone);
  const encodedText = encodeURIComponent(message);
  const url = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function getAppointmentReminderMessage(params: {
  patientName: string;
  date: string;
  time: string;
  doctor: string;
  reason?: string;
}): string {
  return `Asc ${params.patientName},

Waxaan kugu xusuusinaynaa ballantaada Dhool Dental Clinic:
📅 Taariikhda: ${params.date}
⏰ Saacadda: ${params.time}
👨‍⚕️ Dhakhtarka: ${params.doctor}
🦷 Sababta: ${params.reason || 'Baaritaan guud'}

Fadlan haddii aad wax ka beddelayso xilliga ballanta nala soo xiriir ka hor.
📍 Waaberi, Via Liberia, Muqdisho
📞 Tel: +252 61 972 6662
Mahadsanid!`;
}

export function getDebtReminderMessage(params: {
  patientName: string;
  balance: number;
  patientId?: string;
}): string {
  return `Asc ${params.patientName},

Waxaan kugu xusuusinaynaa in xarunta Dhool Dental Clinic & Pharmacy ay kugu leedahay lacag deyn dhiman ah:
💵 Wadarta Deenta: $${params.balance.toFixed(2)}
🔢 Tixraaca Bukaanka: #${params.patientId ? params.patientId.slice(-6).toUpperCase() : ''}

Fadlan waxaad lacagta ku bixin kartaa xarunta clinic-ka ama nala soo xiriir:
📍 Waaberi, Via Liberia, Muqdisho
📞 Tel: +252 61 972 6662 | EVC Plus
Mahadsanid!`;
}

export function getReceiptWhatsAppMessage(params: {
  patientName: string;
  receiptId: string;
  amountPaid: number;
  remainingBalance: number;
  date: string;
}): string {
  return `Asc ${params.patientName},

Waad ku mahadsan tahay lacag bixintaada Dhool Dental Clinic:
🧾 Rasiidh #: ${params.receiptId}
💵 Lacagta la bixiyay: $${params.amountPaid.toFixed(2)}
📊 Deenta Harta: $${params.remainingBalance.toFixed(2)}
📅 Taariikhda: ${params.date}

Dhool Dental Clinic & Pharmacy
📍 Waaberi, Via Liberia, Muqdisho
📞 Tel: +252 61 972 6662`;
}

export function getLabResultWhatsAppMessage(params: {
  patientName: string;
  testName: string;
  date: string;
  doctorName: string;
  status: string;
}): string {
  return `Asc ${params.patientName},

Waxaan kugu wargelinaynaa in natiijada baaritaankaaga shaybaarka (Laboratory Test) ay diyaar tahay:
🔬 Baaritaanka: ${params.testName}
👨‍⚕️ Dhakhtarka: ${params.doctorName}
📅 Taariikhda: ${params.date}
📋 Xaaladda Natiijada: ${params.status}

Fadlan waxaad natiijada oo daabacan ka qaadan kartaa xarunta Dhool Clinic ama la tasho dhakhtarkaaga.
📍 Waaberi, Via Liberia, Muqdisho
📞 Tel: +252 61 972 6662`;
}

export function getSupplierReorderWhatsAppMessage(params: {
  supplierName: string;
  medicineName: string;
  currentStock: number;
  requestedQuantity: number;
}): string {
  return `Asc ${params.supplierName},

Waxaan codsanaynaa dalab dawo cusub oo loogu talagalay Dhool Dental Clinic & Pharmacy:
💊 Dawada: ${params.medicineName}
📦 Tirada Dalabka: ${params.requestedQuantity} xabbo
📊 Stock-ga Hadda Yaalla: ${params.currentStock} xabbo

Fadlan noo soo xaqiiji helitaanka iyo qiimaha ugu dambeeya.
Dhool Dental Clinic & Pharmacy
📞 Tel: +252 61 972 6662`;
}
