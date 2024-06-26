import { Router, Request, Response } from "express";
import { getWeeklyUploadStats, getYearlyUploadStats, getAllTimeUploadStats } from "../services/uploadStatsService";
import { getAllTimeDownloadStats, getWeeklyDownloadStats, getYearlyDownloadStats } from "../services/downloadStatsService";

const stats = Router();

stats.get("/uploads", async (req: Request, res: Response) => {
  try {
    const weeklyStats = await getWeeklyUploadStats();
    const yearlyStats = await getYearlyUploadStats();
    const allTimeStats = await getAllTimeUploadStats();

    res.status(200).json({
      weeklyStats,
      yearlyStats,
      allTimeStats,
    });
  } catch (error) {
    console.error("Error fetching upload stats:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

stats.get("/downloads", async (req: Request, res: Response) => {
    try {
      const weeklyStats = await getWeeklyDownloadStats();
      const yearlyStats = await getYearlyDownloadStats();
      const allTimeStats = await getAllTimeDownloadStats();
  
      res.status(200).json({
        weeklyStats,
        yearlyStats,
        allTimeStats,
      });
    } catch (error) {
      console.error("Error fetching download stats:", error);
      res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
  });
  

export default stats;
