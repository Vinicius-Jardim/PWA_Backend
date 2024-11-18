import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'athlete' | 'instructor';
  instructorId?: mongoose.Types.ObjectId; // Para atletas, refere-se ao instrutor
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['athlete', 'instructor'], required: true },
  instructorId: { type: mongoose.Types.ObjectId, ref: 'User' },
});

export default mongoose.model<IUser>('User', UserSchema);
