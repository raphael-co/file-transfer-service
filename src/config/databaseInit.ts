import pool from "./dbConnection";


const checkTableExists = async (tableName: string) => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query<any[]>(
            `SELECT TABLE_NAME 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = ?`,
            [tableName]
        );
        return rows.length > 0;
    } catch (error) {
        console.error(`Error checking table ${tableName}:`, error);
        throw error;
    } finally {
        connection.release();
    }
};

const createUploadsTable = `
CREATE TABLE uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upload_dir VARCHAR(255) NOT NULL,
    num_files INT NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP
)`;

const createDownloadsTable = `
CREATE TABLE downloads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    download_dir VARCHAR(255) NOT NULL,
    num_files INT NOT NULL,
    download_date DATETIME DEFAULT CURRENT_TIMESTAMP
)`;

export const initializeDatabase = async () => {
    const connection = await pool.getConnection();
    try {
        const uploadsTableExists = await checkTableExists('uploads');
        const downloadsTableExists = await checkTableExists('downloads');

        if (!uploadsTableExists) {
            await connection.query(createUploadsTable);
            console.log("Uploads table created successfully");
        } else {
            console.log("Uploads table already exists");
        }

        if (!downloadsTableExists) {
            await connection.query(createDownloadsTable);
            console.log("Downloads table created successfully");
        } else {
            console.log("Downloads table already exists");
        }
    } catch (error) {
        console.error("Error initializing database: ", error);
    } finally {
        connection.release();
    }
};
