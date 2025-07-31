import sgMail from "@sendgrid/mail";

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface WelcomeEmailData {
  email: string;
  name: string;
  tier: "federal" | "state" | "local";
  price: string;
}

export class EmailService {
  static async sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn("SENDGRID_API_KEY not configured. Email not sent.");
      return;
    }

    const tierNames = {
      federal: "Federal",
      state: "State",
      local: "Local",
    };

    const msg = {
      to: data.email,
      from: process.env.FROM_EMAIL || "noreply@judgefinder.com",
      subject: "Welcome to Judge Finder - Let's Get You Advertised!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Judge Finder</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #1f2937; font-size: 28px; margin: 0;">Judge Finder</h1>
              <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">Legal Intelligence Platform</p>
            </div>
            
            <!-- Welcome Message -->
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Welcome ${data.name}!</h2>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for joining Judge Finder! You're one step away from connecting with people who need experienced legal representation and already know their assigned judge.
              </p>
              
                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                You've signed up for our <strong>${tierNames[data.tier]} Judge advertising package</strong>. Complete your payment to start connecting with potential clients.
              </p>
            </div>
            
            <!-- Package Benefits -->
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
              <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0;">Your Package Includes:</h3>
              <ul style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 10px;">Featured placement on ${tierNames[data.tier].toLowerCase()} judge profile pages</li>
                <li style="margin-bottom: 10px;">Direct exposure to people who need legal representation</li>
                <li style="margin-bottom: 10px;">Monthly analytics reporting</li>
                <li style="margin-bottom: 10px;">Priority customer support</li>
              </ul>
            </div>
            
            <!-- Next Steps -->
            <div style="margin-bottom: 30px;">
              <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 15px 0;">Next Steps:</h3>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                1. Complete your payment to activate your advertisement<br>
                2. We'll send you a confirmation once your ad is live<br>
                3. Start connecting with people who need legal help immediately
              </p>
            </div>
            
            <!-- Contact Info -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                Questions? Contact us at <a href="mailto:support@judgefinder.com" style="color: #3b82f6;">support@judgefinder.com</a>
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                © 2025 Judge Finder. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to Judge Finder, ${data.name}!

Thank you for joining Judge Finder! You're one step away from connecting with people who need experienced legal representation and already know their assigned judge.

You've signed up for our ${tierNames[data.tier]} Judge advertising package. Complete your payment to start connecting with potential clients.

Your Package Includes:
- Featured placement on ${tierNames[data.tier].toLowerCase()} judge profile pages
- Direct exposure to people who need legal representation
- Monthly analytics reporting
- Priority customer support

Next Steps:
1. Complete your payment to activate your advertisement
2. We'll send you a confirmation once your ad is live
3. Start connecting with people who need legal help immediately

Questions? Contact us at support@judgefinder.com

© 2025 Judge Finder. All rights reserved.
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`Welcome email sent to ${data.email}`);
    } catch (error) {
      console.error("Failed to send welcome email:", error);
      throw error;
    }
  }

  static async sendPaymentConfirmationEmail(data: {
    email: string;
    name: string;
    tier: "federal" | "state" | "local";
    price: string;
    subscriptionId: string;
  }): Promise<void> {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn("SENDGRID_API_KEY not configured. Email not sent.");
      return;
    }

    const tierNames = {
      federal: "Federal",
      state: "State",
      local: "Local",
    };

    const msg = {
      to: data.email,
      from: process.env.FROM_EMAIL || "noreply@judgefinder.com",
      subject: "Payment Confirmed - Your Judge Finder Ad is Now Live!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmed - Judge Finder</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #1f2937; font-size: 28px; margin: 0;">Judge Finder</h1>
              <div style="background-color: #dcfce7; color: #166534; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <h2 style="margin: 0; font-size: 20px;">✅ Payment Confirmed!</h2>
              </div>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Great news, ${data.name}!</h2>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Your payment has been processed successfully and your ${tierNames[data.tier]} Judge advertisement is now live!
              </p>
              
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 10px 0;">Payment Details:</h3>
                <p style="color: #374151; font-size: 16px; margin: 0;"><strong>Package:</strong> ${tierNames[data.tier]} Judge Advertising</p>
                <p style="color: #374151; font-size: 16px; margin: 5px 0;"><strong>Amount:</strong> ${data.price}</p>
                <p style="color: #374151; font-size: 16px; margin: 5px 0;"><strong>Subscription ID:</strong> ${data.subscriptionId}</p>
              </div>
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.FRONTEND_URL || "https://judgefinder.com"}" 
                 style="background-color: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                View Your Live Advertisement
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                Questions? Contact us at <a href="mailto:support@judgefinder.com" style="color: #3b82f6;">support@judgefinder.com</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`Payment confirmation email sent to ${data.email}`);
    } catch (error) {
      console.error("Failed to send payment confirmation email:", error);
      throw error;
    }
  }
}
