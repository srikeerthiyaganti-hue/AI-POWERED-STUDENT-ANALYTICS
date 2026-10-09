import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^241FA(04|18|19)\d{3}$/
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    branch: {
      type: String,
      required: true
    },
    branchCode: {
      type: String,
      required: true,
      enum: ['04', '18', '19']
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8
    },
    cgpa: {
      type: Number,
      min: 0.0,
      max: 10.0
    },
    gpa: {
      type: Number,
      required: true,
      min: 0.0,
      max: 10.0
    },
    semesterGpa: [Number],
    arrears: {
      type: Number,
      default: 0,
      min: 0
    },
    attendanceRate: {
      type: Number,
      required: true,
      min: 0.0,
      max: 100.0
    },
    assignmentCompletionRate: {
      type: Number,
      min: 0.0,
      max: 100.0
    },
    engagementScore: {
      type: Number,
      min: 0.0,
      max: 100.0
    },
    technicalSkillsScore: {
      type: Number,
      min: 0.0,
      max: 100.0
    },
    professionalSkillsScore: {
      type: Number,
      min: 0.0,
      max: 100.0
    },
    codingScore: {
      type: Number,
      min: 0.0,
      max: 100.0
    },
    aptitudeScore: {
      type: Number,
      min: 0.0,
      max: 100.0
    },
    mockInterviewScore: {
      type: Number,
      min: 0.0,
      max: 100.0
    },
    placementTrainingScore: {
      type: Number,
      min: 0.0,
      max: 100.0
    },
    mentorFeedbackScore: {
      type: Number,
      min: 0.0,
      max: 100.0
    },
    mentorNotes: String,
    mentorAssigned: {
      type: Boolean,
      default: false
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    riskLevel: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low'
    },
    analytics: {
      type: mongoose.Schema.Types.Mixed
    },
    academicRisk: {
      type: mongoose.Schema.Types.Mixed
    },
    placementReadiness: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

export const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
