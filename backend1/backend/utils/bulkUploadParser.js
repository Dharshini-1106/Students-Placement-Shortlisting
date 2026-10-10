const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs'); // ✅ Added for password hashing
const moment = require('moment');

// ------------------ File Parsing ------------------ //
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ',' }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

const parseExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(worksheet);
};

const parseFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.csv') return await parseCSV(filePath);
  else if (ext === '.xlsx' || ext === '.xls') return parseExcel(filePath);
  else throw new Error('Unsupported file format. Only CSV and Excel files are supported.');
};

// ------------------ Student Validation ------------------ //
const validateStudentData = (data) => {
  const errors = [];
  const validData = [];
  const expectedHeader = 'Name,College mail,Date of Birth,Degree,Department,Gender,Tutor name,Student contact,Personal mail';

  data.forEach((row, index) => {
    const rowErrors = [];
    const processedRow = {};
    const rowKeys = Object.keys(row);

    // ---------- Parse row ----------
    if (rowKeys.length === 1 && rowKeys[0] === expectedHeader) {
      if (index === 0) return; // skip header
      const values = row[expectedHeader].split(',');
      if (values.length !== 9) rowErrors.push('Invalid number of columns');
      else {
        processedRow.fullName = values[0]?.trim();
        processedRow.username = values[1]?.trim();
        processedRow.dob = values[2]?.trim();
        processedRow.degree = values[3]?.trim();
        processedRow.department = values[4]?.trim();
        processedRow.gender = values[5]?.trim();
        processedRow.tutorName = values[6]?.trim();
        processedRow.studentContact = values[7]?.trim();
        processedRow.personalEmail = values[8]?.trim();
      }
    } else {
      // Multi-column / header-based
      const rowKeysLower = rowKeys.reduce((acc, key) => {
        acc[key.toLowerCase().trim()] = row[key];
        return acc;
      }, {});
      const fieldMapping = {
        'name': 'fullName',
        'college mail': 'username',
        'date of birth': 'dob',
        'degree': 'degree',
        'department': 'department',
        'gender': 'gender',
        'tutor name': 'tutorName',
        'student contact': 'studentContact',
        'personal mail': 'personalEmail'
      };

      Object.keys(fieldMapping).forEach((field) => {
        const value = rowKeysLower[field];
        if (!value || value.toString().trim() === '') rowErrors.push(`${field} is required`);
        else processedRow[fieldMapping[field]] = value.toString().trim();
      });
    }

    // ---------- Validations ----------
    if (processedRow.username && !/^[^\s@]+@nec\.edu\.in$/.test(processedRow.username)) rowErrors.push('College mail must be valid NEC email');
    if (processedRow.personalEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(processedRow.personalEmail)) rowErrors.push('Personal mail must be valid email');
    if (processedRow.studentContact && !/^[0-9]{10}$/.test(processedRow.studentContact)) rowErrors.push('Student contact must be 10-digit number');
    if (processedRow.gender && !['Male', 'Female', 'Other'].includes(processedRow.gender)) rowErrors.push('Gender must be Male, Female, or Other');
    if (processedRow.degree && !['B.E.', 'B.Tech', 'M.E.', 'M.Tech'].includes(processedRow.degree)) rowErrors.push('Degree must be B.E., B.Tech, M.E., or M.Tech');
    const validDepartments = ['CSE', 'ECE', 'IT', 'AI&DS', 'MECH', 'CIVIL', 'EEE'];
    if (processedRow.department && !validDepartments.includes(processedRow.department)) rowErrors.push(`Department must be one of: ${validDepartments.join(', ')}`);

    // ---------- Handle Date of Birth and Password ----------
    let dateOfBirth = null;
    let password = null;
    if (processedRow.dob) {
      const dateStr = processedRow.dob.trim();
      // Try parsing as DD/MM/YYYY first (common in India), then other formats
      let parsedDate = moment(dateStr, 'DD/MM/YYYY', true);
      if (!parsedDate.isValid()) {
        parsedDate = moment(dateStr, ['MM/DD/YYYY', 'YYYY-MM-DD', 'MM-DD-YYYY'], true);
      }
      if (parsedDate.isValid()) {
        // Create date at noon local time to avoid timezone conversion issues
        dateOfBirth = moment(parsedDate).local().startOf('day').add(12, 'hours').toDate();
        // Format password as DD/MM/YYYY
        password = parsedDate.format('DD/MM/YYYY');
      } else {
        // If can't parse date, still allow row but dateOfBirth is null
        // Password remains null
      }
    } else {
      // If no DOB provided, set both to null
      dateOfBirth = null;
      password = null;
    }

    // ---------- Push valid data ----------
    if (rowErrors.length === 0) {
      validData.push({
        fullName: processedRow.fullName,
        username: processedRow.username,
        degree: processedRow.degree,
        department: processedRow.department,
        gender: processedRow.gender,
        tutorName: processedRow.tutorName,
        studentContact: processedRow.studentContact,
        personalEmail: processedRow.personalEmail,
        role: 'student',
        collegeEmail: processedRow.username,
        dateOfBirth,
        password // Plain DOB string (DD/MM/YYYY) - model will hash it
      });
    } else errors.push({ row: index + 2, errors: rowErrors, data: row });
  });

  return { validData, errors };
};

