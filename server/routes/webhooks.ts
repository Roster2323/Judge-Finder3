import { RequestHandler } from "express";
import { StripeService } from "../lib/stripe";
import { EmailService } from "../lib/email";
import { DatabaseService } from "../lib/database";
import { SUBSCRIPTION_TIERS } from "../lib/stripe";

/**
 * Handle Stripe webhooks
 * POST /api/webhooks/stripe
 */
export const handleStripeWebhook: RequestHandler = async (req, res) => {
  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    return res.status(400).json({ error: "Missing Stripe signature" });
  }

  try {
    // Raw body is needed for webhook verification
    const event = StripeService.constructWebhookEvent(req.body, signature);

    console.log(`Received Stripe webhook: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("Checkout session completed:", session.id);

        // Handle successful payment
        const paymentData =
          await StripeService.handleSuccessfulPayment(session);

        if (paymentData) {
          try {
            // Get subscription details from Stripe
            const subscription = await StripeService.getSubscription(
              paymentData.subscriptionId,
            );

            // Get the judge ID from stored tier info
            const storedJudgeId = session.metadata?.judgeId;
            const judgeId = storedJudgeId ? parseInt(storedJudgeId) : null;

            if (
              judgeId &&
              (subscription as any).current_period_start &&
              (subscription as any).current_period_end
            ) {
              // Create attorney subscription in database
              await DatabaseService.createAttorneySubscription(
                paymentData.userId,
                judgeId,
                paymentData.tier,
                paymentData.subscriptionId,
                subscription.customer as string,
                new Date((subscription as any).current_period_start * 1000),
                new Date((subscription as any).current_period_end * 1000),
              );
              console.log(
                `Created subscription for user ${paymentData.userId} on judge ${judgeId}`,
              );
            }

            // Send payment confirmation email
            const tier = paymentData.tier;
            await EmailService.sendPaymentConfirmationEmail({
              email: session.customer_email!,
              name: paymentData.customerName,
              tier,
              price: SUBSCRIPTION_TIERS[tier].displayPrice,
              subscriptionId: paymentData.subscriptionId,
            });
          } catch (error) {
            console.error("Error processing successful payment:", error);
          }
        }
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object;
        console.log("Subscription created:", subscription.id);
        // Here you can update your database to mark the subscription as active
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        console.log("Subscription updated:", subscription.id);

        try {
          // Update subscription status in database
          await DatabaseService.updateSubscriptionStatus(
            subscription.id,
            subscription.status as
              | "active"
              | "canceled"
              | "past_due"
              | "unpaid",
            (subscription as any).current_period_start
              ? new Date((subscription as any).current_period_start * 1000)
              : undefined,
            (subscription as any).current_period_end
              ? new Date((subscription as any).current_period_end * 1000)
              : undefined,
          );
        } catch (error) {
          console.error("Error updating subscription:", error);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        console.log("Subscription canceled:", subscription.id);

        try {
          // Update subscription status to canceled
          await DatabaseService.updateSubscriptionStatus(
            subscription.id,
            "canceled",
          );
        } catch (error) {
          console.error("Error canceling subscription:", error);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        console.log("Invoice payment succeeded:", invoice.id);
        // Handle successful recurring payments
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        console.log("Invoice payment failed:", invoice.id);
        // Handle failed payments (e.g., send dunning emails)
        break;
      }

      default:
        console.log(`Unhandled Stripe webhook event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    res.status(400).json({
      error: "Webhook signature verification failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
