import { RequestHandler } from "express";
import { DatabaseService } from "../lib/database";

export const initializeDatabase: RequestHandler = async (req, res) => {
  try {
    await DatabaseService.initializeDatabase();
    await DatabaseService.seedDatabase();
    res.json({
      message: "Database initialized and seeded successfully",
      success: true,
    });
  } catch (error) {
    console.error("Database initialization error:", error);
    res.status(500).json({
      error: "Failed to initialize database",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
