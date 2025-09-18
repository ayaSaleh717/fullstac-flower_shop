import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  loginUser, 
  updateUser, 
  deleteUser,
  logoutUser 
} from '../controllers/userController.js';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/add', createUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.put('/update/:id', updateUser);
router.delete('/delete/:id', deleteUser);

export default router;
