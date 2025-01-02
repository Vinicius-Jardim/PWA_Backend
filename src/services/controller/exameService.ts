import Exam, { IExam } from "../../models/examModel";
import { validateBeltLevels } from "../../utils/beltValidator";
import { FilterQuery } from "mongoose";
import User, { roles, belts } from "../../models/userModel";
import { Op } from "sequelize";

export class ExameService {
  static async create(examData: Partial<IExam>, user: any): Promise<IExam> {
    try {
      // Se não houver instrutor definido, usar o criador como instrutor
      const examWithInstructor = {
        ...examData,
        instructor: examData.instructor || user.id,
        createdBy: user.id
      };

      const exam = new Exam(examWithInstructor);
      await exam.save();

      // Retornar o exame populado com os dados do instrutor
      return await Exam.findById(exam._id)
        .populate('instructor', 'name email')
        .populate('createdBy', 'name email');
    } catch (error) {
      console.error("Error creating exam:", error);
      throw error;
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

      // Construir a pipeline de agregação
      const pipeline = [
        // Lookup para pegar dados do instrutor
        {
          $lookup: {
            from: 'users',
            localField: 'instructor',
            foreignField: '_id',
            as: 'instructorData'
          }
        },
        // Unwind para transformar o array em objeto
        {
          $unwind: {
            path: '$instructorData',
            preserveNullAndEmptyArrays: true
          }
        },
        // Lookup para pegar dados do criador
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdByData'
          }
        },
        // Unwind para transformar o array em objeto
        {
          $unwind: {
            path: '$createdByData',
            preserveNullAndEmptyArrays: true
          }
        },
        // Match para filtrar
        {
          $match: {
            $and: [
              filters.name ? {
                $or: [
                  { name: { $regex: filters.name, $options: 'i' } },
                  { 'instructorData.name': { $regex: filters.name, $options: 'i' } },
                  { 'createdByData.name': { $regex: filters.name, $options: 'i' } }
                ]
              } : {},
              filters.beltLevel ? { beltLevel: filters.beltLevel } : {}
            ]
          }
        },
        // Lookup para participantes
        {
          $lookup: {
            from: 'users',
            localField: 'participants',
            foreignField: '_id',
            as: 'participantsData'
          }
        },
        // Project para formatar os dados
        {
          $project: {
            name: 1,
            date: 1,
            maxParticipants: 1,
            beltLevel: 1,
            location: 1,
            results: 1,
            participants: '$participantsData',
            instructor: {
              _id: '$instructorData._id',
              name: '$instructorData.name',
              email: '$instructorData.email'
            },
            createdBy: {
              _id: '$createdByData._id',
              name: '$createdByData.name',
              email: '$createdByData.email'
            }
          }
        }
      ];

      // Adicionar sort, skip e limit
      pipeline.push(
        { $sort: { date: 1 } },
        { $skip: skip },
        { $limit: limit }
      );

      // Executar a pipeline
      const exams = await Exam.aggregate(pipeline);

      // Contar total
      const totalCount = await Exam.aggregate([
        ...pipeline.slice(0, pipeline.findIndex(p => '$sort' in p)),
        { $count: 'total' }
      ]);

      const total = totalCount[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        exams,
        totalPages,
        currentPage: page,
        totalCount: total
      };
    } catch (error) {
      console.error("Error fetching all exams:", error);
      throw error;
    }
  }

  static async registerForExam(examId: string, athleteId: string) {
    try {
      // Buscar o exame e popular o instrutor e criador
      const exam = await Exam.findById(examId)
        .populate('instructor', 'name email')
        .populate('createdBy', 'name email');

      if (!exam) {
        throw new Error("Exame não encontrado");
      }

      // Verificar se o exame tem um instrutor ou criador
      if (!exam.instructor && !exam.createdBy) {
        throw new Error("Instrutor não definido para este exame");
      }

      // Verificar se ainda há vagas
      if (exam.participants.length >= exam.maxParticipants) {
        throw new Error("Exame já está com todas as vagas preenchidas");
      }

      // Verificar se o atleta já está inscrito
      const isParticipant = exam.participants.some(
        (participantId) => participantId.toString() === athleteId
      );
      
      if (isParticipant) {
        throw new Error("Você já está inscrito neste exame");
      }

      // Adicionar o atleta à lista de participantes
      exam.participants.push(athleteId);
      await exam.save();

      return exam;
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
          select: 'name email belt profilePicture',
          model: User
        });

      if (!exam) {
        throw new Error("Exame não encontrado");
      }

      // Garantir que participants é um array
      const participants = exam.participants || [];

      // Buscar os detalhes dos participantes
      const participantsDetails = await User.find({
        _id: { $in: participants }
      }).select('name email belt profilePicture');

      return participantsDetails;
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

  static async deleteExam(examId: string, userId: string): Promise<void> {
    try {
      const exam = await Exam.findById(examId).populate('instructor', '_id');
      
      if (!exam) {
        throw new Error("Exame não encontrado");
      }

      // Verificar se o usuário é o instrutor do exame
      const instructorId = exam.instructor && exam.instructor._id ? exam.instructor._id.toString() : null;

      // Verificar se o usuário criou o exame
      const createdById = exam.createdBy ? exam.createdBy.toString() : null;

      // Log para debug
      console.log('Delete exam debug:', {
        userId,
        instructorId,
        createdById,
        exam
      });

      if (instructorId !== userId && createdById !== userId) {
        throw new Error("Não autorizado a deletar este exame");
      }

      await Exam.findByIdAndDelete(examId);
    } catch (error) {
      console.error("Erro ao deletar exame:", error);
      throw error;
    }
  }

  static async updateUserBelt(examId: string, userId: string): Promise<void> {
    try {
      const exam = await Exam.findById(examId);
      if (!exam) {
        throw new Error("Exame não encontrado");
      }

      const result = exam.results.find(r => r.athleteId.toString() === userId);
      if (!result || result.grade < 7) {
        throw new Error("Usuário não aprovado neste exame");
      }

      const targetBelt = exam.beltLevel[exam.beltLevel.length - 1];
      await User.findByIdAndUpdate(userId, { belt: targetBelt });
    } catch (error) {
      console.error("Erro ao atualizar faixa do usuário:", error);
      throw error;
    }
  }
}
