import { verifyConsultingOperationnelToken } from '../utils/consultingOperationnelToken.js';

export default function requireConsultingOperationnelParticipant(req, res, next) {
  const auth = req.header('authorization') || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  const token = match ? match[1] : null;

  const verified = verifyConsultingOperationnelToken(token);
  if (!verified.ok) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  req.consultingOperationnelAccountId = verified.accountId;
  return next();
}
