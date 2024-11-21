import mongoose, { Schema, Document, Types } from "mongoose";

// Definindo a interface do InstructorID (documento Mongoose)
interface ICredential extends Document {
  instructorId: string; // ID único do instrutor
  user: Types.ObjectId;
  createdAt: Date; // Data de criação
  updatedAt: Date; // Data da última atualização
  active: boolean; // Se o instrutor está ativo ou não
  isUsed: boolean; // Se o instructorId já está sendo usado
}

// Definindo o schema do InstructorID
const CredentialSchema: Schema = new Schema(
  {
    instructorId: { type: String, required: true, unique: true }, // ID único do instrutor
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Referência ao usuário
    active: { type: Boolean, default: true }, // Status do instrutor (ativo ou não)
    isUsed: { type: Boolean, default: false }, // Indica se o instructorId já está sendo usado
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  }
);

// Criando o modelo InstructorID
const Credential = mongoose.model<ICredential>("Credential", CredentialSchema);

export default Credential;
