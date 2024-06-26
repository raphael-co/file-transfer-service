import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.memoryStorage();
export const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 * 1024 } });

export const validateUploadData = (req: Request, res: Response, next: NextFunction) => {
    const emailAddresses = req.body.emailAddresses;
    const paths = req.body.paths;

    console.log(req.body);
    console.log(emailAddresses);
    console.log(paths);

    if (!paths) {
        return res.status(400).json({ status: 'error', message: 'paths are required.' });
    }

    next();
};

export const assignUploadDir = (req: Request, res: Response, next: NextFunction) => {
    req.uploadDir = req.body.uploadDir || uuidv4();
    next();
};

export const validateCompleteUploadData = (req: Request, res: Response, next: NextFunction) => {
    const { uploadDir, emailAddresses } = req.body;

    if (!uploadDir) {
        return res.status(400).json({ status: 'error', message: 'Upload directory is required.' });
    }

    if (req.body.emailAddresses && (!emailAddresses || emailAddresses.length === 0)) {
        return res.status(400).json({ status: 'error', message: 'Email addresses are required when delivery method is email.' });
    }

    next();
};