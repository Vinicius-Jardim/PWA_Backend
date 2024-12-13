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

// Definição de belts
export const belts = {
  WHITE: "WHITE",
  YELLOW: "YELLOW",
  ORANGE: "ORANGE",
  GREEN: "GREEN",
  BLUE: "BLUE",
  BROWN: "BROWN",
  BLACK: "BLACK",
} as const;

// Interface para tipagem no TypeScript
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: keyof typeof roles;
  belt?: keyof typeof belts;
  age?: number;
  gender?: "male" | "female";
  monthlyFee?: number;
  joinedDate?: Date;
  instructorId?: Types.ObjectId;
  athletes?: Types.ObjectId[];
  examSchedule?: { date: Date; location: string }[];
  payments?: { date: Date; amount: number; status: "paid" | "pending" }[];
  examResults?: { examId: Types.ObjectId; grade: string; date: Date }[];
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
      required: true, 
      enum: Object.values(roles) 
    },
    belt: { 
      type: String, 
      enum: Object.values(belts),
      default: function(this: { role?: string }) {
        return this.role === roles.ATHLETE ? belts.WHITE : undefined;
      }
    },
    age: { type: Number },
    gender: { type: String, enum: ["male", "female"] },
    monthlyFee: { type: Number },
    joinedDate: { type: Date, default: Date.now },
    instructorId: { type: Schema.Types.ObjectId, ref: "User" },
    athletes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    examSchedule: [{
      date: Date,
      location: String
    }],
    payments: [{
      date: Date,
      amount: Number,
      status: { type: String, enum: ["paid", "pending"] }
    }],
    examResults: [{
      examId: { type: Schema.Types.ObjectId, ref: "Exam" },
      grade: String,
      date: Date
    }]
  },
  {
    timestamps: true
  }
);

// Método para verificar permissões
UserSchema.methods.hasPermission = function(requiredRole: keyof typeof roles) {
  return roleHierarchy[this.role] >= roleHierarchy[requiredRole];
};

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
export type RoleType = keyof typeof roles;
export type BeltType = keyof typeof belts;
