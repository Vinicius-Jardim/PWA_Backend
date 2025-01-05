import mongoose, { Schema, Document, model } from "mongoose";
import { belts } from "./userModel";

// Interface para o modelo Exam
export interface IExam extends Document {
  name: string;
  beltLevel: string[];
  finalBelt: string; // Faixa para qual os atletas serão promovidos se aprovados
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  instructor: mongoose.Types.ObjectId;
  sessions: Array<{
    date: Date;
    time: string;
    location: string;
    maxParticipants: number;
    participants: mongoose.Types.ObjectId[];
  }>;
  results?: Array<{
    athleteId: mongoose.Types.ObjectId;
    grade: number;
    observations?: string;
  }>;
}

// Schema do Exam
const ExamSchema: Schema = new Schema<IExam>(
  {
    name: { 
      type: String, 
      required: true 
    },
    beltLevel: [{ 
      type: String,
      enum: ["WHITE", "YELLOW", "ORANGE", "GREEN", "BLUE", "BROWN", "BLACK"],
      required: true 
    }],
    finalBelt: {
      type: String,
      enum: ["YELLOW", "ORANGE", "GREEN", "BLUE", "BROWN", "BLACK"],
      required: true
    },
    description: { 
      type: String 
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    sessions: [{
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
      }]
    }],
    results: [{
      athleteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      grade: {
        type: Number,
        required: true,
        min: 0,
        max: 10
      },
      observations: String
    }]
  },
  {
    timestamps: true,
  }
);

// Middleware para validar o número máximo de participantes em cada sessão
ExamSchema.pre('save', async function(next) {
  if (this.sessions) {
    for (const session of this.sessions) {
      if (session.participants && session.participants.length > session.maxParticipants) {
        throw new Error('Número máximo de participantes excedido em uma sessão');
      }
    }
  }
  next();
});

// Middleware para atualizar a faixa do atleta quando aprovado
ExamSchema.post('save', async function(doc) {
  const User = mongoose.model('User');
  
  if (doc.results && doc.results.length > 0) {
    for (const result of doc.results) {
      if (result.grade >= 7) { // Se a nota for maior ou igual a 7, atleta é aprovado
        await User.findByIdAndUpdate(
          result.athleteId,
          { belt: doc.finalBelt },
          { new: true }
        );
      }
    }
  }
});

const Exam = model<IExam>("Exam", ExamSchema);
export { Exam };
