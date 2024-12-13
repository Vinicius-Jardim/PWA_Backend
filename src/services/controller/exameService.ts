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

  static async getAllExams(
    filters: {
      search?: string;
      beltLevel?: string;
      startDate?: Date;
      endDate?: Date;
      hasVacancy?: boolean;
    } = {},
    sort: { [key: string]: 1 | -1 } = { date: 1 },
    page: number = 1,
    limit: number = 10
  ) {
    try {
      // Build search query
      const query: any = {};

      // Search by name
      if (filters.search) {
        query.name = { $regex: filters.search, $options: "i" };
      }

      // Filter by belt level
      if (filters.beltLevel) {
        query.beltLevel = filters.beltLevel;
      }

      // Filter by date range
      if (filters.startDate || filters.endDate) {
        query.date = {};
        if (filters.startDate) {
          query.date.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.date.$lte = new Date(filters.endDate);
        }
      }

      // Filter by vacancy
      if (filters.hasVacancy) {
        query.$expr = {
          $lt: [{ $size: "$participants" }, "$maxParticipants"]
        };
      }

      // Count total documents
      const totalExams = await Exam.countDocuments(query);

      // Get paginated and sorted results
      const exams = await Exam.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({
          path: "createdBy",
          model: User,
          select: "name email role",
          match: { role: roles.INSTRUCTOR }
        })
        .exec();

      return {
        exams,
        pagination: {
          total: totalExams,
          totalPages: Math.ceil(totalExams / limit),
          currentPage: page,
          limit
        }
      };
    } catch (error) {
      console.error("Error fetching all exams:", error);
      throw new Error("Failed to fetch exams");
    }
  }
}
