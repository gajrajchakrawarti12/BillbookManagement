import express from 'express';
import User from '../models/User.js';
import verifyToken from '../middleware/authentication.js';

const router = express.Router();

// Example protected route
router.get('/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ message: `Welcome to the dashboard, user ${userId}`, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:username', verifyToken, async (req, res) => {
  const username = req.params.username;
  const updateData = req.body;
  console.log(`Updating user: ${username} with data:`, updateData);
  

  try {
    const user = await User.findOneAndUpdate({ username }, updateData, { new: true });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: `User ${username} updated successfully`, user });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:username', verifyToken, async (req, res) => {
  const username = req.params.username;

  try {
    const user = await User.findOneAndDelete({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: `User ${username} deleted successfully`, user });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;