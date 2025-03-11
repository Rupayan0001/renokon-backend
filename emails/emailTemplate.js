export const createFriendRequestEmailTemplate = (senderName, reciverName, profileUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connection Request Accepted</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #0077B5, #00A0DC); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <img src="https://img.freepik.com/premium-vector/linkedin-logo_578229-227.jpg" alt="UnLinked Logo" style="width: 150px; margin-bottom: 20px;border-radius: 10px;"/>
    <h1 style="color: white; margin: 0; font-size: 28px;">Connection Accepted!</h1>
  </div>
  <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; color: #0077B5;"><strong>Hello ${reciverName},</strong></p>
    <p>Great news! <strong>${senderName}</strong> has sent you a friend request on UnLinked.</p>
    <div style="background-color: #f3f6f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="font-size: 16px; margin: 0;"><strong>What's next?</strong></p>
      <ul style="padding-left: 20px;">
        <li>Check out ${senderName}'s full profile</li>
        <li>Send a message to start a conversation</li>
        <li>Explore mutual interests and share memories</li>
      </ul>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${profileUrl}" style="background-color: #0077B5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; transition: background-color 0.3s;">View ${recipientName}'s Profile</a>
    </div>
    <p>Expanding your professional network opens up new opportunities. Keep connecting!</p>
    <p>Best regards,<br>The UnLinked Team</p>
  </div>
</body>
</html>
`;

export const createCommentNotificationEmailTemplate = (recipientName, commenterName, postUrl, commentContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Comment on Your Post</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #0077B5, #00A0DC); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <img src="https://img.freepik.com/premium-vector/linkedin-logo_578229-227.jpg" alt="UnLinked Logo" style="width: 150px; margin-bottom: 20px;border-radius: 10px;"/>
    <h1 style="color: white; margin: 0; font-size: 28px;">New Comment on Your Post</h1>
  </div>
  <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; color: #0077B5;"><strong>Hello ${recipientName},</strong></p>
    <p>${commenterName} has commented on your post:</p>
    <div style="background-color: #f3f6f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="font-style: italic; margin: 0;">"${commentContent}"</p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href=${postUrl} style="background-color: #0077B5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; transition: background-color 0.3s;">View Comment</a>
    </div>
    <p>Stay engaged with your network by responding to comments and fostering discussions.</p>
    <p>Best regards,<br>The UnLinked Team</p>
  </div>
</body>
</html>
`;
export const verifyEmail = (nameOfUser, otp) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Verify Your Email - Renokon</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 500px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .email-header {
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 24px;
      font-weight: bold;
    }
    .email-body {
      padding: 30px;
      text-align: center;
      color: #333333;
    }
    .otp-box {
      display: inline-block;
      font-size: 24px;
      font-weight: bold;
      color: #ffffff;
      background: #007bff;
      padding: 10px 20px;
      border-radius: 8px;
      margin: 15px 0;
    }
    .info-text {
      font-size: 16px;
      margin: 10px 0;
      color: #555555;
    }
    .footer {
      text-align: center;
      padding: 15px;
      font-size: 14px;
      background-color: #f4f4f4;
      color: #666666;
    }
    .footer a {
      color: #007bff;
      text-decoration: none;
    }
  </style>
</head>
<body>

  <div class="email-container">
    <div class="email-header">
      Renokon Email Verification
    </div>
    <div class="email-body">
      <p>Hi <strong>${nameOfUser}</strong>,</p>
      <p class="info-text">Thank you for signing up on Renokon! To verify your email, use the OTP below:</p>
      <div class="otp-box">${otp}</div>
      <p class="info-text">This OTP is valid for <strong>30 minutes</strong>. If you did not request this, let us know by replying to this email.</p>
    </div>
    <div class="footer">
      Need help? <a href="mailto:renokon.team@gmail.com">Contact Support</a> <br>
      &copy; 2025 Renokon. All rights reserved.
    </div>
  </div>

</body>
</html>
`;
export const verifyEmailForPasswordReset = (nameOfUser, otp) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Verify Your Email - Renokon</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 500px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .email-header {
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 24px;
      font-weight: bold;
    }
    .email-body {
      padding: 30px;
      text-align: center;
      color: #333333;
    }
    .otp-box {
      display: inline-block;
      font-size: 24px;
      font-weight: bold;
      color: #ffffff;
      background: #007bff;
      padding: 10px 20px;
      border-radius: 8px;
      margin: 15px 0;
    }
    .info-text {
      font-size: 16px;
      margin: 10px 0;
      color: #555555;
    }
    .footer {
      text-align: center;
      padding: 15px;
      font-size: 14px;
      background-color: #f4f4f4;
      color: #666666;
    }
    .footer a {
      color: #007bff;
      text-decoration: none;
    }
  </style>
</head>
<body>

  <div class="email-container">
    <div class="email-header">
      Renokon Email Verification
    </div>
    <div class="email-body">
      <p>Hi <strong>${nameOfUser}</strong>,</p>
      <p class="info-text">You have requested to reset your password. To verify your email, use the OTP below:</p>
      <div class="otp-box">${otp}</div>
      <p class="info-text">This OTP is valid for <strong>30 minutes</strong>. If you did not request this, let us know by replying to this email.</p>
    </div>
    <div class="footer">
      Need help? <a href="mailto:renokon.team@gmail.com">Contact Support</a> <br>
      &copy; 2025 Renokon. All rights reserved.
    </div>
  </div>

</body>
</html>
`;
export function createWelcomeEmailTemplate(name, profileUrl) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">  
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Renokon</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .email-container {
        max-width: 500px;
        margin: 20px auto;
        background: #ffffff;
        border-radius: 10px;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .email-header {
        background: linear-gradient(135deg, #007bff, #0056b3);
        color: #ffffff;
        text-align: center;
        padding: 20px;
        font-size: 24px;
        font-weight: bold;
      }
      .email-body {
        padding: 30px;
        text-align: center;
        color: #333333;
      }
      .info-box {
        background-color: #f3f6f8;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
      }
      .action-button {
        display: inline-block;
        background: #007bff;
        color: white;
        padding: 14px 28px;
        text-decoration: none;
        border-radius: 30px;
        font-weight: bold;
        font-size: 16px;
        transition: background-color 0.3s;
      }
      .footer {
        text-align: center;
        padding: 15px;
        font-size: 14px;
        background-color: #f4f4f4;
        color: #666666;
      }
      .footer a {
        color: #007bff;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-header">
        Welcome to Renokon!
      </div>
      <div class="email-body">
        <p>Hi <strong>${name}</strong>,</p>
        <p>We're thrilled to have you join our platform! Renokon is your platform to connect with people, learn new things, play quizes, win prizes and many more.</p>
        <div class="info-box">
          <p><strong>Here's how to get started:</strong></p>
          <ul style="text-align: left; padding-left: 20px;">
            <li>Complete your profile</li>
            <li>Connect with friends and families</li>
            <li>Post something interesting</li>
            <li>Join a free quiz pool</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${profileUrl}" class="action-button">Complete Your Profile</a>
        </div>
        <p>If you have any questions or need assistance, our support team is always here to help.</p>
        <p>Best regards,<br>The Renokon Team</p>
      </div>
      <div class="footer">
        Need help? <a href="mailto:renokon.team@gmail.com">Contact Support</a> <br>
        &copy; 2025 Renokon. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
}
export function passwordChangedsuccessEmailTemplate(name, profileUrl) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">  
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Changed Successfully</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .email-container {
        max-width: 500px;
        margin: 20px auto;
        background: #ffffff;
        border-radius: 10px;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .email-header {
        background: linear-gradient(135deg, #007bff, #0056b3);
        color: #ffffff;
        text-align: center;
        padding: 20px;
        font-size: 24px;
        font-weight: bold;
      }
      .email-body {
        padding: 30px;
        text-align: center;
        color: #333333;
      }
      .info-box {
        background-color: #f3f6f8;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
      }
      .action-button {
        display: inline-block;
        background: #007bff;
        color: white;
        padding: 14px 28px;
        text-decoration: none;
        border-radius: 30px;
        font-weight: bold;
        font-size: 16px;
        transition: background-color 0.3s;
      }
      .footer {
        text-align: center;
        padding: 15px;
        font-size: 14px;
        background-color: #f4f4f4;
        color: #666666;
      }
      .footer a {
        color: #007bff;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-header">
        Renokon
      </div>
      <div class="email-body">
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your password has been successfully changed.</p>
        <p>If you have any questions or need assistance, our support team is always here to help. If you have not requested to change password please reply to this mail.</p>
        <p>Best regards,<br>The Renokon Team</p>
      </div>
      <div class="footer">
        Need help? <a href="mailto:renokon.team@gmail.com">Contact Support</a> <br>
        &copy; 2025 Renokon. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
}
export function gameStartsNotification(playerName, gameTitle) {
  return `
 
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Game Starts in 1 Minute!</title>
  <style>
    :root {
      color-scheme: light dark;
    }
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 500px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .email-header {
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 24px;
      font-weight: bold;
    }
    .email-body {
      padding: 30px;
      text-align: center;
      color: #333333;
    }
    .info-box {
      background-color: #f3f6f8;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      font-size: 18px;
      font-weight: bold;
    }
    .emoji {
      font-size: 24px;
    }
    .action-button {
      display: inline-block;
      background: #007bff;
      color: white;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 30px;
      font-weight: bold;
      font-size: 16px;
      transition: background-color 0.3s;
    }
    .footer {
      text-align: center;
      padding: 15px;
      font-size: 14px;
      background-color: #f4f4f4;
      color: #666666;
    }
    .footer a {
      color: #007bff;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      🎮 Game Alert! Your Match is Starting Soon
    </div>
    <div class="email-body">
      <p>Hey <strong>{{playerName}}</strong>,</p>
      <p>Get ready! Your game <strong>{{gameTitle}}</strong> starts in <strong>1 minute</strong>! ⏳</p>
      <div class="info-box">
        <p class="emoji">⚡ Time to bring your A-game! 🎯</p>
        <p>Get ready to play!</p>
          <p>Click on the button below and prepared for an epic battle.</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://renokon.com/game" class="action-button">Game Pool</a>
      </div>
      <p>See you in the game! 🚀</p>
      <p>Best regards,<br>The Renokon Team</p>
    </div>
    <div class="footer">
      Need help? <a href="mailto:renokon.team@gmail.com">Contact Support</a> <br>
      &copy; 2025 Renokon. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
}
export function gamePoolNotFilledNotification(playerName, gameTitle) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Game Pool Not Filled</title>
  <style>
    :root {
      color-scheme: light dark;
    }
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 500px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .email-header {
      background: linear-gradient(135deg, #ff4757, #b30000);
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 24px;
      font-weight: bold;
    }
    .email-body {
      padding: 30px;
      text-align: center;
      color: #333333;
    }
    .info-box {
      background-color: #f3f6f8;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      font-size: 18px;
      font-weight: bold;
    }
    .emoji {
      font-size: 24px;
    }
    .action-button {
      display: inline-block;
      background: #007bff;
      color: white;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 30px;
      font-weight: bold;
      font-size: 16px;
      transition: background-color 0.3s;
    }
    .footer {
      text-align: center;
      padding: 15px;
      font-size: 14px;
      background-color: #f4f4f4;
      color: #666666;
    }
    .footer a {
      color: #007bff;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      ❌ Game Pool Not Filled
    </div>
    <div class="email-body">
      <p>Hey <strong>${playerName}</strong>,</p>
      <p>Unfortunately, your game <strong>{{gameTitle}}</strong> did not have enough players to start. 😔</p>
      <div class="info-box">
        <p class="emoji">🔄 But don't worry! You can join a new pool now.</p>
        <p>We've deleted the unfilled pool, and you can find a new match to play.</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://renokon.com/game" class="action-button">Join New Pool</a>
      </div>
      <p>We hope to see you in the next game! 🚀</p>
      <p>Best regards,<br>The Renokon Team</p>
    </div>
    <div class="footer">
      Need help? <a href="mailto:renokon.team@gmail.com">Contact Support</a> <br>
      &copy; 2025 Renokon. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
}
