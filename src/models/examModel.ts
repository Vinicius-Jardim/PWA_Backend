import mongoose, { Schema, Document, model } from "mongoose";
import { belts } from "./userModel";

// Interface para o modelo Exam
export interface IExam extends Document {
  name: string; // Nome do exame
  date: Date; // Data do exame
  location: string; // Local do exame
  maxParticipants: number; // Limite máximo de participantes
  participants: mongoose.Types.ObjectId[]; // IDs dos atletas inscritos
  beltLevel: string[]; // Faixas que serão avaliadas no exame
  description?: string; // Descrição opcional do exame
  createdBy: mongoose.Types.ObjectId; // ID do instrutor que criou o exame
  instructor: mongoose.Types.ObjectId; // ID do instrutor responsável pelo exame
  results?: Array<{
    athleteId: mongoose.Types.ObjectId;
    grade: string;
    observations?: string;
  }>; // Resultados dos atletas
}

// Schema do Exam
const ExamSchema: Schema = new Schema<IExam>(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String }, // Removido required
    maxParticipants: { type: Number, required: true, default: 10 },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    beltLevel: [{ 
      type: String,
      enum: ["WHITE", "YELLOW", "ORANGE", "GREEN", "BLUE", "BROWN", "BLACK"],
      required: true 
    }],
    description: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Agora é opcional
    },
    results: [{
      athleteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      grade: {
        type: String,
        required: true
      },
      observations: String
    }]
  },
  {
    timestamps: true,
  }
);

// Middleware para validar o número máximo de participantes
ExamSchema.pre('save', async function(next) {
  if (this.participants && this.participants.length > this.maxParticipants) {
    throw new Error('Número máximo de participantes excedido');
  }
  next();
});

// Exportação do modelo
const Exam = model<IExam>("Exam", ExamSchema);
export default Exam;
export { Exam };
