import pool from "../config/dbConnection";
import { RowDataPacket } from "mysql2/promise";

interface DownloadStats {
  totalDownloads: number;
  totalFiles: number;
}

const getDownloadStats = async (condition: string): Promise<DownloadStats> => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>(`
      SELECT COUNT(DISTINCT download_dir) as totalDownloads, SUM(num_files) as totalFiles
      FROM downloads
      WHERE ${condition}
    `);
    return {
      totalDownloads: rows[0].totalDownloads || 0,
      totalFiles: rows[0].totalFiles || 0,
    };
  } finally {
    connection.release();
  }
};

export const getWeeklyDownloadStats = async (): Promise<DownloadStats> => {
  return getDownloadStats("YEARWEEK(download_date, 1) = YEARWEEK(CURDATE(), 1)");
};

export const getYearlyDownloadStats = async (): Promise<DownloadStats> => {
  return getDownloadStats("YEAR(download_date) = YEAR(CURDATE())");
};

export const getAllTimeDownloadStats = async (): Promise<DownloadStats> => {
  return getDownloadStats("1=1");
};
