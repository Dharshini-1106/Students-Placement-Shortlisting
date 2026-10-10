const mongoose = require('mongoose');
const Student = require('./models/Student');
require('dotenv').config();

async function debugLogin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const student = await Student.findOne({ username: '2315048@nec.edu.in' });
    console.log('Student found:', !!student);
    console.log('Student DOB:', student.dateOfBirth);
    console.log('Student role check:', student.constructor.modelName);
    console.log('Has dateOfBirth:', !!student.dateOfBirth);
    console.log('Role is student:', student.constructor.modelName === 'Student');

    const expectedDOB = student.dateOfBirth ? `${student.dateOfBirth.getDate().toString().padStart(2, '0')}/${(student.dateOfBirth.getMonth() + 1).toString().padStart(2, '0')}/${student.dateOfBirth.getFullYear()}` : null;
    console.log('Expected DOB password:', expectedDOB);
    console.log('Entered password should be:', '15/05/2003');
    console.log('Match:', expectedDOB === '15/05/2003');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugLogin();
