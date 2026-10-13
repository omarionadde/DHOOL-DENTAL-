import * as XLSX from 'xlsx';
import { Patient } from '../types';

/**
 * Utility to export Patient Debt Report to clean formatted Excel (.xlsx)
 */
export function exportDebtsToExcel(patients: Patient[]) {
  const indebtedPatients = patients.filter(p => (p.balance || 0) > 0);
  const totalDebt = indebtedPatients.reduce((sum, p) => sum + (p.balance || 0), 0);
  const exportDate = new Date().toLocaleDateString('so-SO') + ' (' + new Date().toISOString().split('T')[0] + ')';

  // Build spreadsheet rows
  const sheetData: (string | number)[][] = [
    ['DHOOL DENTAL CLINIC & PHARMACY'],
    ['WARBIXINTA DEEMAHA BUKAANKA (PATIENT DEBT REPORT)'],
    [`Taariikhda: ${exportDate}`, `Tirada Bukaanka: ${indebtedPatients.length}`, `Wadarta Deenta: $${totalDebt.toFixed(2)}`],
    [], // empty spacer row
    [
      'Tixraac (#)',
      'Patient ID',
      'Magaca Bukaanka (Patient Name)',
      'Taleefanka (Phone)',
      'Da\'da (Age)',
      'Jinsiga (Gender)',
      'Booqashadii Dambaysay',
      'Deenta Ku Taalla / Balance ($)'
    ]
  ];

  indebtedPatients.forEach((patient, index) => {
    sheetData.push([
      index + 1,
      patient.id.slice(-6).toUpperCase(),
      patient.name,
      patient.phone,
      patient.age,
      patient.gender || 'N/A',
      patient.lastVisit || 'N/A',
      Number((patient.balance || 0).toFixed(2))
    ]);
  });

  // Summary Row
  sheetData.push([]);
  sheetData.push([
    'WADARTA GUUD (TOTAL OUTSTANDING DEBT):',
    '',
    '',
    '',
    '',
    '',
    '',
    Number(totalDebt.toFixed(2))
  ]);

  // Create workbook & worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 12 }, // #
    { wch: 15 }, // ID
    { wch: 32 }, // Name
    { wch: 18 }, // Phone
    { wch: 10 }, // Age
    { wch: 14 }, // Gender
    { wch: 22 }, // Last Visit
    { wch: 28 }  // Balance
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Warbixinta Deemaha');

  // Trigger download
  const filename = `Warbixinta_Deemaha_Dhool_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

/**
 * Utility to export Patients / Customers directory to clean formatted Excel (.xlsx)
 */
export function exportPatientsToExcel(patients: Patient[]) {
  const exportDate = new Date().toLocaleDateString('so-SO') + ' (' + new Date().toISOString().split('T')[0] + ')';
  const totalDebt = patients.reduce((sum, p) => sum + (p.balance || 0), 0);

  const sheetData: (string | number)[][] = [
    ['DHOOL DENTAL CLINIC & PHARMACY'],
    ['LIST-KA BUKAANKA & MACAAMIISHA (CUSTOMER & PATIENT DIRECTORY)'],
    [`Taariikhda: ${exportDate}`, `Wadarta Macaamiisha: ${patients.length}`, `Wadarta Deenta Ku Taalla: $${totalDebt.toFixed(2)}`],
    [], // Spacer
    [
      'Tixraac (#)',
      'ID Bukaanka',
      'Magaca Bukaanka (Patient Name)',
      'Taleefanka (Phone)',
      'Da\'da (Age)',
      'Jinsiga (Gender)',
      'Xaaladda / Condition',
      'Deenta Ku Taalla / Balance ($)',
      'Booqashadii Dambaysay'
    ]
  ];

  patients.forEach((patient, index) => {
    sheetData.push([
      index + 1,
      patient.id.slice(-6).toUpperCase(),
      patient.name,
      patient.phone,
      patient.age,
      patient.gender || 'N/A',
      patient.condition || 'General Checkup',
      Number((patient.balance || 0).toFixed(2)),
      patient.lastVisit || 'N/A'
    ]);
  });

  // Summary Row
  sheetData.push([]);
  sheetData.push([
    'WADARTA GUUD (TOTAL):',
    `${patients.length} Patient(s)`,
    '',
    '',
    '',
    '',
    '',
    Number(totalDebt.toFixed(2)),
    ''
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 12 }, // #
    { wch: 15 }, // ID
    { wch: 32 }, // Name
    { wch: 18 }, // Phone
    { wch: 10 }, // Age
    { wch: 14 }, // Gender
    { wch: 25 }, // Condition
    { wch: 28 }, // Balance
    { wch: 22 }  // Last Visit
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Macaamiisha & Bukaanka');

  const filename = `Macaamiisha_Dhool_Clinic_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

/**
 * Utility to export Lab Results to formatted Excel (.xlsx)
 */
export function exportLabResultsToExcel(labResults: any[], patients: Patient[]) {
  const exportDate = new Date().toLocaleDateString('so-SO') + ' (' + new Date().toISOString().split('T')[0] + ')';

  const sheetData: (string | number)[][] = [
    ['DHOOL DENTAL CLINIC & PHARMACY'],
    ['WARBIXINTA BAARITAANADA SHAYBAARKA (LABORATORY TESTS REPORT)'],
    [`Taariikhda: ${exportDate}`, `Tirada Baaritaannada: ${labResults.length}`],
    [],
    [
      'Tixraac (#)',
      'Lab ID',
      'Magaca Bukaanka (Patient)',
      'Nooca Baaritaanka (Test Name)',
      'Qaybta (Category)',
      'Natiijada (Result)',
      'Halbeegga (Unit)',
      'Xadka Caadiga ah (Ref Range)',
      'Xaaladda (Status)',
      'Xaaladda Dalabka (Order Status)',
      'Dhakhtarka (Doctor)',
      'Taariikhda (Date)'
    ]
  ];

  labResults.forEach((lab, index) => {
    const patient = patients.find(p => p.id === lab.patientId);
    sheetData.push([
      index + 1,
      lab.id,
      lab.patientName || patient?.name || 'N/A',
      lab.testName,
      lab.category || 'General',
      lab.result || 'Pending',
      lab.unit || '',
      lab.referenceRange || '',
      lab.status,
      lab.orderStatus || 'Completed',
      lab.doctorName,
      lab.date
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  worksheet['!cols'] = [
    { wch: 10 },
    { wch: 16 },
    { wch: 28 },
    { wch: 30 },
    { wch: 20 },
    { wch: 22 },
    { wch: 14 },
    { wch: 24 },
    { wch: 14 },
    { wch: 18 },
    { wch: 24 },
    { wch: 16 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Shaybaarka');
  const filename = `Shaybaarka_Dhool_Clinic_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

/**
 * Utility to export Pharmacy Medicine Stock & Expiry to formatted Excel (.xlsx)
 */
export function exportMedicineStockToExcel(medicines: any[], filterType: 'all' | 'expired' | 'low-stock' = 'all') {
  const exportDate = new Date().toLocaleDateString('so-SO') + ' (' + new Date().toISOString().split('T')[0] + ')';
  const title = filterType === 'expired' 
    ? 'WARBIXINTA DAAWOOYINKA DHACAY & DHACAYA (EXPIRED & EXPIRING MEDICINES REPORT)'
    : filterType === 'low-stock'
    ? 'WARBIXINTA STOCK-GA YAR (LOW STOCK REORDER REPORT)'
    : 'WARBIXINTA STOCK-GA DAWOOYINKA (PHARMACY INVENTORY REPORT)';

  const sheetData: (string | number)[][] = [
    ['DHOOL DENTAL CLINIC & PHARMACY'],
    [title],
    [`Taariikhda: ${exportDate}`, `Tirada Dawooyinka: ${medicines.length}`],
    [],
    [
      'Tixraac (#)',
      'ID Daawada',
      'Magaca Daawada (Medicine Name)',
      'Qaybta (Category)',
      'Stock Hadda Yaalla',
      'Qiimaha Iibka / Retail ($)',
      'Qiimaha Soo Iibsiga / Cost ($)',
      'Taariikhda Dhicitaanka (Expiry Date)',
      'Xaaladda Dhicitaanka (Expiry Status)'
    ]
  ];

  const now = new Date();

  medicines.forEach((med, index) => {
    let expiryStatus = 'Valid';
    if (med.expiryDate) {
      const exp = new Date(med.expiryDate);
      const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        expiryStatus = `DHACDAY (Expired ${Math.abs(diffDays)}d ago)`;
      } else if (diffDays <= 30) {
        expiryStatus = `Critical: Waxay dhacaysaa ${diffDays} maalmood gudahood`;
      } else if (diffDays <= 90) {
        expiryStatus = `Warning: Waxay dhacaysaa ${diffDays} maalmood gudahood`;
      } else {
        expiryStatus = 'Caafimaad qabta (Valid)';
      }
    }

    sheetData.push([
      index + 1,
      med.id,
      med.name,
      med.category,
      med.stock,
      Number(med.price.toFixed(2)),
      med.costPrice ? Number(med.costPrice.toFixed(2)) : 'N/A',
      med.expiryDate || 'N/A',
      expiryStatus
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  worksheet['!cols'] = [
    { wch: 10 },
    { wch: 16 },
    { wch: 32 },
    { wch: 18 },
    { wch: 18 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 35 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pharmacy Inventory');
  const filename = `Pharmacy_Inventory_Dhool_${filterType}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
