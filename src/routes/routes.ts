import { Router } from 'express';
import uploads from './fileRoutes';
import downloads from './downloads';
import stats from './statsRoutes';

const routes = Router();

//routes
routes.use('/upload', uploads);
routes.use('/files', downloads);
routes.use('/stats', stats);

export default routes;