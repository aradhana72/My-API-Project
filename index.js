const express = require("express");
var bodyParser = require("body-parser");
//Database
const database = require("./database");

//Initialise express
const booky = express();

booky.use(bodyParser.urlencoded({extended: true}));
booky.use(bodyParser.json());

/*
Route            /
Description      Get all the books
Access           PUBLIC
Parameter        NONE
Methods          GET
*/
booky.get("/",(req,res) => {
  return res.json({books: database.books});
});

/*
Route            /is
Description      Get specific book on ISBN
Access           PUBLIC
Parameter        isbn
Methods          GET
*/
booky.get("/is/:isbn",(req,res) => {
  const getSpecificBook = database.books.filter(
    (book) => book.ISBN ===  req.params.isbn
  );

  if(getSpecificBook.length === 0) {
    return res.json({error: `No book found for the ISBN of ${req.params.isbn}`});
  }

  return res.json({book: getSpecificBook});
});


/*
Route            /c
Description      Get specific book on category
Access           PUBLIC
Parameter        category
Methods          GET
*/

booky.get("/c/:category", (req,res) => {
  const getSpecificBook = database.books.filter(
    (book) => book.category.includes(req.params.category)
  )

  if(getSpecificBook.length === 0) {
    return res.json({error: `No book found for the category of ${req.params.category}`})
  }

  return res.json({book: getSpecificBook});
});


/*
Route            /author
Description      Get all authors
Access           PUBLIC
Parameter        NONE
Methods          GET
*/

booky.get("/author", (req,res) => {
  return res.json({authors: database.author});
});

/*
Route            /author/book
Description      Get all authors based on books
Access           PUBLIC
Parameter        isbn
Methods          GET
*/

booky.get("/author/book/:isbn", (req,res) => {
  const getSpecificAuthor = database.author.filter(
    (author) => author.books.includes(req.params.isbn)
  );

  if(getSpecificAuthor.length === 0){
    return res.json({
      error: `No author found for the book of ${req.params.isbn}`
    });
  }
  return res.json({authors: getSpecificAuthor});
});

/*
Route            /publications
Description      Get all publications
Access           PUBLIC
Parameter        NONE
Methods          GET
*/

booky.get("/publications",(req,res) => {
  return res.json({publications: database.publication});
})


//POST

/*
Route            /book/new
Description      Add new books
Access           PUBLIC
Parameter        NONE
Methods          POST
*/

booky.post("/book/new",(req,res) => {
  const newBook = req.body;
  database.books.push(newBook);
  return res.json({updatedBooks: database.books});
});

/*
Route            /author/new
Description      Add new authors
Access           PUBLIC
Parameter        NONE
Methods          POST
*/

booky.post("/author/new",(req,res) => {
  const newAuthor = req.body;
  database.author.push(newAuthor);
  return res.json(database.author);
});

/*
Route            /publication/new
Description      Add new publications
Access           PUBLIC
Parameter        NONE
Methods          POST
*/

booky.post("/publication/new", (req,res) => {
  const newPublication = req.body;
  database.publication.push(newPublication);
  return res.json(database.publication);
});

/*
Route            /publication/update/book
Description      Update /add new publication
Access           PUBLIC
Parameter        isbn
Methods          PUT
*/

booky.put("/publication/update/book/:isbn", (req,res) => {
  //Update the publication database
  database.publication.forEach((pub) => {
    if(pub.id === req.body.pubId) {
      return pub.books.push(req.params.isbn);
    }
  });

  //Update the book database
  database.books.forEach((book) => {
    if(book.ISBN === req.params.isbn) {
      book.publications = req.body.pubId;
      return;
    }
  });

  return res.json(
    {
      books: database.books,
      publications: database.publication,
      message: "Successfully updated publications"
    }
  );
});

/****DELETE*****/
/*
Route            /book/delete
Description      Delete a book
Access           PUBLIC
Parameter        isbn
Methods          DELETE
*/

booky.delete("/book/delete/:isbn", (req,res) => {
  //Whichever book that doesnot match with the isbn , just send it to an updatedBookDatabase array
  //and rest will be filtered out

  const updatedBookDatabase = database.books.filter(
    (book) => book.ISBN !== req.params.isbn
  )
  database.books = updatedBookDatabase;

  return res.json({books: database.books});
});

/*
Route            /book/delete/author
Description      Delete an author from a book and vice versa
Access           PUBLIC
Parameter        isbn, authorId
Methods          DELETE
*/

booky.delete("/book/delete/author/:isbn/:authorId", (req,res) => {
  //Update the book database
   database.books.forEach((book)=>{
     if(book.ISBN === req.params.isbn) {
       const newAuthorList = book.author.filter(
         (eachAuthor) => eachAuthor !== parseInt(req.params.authorId)
       );
       book.author = newAuthorList;
       return;
     }
   });


  //Update the author database
  database.author.forEach((eachAuthor) => {
    if(eachAuthor.id === parseInt(req.params.authorId)) {
      const newBookList = eachAuthor.books.filter(
        (book) => book !== req.params.isbn
      );
      eachAuthor.books = newBookList;
      return;
    }
  });

  return res.json({
    book: database.books,
    author: database.author,
    message: "Author was deleted!!!!"
  });
});


booky.listen(3000,() => {
  console.log("Server is up and running");
});
