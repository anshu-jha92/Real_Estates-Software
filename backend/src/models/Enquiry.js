import mongoose from 'mongoose';

export const ENQUIRY_STATUSES = ['new', 'contacted', 'closed'];

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Please enter your mobile number'],
      trim: true,
      validate: {
        validator: (v) => (String(v).match(/\d/g) || []).length >= 10,
        message: 'Please enter a valid 10 digit mobile number',
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
      validate: {
        validator: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
        message: 'Please enter a valid email address',
      },
    },
    subject: { type: String, trim: true, maxlength: 160, default: '' },
    message: { type: String, trim: true, maxlength: 2000, default: '' },

    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', default: null },
    propertySlug: { type: String, trim: true, default: '' },
    propertyTitle: { type: String, trim: true, default: '' },

    budgetMin: { type: Number, min: 0, default: null },
    budgetMax: { type: Number, min: 0, default: null },
    interestedIn: { type: String, trim: true, default: '' },
    source: { type: String, trim: true, default: 'website' },

    status: { type: String, enum: ENQUIRY_STATUSES, default: 'new', index: true },
    note: { type: String, trim: true, maxlength: 1000, default: '' },

    ip: { type: String, trim: true, default: '' },
    userAgent: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

enquirySchema.index({ createdAt: -1 });

export default mongoose.models.Enquiry || mongoose.model('Enquiry', enquirySchema);
