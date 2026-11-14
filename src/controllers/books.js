import {
  createBook as createBookInDb,
  deleteBook as deleteBookFromDb,
  getAllBooks,
  getBookById,
  updateBook as updateBookInDb,
} from '../models/books.js';

const isValidBook = (book, includeId = false) => {
  if (!book || typeof book !== 'object' || Array.isArray(book)) {
    return false;
  }

  return (
    (!includeId || (typeof book.id === 'string' && book.id.trim().length > 0)) &&
    typeof book.authorId === 'string' &&
    book.authorId.trim().length > 0 &&
    typeof book.title === 'string' &&
    book.title.trim().length > 0 &&
    typeof book.publicationDate === 'string' &&
    book.publicationDate.trim().length > 0
  );
};

const getBooksHandler = async (req, res) => {
  try {
    const books = await getAllBooks();
    return res.status(200).json(books);
  } catch (error) {
    console.error('GET /books failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
const getBookByIdHandler = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const book = await getBookById(requestedId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error('GET /books/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const createBooks = async (req, res) => {
  const { id, authorId, title, publicationDate } = req.body ?? {};
  const book = { id, authorId, title, publicationDate };

  if (!isValidBook(book, true)) {
    return res.status(400).json({
      message: 'Book id, authorId, title, and publicationDate are required.',
    });
  }

  try {
    const existingBook = await getBookById(id);
    if (existingBook) {
      return res.status(400).json({ message: 'A book with this id already exists.' });
    }

    await createBookInDb(book);
    return res.status(201).json(book);
  } catch (error) {
    console.error('POST /books failed:', error.message);
    return res.status(500).json({ message: 'Unable to create book.' });
  }
};

const updateBooks = async (req, res) => {
  const { authorId, title, publicationDate } = req.body ?? {};
  const book = { authorId, title, publicationDate };

  if (!isValidBook(book)) {
    return res.status(400).json({
      message: 'Book authorId, title, and publicationDate are required.',
    });
  }

  try {
    const result = await updateBookInDb(req.params.id, book);
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    return res.status(200).json({ id: req.params.id, ...book });
  } catch (error) {
    console.error('PUT /books/:id failed:', error.message);
    return res.status(500).json({ message: 'Unable to update book.' });
  }
};

const deleteBooks = async (req, res) => {
  try {
    const result = await deleteBookFromDb(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    return res.status(204).end();
  } catch (error) {
    console.error('DELETE /books/:id failed:', error.message);
    return res.status(500).json({ message: 'Unable to delete book.' });
  }
};

export { getBooksHandler, getBookByIdHandler, createBooks, updateBooks, deleteBooks };