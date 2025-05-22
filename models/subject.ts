import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  schedule: [{
    day: { type: String, enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] },
    startTime: String,
    endTime: String
  }]
});
