import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gradeLevel: { type: String, required: true },
  section: { type: String, required: true },
  adviser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  academicYear: { type: String, required: true },
  attendanceThresholds: {
    warningCount: { type: Number, default: 3 },
    criticalCount: { type: Number, default: 5 }
  }
});
