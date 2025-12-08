import { Book } from '../types'; // types.ts에서 타입 가져오기
import { Calendar, Check, Star, Package } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback'; // 이미지 컴포넌트 경로 확인 필요

interface BookCardProps {
    book: Book;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onBookClick: (book: Book) => void;
    isSelectionMode: boolean;
}

export function BookCard({ book, isSelected, onSelect, onBookClick, isSelectionMode }: BookCardProps) {

    const handleClick = () => {
        if (isSelectionMode) {
            onSelect(book.id);
        } else {
            onBookClick(book);
        }
    };

    // 평점 계산
    const calculateAverageRating = () => {
        if (!book.ratings || book.ratings.length === 0) return 0;
        const sum = book.ratings.reduce((acc, r) => acc + r.rating, 0);
        return sum / book.ratings.length;
    };

    const averageRating = calculateAverageRating();

    // ⭐ [구매 시스템] 총 재고가 곧 판매 가능 재고입니다.
    const availableStock = book.stock;

    return (
        <div
            onClick={handleClick}
            className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative cursor-pointer transform hover:scale-105 ${
                isSelected ? 'ring-2 ring-blue-600' : ''
            }`}
        >
            {/* 선택 모드 체크박스 */}
            {isSelectionMode && (
                <div className="absolute top-2 left-2 z-10">
                    <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected
                                ? 'bg-blue-600 border-blue-600'
                                : 'bg-white border-gray-300 hover:border-blue-400'
                        }`}
                    >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                </div>
            )}

            {/* 도서 표지 이미지 */}
            <div className="relative aspect-[3/2] bg-gray-100 overflow-hidden">
                {/* 2번 코드의 안전한 이미지 컴포넌트 사용 */}
                <ImageWithFallback
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-1 right-1 bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px]">
                    {book.genre}
                </div>
            </div>

            {/* 도서 정보 */}
            <div className="p-3">
                <h3 className="text-sm text-gray-900 mb-1 line-clamp-1 font-bold">{book.title}</h3>
                <p className="text-xs text-gray-600 mb-2 line-clamp-1">{book.author}</p>

                <p className="text-xs text-gray-500 line-clamp-2 mb-3 h-8">
                    {book.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {book.publishedYear}
                        </div>
                        <div className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {/* 재고가 0이면 '품절' 표시 */}
                            {availableStock > 0 ? `재고 ${availableStock}권` : <span className="text-red-500 font-bold">품절</span>}
                        </div>
                    </div>
                    {averageRating > 0 && (
                        <div className="flex items-center gap-1 text-yellow-600">
                            <Star className="w-3 h-3 fill-yellow-500" />
                            {averageRating.toFixed(1)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}