import { Router } from 'express';
import { uploadDirectory, uploadFiles, completeUpload } from '../controllers/fileController';
import { assignUploadDir, upload, validateCompleteUploadData, validateUploadData } from '../middleweares/uploadMiddleware';


const uploads = Router();

uploads.post('/', upload.array('files'), validateUploadData, assignUploadDir, uploadDirectory);
uploads.post('/upload-files', upload.array('files'), assignUploadDir, uploadFiles);
uploads.post('/complete-upload', validateCompleteUploadData, completeUpload);
export default uploads;
