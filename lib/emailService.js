import SibApiV3Sdk from "@sendinblue/client";
import dotenv from "dotenv";

dotenv.config();

const brevo = new SibApiV3Sdk.TransactionalEmailsApi();
brevo.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

export async function sendEmail(toEmail, subject, htmlContent) {
  try {
    const emailData = {
      sender: { name: "Renokon", email: "renokon.team@gmail.com" },
      to: [{ email: toEmail }],
      subject: subject,
      htmlContent: htmlContent,
    };

    const response = await brevo.sendTransacEmail(emailData);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export async function sendTemplateEmail(toEmail, templateId, params) {
  try {
    const emailData = {
      sender: { name: "YourApp", email: "your_verified_email@domain.com" },
      to: [{ email: toEmail }],
      templateId: templateId, // Your Brevo Template ID
      params: params, // Dynamic variables for your template
    };

    const response = await brevo.sendTransacEmail(emailData);
    console.log("Template email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending template email:", error);
    throw error;
  }
}
