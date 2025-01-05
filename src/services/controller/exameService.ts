import { Exam, IExam } from "../../models/examModel";
import { User } from "../../models/userModel";
import mongoose from "mongoose";
import { EmailService } from "../emailService";

export class ExameService {
  static async findAll() {
    try {
      return await Exam.find()
        .populate("instructor", "name")
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error("Erro ao buscar exames");
    }
  }

  static async findById(id: string) {
    try {
      const exam = await Exam.findById(id).populate("instructor", "name");
      if (!exam) {
        throw new Error("Exame não encontrado");
      }
      return exam;
    } catch (error) {
      throw new Error("Erro ao buscar exame");
    }
  }

  static async create(examData: Partial<IExam>) {
    try {
      const exam = new Exam(examData);
      await exam.save();

      // Enviar e-mail para o instrutor
      const instructor = await User.findById(examData.instructor);
      if (instructor && instructor.email) {
        await EmailService.sendExamCreatedNotification(
          instructor.email,
          exam.name,
          exam.sessions
        );
      }

      return exam;
    } catch (error) {
      throw new Error("Erro ao criar exame");
    }
  }

  static async update(id: string, instructorId: string, updateData: Partial<IExam>) {
    try {
      const exam = await Exam.findOneAndUpdate(
        { _id: id, instructor: instructorId },
        updateData,
        { new: true }
      );

      if (!exam) {
        throw new Error("Exame não encontrado");
      }

      return exam;
    } catch (error) {
      throw new Error("Erro ao atualizar exame");
    }
  }

  static async delete(id: string, instructorId: string) {
    try {
      const exam = await Exam.findOneAndDelete({
        _id: id,
        instructor: instructorId,
      });

      if (!exam) {
        throw new Error("Exame não encontrado");
      }

      // Notificar participantes sobre o cancelamento
      const participantIds = exam.sessions.reduce((ids: string[], session) => {
        return [...ids, ...session.participants.map(p => p.toString())];
      }, []);

      const participants = await User.find({
        _id: { $in: participantIds }
      });

      for (const participant of participants) {
        if (participant.email) {
          await EmailService.sendExamCancelledNotification(
            participant.email,
            exam.name
          );
        }
      }

      return exam;
    } catch (error) {
      throw new Error("Erro ao excluir exame");
    }
  }

  static async registerParticipant(sessionId: string, userId: string) {
    try {
      const exam = await Exam.findOne({ "sessions._id": sessionId });
      if (!exam) {
        throw new Error("Sessão não encontrada");
      }

      const session = exam.sessions.id(sessionId);
      if (!session) {
        throw new Error("Sessão não encontrada");
      }

      if (session.participants.length >= session.maxParticipants) {
        throw new Error("Sessão está lotada");
      }

      if (session.participants.includes(userId)) {
        throw new Error("Você já está inscrito nesta sessão");
      }

      session.participants.push(userId);
      await exam.save();

      // Enviar e-mail de confirmação
      const participant = await User.findById(userId);
      if (participant && participant.email) {
        await EmailService.sendExamRegistrationConfirmation(
          participant.email,
          exam.name,
          session
        );
      }

      return exam;
    } catch (error) {
      throw error;
    }
  }

  static async unregisterParticipant(sessionId: string, userId: string) {
    try {
      const exam = await Exam.findOne({ "sessions._id": sessionId });
      if (!exam) {
        throw new Error("Sessão não encontrada");
      }

      const session = exam.sessions.id(sessionId);
      if (!session) {
        throw new Error("Sessão não encontrada");
      }

      const participantIndex = session.participants.indexOf(userId);
      if (participantIndex === -1) {
        throw new Error("Você não está inscrito nesta sessão");
      }

      session.participants.splice(participantIndex, 1);
      await exam.save();

      // Enviar e-mail de cancelamento
      const participant = await User.findById(userId);
      if (participant && participant.email) {
        await EmailService.sendExamUnregistrationConfirmation(
          participant.email,
          exam.name,
          session
        );
      }

      return exam;
    } catch (error) {
      throw error;
    }
  }

  static async findMyExams(userId: string) {
    try {
      return await Exam.find({
        "sessions.participants": userId
      }).populate("instructor", "name");
    } catch (error) {
      throw new Error("Erro ao buscar exames");
    }
  }

  static async findByInstructor(instructorId: string) {
    try {
      return await Exam.find({ instructor: instructorId })
        .populate("instructor", "name")
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error("Erro ao buscar exames");
    }
  }

