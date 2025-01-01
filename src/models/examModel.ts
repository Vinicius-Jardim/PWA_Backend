import mongoose, { Schema, Document, model } from "mongoose";
import { belts } from "./userModel";

// Interface para o modelo Exam
export interface IExam extends Document {
  name: string; // Nome do exame
  date: Date; // Data do exame
  maxParticipants: number; // Limite máximo de participantes
  participants: mongoose.Types.ObjectId[]; // IDs dos atletas inscritos
  beltLevel: string[]; // Graduação necessária para inscrição
  createdBy: mongoose.Types.ObjectId; // ID do instrutor que criou o exame
  instructor: mongoose.Types.ObjectId; // ID do instrutor responsável pelo exame
}

// Schema do Exam
const ExamSchema: Schema = new Schema<IExam>(
  {
    name: { type: String, required: true }, // Nome do exame
    date: { type: Date, required: true }, // Data do exame
    maxParticipants: { type: Number, required: true, default: 10 }, // Máximo de inscritos
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Referência aos atletas
    beltLevel: [{ 
      type: String,
      enum: Object.values(belts),
      required: true 
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Criador
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Instrutor responsável
  },
  {
    timestamps: true, // Adiciona campos de createdAt e updatedAt automaticamente
  }
);

// Exportação do modelo
const Exam = model<IExam>("Exam", ExamSchema);
export default Exam;
export { Exam };
