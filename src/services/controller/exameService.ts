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
        .populate({
          path: 'instructor',
          select: 'name email'
        })
        .populate({
          path: 'createdBy',
          select: 'name email'
        })
        .populate({
          path: 'participants',
          select: 'name email'
        })
        .populate({
          path: 'results.athleteId',
          select: 'name email'
        })
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .lean();

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

      // Check if athlete is already registered
      if (exam.participants.includes(athleteId)) {
        throw new Error("Você já está inscrito neste exame");
      }

      // Add athlete to participants
      exam.participants.push(athleteId);
      await exam.save();

      // Return updated exam
      const updatedExam = await Exam.findById(examId)
        .populate('instructor', 'name email')
        .populate('createdBy', 'name email')
        .populate('participants', 'name email');

      return updatedExam;
    } catch (error) {
      console.error("Error registering for exam:", error);
      throw error;
    }
  }

  static async getAthleteExams(athleteId: string) {
    try {
      // Buscar todos os exames onde o atleta é participante
      const exams = await Exam.find({
        participants: athleteId
      })
        .populate({
          path: 'instructor',
          select: 'name email'
        })
        .populate({
          path: 'createdBy',
          select: 'name email'
        })
        .populate({
          path: 'results.athleteId',
          select: 'name email'
        })
        .sort({ date: -1 });

      // Filtrar os resultados para mostrar apenas os do atleta atual
      const examsWithFilteredResults = exams.map(exam => {
        const examObj = exam.toObject();
        if (examObj.results) {
          examObj.results = examObj.results.filter(
            result => result.athleteId._id.toString() === athleteId
          );
        }
        return examObj;
      });

      return examsWithFilteredResults;
    } catch (error) {
      console.error("Error fetching athlete exams:", error);
      throw error;
    }
  }

  static async updateExamResult(
    examId: string,
    athleteId: string,
    grade: string,
    observations?: string
  ) {
    try {
      const exam = await Exam.findById(examId);
      if (!exam) {
        throw new Error("Exame não encontrado");
      }

      const athlete = await User.findById(athleteId);
      if (!athlete) {
        throw new Error("Atleta não encontrado");
      }

      // Verificar se o atleta está inscrito no exame
      const isRegistered = exam.participants.some(
        (participantId) => participantId.toString() === athleteId
      );

      if (!isRegistered) {
        throw new Error("Atleta não está inscrito neste exame");
      }

      // Verificar se já existe um resultado para este atleta
      const existingResultIndex = exam.results?.findIndex(
        result => result.athleteId.toString() === athleteId
      );

      // Preparar o resultado
      const examResult = {
        athleteId,
        grade,
        observations
      };

      if (existingResultIndex !== undefined && existingResultIndex >= 0) {
        // Atualizar resultado existente
        exam.results[existingResultIndex] = examResult;
      } else {
        // Adicionar novo resultado
        if (!exam.results) {
          exam.results = [];
        }
        exam.results.push(examResult);
      }

      // Se o atleta foi aprovado (nota >= 7), atualizar a faixa
      if (Number(grade) >= 7) {
        // Pegar a faixa mais alta do exame
        const examBelts = exam.beltLevel;
        if (examBelts && examBelts.length > 0) {
          const currentBeltIndex = Object.values(belts).indexOf(athlete.belt);
          const examBeltIndex = Math.max(...examBelts.map(belt => Object.values(belts).indexOf(belt)));
          
          // Só atualiza se a faixa do exame for maior que a atual
          if (examBeltIndex > currentBeltIndex) {
            athlete.belt = Object.values(belts)[examBeltIndex];
          }
        }
      }

      // Adicionar ao histórico do atleta
      if (!athlete.examResults) {
        athlete.examResults = [];
      }
      athlete.examResults.push({
        examId: exam._id,
        grade,
        date: exam.date,
        observations
      });

      // Salvar as alterações
      await Promise.all([exam.save(), athlete.save()]);

      return {
        message: "Resultado registrado com sucesso",
        result: {
          examName: exam.name,
          athleteName: athlete.name,
          grade,
          observations,
          date: exam.date,
          newBelt: athlete.belt // Retornar a nova faixa, se foi atualizada
        },
      };
    } catch (error) {
      console.error("Error updating exam result:", error);
      throw error;
    }
  }

  static async getExamParticipants(examId: string) {
    try {
      const exam = await Exam.findById(examId)
        .populate({
          path: 'participants',
          select: '_id name belt profilePicture',
          model: User
        });

      if (!exam) {
        throw new Error("Exame não encontrado");
      }

      return exam.participants;
    } catch (error) {
      console.error("Error getting exam participants:", error);
      throw error;
    }
  }

  static async updateExam(
    examId: string,
    userId: string,
    updateData: {
      name: string;
      date: Date;
      location: string;
      belt: string;
      maxParticipants?: number;
      description?: string;
    }
  ) {
    try {
      const exam = await Exam.findById(examId);
      
      if (!exam) {
        throw new Error("Exame não encontrado");
      }

      // Verificar se o instrutor é o dono do exame
      if (exam.instructor.toString() !== userId) {
        throw new Error("Você não tem permissão para editar este exame");
      }

      // Se houver participantes, não permite alterar a data
      if (exam.participants.length > 0 && updateData.date && exam.date.toString() !== updateData.date) {
        throw new Error("Não é possível alterar a data de um exame que já possui participantes");
      }

      // Atualizar os campos permitidos
      const allowedUpdates = ['name', 'date', 'location', 'belt', 'maxParticipants', 'description'];
      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          exam[field] = updateData[field];
        }
      });

      await exam.save();
      return exam;
    } catch (error) {
      console.error("Error updating exam:", error);
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
