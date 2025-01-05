import { Types } from "mongoose";
import { Exam } from "../../models/examModel";
import { User } from "../../models/userModel";
import { EmailService } from "../emailService";

interface SessionData {
  examId: string;
  date: Date;
  time: string;
  location: string;
  maxParticipants: number;
  participants: Types.ObjectId[];
}

export const ExamSessionService = {
  createSession: async (sessionData: SessionData) => {
    const exam = await Exam.findById(sessionData.examId).populate('instructor');
    if (!exam) {
      throw new Error("Exame não encontrado");
    }

    exam.sessions.push({
      date: sessionData.date,
      time: sessionData.time,
      location: sessionData.location,
      maxParticipants: sessionData.maxParticipants,
      participants: []
    });

    await exam.save();

    // Notifica o instrutor sobre a nova sessão
    if (exam.instructor) {
      const instructor = await User.findById(exam.instructor);
      if (instructor?.email) {
        await EmailService.sendExamCreatedNotification(
          instructor.email,
          exam.name,
          exam.sessions
        );
      }
    }

    return exam.sessions[exam.sessions.length - 1];
  },

  getSessionsByExam: async (examId: string) => {
    const exam = await Exam.findById(examId);
    if (!exam) {
      throw new Error("Exame não encontrado");
    }
    return exam.sessions;
  },

  register: async (examId: string, sessionId: string, athleteId: string) => {
    const exam = await Exam.findById(examId);
    if (!exam) {
      throw new Error("Exame não encontrado");
    }

    const session = exam.sessions.id(sessionId);
    if (!session) {
      throw new Error("Sessão não encontrada");
    }

    if (session.participants.includes(new Types.ObjectId(athleteId))) {
      throw new Error("Atleta já está inscrito nesta sessão");
    }

    if (session.participants.length >= session.maxParticipants) {
      throw new Error("Sessão está lotada");
    }

    session.participants.push(new Types.ObjectId(athleteId));
    await exam.save();

    // Notifica o atleta sobre a inscrição
    const athlete = await User.findById(athleteId);
    if (athlete?.email) {
      await EmailService.sendExamRegistrationConfirmation(
        athlete.email,
        exam.name,
        session
      );
    }

    return session;
  },

  unregister: async (examId: string, sessionId: string, athleteId: string) => {
    const exam = await Exam.findById(examId);
    if (!exam) {
      throw new Error("Exame não encontrado");
    }

    const session = exam.sessions.id(sessionId);
    if (!session) {
      throw new Error("Sessão não encontrada");
    }

    const participantIndex = session.participants.findIndex(
      (id) => id.toString() === athleteId
    );

    if (participantIndex === -1) {
      throw new Error("Atleta não está inscrito nesta sessão");
    }

    session.participants.splice(participantIndex, 1);
    await exam.save();

    // Notifica o atleta sobre o cancelamento
    const athlete = await User.findById(athleteId);
    if (athlete?.email) {
      await EmailService.sendExamUnregistrationConfirmation(
        athlete.email,
        exam.name,
        session
      );
    }

    return session;
  },

  delete: async (examId: string, sessionId: string) => {
    const exam = await Exam.findById(examId);
    if (!exam) {
      throw new Error("Exame não encontrado");
    }

    const session = exam.sessions.id(sessionId);
    if (!session) {
      throw new Error("Sessão não encontrada");
    }

    // Notifica todos os participantes sobre o cancelamento
    const participants = await User.find({
      _id: { $in: session.participants }
    });

    for (const participant of participants) {
      if (participant.email) {
        await EmailService.sendExamSessionCancelledNotification(
          participant.email,
          exam.name,
          session
        );
      }
    }

    exam.sessions.pull({ _id: sessionId });
    await exam.save();
  },

  update: async (examId: string, sessionId: string, updateData: Partial<SessionData>) => {
    const exam = await Exam.findById(examId);
    if (!exam) {
      throw new Error("Exame não encontrado");
    }

    const session = exam.sessions.id(sessionId);
    if (!session) {
      throw new Error("Sessão não encontrada");
    }

    Object.assign(session, updateData);
    await exam.save();

    // Notifica todos os participantes sobre a atualização
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

    return session;
  }
};
