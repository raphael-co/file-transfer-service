import { Router } from 'express';
import { uploadFiles, downloadFiles, getFilesInformation } from '../controllers/fileController';
import { assignUploadDir, upload, validateUploadData } from '../middleweares/uploadMiddleware';


const router = Router();

router.post('/upload', upload.array('files'), validateUploadData, assignUploadDir, uploadFiles);
router.get('/files/download/:dir', downloadFiles);
router.get('/files/:dir', getFilesInformation);

export default router;