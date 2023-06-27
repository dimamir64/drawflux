import { Router } from 'express';
import queries from '../../../api/queries';
import { loadRoute } from '../../../utils/route/route';

const qrCodeRouter = Router();

qrCodeRouter.post('/', loadRoute(queries.generateQRCode));

export { qrCodeRouter };