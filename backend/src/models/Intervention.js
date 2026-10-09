import mongoose from 'mongoose';

const InterventionSchema = new mongoose.Schema(
  {
    studentRegistrationNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      match: [/^241FA(04|18|19)\d{3}$/, 'Invalid registration number format. Must match 241FA[04|18|19]xxx']
    },
    studentName: {
      type: String,
      required: true,
      trim: true
    },
    studentBranch: {
      type: String,
      required: true,
      trim: true
    },
    branchCode: {
      type: String,
      enum: ['04', '18', '19']
    },
    issue: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
      minlength: [5, 'Issue description must be at least 5 characters long']
    },
    actionPlan: {
      type: String,
      required: [true, 'Action plan is required'],
      trim: true,
      minlength: [5, 'Action plan must be at least 5 characters long']
    },
    priority: {
      type: String,
      required: true,
      enum: {
        values: ['High', 'Medium', 'Low'],
        message: 'Priority must be High, Medium, or Low'
      },
      default: 'Medium'
    },
    assignedFaculty: {
      type: String,
      required: [true, 'Assigned faculty or mentor is required'],
      trim: true
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['Pending', 'In Progress', 'Completed'],
        message: 'Status must be Pending, In Progress, or Completed'
      },
      default: 'Pending'
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    resolutionNotes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Helpful indexes for efficient filtering
InterventionSchema.index({ studentRegistrationNumber: 1, status: 1 });
InterventionSchema.index({ status: 1, priority: 1 });
InterventionSchema.index({ dueDate: 1 });

export const Intervention = mongoose.models.Intervention || mongoose.model('Intervention', InterventionSchema);
export default Intervention;
