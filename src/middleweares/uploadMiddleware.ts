import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

export const assignUploadDir = (req: Request, res: Response, next: NextFunction) => {
    req.uploadDir = uuidv4();
    next();
};
