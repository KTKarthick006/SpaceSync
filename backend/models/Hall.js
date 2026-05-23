import mongoose from 'mongoose';

const hallSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  capacity:    { type: Number, required: true },
  isAC:        { type: Boolean, default: true },
  amenities:   { type: [String], default: [] },
  description: { type: String, default: '' },
  isActive:    { type: Boolean, default: true }
});

export default mongoose.model('Hall', hallSchema);
