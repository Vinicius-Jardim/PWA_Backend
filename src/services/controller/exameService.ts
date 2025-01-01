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
      const instructor = await User.findById(instructorId.id);
      if (!instructor) {
        throw new Error("Instructor not found");
      }

      // Validate and typecast multiple belt levels
      const validBeltLevels = validateBeltLevels(beltLevel);

      // Create exam with instructor
      const newExame = await Exam.create({
        name,
        date,
        maxParticipants,
        beltLevel: validBeltLevels,
        createdBy: instructor._id,
        instructor: instructor._id, // Definir o instrutor
      });

      // Populate instructor details
      await newExame.populate('instructor', 'name email');

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
      if (!instructorUser) {
        throw new Error("Instructor not found");
      }

      const skip = (page - 1) * limit;

      const exams = await Exam.find({ instructor: instructorId })
        .populate('instructor', 'name email')
        .populate('createdBy', 'name email')
        .populate('participants', 'name email')
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit);

      const totalCount = await Exam.countDocuments({ instructor: instructorId });
      const totalPages = Math.ceil(totalCount / limit);

      return {
        exams,
        totalPages,
        currentPage: page,
        totalCount,
      };
    } catch (error) {
      console.error("Error fetching instructor exams:", error);
      throw error;
    }
  }

  static async getAllExams(
    filters: FilterQuery<IExam>,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const skip = (page - 1) * limit;

      const exams = await Exam.find(filters)
        .populate('instructor', 'name email')
        .populate('createdBy', 'name email')
        .populate('participants', 'name email')
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit);

      const totalCount = await Exam.countDocuments(filters);
      const totalPages = Math.ceil(totalCount / limit);

      return {
        exams,
        totalPages,
        currentPage: page,
        totalCount,
      };
    } catch (error) {
      console.error("Error fetching all exams:", error);
      throw error;
    }
  }

  static async registerForExam(examId: string, athleteId: string) {
    try {
      const exam = await Exam.findById(examId)
        .populate('instructor')
        .populate('createdBy');
        
      if (!exam) {
        throw new Error("Exame não encontrado");
      }

      // Check if exam is full
      if (exam.participants.length >= exam.maxParticipants) {
        throw new Error("Exame já está lotado");
      }

      // Get athlete info
      const athlete = await User.findById(athleteId);
      if (!athlete || athlete.role !== roles.ATHLETE) {
        throw new Error("Atleta não encontrado");
      }
      if (!athlete.instructorId) {
        throw new Error("Atleta não possui um instrutor");
      }

      // Check if athlete meets belt requirements
      const athleteBelt = athlete.belt;
      const allowedBelts = exam.beltLevel;

      if (athleteBelt && !allowedBelts.includes(athleteBelt)) {
        throw new Error(
          `Sua faixa (${athleteBelt}) não é elegível para este exame. Faixas permitidas: ${allowedBelts.join(
            ", "
          )}`
        );
      }

      // Check if athlete has any pending payments
      const hasPendingPayments = athlete.payments?.some(
        (payment) => payment.status === "pending"
      );
      if (hasPendingPayments) {
        throw new Error("Não é possível se inscrever com pagamentos pendentes");
      }

      // Check if athlete is already registered
      const isAlreadyRegistered = exam.participants.some(
        (participantId) => participantId.toString() === athleteId
      );

      if (isAlreadyRegistered) {
        throw new Error("Você já está inscrito neste exame");
      }

      // Register athlete for exam using updateOne
      const result = await Exam.updateOne(
        { _id: examId },
        { $push: { participants: athlete._id } }
      );

      if (result.modifiedCount === 0) {
        throw new Error("Erro ao se inscrever no exame");
      }

      return {
        message: "Inscrição realizada com sucesso",
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
          select: "name email profilePicture",
        })
        .sort({ date: 1 });

      // Mapeia os exames para incluir informações formatadas do instrutor
      const formattedExams = exams.map((exam) => ({
        ...exam.toObject(),
        instructor: exam.createdBy
          ? {
              name: exam.createdBy.name,
              email: exam.createdBy.email,
              profilePicture: exam.createdBy.profilePicture,
            }
          : null,
      }));

      return formattedExams;
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

  static async unregisterFromExam(examId: string, athleteId: string) {
    try {
      // Primeiro, buscar o exame com todas as referências necessárias
      const exam = await Exam.findById(examId)
        .populate('instructor')
        .populate('createdBy');
        
      if (!exam) {
        throw new Error("Exame não encontrado");
      }

      // Check if athlete is registered
      const isRegistered = exam.participants.some(
        (participantId) => participantId.toString() === athleteId
      );

      if (!isRegistered) {
        throw new Error("Você não está inscrito neste exame");
      }

      // Remove athlete from exam
      const updatedParticipants = exam.participants.filter(
        (participantId) => participantId.toString() !== athleteId
      );

      // Atualizar usando updateOne para evitar validação do mongoose
      const result = await Exam.updateOne(
        { _id: examId },
        { $set: { participants: updatedParticipants } }
      );

      if (result.modifiedCount === 0) {
        throw new Error("Erro ao cancelar inscrição no exame");
      }

      return {
        message: "Inscrição cancelada com sucesso",
        exam: {
          name: exam.name,
          date: exam.date,
          beltLevel: exam.beltLevel,
        },
      };
    } catch (error) {
      console.error("Error unregistering from exam:", error);
      throw error;
    }
  }
}
