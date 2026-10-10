const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
  // Authentication
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'staff'
  },

  // Basic Information
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: false, // Allow null for invalid dates
    set: function (date) {
      // Accepts DD/MM/YYYY or Date
      if (date instanceof Date) return date;
      if (typeof date === 'string' && date.includes('/')) {
        const [day, month, year] = date.split('/').map(num => parseInt(num, 10));
        // Create date at midnight local time to avoid timezone conversion issues
        const d = new Date();
        d.setFullYear(year, month - 1, day);
        d.setHours(0, 0, 0, 0);
        return d;
      }
      return new Date(date);
    },
    get: function (date) {
      if (!date) return null;
      const d = new Date(date);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    }
  },
  department: {
    type: String,
    required: true,
    enum: ['CSE', 'ECE', 'IT', 'AI&DS', 'MECH', 'CIVIL', 'EEE', 'Placement Cell']
  },
  contactNumber: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  designation: {
    type: String,
    required: true
  },
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});


// 🔒 Hash password before saving
staffSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.skipHash) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});


// 🔒 Hash password for update operations (if applicable)
staffSchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {
  const update = this.getUpdate();
  if (update && update.$set && update.$set.password && !update.$set.skipHash) {
    const salt = await bcrypt.genSalt(10);
    update.$set.password = await bcrypt.hash(update.$set.password, salt);
  }
  next();
});


// ✅ Password comparison method (for login)
staffSchema.methods.matchPassword = async function (enteredPassword) {
  console.log('Staff matchPassword called with enteredPassword:', enteredPassword);
  console.log('stored password hash:', this.password);

  // If password is not hashed (plain DOB), compare directly
  if (this.password && !this.password.startsWith('$2')) {
    console.log('Using plain text comparison for DOB password');
    const result = enteredPassword === this.password;
    console.log('Plain text compare result:', result);
    return result;
  }

  // Otherwise, use bcrypt comparison
  const result = await bcrypt.compare(enteredPassword, this.password);
  console.log('bcrypt.compare result:', result);
  return result;
};


// ✅ Helper (for bulk upload)
// Convert DOB (DD/MM/YYYY) → hashed password
staffSchema.statics.generateHashedPassword = async function (dobString) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(dobString, salt);
};


module.exports = mongoose.model('Staff', staffSchema);
