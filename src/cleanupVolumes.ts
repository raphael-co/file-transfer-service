import { exec } from 'child_process';
import util from 'util';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';

const execAsync = util.promisify(exec);
const MAX_AGE = 5 * 60 * 1000; // 5 minutes en millisecondes
const UPLOADS_DIR = '/app/uploads';

async function deleteOldVolumes() {
    try {
        const files = await fs.promises.readdir(UPLOADS_DIR);
        const now = Date.now();

        console.log(`Deleting old volumes...`);
        console.log(files);

        for (const file of files) {
            const filePath = path.join(UPLOADS_DIR, file);
            const stats = await fs.promises.stat(filePath);
            const age = now - stats.mtimeMs;

            console.log(stats);

            if (age > MAX_AGE) {
                await execAsync(`rm -rf ${filePath}`);
                console.log(`Deleted: ${filePath}`);
            }else{
                console.log(`Not deleted: ${filePath}`);
            }
        }
    } catch (error) {
        console.error(`Error deleting old volumes: ${error}`);
    }
}

// Planification du script pour qu'il s'exécute toutes les minutes
cron.schedule('* * * * *', () => {
    deleteOldVolumes();
});
