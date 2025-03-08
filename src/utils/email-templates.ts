export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Cricket Account</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #1e3c72, #2a5298); padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
    <h1 style="color: white; margin: 0;">Welcome to Cricket Tournament</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <p>Hello <strong>{playerName}</strong>,</p>
    <p>Thank you for registering for our cricket tournament! To verify your account, please use the verification code below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background-color: #f2f2f2; padding: 15px 30px; border-radius: 5px; color: #1e3c72; border: 1px dashed #ccc;">{verificationCode}</span>
    </div>
    <p>Enter this code on the verification page to complete your registration and join your team.</p>
    <p>This code will expire in 30 minutes for security reasons.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="font-size: 14px; color: #666;">
        <p>If you didn't request this verification, please ignore this email.</p>
      </div>
    </div>
    <p>Best regards,<br/>The Cricket Tournament Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>© ${new Date().getFullYear()} Cricket Tournament. All rights reserved.</p>
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Cricket Tournament</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #1e3c72, #2a5298); padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
    <h1 style="color: white; margin: 0;">Welcome to Cricket Tournament</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <p>Hello <strong>{playerName}</strong>,</p>
    <p>Welcome to the Cricket Tournament! Your account has been successfully verified and is now active.</p>
    
    <div style="margin: 30px 0; background-color: #e8f4ff; padding: 20px; border-radius: 5px; border-left: 4px solid #1e3c72;">
      <h3 style="margin-top: 0; color: #1e3c72;">Your Account Information:</h3>
      <p><strong>Player ID:</strong> {playerId}</p>
      <p><strong>University:</strong> {universityName}</p>
      <p><strong>Email:</strong> {playerEmail}</p>
    </div>
    
    <p>You can now:</p>
    <ul style="padding-left: 20px;">
      <li>Create or join a team</li>
      <li>View upcoming matches</li>
      <li>Track your cricket statistics</li>
      <li>Connect with other players</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{dashboardURL}" style="background-color: #1e3c72; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
    </div>
    
    <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
    <p>Best regards,<br/>The Cricket Tournament Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>© ${new Date().getFullYear()} Cricket Tournament. All rights reserved.</p>
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #1e3c72, #2a5298); padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
    <h1 style="color: white; margin: 0;">Password Reset Request</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <p>Hello <strong>{playerName}</strong>,</p>
    <p>We received a request to reset your password for your Cricket Tournament account. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #1e3c72; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
    </div>
    <p style="font-size: 14px; color: #666;">Or copy and paste this URL into your browser: <br/> {resetURL}</p>
    <div style="background-color: #fff4e5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800;">
      <p style="margin: 0; color: #e65100;"><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
    </div>
    <p>If you didn't request a password reset, please secure your account by changing your password.</p>
    <p>Best regards,<br/>The Cricket Tournament Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>© ${new Date().getFullYear()} Cricket Tournament. All rights reserved.</p>
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #1e3c72, #2a5298); padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
    <h1 style="color: white; margin: 0;">Password Reset Successful</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <p>Hello <strong>{playerName}</strong>,</p>
    <p>We're writing to confirm that your password has been successfully reset.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="display: inline-block; background-color: #e8f5e9; width: 80px; height: 80px; line-height: 80px; border-radius: 50%; text-align: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
    </div>
    <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50;">
      <p style="margin: 0;"><strong>Your password has been updated successfully.</strong> You can now log in with your new password.</p>
    </div>
    <p>If you did not initiate this password reset, please contact our support team immediately.</p>
    <p>For security reasons, we recommend that you:</p>
    <ul style="padding-left: 20px;">
      <li>Use a strong, unique password</li>
      <li>Enable two-factor authentication if available</li>
      <li>Avoid using the same password across multiple sites</li>
    </ul>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{loginURL}" style="background-color: #1e3c72; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Login to Your Account</a>
    </div>
    <p>Thank you for helping us keep your account secure.</p>
    <p>Best regards,<br/>The Cricket Tournament Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>© ${new Date().getFullYear()} Cricket Tournament. All rights reserved.</p>
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const TEAM_CREATION_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Created Successfully</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #1e3c72, #2a5298); padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
    <h1 style="color: white; margin: 0;">Team Created Successfully</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <p>Hello <strong>{captainName}</strong>,</p>
    <p>Congratulations! Your cricket team "<strong>{teamName}</strong>" has been successfully created. As team captain, you now have access to manage your team and participate in tournaments.</p>
    
    <div style="margin: 30px 0; background-color: #e8f4ff; padding: 20px; border-radius: 5px; border-left: 4px solid #1e3c72;">
      <h3 style="margin-top: 0; color: #1e3c72;">Team Information:</h3>
      <p><strong>Team Name:</strong> {teamName}</p>
      <p><strong>University:</strong> {universityName}</p>
      <p><strong>Captain:</strong> {captainName}</p>
      <p><strong>Initial Budget:</strong> ${'{budget}'}</p>
    </div>
    
    <p>As team captain, you can now:</p>
    <ul style="padding-left: 20px;">
      <li>Invite players to join your team</li>
      <li>Register for tournaments</li>
      <li>Manage your team's budget</li>
      <li>Create and update your team's profile</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{teamDashboardURL}" style="background-color: #1e3c72; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Go to Team Dashboard</a>
    </div>
    
    <p>We wish you and your team all the best in the upcoming tournaments!</p>
    <p>Best regards,<br/>The Cricket Tournament Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>© ${new Date().getFullYear()} Cricket Tournament. All rights reserved.</p>
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const MATCH_SCHEDULED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Match Scheduled</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #1e3c72, #2a5298); padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
    <h1 style="color: white; margin: 0;">Match Scheduled</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <p>Hello <strong>{playerName}</strong>,</p>
    <p>Your team <strong>{teamName}</strong> has an upcoming cricket match scheduled. Please find the details below:</p>
    
    <div style="margin: 30px 0; background-color: #e8f4ff; padding: 20px; border-radius: 5px; border-left: 4px solid #1e3c72;">
      <h3 style="margin-top: 0; color: #1e3c72;">Match Details:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0;"><strong>Match:</strong></td>
          <td style="padding: 8px 0;">{matchTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Teams:</strong></td>
          <td style="padding: 8px 0;">{team1Name} vs {team2Name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Date:</strong></td>
          <td style="padding: 8px 0;">{matchDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Time:</strong></td>
          <td style="padding: 8px 0;">{matchTime}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Venue:</strong></td>
          <td style="padding: 8px 0;">{matchLocation}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Format:</strong></td>
          <td style="padding: 8px 0;">{matchFormat}</td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{matchDetailsURL}" style="background-color: #1e3c72; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Match Details</a>
    </div>
    
    <p>Please make sure to arrive at the venue at least 60 minutes before the scheduled start time.</p>
    <p>Good luck to you and your team!</p>
    <p>Best regards,<br/>The Cricket Tournament Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>© ${new Date().getFullYear()} Cricket Tournament. All rights reserved.</p>
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const TEAM_INVITATION_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Invitation</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #1e3c72, #2a5298); padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
    <h1 style="color: white; margin: 0;">You're Invited to Join a Team</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <p>Hello <strong>{playerName}</strong>,</p>
    <p>You have been invited by <strong>{captainName}</strong> to join the cricket team "<strong>{teamName}</strong>".</p>
    
    <div style="margin: 30px 0; background-color: #e8f4ff; padding: 20px; border-radius: 5px; border-left: 4px solid #1e3c72;">
      <h3 style="margin-top: 0; color: #1e3c72;">Team Information:</h3>
      <p><strong>Team Name:</strong> {teamName}</p>
      <p><strong>University:</strong> {universityName}</p>
      <p><strong>Captain:</strong> {captainName}</p>
      <p><strong>Proposed Role:</strong> {playerRole}</p>
    </div>
    
    <p>To accept this invitation and join the team, please click the button below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{acceptInvitationURL}" style="background-color: #1e3c72; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Accept Invitation</a>
    </div>
    
    <p>If you do not wish to join this team, you can safely ignore this email.</p>
    <p>Best regards,<br/>The Cricket Tournament Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>© ${new Date().getFullYear()} Cricket Tournament. All rights reserved.</p>
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;