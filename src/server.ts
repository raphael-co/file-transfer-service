import express from 'express';
import cors from 'cors';
// import fileRoutes from './routes/fileRoutes';
import { initializeDatabase } from './config/databaseInit';
import routes from './routes/routes';


const app = express();
const port = 3000;

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001','http://localhost', 'http://192.168.1.39','https://transfer-express.netgraph.fr'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50gb' }));
app.use(express.urlencoded({ extended: true, limit: '10gb' }));

app.use('/api', routes);

app.listen(port, async () => {
    console.log(`Server running at http://localhost:${port}/`);

    // Initialize the database
    await initializeDatabase();
});
