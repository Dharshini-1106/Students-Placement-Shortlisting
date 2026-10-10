const mongoose = require('mongoose');
const Student = require('./models/Student');
const Staff = require('./models/Staff');
require('dotenv').config();

async function checkPasswordHash() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Check student password
    const student = await Student.findOne({ username: '2315048@nec.edu.in' });
    console.log('Student password:', student.password);
    console.log('Student password length:', student.password.length);
    console.log('Is hashed (length > 10):', student.password.length > 10);

    // Check staff password
    const staff = await Staff.findOne({ username: 'staff@nec.edu.in' });
    if (staff) {
      console.log('Staff password:', staff.password);
      console.log('Staff password length:', staff.password.length);
      console.log('Is hashed (length > 10):', staff.password.length > 10);
    } else {
      console.log('Staff not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkPasswordHash();
