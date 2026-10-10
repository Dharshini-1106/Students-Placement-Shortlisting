const mongoose = require('mongoose');
const Student = require('./models/Student');
require('dotenv').config();

async function listStudents() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const students = await Student.find({}).select('username fullName dateOfBirth');
    console.log('Students in database:');
    students.forEach(student => {
      console.log(`Username: ${student.username}, Name: ${student.fullName}, DOB: ${student.dateOfBirth}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

listStudents();
