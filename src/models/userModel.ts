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
  birthDate?: Date;
  phone?: string;
  gender?: "male" | "female";
  monthlyFee?: number;
  joinedDate?: Date;
  instructorId?: Types.ObjectId;
  athletes?: Types.ObjectId[];
  payments?: { date: Date; amount: number; status: "paid" | "pending" }[];
  examResults?: { examId: Types.ObjectId; grade: string; date: Date }[];
  qrCode?: string;
  avatarUrl?: string;
  suspended?: boolean;
  credentialNumber?: string;
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
    credentialNumber: {
      type: String,
      validate: {
        validator: function (v: string) {
          return this.role !== roles.INSTRUCTOR || (v && v.length === 9 && /^\d+$/.test(v));
        },
        message: "Número de credencial deve ter exatamente 9 dígitos",
      },
      required: function (this: { role: string }) {
        return this.role === roles.INSTRUCTOR;
      },
    },
    belt: {
      type: String,
      enum: Object.values(belts),
      default: function (this: { role?: string }) {
        return this.role === roles.ATHLETE ? belts.WHITE : undefined;
      },
    },
    birthDate: { 
      type: Date,
      validate: {
        validator: function(date: Date) {
          return date <= new Date();
        },
        message: "Data de nascimento não pode ser no futuro"
      }
    },
    phone: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return /^\+?[\d\s-()]+$/.test(v);
        },
        message: "Formato de telefone inválido"
      }
    },
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
          validator: function (this: { role: string }, value: Types.ObjectId[]) {
            return this.role === roles.INSTRUCTOR;
          },
          message: "Only INSTRUCTOR can have associated athletes.",
        },
        {
          validator(athletes: Types.ObjectId[]) {
            return athletes.length <= 10;
          },
          message: "An instructor can have at most 10 associated athletes.",
        },
      ],
      default: function (this: { role: string }) {
        return this.role === roles.INSTRUCTOR ? [] : undefined;
      }
    },
    payments: [
      {
        date: { type: Date },
        amount: { type: Number },
        status: { type: String, enum: ["paid", "pending"] },
      },
    ],
    examResults: [{
      examId: { type: Schema.Types.ObjectId, ref: 'Exam' },
      grade: String,
      date: { type: Date, default: Date.now }
    }],
    qrCode: { type: String },
    avatarUrl: { type: String }
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

// Middleware para limpar campos específicos
UserSchema.pre("save", function (next) {
  const user = this as IUser;

  // Limpar campos baseado no papel do usuário
  if (user.role === roles.ATHLETE) {
    user.credentialNumber = undefined;
    user.athletes = undefined;
  } else if (user.role === roles.INSTRUCTOR) {
    user.belt = undefined;
    user.monthlyFee = undefined;
    user.instructorId = undefined;
    user.birthDate = undefined;
  }

  next();
});

export default mongoose.model<IUser>("User", UserSchema);
