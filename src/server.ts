import express from 'express';
import cors from 'cors';
import fileRoutes from './routes/fileRoutes';

const app = express();
const port = 3000;

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50gb' }));
app.use(express.urlencoded({ extended: true, limit: '10gb' }));

app.use('/api', fileRoutes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
