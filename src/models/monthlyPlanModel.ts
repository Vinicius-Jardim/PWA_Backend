import mongoose from "mongoose";

export const localization = {
  INTERNATIONAL: "international",
  NATIONAL: "national",
  REGIONAL: "regional",
};

const monthlyPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number,
      required: true,
      min: 1, // Duração em meses
    },
    graduationScopes: {
      type: [String],
      enum: Object.values(localization),
      required: true,
    },
    weeklyClasses: {
      type: Number,
      required: true,
      min: 1, // Número mínimo de aulas semanais
    },
    privateLessonsIncluded: {
      type: Boolean,
      default: false, // Indica se o plano inclui aulas privadas
    },
    studentCapacity: {
      type: Number,
      min: 1, // Número máximo de alunos permitidos no plano
    },
    description: {
      type: String,
      maxlength: 500, // Breve descrição do plano
    },
  },
  {
    timestamps: true,
    collection: "MonthlyPlans",
  }
);

const MonthlyPlan = mongoose.model("MonthlyPlan", monthlyPlanSchema);

export { MonthlyPlan };
