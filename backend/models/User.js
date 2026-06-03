const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['student', 'tutor'],
      default: 'student'
    },
    school: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true  // automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('User', UserSchema);
