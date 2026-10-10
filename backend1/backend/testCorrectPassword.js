const mongoose = require('mongoose');
const Student = require('./models/Student');
require('dotenv').config();

async function testCorrectPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const student = await Student.findOne({ username: '2315048@nec.edu.in' });
    console.log('Student password in DB:', student.password);

    // Test direct password comparison
    const enteredPassword = '15/05/2003';
    console.log('Entered password:', enteredPassword);
    console.log('Passwords match:', student.password === enteredPassword);

    // Test matchPassword method
    const matchResult = await student.matchPassword(enteredPassword);
    console.log('matchPassword result:', matchResult);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testCorrectPassword();
