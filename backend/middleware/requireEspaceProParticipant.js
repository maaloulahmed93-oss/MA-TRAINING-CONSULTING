import { verifyEspaceProToken } from '../utils/espaceProToken.js';

export default function requireEspaceProParticipant(req, res, next) {
  const auth = req.header('authorization') || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  const token = match ? match[1] : null;

  const verified = verifyEspaceProToken(token);
  if (!verified.ok) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  req.espaceProAccountId = verified.accountId;
  return next();
}
