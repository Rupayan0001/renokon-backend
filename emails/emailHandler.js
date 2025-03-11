import { client } from "./../lib/mailtrap.js";
import { sender } from "./../lib/mailtrap.js";
import { createFriendRequestEmailTemplate, createWelcomeEmailTemplate } from "./emailTemplate.js";

export const sendWelcomeEmail = async (email, name, profileUrl) => {
  const recipient = [{ email }];

  try {
    const response = await client.send({
      from: sender,
      to: recipient,
      subject: "Welcome to Renokon",
      html: createWelcomeEmailTemplate(name, profileUrl),
      category: "Welcome",
    });
    console.log("Respose emails sent successfully ", response);
  } catch (error) {
    console.log(error);
  }
};

export const sendFriendRequestEmail = async (email, senderName, reciverName, profileUrl) => {
  const recipient = [{ email }];

  try {
    const response = await client.send({
      from: sender,
      to: recipient,
      subject: "You have a new friend request",
      html: createFriendRequestEmailTemplate(senderName, reciverName, profileUrl),
      category: "Friend Request",
    });
  } catch (error) {
    console.log(`Error sending email sdbsdbsdbsdbsdbsdbsdb: ${error}`);
  }
};

export const verifyEmail = async (email, senderName, reciverName, otp) => {
  const recipient = [{ email }];
  try {
    const response = await client.send({
      from: sender,
      to: recipient,
      subject: "Renookon: OTP for email verification",
      html: `<p>Hello ${reciverName}</p><p>${senderName}: Your OTP to verify email is <b> ${otp} </b> </p><p>OTP is valid for 30 minutes</p><p>Thank you.</p>`,
      category: "Verify Email",
    });
  } catch (error) {
    console.log(`Error sending email: ${error}`);
  }
};

export const verifyEmailForPasswordReset = async (email, otp) => {
  const recipient = [{ email }];
  try {
    const response = await client.send({
      from: sender,
      to: recipient,
      subject: "UnLinked: OTP for password reset",
      html: `<p>Hello</p><div class="flex justify-center items-center bg-white w-full py-4"><p>Your OTP to reset password is</p> <p class="text-blue-600 text-2xl font-semibold"> ${otp} </p> </div><p>OTP is valid for 5 minutes</p><p>Thank you.</p>`,
      category: "Verify Email",
    });
  } catch (error) {
    console.log(`Error sending email: ${error}`);
  }
};
