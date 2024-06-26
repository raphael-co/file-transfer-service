import { Router, Request, Response } from 'express';
import { uploadDirectory, downloadFiles, getFilesInformation, uploadFiles } from '../controllers/fileController';
import { assignUploadDir, upload, validateUploadData } from '../middleweares/uploadMiddleware';
import { getWeeklyUploadStats, getYearlyUploadStats, getAllTimeUploadStats } from '../services/uploadStatsService';
import { getAllTimeDownloadStats, getWeeklyDownloadStats, getYearlyDownloadStats } from "../services/downloadStatsService";

const downloads = Router();

downloads.get('/download/:dir', downloadFiles);
downloads.get('/:dir', getFilesInformation);

export default downloads;