import 'dotenv/config'
import express from "express";
import cors from "cors";

import { initializeDatabase } from "./routes/database";
import judgesRouter from "./routes/judges";
import { getJudgeAttorneys } from "./routes/judgeAttorneys";
import {
  login,
  register,
  getCurrentUser,
  createCheckoutSession,
} from "./routes/auth";
import { handleStripeWebhook } from "./routes/webhooks";
import {
  getAttorneySubscriptions,
  cancelAttorneySubscription,
  updateAttorneySubscription,
} from "./routes/subscriptions";
import { generateSitemap, generateRobots } from "./routes/sitemap";
import { 
  getJudgeProfile as getJudgeProfileAPI, 
  getBasicJudgeInfo, 
  healthCheck, 
  judgeProfileLimiter 
} from "./routes/judge-profile";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Basic routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  // Database initialization
  app.post("/api/database/init", initializeDatabase);

  // Judge routes - using the new router
  app.use("/api/judges", judgesRouter);
  app.get("/api/judges/:id/attorneys", getJudgeAttorneys);

  // Judge Profile API routes (new service)
  app.get("/api/judge-profile/health", healthCheck);
  app.get("/api/judge-profile/:id", judgeProfileLimiter, getJudgeProfileAPI);
  app.get("/api/judge-profile/:id/basic", judgeProfileLimiter, getBasicJudgeInfo);

  // Authentication routes
  app.post("/api/auth/login", login);
  app.post("/api/auth/register", register);
  app.get("/api/auth/me", getCurrentUser);
  app.post("/api/auth/create-checkout", createCheckoutSession);

  // Subscription routes
  app.get("/api/subscriptions/:userId", getAttorneySubscriptions);
  app.post(
    "/api/subscriptions/:subscriptionId/cancel",
    cancelAttorneySubscription,
  );
  app.put("/api/subscriptions/:subscriptionId", updateAttorneySubscription);

  // SEO routes
  app.get("/sitemap.xml", generateSitemap);
  app.get("/robots.txt", generateRobots);

  // Webhook routes (raw body needed for Stripe signature verification)
  app.post(
    "/api/webhooks/stripe",
    express.raw({ type: "application/json" }),
    handleStripeWebhook,
  );

  return app;
}
