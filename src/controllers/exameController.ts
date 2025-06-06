import { Request, Response } from "express";
import { Exam } from "../models/examModel";
import { User } from "../models/userModel";
import mongoose from "mongoose";

export class ExameController {
  static async all(req: Request, res: Response) {
    try {
      const exams = await Exam.find()
        .populate("instructor", "name")
        .sort({ createdAt: -1 });
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar exames" });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const exam = await Exam.findOne({ "sessions._id": sessionId });
      if (!exam) {
        return res.status(404).json({ message: "Sessão não encontrada" });
      }

      const session = exam.sessions.id(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Sessão não encontrada" });
      }

      if (session.participants.length >= session.maxParticipants) {
        return res.status(400).json({ message: "Sessão está lotada" });
      }

      if (session.participants.includes(userId)) {
        return res.status(400).json({ message: "Você já está inscrito nesta sessão" });
      }

      session.participants.push(userId);
      await exam.save();

      res.json({ message: "Inscrição realizada com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao realizar inscrição" });
    }
  }

  static async unregister(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const exam = await Exam.findOne({ "sessions._id": sessionId });
      if (!exam) {
        return res.status(404).json({ message: "Sessão não encontrada" });
      }

      const session = exam.sessions.id(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Sessão não encontrada" });
      }

      const participantIndex = session.participants.indexOf(userId);
      if (participantIndex === -1) {
        return res.status(400).json({ message: "Você não está inscrito nesta sessão" });
      }

      session.participants.splice(participantIndex, 1);
      await exam.save();

      res.json({ message: "Inscrição cancelada com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao cancelar inscrição" });
    }
  }

  static async myExams(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const exams = await Exam.find({
        "sessions.participants": userId
      }).populate("instructor", "name");
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar exames" });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const examData = {
        ...req.body,
        createdBy: req.user.id,
        instructor: req.user.id
      };

      const exam = new Exam(examData);
      await exam.save();

      res.status(201).json(exam);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar exame" });
    }
  }

  static async own(req: Request, res: Response) {
    try {
      const exams = await Exam.find({ instructor: req.user.id })
        .populate("instructor", "name")
        .sort({ createdAt: -1 });
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar exames" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const exam = await Exam.findOneAndUpdate(
        { _id: id, instructor: req.user.id },
        req.body,
        { new: true }
      );

      if (!exam) {
        return res.status(404).json({ message: "Exame não encontrado" });
      }

      res.json(exam);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar exame" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const exam = await Exam.findOneAndDelete({
        _id: id,
        instructor: req.user.id
      });

      if (!exam) {
        return res.status(404).json({ message: "Exame não encontrado" });
      }

      res.json({ message: "Exame excluído com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir exame" });
    }
  }

  // Métodos de Sessão
  static async getSessions(req: Request, res: Response) {
    try {
      const { examId } = req.params;
      const exam = await Exam.findById(examId);
      
      if (!exam) {
        return res.status(404).json({ message: "Exame não encontrado" });
      }

      res.json(exam.sessions);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar sessões" });
    }
  }

  static async addSession(req: Request, res: Response) {
    try {
      const { examId } = req.params;
      const sessionData = req.body;

      const exam = await Exam.findOne({
        _id: examId,
        instructor: req.user.id
      });

      if (!exam) {
        return res.status(404).json({ message: "Exame não encontrado" });
      }

      exam.sessions.push(sessionData);
      await exam.save();

      res.status(201).json(exam);
    } catch (error) {
      res.status(500).json({ message: "Erro ao adicionar sessão" });
    }
  }

  static async updateSession(req: Request, res: Response) {
    try {
      const { examId, sessionId } = req.params;
      const sessionData = req.body;

      const exam = await Exam.findOne({
        _id: examId,
        instructor: req.user.id
      });

      if (!exam) {
        return res.status(404).json({ message: "Exame não encontrado" });
      }

      const session = exam.sessions.id(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Sessão não encontrada" });
      }

      Object.assign(session, sessionData);
      await exam.save();

      res.json(exam);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar sessão" });
    }
  }

  static async deleteSession(req: Request, res: Response) {
    try {
      const { examId, sessionId } = req.params;

      const exam = await Exam.findOne({
        _id: examId,
        instructor: req.user.id
      });

      if (!exam) {
        return res.status(404).json({ message: "Exame não encontrado" });
      }

      exam.sessions = exam.sessions.filter(
        session => session._id.toString() !== sessionId
      );
      await exam.save();

      res.json({ message: "Sessão excluída com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir sessão" });
    }
  }

  // Métodos de Resultado
  static async updateResult(req: Request, res: Response) {
    try {
      const { examId, athleteId } = req.params;
      const { grade, observations } = req.body;

      // Buscar o exame
      const exam = await Exam.findById(examId);
      if (!exam) {
        return res.status(404).json({ message: "Exame não encontrado" });
      }

      // Verificar se o atleta está inscrito em alguma sessão
      const isParticipant = exam.sessions.some(session => 
        session.participants.some(p => p.toString() === athleteId)
      );

      if (!isParticipant) {
        return res.status(404).json({ message: "Atleta não inscrito neste exame" });
      }

      // Verificar se já existe um resultado para este atleta
      const existingResult = exam.results?.find(r => r.athleteId.toString() === athleteId);
      if (existingResult) {
        return res.status(400).json({ message: "Já existe um resultado registrado para este atleta" });
      }

      // Adicionar o resultado
      if (!exam.results) {
        exam.results = [];
      }

      exam.results.push({
        athleteId: new mongoose.Types.ObjectId(athleteId),
        grade: Number(grade),
        observations
      });

      await exam.save();

      res.json({ message: "Resultado registrado com sucesso" });
    } catch (error) {
      console.error('Erro ao atualizar resultado:', error);
      res.status(500).json({ message: "Erro ao atualizar resultado", error: error.message });
    }
  }

  static async getParticipants(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Buscar o exame com populate no instructor
      const exam = await Exam.findById(id).populate('instructor');

      if (!exam) {
        return res.status(404).json({ message: "Exame não encontrado" });
      }

      // Coleta todos os IDs únicos de participantes de todas as sessões
      const participantIds = Array.from(new Set(
        exam.sessions.reduce((ids: string[], session) => {
          return [...ids, ...session.participants.map(p => p.toString())];
        }, [])
      ));

      if (participantIds.length === 0) {
        return res.json([]);
      }

      // Buscar usuários pelo ID
      const users = await mongoose.model('User').find({
        _id: { $in: participantIds.map(id => new mongoose.Types.ObjectId(id)) }
      }).select("name email belt");

      res.json(users);
    } catch (error) {
      console.error("Erro ao buscar participantes:", error);
      res.status(500).json({ message: "Erro ao buscar participantes" });
    }
  }

  static async updateBelt(req: Request, res: Response) {
    try {
      const { examId, athleteId } = req.params;

      const exam = await Exam.findById(examId);
      if (!exam) {
        return res.status(404).json({ message: "Exame não encontrado" });
      }

      // Verificar se o atleta tem resultado e se foi aprovado
      const result = exam.results?.find(r => r.athleteId.toString() === athleteId);
      if (!result) {
        return res.status(400).json({ message: "Atleta não tem resultado registrado" });
      }

      if (result.grade < 7) {
        return res.status(400).json({ message: "Atleta não foi aprovado" });
      }

      const athlete = await User.findById(athleteId);
      if (!athlete) {
        return res.status(404).json({ message: "Atleta não encontrado" });
      }

      // Pegar a última faixa do array beltLevel (que é a faixa alvo)
      const newBelt = exam.beltLevel[exam.beltLevel.length - 1];
      if (!newBelt) {
        return res.status(400).json({ message: "Faixa alvo não encontrada no exame" });
      }

      athlete.belt = newBelt;
      await athlete.save();

      res.json({ message: "Faixa atualizada com sucesso", newBelt });
    } catch (error) {
      console.error('Erro ao atualizar faixa:', error);
      res.status(500).json({ message: "Erro ao atualizar faixa" });
    }
  }
}
