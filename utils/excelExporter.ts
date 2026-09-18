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
