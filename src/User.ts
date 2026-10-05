import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, select: false },
}, {
  timestamps: true,
  toJSON: { transform: (_doc, result) => { delete (result as { password?: string }).password; return result; } },
});

export default mongoose.model('User', userSchema);
