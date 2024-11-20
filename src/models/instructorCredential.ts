import mongoose, { Schema, Document } from 'mongoose';

// Definindo a interface do InstructorID (documento Mongoose)
interface IInstructorID extends Document {
  instructorId: string; // ID único do instrutor
  name: string;         // Nome do instrutor
  email: string;        // E-mail do instrutor
  createdAt: Date;      // Data de criação
  updatedAt: Date;      // Data da última atualização
  active: boolean;      // Se o instrutor está ativo ou não
  isUsed: boolean;      // Se o instructorId já está sendo usado
}

// Definindo o schema do InstructorID
const InstructorIDSchema: Schema = new Schema(
  {
    instructorId: { type: String, required: true, unique: true }, // ID único do instrutor
    name: { type: String, required: true },                      // Nome do instrutor
    email: { type: String, required: true, unique: true },        // E-mail do instrutor
    active: { type: Boolean, default: true },                     // Status do instrutor (ativo ou não)
    isUsed: { type: Boolean, default: false },                    // Indica se o instructorId já está sendo usado
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  }
);

// Criando o modelo InstructorID
const InstructorID = mongoose.model<IInstructorID>('InstructorID', InstructorIDSchema);

export default InstructorID;
