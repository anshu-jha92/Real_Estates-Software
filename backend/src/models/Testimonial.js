import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    role: { type: String, trim: true, default: '' },
    locality: { type: String, trim: true, default: '' },
    message: { type: String, required: [true, 'Message is required'], trim: true, maxlength: 900 },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    avatar: { type: String, trim: true, default: '' },
    propertyTitle: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export default mongoose.models.Testimonial || mongoose.model('Testimonial', testimonialSchema);
