import { Book } from '../types';   // ✅ types.ts로 통일!
import { BookCard } from './BookCard';
import { BookOpen } from 'lucide-react'; // 아이콘도 필요하다면 추가

interface BookListProps {
    books: Book[];
    selectedBookIds: string[];
    onSelectBook: (id: string) => void;
    onBookClick: (book: Book) => void;
    isSelectionMode: boolean;
}

export function BookList({ books, selectedBookIds, onSelectBook, onBookClick, isSelectionMode }: BookListProps) {

    // 도서가 없을 때 화면
    if (books.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-medium mb-2">등록된 도서가 없습니다</h3>
                <p className="text-gray-500 text-sm">새로운 도서를 추가해보세요</p>
            </div>
        );
    }

    // 도서 목록 그리드
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {books.map(book => (
                <BookCard
                    key={book.id}
                    book={book}
                    // loans prop 제거됨
                    isSelected={selectedBookIds.includes(book.id)}
                    onSelect={onSelectBook}
                    onBookClick={onBookClick}
                    isSelectionMode={isSelectionMode}
                />
            ))}
        </div>
    );
}