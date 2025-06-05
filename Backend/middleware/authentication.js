import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default async function verifyAccessToken(req, res, next) {
  try {
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.sub).select('-password');
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
