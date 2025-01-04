import nodemailer from 'nodemailer';
import config from '../config';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  private static async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw new Error('Falha ao enviar email');
    }
  }

  static async sendExamCreatedNotification(instructorEmail: string, examName: string, sessions: any[]) {
    const sessionsList = sessions.map(session => `
      <li>
        Data: ${new Date(session.date).toLocaleDateString('pt-BR')}
        Horário: ${session.time}
        Local: ${session.location}
        Limite de participantes: ${session.maxParticipants}
      </li>
    `).join('');

    const html = `
      <h2>Novo Exame Criado</h2>
      <p>O exame "${examName}" foi criado com sucesso.</p>
      <h3>Sessões:</h3>
      <ul>${sessionsList}</ul>
    `;

    await this.sendEmail(instructorEmail, 'Novo Exame Criado', html);
  }

  static async sendExamCancelledNotification(participantEmail: string, examName: string) {
    const html = `
      <h2>Exame Cancelado</h2>
      <p>O exame "${examName}" foi cancelado.</p>
      <p>Entre em contato com seu instrutor para mais informações.</p>
    `;

    await this.sendEmail(participantEmail, 'Exame Cancelado', html);
  }

  static async sendExamRegistrationConfirmation(participantEmail: string, examName: string, session: any) {
    const html = `
      <h2>Inscrição Confirmada</h2>
      <p>Sua inscrição para o exame "${examName}" foi confirmada.</p>
      <h3>Detalhes da Sessão:</h3>
      <ul>
        <li>Data: ${new Date(session.date).toLocaleDateString('pt-BR')}</li>
        <li>Horário: ${session.time}</li>
        <li>Local: ${session.location}</li>
      </ul>
    `;

    await this.sendEmail(participantEmail, 'Inscrição em Exame Confirmada', html);
  }

  static async sendExamUnregistrationConfirmation(participantEmail: string, examName: string, session: any) {
    const html = `
      <h2>Cancelamento de Inscrição</h2>
      <p>Sua inscrição para o exame "${examName}" foi cancelada.</p>
      <h3>Detalhes da Sessão Cancelada:</h3>
      <ul>
        <li>Data: ${new Date(session.date).toLocaleDateString('pt-BR')}</li>
        <li>Horário: ${session.time}</li>
        <li>Local: ${session.location}</li>
      </ul>
    `;

    await this.sendEmail(participantEmail, 'Cancelamento de Inscrição em Exame', html);
  }

  static async sendExamSessionUpdatedNotification(participantEmail: string, examName: string, session: any) {
    const html = `
      <h2>Atualização de Sessão de Exame</h2>
      <p>A sessão do exame "${examName}" foi atualizada.</p>
      <h3>Novos Detalhes da Sessão:</h3>
      <ul>
        <li>Data: ${new Date(session.date).toLocaleDateString('pt-BR')}</li>
        <li>Horário: ${session.time}</li>
        <li>Local: ${session.location}</li>
      </ul>
    `;

    await this.sendEmail(participantEmail, 'Atualização de Sessão de Exame', html);
  }

  static async sendExamSessionCancelledNotification(participantEmail: string, examName: string, session: any) {
    const html = `
      <h2>Cancelamento de Sessão de Exame</h2>
      <p>A sessão do exame "${examName}" foi cancelada.</p>
      <h3>Detalhes da Sessão Cancelada:</h3>
      <ul>
        <li>Data: ${new Date(session.date).toLocaleDateString('pt-BR')}</li>
        <li>Horário: ${session.time}</li>
        <li>Local: ${session.location}</li>
      </ul>
      <p>Entre em contato com seu instrutor para mais informações ou para se inscrever em outra sessão.</p>
    `;

    await this.sendEmail(participantEmail, 'Cancelamento de Sessão de Exame', html);
  }

  static async sendExamResultNotification(participantEmail: string, examName: string, grade: string, observations?: string) {
    const html = `
      <h2>Resultado do Exame</h2>
      <p>O resultado do seu exame "${examName}" está disponível:</p>
      <h3>Resultado:</h3>
      <ul>
        <li>Nota: ${grade}</li>
        ${observations ? `<li>Observações: ${observations}</li>` : ''}
      </ul>
    `;

    await this.sendEmail(participantEmail, 'Resultado do Exame', html);
  }

  static async sendBeltUpdateNotification(participantEmail: string, oldBelt: string, newBelt: string) {
    const html = `
      <h2>Parabéns! Nova Graduação</h2>
      <p>Sua faixa foi atualizada com sucesso!</p>
      <ul>
        <li>Faixa anterior: ${oldBelt}</li>
        <li>Nova faixa: ${newBelt}</li>
      </ul>
      <p>Parabéns pela sua conquista! Continue se dedicando ao seu desenvolvimento nas artes marciais.</p>
    `;

    await this.sendEmail(participantEmail, 'Nova Graduação', html);
  }

  // Outros métodos de email existentes...
}
