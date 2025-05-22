import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  date: { type: Date, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { 
      type: String, 
      enum: ['present', 'absent', 'late', 'excused'],
      default: 'present'
    },
    remarks: String,
    timeMarked: { type: Date, default: Date.now }
  }],
  lastModified: { type: Date, default: Date.now },
  modificationHistory: [{
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
    changes: [{
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      oldStatus: String,
      newStatus: String,
      reason: String
    }]
  }]
});
