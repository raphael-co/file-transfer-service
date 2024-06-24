import { Router } from 'express';
import { uploadFiles, downloadFiles } from '../controllers/fileController';
import { assignUploadDir, upload } from '../middleweares/uploadMiddleware';


const router = Router();

router.post('/upload', assignUploadDir, upload.array('files'), uploadFiles);
router.get('/files/:dir', downloadFiles);

export default router;
