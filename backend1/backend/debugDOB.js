const mongoose = require('mongoose');
const Student = require('./models/Student');
require('dotenv').config();

async function debugDOB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const student = await Student.findOne({ username: '2315048@nec.edu.in' });
    console.log('Student DOB:', student.dateOfBirth);

    if (student.dateOfBirth) {
      const d = new Date(student.dateOfBirth);
      const formatted = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
      console.log('Formatted DOB:', formatted);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugDOB();
