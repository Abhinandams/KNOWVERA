import BookCard from "../../molecules/Cards/BookCards/BookCard";

type Book={
  id: number
  title: string
  author: string
  category: string;
  publisher: string;
  image: string;
  availableCopies: number;
};


type Props={
  books:Book[];
};

const BookGrid=({books}:Props)=>{
  return(
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {books.map((book)=>{
        return (
          <BookCard
            key={book.id}
            id={book.id}
            title={book.title}
            author={book.author}
            category={book.category}
            publisher={book.publisher}
            image={book.image}
            availableCopies={book.availableCopies}
          />
        );
      })}
    </div>
  );
};

export default BookGrid