  static async addSession(examId: string, instructorId: string, sessionData: any) {
    try {
      const exam = await Exam.findOne({
        _id: examId,
        instructor: instructorId
      });

      if (!exam) {
        throw new Error("Exame não encontrado");
      }

      exam.sessions.push(sessionData);
      await exam.save();

      return exam;
    } catch (error) {
      throw new Error("Erro ao adicionar sessão");
    }
  }

  static async updateSession(examId: string, sessionId: string, instructorId: string, sessionData: any) {
    try {
      const exam = await Exam.findOne({
        _id: examId,
        instructor: instructorId
      });

      if (!exam) {
        throw new Error("Exame não encontrado");
      }

      const session = exam.sessions.id(sessionId);
      if (!session) {
        throw new Error("Sessão não encontrada");
      }

      Object.assign(session, sessionData);
      await exam.save();

      // Notificar participantes sobre a atualização
      const participants = await User.find({
        _id: { $in: session.participants }
      });

      for (const participant of participants) {
        if (participant.email) {
          await EmailService.sendExamSessionUpdatedNotification(
            participant.email,
            exam.name,
            session
          );
        }
      }

      return exam;
    } catch (error) {
      throw new Error("Erro ao atualizar sessão");
    }
  }

  static async deleteSession(examId: string, sessionId: string, instructorId: string) {
    try {
      const exam = await Exam.findOne({
        _id: examId,
        instructor: instructorId
      });

      if (!exam) {
        throw new Error("Exame não encontrado");
      }

      const session = exam.sessions.id(sessionId);
      if (!session) {
        throw new Error("Sessão não encontrada");
      }

      // Notificar participantes antes de excluir
      const participants = await User.find({
        _id: { $in: session.participants }
      });

      exam.sessions = exam.sessions.filter(
        s => s._id.toString() !== sessionId
      );
      await exam.save();

      // Enviar notificações após confirmar a exclusão
      for (const participant of participants) {
        if (participant.email) {
          await EmailService.sendExamSessionCancelledNotification(
            participant.email,
            exam.name,
            session
          );
        }
      }

      return exam;
    } catch (error) {
      throw new Error("Erro ao excluir sessão");
    }
  }

  static async updateResult(examId: string, instructorId: string, resultData: any) {
    try {
      const exam = await Exam.findOne({
        _id: examId,
        instructor: instructorId
      });

      if (!exam) {
        throw new Error("Exame não encontrado");
      }

      const { athleteId, grade, observations } = resultData;

      const result = {
        athleteId,
        grade,
        observations
      };

      const existingResultIndex = exam.results.findIndex(
        r => r.athleteId.toString() === athleteId
      );

      if (existingResultIndex >= 0) {
        exam.results[existingResultIndex] = result;
      } else {
        exam.results.push(result);
      }

      await exam.save();

      // Notificar atleta sobre o resultado
      const athlete = await User.findById(athleteId);
      if (athlete && athlete.email) {
        await EmailService.sendExamResultNotification(
          athlete.email,
          exam.name,
          grade,
          observations
        );
      }

      return exam;
    } catch (error) {
      throw new Error("Erro ao atualizar resultado");
    }
  }

  static async getParticipants(examId: string, instructorId: string) {
    try {
      const exam = await Exam.findOne({
        _id: examId,
        instructor: instructorId
      });

      if (!exam) {
        throw new Error("Exame não encontrado");
      }

      const participantIds = exam.sessions.reduce((ids: string[], session) => {
        return [...ids, ...session.participants.map(p => p.toString())];
      }, []);

      return await User.find({
        _id: { $in: participantIds }
      }).select("name email belt");
    } catch (error) {
      throw new Error("Erro ao buscar participantes");
    }
  }

  static async updateBelt(examId: string, athleteId: string, instructorId: string, newBelt: string) {
    try {
      const exam = await Exam.findOne({
        _id: examId,
        instructor: instructorId
      });

      if (!exam) {
        throw new Error("Exame não encontrado");
      }

      const athlete = await User.findById(athleteId);
      if (!athlete) {
        throw new Error("Atleta não encontrado");
      }

      const oldBelt = athlete.belt;
      athlete.belt = newBelt;
      await athlete.save();

      // Notificar atleta sobre a mudança de faixa
      if (athlete.email) {
        await EmailService.sendBeltUpdateNotification(
          athlete.email,
          oldBelt,
          newBelt
        );
      }

      return athlete;
    } catch (error) {
      throw new Error("Erro ao atualizar faixa");
    }
  }
}
