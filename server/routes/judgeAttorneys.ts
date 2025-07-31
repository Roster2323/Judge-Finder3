import { RequestHandler } from "express";
import { DatabaseService } from "../lib/database";
import { ErrorResponse } from "@shared/api";

/**
 * Get attorneys advertising on a specific judge
 * GET /api/judges/:id/attorneys
 */
export const getJudgeAttorneys: RequestHandler = async (req, res) => {
  try {
    const judgeId = parseInt(req.params.id);

    if (isNaN(judgeId)) {
      return res.status(400).json({
        error: "Invalid judge ID",
      } as ErrorResponse);
    }

    const attorneys = await DatabaseService.getAttorneysForJudge(judgeId);

    res.json({
      attorneys: attorneys.map((attorney) => ({
        id: attorney.id,
        name: attorney.attorney_name,
        email: attorney.attorney_email,
        firmName: attorney.firm_name,
        practiceAreas: attorney.practice_areas || [],
        barNumber: attorney.bar_number,
        subscriptionStatus: attorney.status,
        tier: attorney.tier,
      })),
      total: attorneys.length,
    });
  } catch (error) {
    console.error("Get judge attorneys error:", error);
    res.status(500).json({
      error: "Failed to get judge attorneys",
      message: error instanceof Error ? error.message : "Unknown error",
    } as ErrorResponse);
  }
};
