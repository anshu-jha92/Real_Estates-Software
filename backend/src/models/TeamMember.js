import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    role: { type: String, required: [true, 'Role is required'], trim: true },
    image: { type: String, trim: true, default: '' },
    note: { type: String, trim: true, default: '', maxlength: 400 },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export default mongoose.models.TeamMember || mongoose.model('TeamMember', teamMemberSchema);
