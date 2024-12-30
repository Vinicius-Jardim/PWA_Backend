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
  qrCode?: string;
  avatarUrl?: string;
  suspended?: boolean;
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
      enum: Object.values(roles),
    },
    belt: {
      type: String,
      enum: Object.values(belts),
      default: function (this: { role?: string }) {
        return this.role === roles.ATHLETE ? belts.WHITE : undefined;
      },
    },
    age: { type: Number },
    gender: { type: String, enum: ["male", "female"] },
    monthlyFee: { type: Number },
    joinedDate: { type: Date, default: Date.now },
    suspended: { type: Boolean, default: false },
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: function (this: { role: string }, value: Types.ObjectId) {
          return this.role === roles.ATHLETE;
        },
        message: "Only ATHLETE can have an instructorId.",
      },
    },
    athletes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      validate: [
        {
          validator: function (
            this: { role: string },
            athletes: Types.ObjectId[]
          ) {
            // Apenas INSTRUCTOR pode ter atletas associados
            return this.role === roles.INSTRUCTOR || athletes.length === 0;
          },
          message: "Only INSTRUCTOR can have associated athletes.",
        },
        {
          validator: function (athletes: Types.ObjectId[]) {
            // Garantir que o número de atletas não exceda 10
            return athletes.length <= 10;
          },
          message: "An instructor can have at most 10 associated athletes.",
        },
      ],
    },
    examSchedule: [
      {
        date: { type: Date },
        location: { type: String },
      },
    ],
    payments: [
      {
        date: { type: Date },
        amount: { type: Number },
        status: { type: String, enum: ["paid", "pending"] },
      },
    ],
    examResults: [
      {
        examId: { type: Schema.Types.ObjectId, ref: "Exam" },
        grade: { type: String },
        date: { type: Date },
      },
    ],
    qrCode: { type: String },
    avatarUrl: { type: String },
  },
  {
    timestamps: true,
  }
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

// Middleware para limpar campos específicos
UserSchema.pre("save", function (next) {
  const user = this as IUser;

  // Se não for atleta, remove campos específicos de atleta
  if (user.role !== roles.ATHLETE) {
    user.belt = undefined;
    user.instructorId = undefined;
    user.monthlyFee = undefined;
  }

  // Se não for instrutor, remove lista de atletas
  if (user.role !== roles.INSTRUCTOR) {
    user.athletes = [];
  }

  next();
});

export type RoleType = keyof typeof roles;
export type BeltType = keyof typeof belts;

export default mongoose.model<IUser>("User", UserSchema);
