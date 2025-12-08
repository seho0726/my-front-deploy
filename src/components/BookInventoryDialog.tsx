import { useState } from 'react';
import { Book, Order } from '../types'; // types.ts에서 Order 가져오기
import { X, Search, Package, BookOpen, ChevronUp, ChevronDown, ShoppingBag, DollarSign } from 'lucide-react';

interface BookInventoryDialogProps {
    books: Book[];
    orders: Order[]; // ⭐ loans 대신 orders를 받습니다.
    onClose: () => void;
    onEditBook: (book: Book) => void;
}

// 정렬 기준 변경 (대출 관련 제거 -> 판매/매출 관련 추가)
type SortField = 'title' | 'author' | 'genre' | 'isbn' | 'stock' | 'totalSold' | 'totalRevenue';
type SortDirection = 'asc' | 'desc';

export function BookInventoryDialog({ books, orders, onClose, onEditBook }: BookInventoryDialogProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortField>('title');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // ⭐ [핵심] 각 책별 판매 통계 계산
    const getBooksWithStats = () => {
        return books.map(book => {
            // 이 책에 대한 모든 주문 내역 찾기
            const bookOrders = orders.filter(o => o.bookId === book.id);

            // 총 판매량 계산
            const totalSold = bookOrders.reduce((sum, order) => sum + order.quantity, 0);

            // 총 매출액 계산
            const totalRevenue = bookOrders.reduce((sum, order) => sum + order.totalPrice, 0);

            return {
                ...book,
                totalSold,
                totalRevenue
            };
        });
    };

    // 검색 필터링
    const filteredBooks = getBooksWithStats().filter(book => {
        const query = searchQuery.toLowerCase();
        return (
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.genre.toLowerCase().includes(query) ||
            (book.isbn && book.isbn.toLowerCase().includes(query))
        );
    });

    // 정렬 핸들러
    const handleSort = (field: SortField) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('desc'); // 수치 데이터는 내림차순(높은거 부터)이 보기 편함
        }
    };

    // 정렬 로직
    const sortedBooks = [...filteredBooks].sort((a, b) => {
        const aValue = a[sortBy] ?? '';
        const bValue = b[sortBy] ?? '';

        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        } else {
            const comparison = String(aValue).localeCompare(String(bValue));
            return sortDirection === 'asc' ? comparison : -comparison;
        }
    });

    // ⭐ 전체 통계 계산 (상단 카드용)
    const totalBooks = books.length;
    const currentTotalStock = books.reduce((sum, book) => sum + book.stock, 0);
    const totalSoldUnits = orders.reduce((sum, order) => sum + order.quantity, 0);
    const totalRevenueAll = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-gray-900 font-bold text-lg">도서 재고 및 판매 현황</h2>
                            <p className="text-sm text-gray-500">전체 도서의 재고 관리 및 매출 통계</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* ⭐ Statistics Cards (판매 데이터로 변경) */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-4 gap-4">
                        {/* 1. 총 도서 종수 */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="w-4 h-4 text-gray-600" />
                                <p className="text-sm text-gray-600 font-medium">등록된 도서</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{totalBooks}종</p>
                        </div>

                        {/* 2. 현재 총 재고 */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Package className="w-4 h-4 text-blue-600" />
                                <p className="text-sm text-gray-600 font-medium">현재 총 재고</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">{currentTotalStock}권</p>
                        </div>

                        {/* 3. 누적 판매량 */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <ShoppingBag className="w-4 h-4 text-green-600" />
                                <p className="text-sm text-gray-600 font-medium">누적 판매량</p>
                            </div>
                            <p className="text-2xl font-bold text-green-600">{totalSoldUnits}권</p>
                        </div>

                        {/* 4. 총 매출액 */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-4 h-4 text-indigo-600" />
                                <p className="text-sm text-gray-600 font-medium">총 매출액</p>
                            </div>
                            <p className="text-2xl font-bold text-indigo-600">{totalRevenueAll.toLocaleString()}원</p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="도서 검색 (제목, 저자, 장르, ISBN)"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded">
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-hidden px-6 py-4 flex flex-col">
                    {sortedBooks.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">데이터가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto overflow-y-auto flex-1">
                            <table className="w-full min-w-max">
                                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">도서 정보</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                                        <button className="flex items-center gap-1 hover:text-gray-900" onClick={() => handleSort('genre')}>
                                            장르 {sortBy === 'genre' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                                        <button className="flex items-center gap-1 justify-center hover:text-gray-900" onClick={() => handleSort('stock')}>
                                            현재 재고 {sortBy === 'stock' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                                        <button className="flex items-center gap-1 justify-center hover:text-gray-900" onClick={() => handleSort('totalSold')}>
                                            총 판매량 {sortBy === 'totalSold' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                                        <button className="flex items-center gap-1 justify-end ml-auto hover:text-gray-900" onClick={() => handleSort('totalRevenue')}>
                                            총 매출 {sortBy === 'totalRevenue' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}
                                        </button>
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {sortedBooks.map(book => (
                                    <tr
                                        key={book.id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => onEditBook(book)}
                                    >
                                        {/* 도서 정보 (이미지 + 제목 + 저자) */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <img src={book.coverImage} alt={book.title} className="w-10 h-14 object-cover rounded bg-gray-200" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{book.title}</p>
                                                    <p className="text-sm text-gray-500">{book.author}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* 장르 */}
                                        <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                          {book.genre}
                        </span>
                                        </td>

                                        {/* 현재 재고 */}
                                        <td className="px-4 py-3 text-center">
                        <span className={`font-bold ${book.stock === 0 ? 'text-red-500' : book.stock < 5 ? 'text-orange-500' : 'text-gray-700'}`}>
                          {book.stock}
                        </span>
                                        </td>

                                        {/* 총 판매량 */}
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-gray-900">{book.totalSold}권</span>
                                        </td>

                                        {/* 총 매출 */}
                                        <td className="px-4 py-3 text-right">
                                            <span className="font-medium text-indigo-600">{book.totalRevenue.toLocaleString()}원</span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}