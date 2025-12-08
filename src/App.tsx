import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // 라우터 추가
import { BookList } from './components/BookList';
import { AddBookDialog } from './components/AddBookDialog';
import { Sidebar } from './components/Sidebar';
import { LoginScreen } from './components/LoginScreen';
import { SignUpScreen } from './components/SignUpScreen'; // 회원가입 추가
import { MyPage } from './components/MyPage';
import { BookDetailDialog } from './components/BookDetailDialog';
import { BookInventoryDialog } from './components/BookInventoryDialog';
import { Plus, Menu, X, Edit2, Trash2, Search, LogOut, User as UserIcon, Package } from 'lucide-react';
import ktAivleLogo from './assets/e5ac75b360c5f16e2a9a70e851e77229ca22f463.png'; // 로고 경로 확인 필요
import { Book, User, Order } from './types'; // types.ts에서 공통 타입 가져오기

export default function App() {
    // 1. 유저 상태 관리
    const [users, setUsers] = useState<User[]>(() => {
        const savedUsers = localStorage.getItem('users');
        if (savedUsers) {
            try { return JSON.parse(savedUsers); }
            catch (e) { console.error('Error parsing saved users:', e); }
        }
        return [
            { id: 'ADMIN', password: '1234', role: 'admin' },
            { id: 'KT', password: '1234', role: 'user' }
        ];
    });

    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // 2. 도서 상태 관리 (서버 연동)
    const [books, setBooks] = useState<Book[]>([]);

    // 도서 목록 불러오기 (API)
    const fetchBooks = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/book");
            if (!res.ok) throw new Error("Failed to fetch books");
            const data = await res.json();
            // 날짜 변환 등 데이터 전처리
            const parsedData = data.map((b: any) => ({
                ...b,
                createdAt: new Date(b.createdAt),
                ratings: b.ratings || [],
                reviews: b.reviews || [],
                stock: b.stock || 0
            }));
            setBooks(parsedData);
        } catch (error) {
            console.error("Failed to fetch books:", error);
            // 에러 시 빈 배열 유지
        }
    };

    // 앱 시작 시 도서 목록 로드
    useEffect(() => {
        fetchBooks();
    }, []);

    // 3. 주문(구매) 내역 상태 관리 (LocalStorage 연동)
    const [orders, setOrders] = useState<Order[]>(() => {
        const savedOrders = localStorage.getItem('orders');
        if (savedOrders) {
            try {
                const parsed = JSON.parse(savedOrders);
                return parsed.map((o: any) => ({
                    ...o,
                    purchaseDate: new Date(o.purchaseDate)
                }));
            } catch (e) { console.error(e); }
        }
        return [];
    });

    // 주문 내역 저장
    useEffect(() => {
        localStorage.setItem('orders', JSON.stringify(orders));
    }, [orders]);

    // UI 상태들
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectionType, setSelectionType] = useState<'edit' | 'delete' | null>(null);
    const [isMyPageOpen, setIsMyPageOpen] = useState(false);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    // 필터 상태
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('전체');
    const [sortBy, setSortBy] = useState<'title' | 'year' | 'author'>('title');

    // 페이지네이션
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const isAdmin = currentUser?.role === 'admin';

    // --- 핸들러 함수들 ---

    const handleLogin = (user: User) => setCurrentUser(user);

    const handleLogout = () => {
        setCurrentUser(null);
        setIsSelectionMode(false);
        setSelectedBookIds([]);
    };

    const handlePasswordChange = (newPassword: string) => {
        if (currentUser) {
            setUsers(users.map(u => u.id === currentUser.id ? { ...u, password: newPassword } : u));
            setCurrentUser({ ...currentUser, password: newPassword });
        }
    };

    // 도서 추가 (API 연동 - AddBookDialog에서 이미 처리됨, 여기선 목록 갱신만)
    const handleAddBook = (bookData: Book) => {
        fetchBooks(); // 최신 목록 다시 불러오기
        setIsDialogOpen(false);
    };

    // 도서 수정 (API 연동 - AddBookDialog에서 이미 처리됨)
    const handleEditBook = (bookData: Book) => {
        fetchBooks(); // 최신 목록 다시 불러오기
        setEditingBook(null);
        setIsDialogOpen(false);
    };

    // 도서 삭제 (API 연동)
    const handleDeleteBook = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:8080/api/book/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("삭제 실패");
            alert("도서가 삭제되었습니다.");
            fetchBooks(); // 목록 갱신
        } catch (error) {
            console.error("삭제 오류:", error);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    // 일괄 삭제 (API 연동)
    const handleBulkDelete = async () => {
        if (selectedBookIds.length === 0) return;
        if (!confirm(`선택한 ${selectedBookIds.length}권의 도서를 삭제하시겠습니까?`)) return;

        try {
            for (const bookId of selectedBookIds) {
                await fetch(`http://localhost:8080/api/book/${bookId}`, { method: "DELETE" });
            }
            alert("선택한 도서가 삭제되었습니다.");
            fetchBooks();
            setSelectedBookIds([]);
            setIsSelectionMode(false);
            setSelectionType(null);
        } catch (err) {
            console.error("일괄 삭제 오류:", err);
            alert("일괄 삭제 중 오류가 발생했습니다.");
        }
    };

    const handleBulkEdit = () => {
        if (selectedBookIds.length === 0) return;
        if (selectedBookIds.length === 1) {
            const book = books.find(b => b.id === selectedBookIds[0]);
            if (book) {
                setEditingBook(book);
                setIsDialogOpen(true);
            }
        } else {
            alert('편집은 한 번에 하나의 도서만 선택해주세요.');
        }
    };

    // ⭐ [핵심] 구매하기 핸들러
    const handlePurchase = (bookId: string, quantity: number, totalPrice: number) => {
        if (!currentUser) return;
        const book = books.find(b => b.id === bookId);
        if (!book) return;

        // 1. 재고 차감 (API 연동 필요 - 여기선 로컬 상태만 업데이트 예시)
        // 실제로는 PUT /api/book/{id}/stock 호출 권장
        const updatedBook = { ...book, stock: book.stock - quantity };
        setBooks(books.map(b => b.id === bookId ? updatedBook : b));
        setSelectedBook(updatedBook);

        // 2. 주문 기록 생성
        const newOrder: Order = {
            id: Date.now().toString(),
            bookId,
            userId: currentUser.id,
            quantity,
            totalPrice,
            purchaseDate: new Date()
        };
        setOrders(prev => [newOrder, ...prev]);

        alert(`${book.title} ${quantity}권을 구매했습니다. (총 ${totalPrice.toLocaleString()}원)`);
    };

    // 장바구니 핸들러
    const handleAddToCart = (bookId: string, quantity: number) => {
        alert(`장바구니에 ${quantity}권이 담겼습니다.`);
        console.log("Cart:", bookId, quantity);
    };

    // --- UI 로직 ---

    const enterSelectionMode = (mode: 'edit' | 'delete') => {
        setIsSelectionMode(true);
        setSelectionType(mode);
        setSelectedBookIds([]);
    };

    const exitSelectionMode = () => {
        setIsSelectionMode(false);
        setSelectionType(null);
        setSelectedBookIds([]);
    };

    const handleSelectBook = (id: string) => {
        setSelectedBookIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSelectAll = () => {
        const currentBooks = getCurrentPageBooks();
        const currentIds = currentBooks.map(b => b.id);
        if (currentIds.every(id => selectedBookIds.includes(id))) {
            setSelectedBookIds(selectedBookIds.filter(id => !currentIds.includes(id)));
        } else {
            const newIds = [...selectedBookIds];
            currentIds.forEach(id => { if (!newIds.includes(id)) newIds.push(id); });
            setSelectedBookIds(newIds);
        }
    };

    const handleBookClick = (book: Book) => {
        if (!isSelectionMode) setSelectedBook(book);
    };

    const openAddDialog = () => {
        setEditingBook(null);
        setIsDialogOpen(true);
    };

    // 필터링 및 정렬
    const filteredBooks = books
        .filter(book => {
            const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesGenre = selectedGenre === '전체' || book.genre === selectedGenre;
            return matchesSearch && matchesGenre;
        })
        .sort((a, b) => {
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            if (sortBy === 'year') return b.publishedYear - a.publishedYear;
            return a.author.localeCompare(b.author);
        });

    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
    const getCurrentPageBooks = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredBooks.slice(startIndex, startIndex + itemsPerPage);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 로그인 체크 및 라우팅
    if (!currentUser) {
        return (
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginScreen onLogin={handleLogin} />} />
                <Route path="/signup" element={<SignUpScreen />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-md sticky top-0 z-40 border-b border-gray-200">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-3 gap-4">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <Menu className="w-6 h-6 text-gray-700" />
                            </button>
                            <div className="flex items-center gap-2">
                                <img src={ktAivleLogo} alt="Logo" className="h-8" />
                                <h1 className="text-gray-900 whitespace-nowrap">AI 도서 구매</h1>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-2xl mx-4 relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="도서 검색 (제목, 저자)"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>

                        {/* Right Buttons */}
                        <div className="flex items-center gap-2">
                            {isSelectionMode ? (
                                <>
                                    <button onClick={exitSelectionMode} className="px-3 py-2 bg-gray-200 rounded-lg">취소</button>
                                    {selectedBookIds.length > 0 && (
                                        <>
                                            {selectionType === 'edit' && <button onClick={handleBulkEdit} className="px-3 py-2 bg-green-600 text-white rounded-lg">편집 ({selectedBookIds.length})</button>}
                                            {selectionType === 'delete' && <button onClick={handleBulkDelete} className="px-3 py-2 bg-red-600 text-white rounded-lg">삭제 ({selectedBookIds.length})</button>}
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    {isAdmin && (
                                        <>
                                            <button onClick={() => setIsInventoryOpen(true)} className="p-2 bg-purple-100 rounded text-purple-600"><Package className="w-5 h-5"/></button>
                                            <button onClick={() => enterSelectionMode('edit')} className="p-2 bg-green-100 rounded text-green-600"><Edit2 className="w-5 h-5"/></button>
                                            <button onClick={() => enterSelectionMode('delete')} className="p-2 bg-red-100 rounded text-red-600"><Trash2 className="w-5 h-5"/></button>
                                        </>
                                    )}
                                    <button onClick={openAddDialog} className="p-2 bg-blue-100 rounded text-blue-600"><Plus className="w-5 h-5"/></button>
                                    <button onClick={() => setIsMyPageOpen(true)} className="p-2 bg-indigo-100 rounded text-indigo-600"><UserIcon className="w-5 h-5"/></button>
                                    <button onClick={handleLogout} className="p-2 bg-gray-200 rounded text-gray-600"><LogOut className="w-5 h-5"/></button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <Sidebar
                books={books}
                currentUser={currentUser}
                isOpen={isSidebarOpen}
                selectedGenre={selectedGenre}
                sortBy={sortBy}
                onGenreChange={setSelectedGenre}
                onSortChange={setSortBy}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <main className={`px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-0'}`}>
                {/* Filter & Sort Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-gray-700 mb-1">{selectedGenre === '전체' ? '전체 도서' : `${selectedGenre} 도서`}</h2>
                        <p className="text-sm text-gray-500">{filteredBooks.length}권의 도서</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">정렬:</span>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'title' | 'year' | 'author')} className="px-3 py-1.5 border rounded-lg text-sm outline-none">
                            <option value="title">제목순</option>
                            <option value="year">최신순</option>
                            <option value="author">저자명순</option>
                        </select>
                    </div>
                </div>

                <BookList
                    books={getCurrentPageBooks()}
                    selectedBookIds={selectedBookIds}
                    onSelectBook={handleSelectBook}
                    onBookClick={setSelectedBook}
                    isSelectionMode={isSelectionMode}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 border rounded-lg disabled:opacity-50">이전</button>
                        <span className="px-4 py-2">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 border rounded-lg disabled:opacity-50">다음</button>
                    </div>
                )}
            </main>

            {/* Dialogs */}
            {isDialogOpen && (
                <AddBookDialog
                    book={editingBook}
                    onClose={() => setIsDialogOpen(false)}
                    onSave={editingBook ? handleEditBook : handleAddBook}
                />
            )}

            {isMyPageOpen && currentUser && (
                <MyPage
                    user={currentUser}
                    books={isAdmin ? books : books.filter(b => b.createdBy === currentUser.id)}
                    allBooks={books}
                    orders={orders} // ⭐ 구매 장부 전달
                    onClose={() => setIsMyPageOpen(false)}
                    onPasswordChange={handlePasswordChange}
                    onEditBook={(book) => {
                        setEditingBook(book);
                        setIsDialogOpen(true);
                        setIsMyPageOpen(false);
                    }}
                    onDeleteBook={handleDeleteBook}
                />
            )}

            {selectedBook && currentUser && (
                <BookDetailDialog
                    book={selectedBook}
                    currentUser={currentUser}
                    onClose={() => setSelectedBook(null)}
                    onUpdateBook={(updatedBook) => {
                        setBooks(books.map(b => b.id === updatedBook.id ? updatedBook : b));
                        setSelectedBook(updatedBook);
                    }}
                    onAddToCart={handleAddToCart}
                    onPurchase={handlePurchase}
                />
            )}

            {isInventoryOpen && currentUser && isAdmin && (
                <BookInventoryDialog
                    books={books}
                    orders={orders} // ⭐ 대출 기록 대신 구매 기록 전달
                    onClose={() => setIsInventoryOpen(false)}
                    onEditBook={(book) => {
                        setEditingBook(book);
                        setIsDialogOpen(true);
                        setIsInventoryOpen(false);
                    }}
                />
            )}
        </div>
    );
}