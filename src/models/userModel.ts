import mongoose, { Schema, Document, Types } from "mongoose";

// Definição de roles
export const roles = {
  ATHLETE: "ATHLETE",
  INSTRUCTOR: "INSTRUCTOR",
  ADMIN: "ADMIN",
} as const;
export const roleHierarchy = {
  [roles.ATHLETE]: 1,
  [roles.INSTRUCTOR]: 2,
  [roles.ADMIN]: 3,
};

// Interface para tipagem no TypeScript
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: keyof typeof roles; // Vincula a interface ao roles
  belt?: string; // Apenas para atletas
  age?: number; // Apenas para atletas
  gender?: "male" | "female"; // Apenas para atletas
  monthlyFee?: number; // Apenas para atletas
  joinedDate?: Date; // Apenas para atletas
  instructorId?: Types.ObjectId; // Referência para instrutor, apenas para atletas
  athletes?: Types.ObjectId[]; // Lista de atletas, apenas para instrutores
  examSchedule?: { date: Date; location: string }[]; // Exames agendados, apenas para instrutores
  payments?: { date: Date; amount: number; status: "paid" | "pending" }[]; // Histórico de pagamentos, apenas para atletas
  examResults?: { examId: Types.ObjectId; grade: string; date: Date }[]; // Resultados de exames, apenas para atletas

  // Métodos
  hasPermission(requiredRole: keyof typeof roles): boolean;
}

// Schema para usuários
const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(roles),
      required: true,
      default: roles.ATHLETE,
    },
    belt: { type: String },
    age: { type: Number },
    gender: { type: String, enum: ["male", "female"] },
    monthlyFee: { type: Number },
    joinedDate: { type: Date, default: Date.now },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "Credential" },
    athletes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    examSchedule: [
      {
        date: { type: Date, required: true },
        location: { type: String, required: true },
      },
    ],
    payments: [
      {
        date: { type: Date, required: true },
        amount: { type: Number, required: true },
        status: { type: String, enum: ["paid", "pending"], required: true },
      },
    ],
    examResults: [
      {
        examId: { type: mongoose.Schema.Types.ObjectId, required: true },
        grade: { type: String, required: true },
        date: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true }
);
// Exporta o modelo
export default mongoose.model<IUser>("User", UserSchema);
export type RoleType = keyof typeof roles;
