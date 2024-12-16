import Exam, { IExam } from "../../models/examModel";
import { validateBeltLevels } from "../../utils/beltValidator";
import { FilterQuery } from "mongoose";
import User, { roles, belts } from "../../models/userModel";
import { Op } from "sequelize";

export class ExameService {
  static async create(
    exame: IExam,
    instructorId: { id: string; role: string }
  ): Promise<IExam> {
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
    filters: { beltLevel?: string } = {},
    page: number = 1,
    limit: number = 10
  ) {
    try {
      // Validar valores de paginação
      if (page < 1) page = 1;
      if (limit < 1) limit = 10;

      // Construir o filtro baseado no nível de faixa (beltLevel)
      const query: any = {};
      if (filters.beltLevel) {
        query.beltLevel = { $in: [filters.beltLevel] }; // Usar $in para arrays
      }

      // Contar o total de exames correspondentes
      const totalExams = await Exam.countDocuments(query);

      if (totalExams === 0) {
        return {
          exams: [],
          pagination: {
            total: 0,
            totalPages: 0,
            currentPage: 1,
            limit,
          },
        };
      }

      // Obter os resultados paginados
      const exams = await Exam.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      return {
        exams,
        pagination: {
          total: totalExams,
          totalPages: Math.ceil(totalExams / limit),
          currentPage: page,
          limit,
        },
      };
    } catch (error) {
      console.error("Error fetching exams:", error);
      throw new Error("Failed to fetch exams");
    }
  }

  static async registerForExam(examId: string, athleteId: string) {
    try {
      const exam = await Exam.findById(examId);
      if (!exam) {
        return "Exam not found";
      }

      // Check if exam is full
      if (exam.participants.length >= exam.maxParticipants) {
        return "Exam is already full";
      }

      // Get athlete info
      const athlete = await User.findById(athleteId);
      if (!athlete || athlete.role !== roles.ATHLETE) {
        return "Athlete not found";
      }
      if (!athlete.instructorId) {
        return "Athlete does not have an instructor";
      }

      // Check if athlete meets belt requirements
      const athleteBelt = athlete.belt;
      const allowedBelts = exam.beltLevel;

      if (athleteBelt && !allowedBelts.includes(athleteBelt)) {
        throw new Error(
          `Athlete belt (${athleteBelt}) is not eligible for this exam. Required belts: ${allowedBelts.join(
            ", "
          )}`
        );
      }

      // Check if athlete has any pending payments
      const hasPendingPayments = athlete.payments?.some(
        (payment) => payment.status === "pending"
      );
      if (hasPendingPayments) {
        throw new Error("Cannot register for exam with pending payments");
      }

      // Check if athlete is already registered
      const isAlreadyRegistered = exam.participants.some(
        (participantId) => participantId.toString() === athleteId
      );

      if (isAlreadyRegistered) {
        throw new Error("Athlete is already registered for this exam");
      }

      // Register athlete for exam
      exam.participants.push(athlete._id);
      await exam.save();

      return {
        message: "Successfully registered for exam",
        exam: {
          name: exam.name,
          date: exam.date,
          beltLevel: exam.beltLevel,
        },
      };
    } catch (error) {
      console.error("Error registering for exam:", error);
      throw error;
    }
  }

  static async getAthleteExams(athleteId: string) {
    try {
      const exams = await Exam.find({ participants: athleteId })
        .populate({
          path: "createdBy",
          model: User,
          select: "name email",
        })
        .sort({ date: 1 });

      return exams;
    } catch (error) {
      console.error("Error fetching athlete exams:", error);
      throw new Error("Failed to fetch athlete exams");
    }
  }

  static async updateExamResult(
    examId: string,
    athleteId: string,
    grade: string
  ) {
    try {
      const exam = await Exam.findById(examId);
      if (!exam) {
        throw new Error("Exam not found");
      }

      const athlete = await User.findById(athleteId);
      if (!athlete) {
        throw new Error("Athlete not found");
      }

      // Add exam result to athlete's record
      athlete.examResults = athlete.examResults || [];
      athlete.examResults.push({
        examId: exam._id,
        grade,
        date: exam.date,
      });

      await athlete.save();

      return {
        message: "Exam result recorded successfully",
        result: {
          examName: exam.name,
          grade,
          date: exam.date,
        },
      };
    } catch (error) {
      console.error("Error updating exam result:", error);
      throw error;
    }
  }
}
