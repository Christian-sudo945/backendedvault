import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['adviser', 'subject_teacher', 'school_admin', 'student', 'parent'],
    required: true 
  },
  advisoryClass: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  assignedSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  notifications: [{
    type: { type: String },
    message: String,
    date: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],
  settings: {
    notifyAbsences: { type: Boolean, default: true },
    absenceThreshold: { type: Number, default: 3 },
    notificationMethod: { 
      app: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false }
    }
  }
});
