import Exam, { IExam } from "../../models/examModel";

export class ExameService {
  static async create(exame: IExam): Promise<IExam> {
    try {
      console.log("Creating exam with data:", exame);
      const newExame = await Exam.create(exame);
      return newExame;
    } catch (error) {
      console.error("Error during exam creation:", error); // Log completo do erro

      // Certifique-se de que o erro tem uma mensagem
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error("Failed to create exam: " + errorMessage);
    }
  }
}
