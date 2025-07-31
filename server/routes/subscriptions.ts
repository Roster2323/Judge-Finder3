import { RequestHandler } from "express";
import { DatabaseService } from "../lib/database";
import { StripeService } from "../lib/stripe";
import { ErrorResponse } from "@shared/api";

/**
 * Get attorney subscriptions
 * GET /api/subscriptions/:userId
 */
export const getAttorneySubscriptions: RequestHandler = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({
        error: "Invalid user ID",
      } as ErrorResponse);
    }

    const subscriptions =
      await DatabaseService.getAttorneySubscriptions(userId);

    res.json({
      subscriptions: subscriptions,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error("Get attorney subscriptions error:", error);
    res.status(500).json({
      error: "Failed to get subscriptions",
      message: error instanceof Error ? error.message : "Unknown error",
    } as ErrorResponse);
  }
};

/**
 * Cancel attorney subscription
 * POST /api/subscriptions/:subscriptionId/cancel
 */
export const cancelAttorneySubscription: RequestHandler = async (req, res) => {
  try {
    const subscriptionId = req.params.subscriptionId;

    if (!subscriptionId) {
      return res.status(400).json({
        error: "Subscription ID is required",
      } as ErrorResponse);
    }

    // Get subscription from database
    const subscription =
      await DatabaseService.getSubscriptionByStripeId(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        error: "Subscription not found",
      } as ErrorResponse);
    }

    // Cancel subscription in Stripe (at period end)
    const updatedSubscription = await StripeService.cancelSubscription(subscriptionId);

          // Update subscription status in database
      await DatabaseService.updateSubscriptionStatus(
        subscriptionId,
        updatedSubscription.status as "active" | "canceled" | "past_due" | "unpaid",
        undefined, // Don't change current_period_start
        (updatedSubscription as any).current_period_end
          ? new Date((updatedSubscription as any).current_period_end * 1000)
          : undefined,
      );

      res.json({
        message: "Subscription cancelled successfully",
        subscription: {
          id: updatedSubscription.id,
          status: updatedSubscription.status,
          cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
          periodEnd: (updatedSubscription as any).current_period_end
            ? new Date((updatedSubscription as any).current_period_end * 1000)
            : null,
        },
      });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({
      error: "Failed to cancel subscription",
      message: error instanceof Error ? error.message : "Unknown error",
    } as ErrorResponse);
  }
};

/**
 * Update attorney subscription
 * PUT /api/subscriptions/:subscriptionId
 */
export const updateAttorneySubscription: RequestHandler = async (req, res) => {
  try {
    const subscriptionId = req.params.subscriptionId;
    const { status, currentPeriodStart, currentPeriodEnd } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({
        error: "Subscription ID is required",
      } as ErrorResponse);
    }

    // Update subscription in database
    await DatabaseService.updateSubscriptionStatus(
      subscriptionId,
      status,
      currentPeriodStart ? new Date(currentPeriodStart) : undefined,
      currentPeriodEnd ? new Date(currentPeriodEnd) : undefined,
    );

    res.json({
      message: "Subscription updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Update subscription error:", error);
    res.status(500).json({
      error: "Failed to update subscription",
      message: error instanceof Error ? error.message : "Unknown error",
    } as ErrorResponse);
  }
};
