import express from 'express';
import { bookPost, deleteBook, getAllBooks, getMyBooks, getSingleBook, updateBook } from '../controllers/bookController.js';
import { isAuthenticated, isAuthorized } from '../middlewares/auth.js';

const router = express.Router();


router.post('/post', isAuthenticated, isAuthorized("Author"), bookPost)
router.delete('/delete/:id', isAuthenticated, isAuthorized("Author"), deleteBook)
router.get('/all', getAllBooks);
router.get('/singlebook/:id', isAuthenticated, getSingleBook);
router.get('/mybooks', isAuthenticated, isAuthorized("Author"), getMyBooks);
router.put('/update/:id', isAuthenticated, isAuthorized("Author"), updateBook);



export default router;