import Exam, { IExam } from "../../models/examModel";
import { validateBeltLevels } from "../../utils/beltValidator";
import User, { roles, belts } from "../../models/userModel";

export class ExameService {
  static async create(exame: IExam, instructorId: { id: string; role: string }): Promise<IExam> {
    try {
      const { name, date, beltLevel, maxParticipants } = exame;

      // Validate instructor
      const instructor = await User.findById(instructorId.id); // Use apenas o campo `id`
      if (!instructor) {
        throw new Error("Instructor not found");
      }

      // Validate and typecast multiple belt levels
      const validBeltLevels = validateBeltLevels(beltLevel);

      // Add createdBy (assuming it's the instructor)
      const newExame = await Exam.create({
        name,
        date,
        maxParticipants,
        beltLevel: validBeltLevels,
        createdBy: instructor._id, // Certifique-se de que `instructor` tenha `_id`
      });

      return newExame;
    } catch (error) {
      console.error("Error during exam creation:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error("Failed to create exam: " + errorMessage);
    }
  }

  static async getOwnExams(
    instructor: { id: string; role: string },
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const instructorId = instructor.id;

      // Validate instructor
      const instructorUser = await User.findById(instructorId);
      if (!instructorUser || instructor.role !== roles.INSTRUCTOR) {
        throw new Error("Instructor not found or invalid role");
      }

      // Paginação
      const skip = (page - 1) * limit;
      const exams = await Exam.find({ createdBy: instructorId })
        .skip(skip)
        .limit(limit);

      const totalExams = await Exam.countDocuments({ createdBy: instructorId });

      // Verifique se há exames
      if (!exams || exams.length === 0) {
        throw new Error("No exams found");
      }

      // Retornar dados paginados
      return {
        totalExams,
        totalPages: Math.ceil(totalExams / limit),
        currentPage: page,
        exams,
      };
    } catch (error) {
      console.error("Error during fetching exams:", error);
      throw new Error("Failed to fetch exams: " + error);
    }
  }
}
