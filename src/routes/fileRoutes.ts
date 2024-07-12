import { Router } from 'express';
import { uploadDirectory, uploadFiles, completeUpload, checkDirectorySize, getUsedSpace, checkAvailableSpace } from '../controllers/fileController';
import { assignUploadDir, upload, validateCompleteUploadData, validateUploadData } from '../middleweares/uploadMiddleware';


const uploads = Router();

uploads.post('/', upload.array('files'), checkAvailableSpace, validateUploadData, assignUploadDir, uploadDirectory);
uploads.post('/upload-files', upload.array('files'), checkAvailableSpace, assignUploadDir, uploadFiles);
uploads.post('/complete-upload', validateCompleteUploadData, completeUpload);
uploads.get('/check-directory-size/:dir', checkDirectorySize);  // This remains the same
uploads.get('/used-space', getUsedSpace);  // Added new route for checking used space

export default uploads;
