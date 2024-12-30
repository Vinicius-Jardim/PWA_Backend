interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // TODO: Implementar o serviço de email real (por exemplo, usando nodemailer)
  console.log('Email enviado:', options);
};
