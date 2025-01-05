import { Exam } from "../models/examModel";
import User from "../models/userModel";
import { sendEmail } from "../utils/emailService";

export class ExamNotificationService {
  static async checkAndNotifyEligibleExams(userId: string, currentBelt: string) {
    try {
      // Busca o atleta
      const athlete = await User.findById(userId);
      if (!athlete) {
        throw new Error("Atleta não encontrado");
      }

      // Busca exames que o atleta pode fazer com sua faixa atual
      const eligibleExams = await Exam.find({
        beltLevel: currentBelt,
        // Garante que só pegamos exames futuros
        "sessions.date": { $gt: new Date() }
      }).populate("instructor", "name");

      if (eligibleExams.length > 0) {
        // Prepara o conteúdo do email
        const examsList = eligibleExams.map(exam => {
          const nextSession = exam.sessions
            .filter(s => new Date(s.date) > new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

          return `
            • Nome do Exame: ${exam.name}
            • Faixa Final: ${exam.finalBelt}
            • Próxima Sessão: ${nextSession ? new Date(nextSession.date).toLocaleDateString() + ' às ' + nextSession.time : 'A definir'}
            • Local: ${nextSession?.location || 'A definir'}
            • Instrutor: ${(exam.instructor as any)?.name || 'A definir'}
            ----------------------------------------
          `;
        }).join('\n');

        const emailContent = `
          Olá ${athlete.name}!

          Parabéns pela sua nova faixa! Você agora está elegível para os seguintes exames:

          ${examsList}

          Para se inscrever, acesse o sistema clicando no link abaixo:
          http://localhost:3000/exams

          Boa sorte em sua jornada!
          Academia Miyagi-Do 
        `;

        // Envia o email
        await sendEmail({
          to: athlete.email,
          subject: "🥋 Novos Exames Disponíveis - Você está elegível!",
          text: emailContent
        });
      }
    } catch (error) {
      console.error("Erro ao verificar exames elegíveis:", error);
      // Não lançamos o erro para não interferir no fluxo principal
    }
  }
}
