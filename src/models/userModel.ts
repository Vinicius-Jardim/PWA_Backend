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
  BLUE: "BLUE",
  PURPLE: "PURPLE",
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
  birthDate?: Date;
  phone?: string;
  gender?: "male" | "female";
  suspended?: boolean;
  instructorId?: Types.ObjectId;
  joinedDate?: Date;
  payments?: Types.ObjectId[];
  examResults?: Types.ObjectId[];
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
      default: roles.ATHLETE,
    },
    belt: {
      type: String,
      enum: Object.values(belts),
      default: belts.WHITE,
    },
    birthDate: { type: Date, required: false },
    phone: { type: String, required: false },
    gender: { type: String, enum: ["male", "female"] },
    suspended: { type: Boolean, default: false },
    instructorId: { type: Schema.Types.ObjectId, ref: "User" },
    joinedDate: { type: Date, default: Date.now },
    payments: [{ type: Schema.Types.ObjectId, ref: "Payment" }],
    examResults: [{ type: Schema.Types.ObjectId, ref: "ExamResult" }],
  },
  { timestamps: true }
);

// Método para verificar permissões
UserSchema.methods.hasPermission = function (
  this: IUser,
  requiredRole: keyof typeof roles
): boolean {
  const userRoleLevel = roleHierarchy[this.role];
  const requiredRoleLevel = roleHierarchy[requiredRole];
  return userRoleLevel >= requiredRoleLevel;
};

export default mongoose.model<IUser>("User", UserSchema);
