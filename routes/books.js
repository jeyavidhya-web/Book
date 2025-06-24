const express = require('express');
const { body, validationResult } = require('express-validator');

const Book = require('../models/Book');
//const  auth  = require('../middleware/auth');
const router = express.Router();

const {
  getAllBooks
  
} = require('../controllers/booksController')

// Validation rules for creating/updating book
const bookValidationRules = [
  body('title').notEmpty().withMessage('Title is required').trim().escape(),
  body('author').notEmpty().withMessage('Author is required').trim().escape(),
  body('genre').optional().trim().escape(),
  body('publishedDate').optional().isISO8601().toDate().withMessage('Published date must be a valid date'),
];


router.get('/', getAllBooks);

// Add a new book and link to user

router.post('/add', bookValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach(e => req.flash('error', e.msg));
    return res.redirect('/books');
  }
  try {

    console.log( " USER ID:" +  req.user._id )  

    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      generation: req.body.generation,
      publishedDate: req.body.publishedDate || undefined,
      owner: req.user._id // <- Set owner!
    });

    await book.save();
    req.flash('info', 'Book added');
    res.redirect('/books');
  } catch (err) {
    console.log(err)
    req.flash('error', 'Error adding book');
    res.redirect('/books');
  }
});// Show edit book form
router.get('/edit/:id',  async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      req.flash('error', 'Book not found');
      return res.redirect('/books');
    }

    console.log( " USER ID:" +  req.user._id )  

    console.log("OWNER:::" + book.owner)


    if (book.owner.toString() !== req.user._id.toString()) {
      req.flash('error', 'Unauthorized');
      return res.redirect('/books');
    }
    res.render('editBook', { book, errors: req.flash('error'), info: req.flash('info') });
  } catch (err) {
    req.flash('error', 'Error loading book');
    res.redirect('/books');
  }
});

// Handle book update
router.post('/edit/:id',  bookValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach(e => req.flash('error', e.msg));
    return res.redirect(`/books/edit/${req.params.id}`);
  }

  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      req.flash('error', 'Book not found');
      return res.redirect('/books');
    }
    if (book.owner.toString() !== req.user._id.toString()) {
      req.flash('error', 'Unauthorized');
      return res.redirect('/books');
    }

    book.title = req.body.title;
    book.author = req.body.author;
    book.genre = req.body.genre;
    book.publishedDate = req.body.publishedDate;

    await book.save();
    req.flash('info', 'Book updated');
    res.redirect('/books');
  } catch (err) {
    req.flash('error', 'Error updating book');
    res.redirect('/books');
  }
});

// Delete a book
router.post('/delete/:id',  async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      req.flash('error', 'Book not found');
      return res.redirect('/books');
    }
    if (book.owner.toString() !== req.user._id.toString()) {
      req.flash('error', 'Unauthorized');
      return res.redirect('/books');
    }

    await book.deleteOne();
    req.flash('info', 'Book deleted');
    res.redirect('/books');
  } catch (err) {
    req.flash('error', 'Error deleting book');
    res.redirect('/books');
  }
});

// Search books by title
router.get('/search', async (req, res) => {
  const search = req.query.title || '';
  try {
    const books = await Book.find({
      title: { $regex: search, $options: 'i' }
    }).sort({ createdAt: -1 });
    res.render('books', {
      books,
      errors: req.flash('error'),
      info: req.flash('info'),
      search
    });
  } catch (err) {
    req.flash('error', 'Failed to search books');
    res.redirect('/books');
  }
});


module.exports = router;
