import { RequestHandler } from "express";
import { DatabaseService } from "../lib/database";
import { EmailService } from "../lib/email";
import { StripeService, SUBSCRIPTION_TIERS } from "../lib/stripe";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ErrorResponse,
} from "@shared/api";

/**
 * Simple login endpoint (creates user if doesn't exist)
 * POST /api/auth/login
 */
export const login: RequestHandler = async (req, res) => {
  try {
    const { email, name }: LoginRequest = req.body;

    if (!email || !name) {
      return res.status(400).json({
        error: "Email and name are required",
      } as ErrorResponse);
    }

    // Check if user exists
    let user = await DatabaseService.getUserByEmail(email);

    // Create user if doesn't exist
    if (!user) {
      user = await DatabaseService.createUser(email, name);
    }

    const response: LoginResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType as "attorney" | "admin",
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Failed to login",
      message: error instanceof Error ? error.message : "Unknown error",
    } as ErrorResponse);
  }
};

/**
 * Enhanced register endpoint with email and Stripe integration
 * POST /api/auth/register
 */
export const register: RequestHandler = async (req, res) => {
  try {
    const {
      email,
      name,
      firmName,
      practiceAreas = [],
      barNumber,
      tier, // The pricing tier they selected
    }: RegisterRequest & { tier: "federal" | "state" | "local" } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        error: "Email and name are required",
      } as ErrorResponse);
    }

    if (!tier || !SUBSCRIPTION_TIERS[tier]) {
      return res.status(400).json({
        error: "Valid pricing tier is required",
      } as ErrorResponse);
    }

    // Check if user already exists
    const existingUser = await DatabaseService.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: "User with this email already exists",
      } as ErrorResponse);
    }

    // Create user
    const user = await DatabaseService.createUser(email, name, "attorney");

    // Create attorney profile
    const profile = await DatabaseService.createAttorneyProfile(
      user.id,
      firmName,
      practiceAreas,
      barNumber,
    );

    // Send welcome email
    try {
      await EmailService.sendWelcomeEmail({
        email: user.email,
        name: user.name,
        tier,
        price: SUBSCRIPTION_TIERS[tier].displayPrice,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail registration if email fails
    }

    // Get judge ID from request body (passed from frontend)
    const judgeId = req.body.judgeId;

    // Create Stripe checkout session
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
    const checkoutSession = await StripeService.createCheckoutSession({
      tier,
      customerEmail: user.email,
      customerName: user.name,
      userId: user.id,
      judgeId: judgeId,
      successUrl: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${frontendUrl}/payment/cancel`,
    });

    const response: RegisterResponse & { checkoutUrl: string } = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType as "attorney" | "admin",
      },
      profile: {
        id: profile.id,
        firmName: profile.firmName || undefined,
        practiceAreas: profile.practiceAreas || [],
        barNumber: profile.barNumber || undefined,
        verified: profile.verified,
      },
      checkoutUrl: checkoutSession.url!,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Failed to register",
      message: error instanceof Error ? error.message : "Unknown error",
    } as ErrorResponse);
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getCurrentUser: RequestHandler = async (req, res) => {
  try {
    // In a real implementation, you'd get the user ID from a JWT token
    // For now, we'll require the email as a query parameter
    const email = req.query.email as string;

    if (!email) {
      return res.status(401).json({
        error: "Authentication required",
      } as ErrorResponse);
    }

    const user = await DatabaseService.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      } as ErrorResponse);
    }

    const response: LoginResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType as "attorney" | "admin",
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      error: "Failed to get user profile",
      message: error instanceof Error ? error.message : "Unknown error",
    } as ErrorResponse);
  }
};

/**
 * Create Stripe checkout session for existing user
 * POST /api/auth/create-checkout
 */
export const createCheckoutSession: RequestHandler = async (req, res) => {
  try {
    const { userId, tier } = req.body;

    if (!userId || !tier) {
      return res.status(400).json({
        error: "User ID and tier are required",
      } as ErrorResponse);
    }

    // Get user details
    const user = await DatabaseService.getUserByEmail(
      req.body.email, // You might want to get this from JWT token instead
    );

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      } as ErrorResponse);
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
    const checkoutSession = await StripeService.createCheckoutSession({
      tier,
      customerEmail: user.email,
      customerName: user.name,
      userId: user.id,
      successUrl: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${frontendUrl}/payment/cancel`,
    });

    res.json({
      checkoutUrl: checkoutSession.url,
    });
  } catch (error) {
    console.error("Create checkout session error:", error);
    res.status(500).json({
      error: "Failed to create checkout session",
      message: error instanceof Error ? error.message : "Unknown error",
    } as ErrorResponse);
  }
};
