import fs from 'fs';
import NodeClam from 'clamscan';
import { v4 as uuidv4 } from 'uuid';

const logDir = 'logs';

export const scanFiles = async (filePaths: string[]) => {
    return await Promise.all(filePaths.map(async filePath => {
        const uniqueLogFile = `${logDir}/${uuidv4()}.log`;
        fs.writeFileSync(uniqueLogFile, '');

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
};
