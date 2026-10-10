const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('./models/Student');
const Staff = require('./models/Staff');
require('dotenv').config();

async function updatePasswords() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Update Student passwords
    const students = await Student.find({ dateOfBirth: { $ne: null } });
    for (const student of students) {
      if (student.dateOfBirth) {
        const day = student.dateOfBirth.getDate().toString().padStart(2, '0');
        const month = (student.dateOfBirth.getMonth() + 1).toString().padStart(2, '0');
        const year = student.dateOfBirth.getFullYear();
        const dobString = `${day}/${month}/${year}`;
        student.password = dobString;
        student.skipHash = true;
        await student.save();
        console.log(`Updated password for student: ${student.username}`);
      }
    }

    // Update Staff passwords
    const staffs = await Staff.find({ dateOfBirth: { $ne: null } });
    for (const staff of staffs) {
      if (staff.dateOfBirth) {
        const day = staff.dateOfBirth.getDate().toString().padStart(2, '0');
        const month = (staff.dateOfBirth.getMonth() + 1).toString().padStart(2, '0');
        const year = staff.dateOfBirth.getFullYear();
        const dobString = `${day}/${month}/${year}`;
        staff.password = dobString;
        staff.skipHash = true;
        await staff.save();
        console.log(`Updated password for staff: ${staff.username}`);
      }
    }

    console.log('Password update completed');
  } catch (error) {
    console.error('Error updating passwords:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updatePasswords();
