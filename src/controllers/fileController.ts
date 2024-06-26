import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import NodeClam from 'clamscan';
import archiver from 'archiver';
import { scanFiles } from '../services/fileService';
import sendDownloadLinkEmail from '../services/emailService';
import pool from '../config/dbConnection';

const logDir = 'logs';

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

interface FileSystemEntry {
    name: string;
    type: 'file' | 'directory';
    size?: string;  // Change type to string to store formatted size
    children?: FileSystemEntry[];
}

export const completeUpload = async (req: Request, res: Response) => {
    const { uploadDir, emailAddresses } = req.body;

    if (!uploadDir || !emailAddresses) {
        return res.status(400).send({ status: 'error', message: 'Missing parameters.' });
    }

    try {
        const uploadDirUrl = `${req.protocol}://${req.get('host')}/api/files/download/${uploadDir}`;
        const emailAddressArray = emailAddresses.split(',');

        await sendDownloadLinkEmail(emailAddressArray, uploadDirUrl);

        res.status(200).send({ status: 'success', message: 'Emails sent successfully.' });
    } catch (err) {
        console.error('Error sending email:', err);
        res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
};

export const uploadDirectory = async (req: Request, res: Response) => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).send({ status: 'error', message: 'No files uploaded.' });
    }

    const connection = await pool.getConnection();
    try {
        const files = req.files as Express.Multer.File[];
        const paths = req.body.paths.split(',');

        console.log("enter upload");

        const filePaths = files.map((file, index) => {
            const relativePath = paths[index];
            const uploadDir = `uploads/${req.uploadDir}/${path.dirname(relativePath)}`;
            fs.mkdirSync(uploadDir, { recursive: true });
            const filePath = path.join(uploadDir, path.basename(relativePath));
            fs.writeFileSync(filePath, file.buffer);
            return filePath;
        });

        console.log("after filePaths");

        const fileScanResults = await scanFiles(filePaths);

        console.log("after fileScanResults");

        const infectedFiles = fileScanResults.filter(result => result.isInfected);

        console.log("after fileScanResults filter");

        if (infectedFiles.length > 0) {
            return res.status(400).send({ status: 'error', message: 'Some files are infected.' });
        }

        const uploadDirUrl = `${req.protocol}://${req.get('host')}/api/files/download/${req.uploadDir}`;

        await connection.query('INSERT INTO uploads (upload_dir, num_files) VALUES (?, ?)', [
            req.uploadDir,
            files.length
        ]);

        res.status(200).send({ status: 'success', uploadDirUrl });
    } catch (err) {
        console.error('Error scanning files:', err);
        res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    } finally {
        connection.release();
    }
};

export const uploadFiles = async (req: Request, res: Response) => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).send({ status: 'error', message: 'No files uploaded.' });
    }

    const connection = await pool.getConnection();
    try {
        const files = req.files as Express.Multer.File[];
        const uploadDir = `uploads/${req.uploadDir}`;
        fs.mkdirSync(uploadDir, { recursive: true });

        const filePaths = files.map((file) => {
            const filePath = path.join(uploadDir, file.originalname);
            fs.writeFileSync(filePath, file.buffer);
            return filePath;
        });

        const fileScanResults = await scanFiles(filePaths);
        const infectedFiles = fileScanResults.filter(result => result.isInfected);

        if (infectedFiles.length > 0) {
            return res.status(400).send({ status: 'error', message: 'Some files are infected.' });
        }

        const uploadDirUrl = `${req.protocol}://${req.get('host')}/api/files/download/${req.uploadDir}`;

        await connection.query('INSERT INTO uploads (upload_dir, num_files) VALUES (?, ?)', [
            req.uploadDir,
            files.length
        ]);

        res.status(200).send({ status: 'success', uploadDirUrl });
    } catch (err) {
        console.error('Error scanning files:', err);
        res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    } finally {
        connection.release();
    }
};

const countFilesInDirectory = (dirPath: string): number => {
    let fileCount = 0;
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const fileStats = fs.statSync(filePath);
        if (fileStats.isDirectory()) {
            fileCount += countFilesInDirectory(filePath);
        } else {
            fileCount += 1;
        }
    });

    return fileCount;
};

export const downloadFiles = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();
    try {
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

            const numberOfFiles = countFilesInDirectory(dirPath);

            await connection.query('INSERT INTO downloads (download_dir, num_files) VALUES (?, ?)', [
                req.params.dir,
                numberOfFiles
            ]);
        } else {
            res.status(404).send({ status: 'error', message: 'Directory not found, directory may have been deleted or expired.' });
        }
    } catch (err) {
        console.error('Error logging download:', err);
        res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    } finally {
        connection.release();
    }
};

const getAllFiles = (dirPath: string, arrayOfFiles: FileSystemEntry[] = []): FileSystemEntry[] => {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        const fileStats = fs.statSync(filePath);
        if (fileStats.isDirectory()) {
            const dirContent: FileSystemEntry = { name: file, type: 'directory', children: [] };
            dirContent.children = getAllFiles(filePath);
            arrayOfFiles.push(dirContent);
        } else {
            arrayOfFiles.push({ name: file, type: 'file', size: formatSizeUnits(fileStats.size) });
        }
    });

    return arrayOfFiles;
};

const formatSizeUnits = (bytes: number) => {
    if (bytes >= 1073741824) {
        return (bytes / 1073741824).toFixed(2) + ' GB';
    } else if (bytes >= 1048576) {
        return (bytes / 1048576).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
        return (bytes / 1024).toFixed(2) + ' KB';
    } else if (bytes > 1) {
        return bytes + ' bytes';
    } else if (bytes === 1) {
        return bytes + ' byte';
    } else {
        return '0 bytes';
    }
};

export const getFilesInformation = (req: Request, res: Response) => {
    const dirPath = path.join(__dirname, '../../uploads', req.params.dir);
    if (fs.existsSync(dirPath)) {
        const allFiles = getAllFiles(dirPath);
        let numberOfFiles = 0;
        let totalSize = 0;

        const calculateStats = (files: FileSystemEntry[]) => {
            files.forEach((file) => {
                if (file.type === 'file' && file.size) {
                    numberOfFiles += 1;
                    totalSize += Number(file.size.split(' ')[0]) * getSizeMultiplier(file.size);
                } else if (file.type === 'directory' && file.children) {
                    calculateStats(file.children);
                }
            });
        };

        const getSizeMultiplier = (size: string): number => {
            if (size.endsWith('GB')) return 1073741824;
            if (size.endsWith('MB')) return 1048576;
            if (size.endsWith('KB')) return 1024;
            if (size.endsWith('byte')) return 1;
            if (size.endsWith('bytes')) return 1;
            return 1;
        };

        calculateStats(allFiles);

        res.status(200).send({
            status: 'success',
            numberOfFiles: numberOfFiles,
            totalSize: formatSizeUnits(totalSize),
            files: allFiles
        });
    } else {
        res.status(404).send({ status: 'error', message: 'Directory not found.' });
    }
};
