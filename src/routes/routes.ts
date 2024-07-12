import { Router } from 'express';
import uploads from './fileRoutes';
import downloads from './downloads';
import stats from './statsRoutes';

const routes = Router();

//routes
routes.use('/upload', uploads);
routes.use('/files', downloads);
routes.use('/stats', stats);

routes.get('/test', (req, res) => {
    res.status(200).json({ message: 'is runnig' });
});

export default routes;