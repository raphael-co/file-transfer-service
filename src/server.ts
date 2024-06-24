import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import NodeClam from 'clamscan';
import { v4 as uuidv4 } from 'uuid';
import archiver from 'archiver';
import cors from 'cors';

const app = express();
const port = 3000;

// Ensure the log directory exists
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Configuration of Multer for local storage
const storage = multer.memoryStorage(); // Store files in memory temporarily

const upload = multer({ storage: storage });

// Middleware to generate a unique directory ID for each upload
app.use((req, res, next) => {
    req.uploadDir = uuidv4();
    next();
});

app.use(cors(corsOptions));

// Endpoint to upload multiple files
app.post('/upload', upload.array('files'), async (req, res) => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).send('No files uploaded.');
    }

    try {
        const files = req.files as Express.Multer.File[];
        const paths = req.body.paths.split(','); // Assuming paths are sent as a comma-separated string

        const filePaths = files.map((file, index) => {
            const relativePath = paths[index];
            const uploadDir = `uploads/${req.uploadDir}/${path.dirname(relativePath)}`;
            fs.mkdirSync(uploadDir, { recursive: true });
            const filePath = path.join(uploadDir, path.basename(relativePath));
            fs.writeFileSync(filePath, file.buffer); // Save file from buffer to disk
            return filePath;
        });

        const fileScanResults = await Promise.all(filePaths.map(async filePath => {
            const uniqueLogFile = `${logDir}/${uuidv4()}.log`;

            // Create an empty log file
            fs.writeFileSync(uniqueLogFile, '');

            // Initialize ClamAV with a unique log file for each scan
            const clamInstance = await new NodeClam().init({
                removeInfected: true,
                quarantineInfected: 'quarantine/',
                scanLog: uniqueLogFile,
                debugMode: true,
                fileScanSizeLimit: '50MB',
            });

            const result = await clamInstance.scanFile(filePath);
            return result;
        }));

        const infectedFiles = fileScanResults.filter(result => result.isInfected);

        if (infectedFiles.length > 0) {
            return res.status(400).send('Some files are infected.');
        }

        const uploadDirUrl = `${req.protocol}://${req.get('host')}/files/${req.uploadDir}`;
        res.status(200).send({ uploadDirUrl });
    } catch (err) {
        console.error('Error scanning files:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to retrieve a file or directory as a ZIP archive
app.get('/files/:dir', (req: Request, res: Response) => {
    const dirPath = path.join(__dirname, '../uploads', req.params.dir);
    if (fs.existsSync(dirPath)) {
        // Create a ZIP archive of the directory
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=${req.params.dir}.zip`);

        const archive = archiver('zip', {
            zlib: { level: 9 } // Compression level
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
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