// ------------------ Staff Validation ------------------ //
const validateStaffData = (data) => {
  const requiredFields = ['name', 'college mail', 'date of birth', 'department', 'contact number', 'designation'];
  const errors = [];
  const validData = [];

  data.forEach((row, index) => {
    const rowErrors = [];
    const processedRow = {};
    const rowKeys = Object.keys(row).reduce((acc, key) => { acc[key.toLowerCase().trim()] = row[key]; return acc; }, {});
    const fieldMapping = {
      'name': 'fullName',
      'college mail': 'username',
      'date of birth': 'dob',
      'department': 'department',
      'contact number': 'contactNumber',
      'designation': 'designation'
    };

    requiredFields.forEach((field) => {
      const value = rowKeys[field];
      if (!value || value.toString().trim() === '') rowErrors.push(`${field} is required`);
      else processedRow[fieldMapping[field]] = value.toString().trim();
    });

    if (processedRow.username && !/^[^\s@]+@nec\.edu\.in$/.test(processedRow.username)) rowErrors.push('College mail must be valid NEC email');
    if (processedRow.contactNumber && !/^[0-9]{10}$/.test(processedRow.contactNumber)) rowErrors.push('Contact Number must be 10-digit number');
    const validDepartments = ['CSE', 'ECE', 'IT', 'AI&DS', 'MECH', 'CIVIL', 'EEE', 'Placement Cell'];
    if (processedRow.department && !validDepartments.includes(processedRow.department)) rowErrors.push(`Department must be one of: ${validDepartments.join(', ')}`);

    // ---------- DOB & Password ----------
    let dateOfBirth = null;
    let password = null;
    if (processedRow.dob) {
      const dateStr = processedRow.dob.trim();
      // Try parsing as DD/MM/YYYY first (common in India), then other formats
      let parsedDate = moment(dateStr, 'DD/MM/YYYY', true);
      if (!parsedDate.isValid()) {
        parsedDate = moment(dateStr, ['MM/DD/YYYY', 'YYYY-MM-DD', 'MM-DD-YYYY'], true);
      }
      if (parsedDate.isValid()) {
        // Create date at noon local time to avoid timezone conversion issues
        dateOfBirth = moment(parsedDate).local().startOf('day').add(12, 'hours').toDate();
        // Format password as DD/MM/YYYY
        password = parsedDate.format('DD/MM/YYYY');
      } else {
        // If can't parse date, still allow row but dateOfBirth is null
        // Password remains null
      }
    } else {
      // If no DOB provided, set both to null
      dateOfBirth = null;
      password = null;
    }

    if (rowErrors.length === 0) {
      validData.push({
        ...processedRow,
        role: 'staff',
        email: processedRow.username,
        dateOfBirth,
        password // Plain DOB string (DD/MM/YYYY) - model will hash it
      });
    } else errors.push({ row: index + 2, errors: rowErrors, data: row });
  });

  return { validData, errors };
};

// ------------------ Export ------------------ //
module.exports = {
  parseFile,
  validateStudentData,
  validateStaffData
};
