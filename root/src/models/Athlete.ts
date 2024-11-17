import mongoose, { Schema, Document } from 'mongoose';

export interface IAthlete extends Document {
  name: string;
  belt: string;
  age: number;
  gender: 'male' | 'female';
  monthlyFee: number;
  joinedDate: Date;
  instructorId: mongoose.Types.ObjectId;
  active: boolean;
}

const AthleteSchema: Schema = new Schema({
  name: { type: String, required: true },
  belt: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  monthlyFee: { type: Number, required: true },
  joinedDate: { type: Date, required: true, default: Date.now },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: true },
  active: { type: Boolean, default: true },
});

export default mongoose.model<IAthlete>('Athlete', AthleteSchema);
