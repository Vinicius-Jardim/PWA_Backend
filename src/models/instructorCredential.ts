import mongoose, { Schema, Document } from 'mongoose';

export interface IInstructorCredential extends Document {
  instructorId: string;  // ID único do instrutor (tipo documento de identificação)
  isUsed: boolean;      // Se já foi usado para registro
  user?: Schema.Types.ObjectId;  // Referência ao usuário instrutor
  createdAt: Date;
  updatedAt: Date;
}

const instructorCredentialSchema = new Schema<IInstructorCredential>({
  instructorId: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v: string) {
        // Validação para número de identificação português
        return /^\d{9}$/.test(v);  // 9 dígitos
      },
      message: props => `${props.value} não é um número de identificação válido!`
    }
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export default mongoose.model<IInstructorCredential>('InstructorCredential', instructorCredentialSchema);
