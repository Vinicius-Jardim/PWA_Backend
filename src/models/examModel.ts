import mongoose, { Schema, Document, model } from "mongoose";

// Interface para o modelo Exam
export interface IExam extends Document {
  name: string; // Nome do exame
  date: Date; // Data do exame
  maxParticipants: number; // Limite máximo de participantes
  participants: mongoose.Types.ObjectId[]; // IDs dos atletas inscritos
  beltLevel: string; // Graduação necessária para inscrição
  createdBy: mongoose.Types.ObjectId; // ID do instrutor que criou o exame
}

// Schema do Exam
const ExamSchema: Schema = new Schema<IExam>(
  {
    name: { type: String, required: true }, // Nome do exame
    date: { type: Date, required: true }, // Data do exame
    maxParticipants: { type: Number, required: true, default: 10 }, // Máximo de inscritos
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Athlete" }], // Referência aos atletas
    beltLevel: { type: String, required: true }, // Graduação exigida
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
    }, // Criador
  },
  {
    timestamps: true, // Adiciona campos de createdAt e updatedAt automaticamente
  }
);

// Exportação do modelo
const Exam = model<IExam>("Exam", ExamSchema);
export default Exam;
export { Exam };
