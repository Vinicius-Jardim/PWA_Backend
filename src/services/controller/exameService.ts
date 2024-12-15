import Exam, { IExam } from "../../models/examModel";
import { validateBeltLevels } from "../../utils/beltValidator";
import { FilterQuery } from "mongoose";
import User, { roles, belts } from "../../models/userModel";
import { Op } from "sequelize";

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

  static async getAllExams(page: number = 1, limit: number = 10, search: string = "", beltLevel: string = "") {
    const offset = (page - 1) * limit;

    // Construir condições dinamicamente
    const filters: { name?: { $regex: string; $options: string }; beltLevel?: string } = {};
    if (search) {
        filters.name = { $regex: search, $options: 'i' }; // Busca parcial no nome
    }
    if (beltLevel) {
        filters.beltLevel = beltLevel; // Filtrar por nível de cinto
    }

    // Obter resultados e contagem
    const results = await Exam.find(filters).skip(offset).limit(limit).sort({ createdAt: -1 }).exec();
    const total = await Exam.countDocuments(filters);

    return {
        total,
        page,
        limit,
        results,
    };
  }
}