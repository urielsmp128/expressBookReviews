const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Returns the books whose given field matches the value (case-insensitive), with their isbn
const findBooksBy = (field, value) => {
  const wanted = value.toLowerCase();
  return Object.keys(books)
    .filter((isbn) => books[isbn][field].toLowerCase() === wanted)
    .map((isbn) => ({ isbn, ...books[isbn] }));
}

public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  if (!isValid(username)) {
    return res.status(400).json({message: "Invalid username"});
  }

  if (users.some((user) => user.username === username)) {
    return res.status(409).json({message: "User already exists"});
  }

  users.push({ username, password });
  return res.status(201).json({message: "User successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }
  return res.status(200).json(book);
 });

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const matches = findBooksBy("author", req.params.author);
  if (matches.length === 0) {
    return res.status(404).json({message: "No books found for this author"});
  }
  return res.status(200).json(matches);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const matches = findBooksBy("title", req.params.title);
  if (matches.length === 0) {
    return res.status(404).json({message: "No books found with this title"});
  }
  return res.status(200).json(matches);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }
  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
