import fs from 'fs';
import NodeClam from 'clamscan';
import { v4 as uuidv4 } from 'uuid';

const logDir = 'logs';

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

export const scanFiles = async (filePaths: string[]) => {
    return await Promise.all(filePaths.map(async filePath => {
        const uniqueLogFile = `${logDir}/${uuidv4()}.log`;
        fs.writeFileSync(uniqueLogFile, '');

        console.log(`Scanning file: ${filePath}`);
        
        const clamInstance = await new NodeClam().init({
            removeInfected: true,
            quarantineInfected: 'quarantine/',
            scanLog: uniqueLogFile,
            debugMode: true,
            fileScanSizeLimit: '10GB',
        });

        console.log(`Scanned file: ${filePath}`);
        const result = await clamInstance.scanFile(filePath);
        return result;
    }));
};
