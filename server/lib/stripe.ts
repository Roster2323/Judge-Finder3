import Stripe from "stripe";

// Initialize Stripe only if API key is available
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error(
        "Stripe secret key not configured. Please set STRIPE_SECRET_KEY environment variable.",
      );
    }
    stripe = new Stripe(apiKey, {
      apiVersion: "2025-06-30.basil",
    });
  }
  return stripe;
}

export interface SubscriptionTier {
  tier: "federal" | "state" | "local";
  priceId: string;
  amount: number; // in cents
  displayPrice: string;
}

// Stripe Price IDs for different tiers (you'll need to create these in Stripe Dashboard)
export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  federal: {
    tier: "federal",
    priceId: process.env.STRIPE_FEDERAL_PRICE_ID || "price_federal_default",
    amount: 50000, // $500.00
    displayPrice: "$500/mo",
  },
  state: {
    tier: "state",
    priceId: process.env.STRIPE_STATE_PRICE_ID || "price_state_default",
    amount: 20000, // $200.00
    displayPrice: "$200/mo",
  },
  local: {
    tier: "local",
    priceId: process.env.STRIPE_LOCAL_PRICE_ID || "price_local_default",
    amount: 10000, // $100.00
    displayPrice: "$100/mo",
  },
};

export class StripeService {
  /**
   * Create a Stripe Checkout Session for subscription
   */
  static async createCheckoutSession({
    tier,
    customerEmail,
    customerName,
    userId,
    judgeId,
    successUrl,
    cancelUrl,
  }: {
    tier: "federal" | "state" | "local";
    customerEmail: string;
    customerName: string;
    userId: number;
    judgeId?: number;
    successUrl: string;
    cancelUrl: string;
  }): Promise<Stripe.Checkout.Session> {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key not configured");
    }

    const subscriptionTier = SUBSCRIPTION_TIERS[tier];
    if (!subscriptionTier) {
      throw new Error(`Invalid subscription tier: ${tier}`);
    }

    try {
      const stripeClient = getStripe();
      const session = await stripeClient.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: subscriptionTier.priceId,
            quantity: 1,
          },
        ],
        customer_email: customerEmail,
        metadata: {
          userId: userId.toString(),
          tier: tier,
          customerName: customerName,
          judgeId: judgeId?.toString() || "",
        },
        subscription_data: {
          metadata: {
            userId: userId.toString(),
            tier: tier,
            customerName: customerName,
            judgeId: judgeId?.toString() || "",
          },
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: "required",
      });

      return session;
    } catch (error) {
      console.error("Error creating Stripe checkout session:", error);
      throw error;
    }
  }

  /**
   * Create a customer in Stripe
   */
  static async createCustomer({
    email,
    name,
    userId,
  }: {
    email: string;
    name: string;
    userId: number;
  }): Promise<Stripe.Customer> {
    try {
      const stripeClient = getStripe();
      const customer = await stripeClient.customers.create({
        email,
        name,
        metadata: {
          userId: userId.toString(),
        },
      });

      return customer;
    } catch (error) {
      console.error("Error creating Stripe customer:", error);
      throw error;
    }
  }

  /**
   * Get subscription details
   */
  static async getSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription> {
    try {
      const stripeClient = getStripe();
      const subscription =
        await stripeClient.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error("Error retrieving subscription:", error);
      throw error;
    }
  }

  /**
   * Cancel a subscription at period end (legal compliance - ads continue until paid period ends)
   */
  static async cancelSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription> {
    try {
      const stripeClient = getStripe();
      // Set cancel_at_period_end to true instead of immediate cancellation
      // This ensures attorney ads continue to show until the end of the paid subscription period
      const subscription = await stripeClient.subscriptions.update(
        subscriptionId,
        {
          cancel_at_period_end: true,
        },
      );
      return subscription;
    } catch (error) {
      console.error("Error canceling subscription:", error);
      throw error;
    }
  }

  /**
   * Immediately cancel a subscription (for admin use only)
   */
  static async cancelSubscriptionImmediately(
    subscriptionId: string,
  ): Promise<void> {
    try {
      const stripeClient = getStripe();
      await stripeClient.subscriptions.cancel(subscriptionId);
    } catch (error) {
      console.error("Error immediately canceling subscription:", error);
      throw error;
    }
  }

  /**
   * Construct webhook event from raw body and signature
   */
  static constructWebhookEvent(
    rawBody: string | Buffer,
    signature: string,
  ): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Stripe webhook secret not configured");
    }

    const stripeClient = getStripe();
    return stripeClient.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  }

  /**
   * Handle successful payment
   */
  static async handleSuccessfulPayment(session: Stripe.Checkout.Session) {
    console.log("Payment successful for session:", session.id);

    const userId = session.metadata?.userId;
    const tier = session.metadata?.tier as "federal" | "state" | "local";
    const customerName = session.metadata?.customerName;

    if (!userId || !tier || !customerName) {
      console.error("Missing metadata in successful payment session");
      return;
    }

    // Here you can update your database to mark the user as having an active subscription
    // For now, we'll just log it
    console.log(
      `User ${userId} (${customerName}) successfully subscribed to ${tier} tier`,
    );

    return {
      userId: parseInt(userId),
      tier,
      customerName,
      subscriptionId: session.subscription as string,
    };
  }
}

export { getStripe };
