
import { RowDataPacket } from "mysql2/promise";
import pool from "../config/dbConnection";

interface UploadStats {
  totalUploads: number;
  totalFiles: number;
}

const getUploadsCount = async (condition: string): Promise<UploadStats> => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>(`
      SELECT COUNT(DISTINCT upload_dir) as totalUploads, SUM(num_files) as totalFiles
      FROM uploads
      WHERE ${condition}
    `);
    return {
      totalUploads: rows[0].totalUploads || 0,
      totalFiles: rows[0].totalFiles || 0,
    };
  } finally {
    connection.release();
  }
};

export const getWeeklyUploadStats = async (): Promise<UploadStats> => {
  return getUploadsCount("YEARWEEK(upload_date, 1) = YEARWEEK(CURDATE(), 1)");
};

export const getYearlyUploadStats = async (): Promise<UploadStats> => {
  return getUploadsCount("YEAR(upload_date) = YEAR(CURDATE())");
};

export const getAllTimeUploadStats = async (): Promise<UploadStats> => {
  return getUploadsCount("1=1");
};
