import mongoose, { Schema, Document, model } from "mongoose";

// Interface para o modelo ExamSession
export interface IExamSession extends Document {
  examId: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  location: string;
  maxParticipants: number;
  participants: mongoose.Types.ObjectId[];
}

// Schema da Sessão de Exame
const ExamSessionSchema: Schema = new Schema<IExamSession>(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    date: { 
      type: Date, 
      required: true 
    },
    time: {
      type: String,
      required: true
    },
    location: { 
      type: String, 
      required: true 
    },
    maxParticipants: { 
      type: Number, 
      required: true, 
      default: 10 
    },
    participants: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
  },
  {
    timestamps: true,
  }
);

// Middleware para validar o número máximo de participantes
ExamSessionSchema.pre('save', async function(next) {
  if (this.participants && this.participants.length > this.maxParticipants) {
    throw new Error('Número máximo de participantes da sessão excedido');
  }
  next();
});

// Método para verificar disponibilidade
ExamSessionSchema.methods.checkAvailability = function(): boolean {
  return this.participants.length < this.maxParticipants;
};

// Método para registrar participante
ExamSessionSchema.methods.registerParticipant = function(participantId: mongoose.Types.ObjectId): boolean {
  if (this.checkAvailability() && !this.participants.includes(participantId)) {
    this.participants.push(participantId);
    return true;
  }
  return false;
};

// Exportação do modelo
const ExamSession = model<IExamSession>("ExamSession", ExamSessionSchema);
export default ExamSession;
export { ExamSession };
