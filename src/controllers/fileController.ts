import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import NodeClam from 'clamscan';
import archiver from 'archiver';
import { scanFiles } from '../services/fileService';


const logDir = 'logs';

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

export const uploadFiles = async (req: Request, res: Response) => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).send('No files uploaded.');
    }

    try {
        const files = req.files as Express.Multer.File[];
        const paths = req.body.paths.split(',');

        const filePaths = files.map((file, index) => {
            const relativePath = paths[index];
            const uploadDir = `uploads/${req.uploadDir}/${path.dirname(relativePath)}`;
            fs.mkdirSync(uploadDir, { recursive: true });
            const filePath = path.join(uploadDir, path.basename(relativePath));
            fs.writeFileSync(filePath, file.buffer);
            return filePath;
        });

        const fileScanResults = await scanFiles(filePaths);

        const infectedFiles = fileScanResults.filter(result => result.isInfected);

        if (infectedFiles.length > 0) {
            return res.status(400).send('Some files are infected.');
        }

        const uploadDirUrl = `${req.protocol}://${req.get('host')}/api/files/${req.uploadDir}`;
        res.status(200).send({ uploadDirUrl });
    } catch (err) {
        console.error('Error scanning files:', err);
        res.status(500).send('Internal Server Error');
    }
};

export const downloadFiles = (req: Request, res: Response) => {
    const dirPath = path.join(__dirname, '../../uploads', req.params.dir);
    if (fs.existsSync(dirPath)) {
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=${req.params.dir}.zip`);

        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        archive.on('error', (err) => {
            throw err;
        });

        archive.pipe(res);
        archive.directory(dirPath, false);
        archive.finalize();
    } else {
        res.status(404).send('Directory not found.');
    }
};
