import { useState, useEffect } from 'react';
import { Book, User, Review } from '../types';
import { apiFetch } from '../api/client'; // ⭐ apiFetch 임포트
import { X, BookOpen, User as UserIcon, Calendar, Hash, Tag, Star, MessageSquare, Send, Edit2, Trash2, Check, XCircle, Package, Plus, Minus, ShoppingBag, CreditCard, RefreshCw } from 'lucide-react';

interface BookDetailDialogProps {
    book: Book; // 목록에서 넘겨준 책 정보
    currentUser: User;
    onClose: () => void;
    onUpdateBook: (updatedBook: Book) => void;
    onAddToCart: (bookId: string, quantity: number) => void;
    onPurchase: (bookId: string, quantity: number, totalPrice: number) => void;
}

// API 응답 타입
interface CommentResponse {
    commentId: number;
    userId: string;
    bookId: number;
    description: string;
    createdAt: string;
}

export function BookDetailDialog({
                                     book: initialBook,
                                     currentUser,
                                     onClose,
                                     onUpdateBook,
                                     onAddToCart,
                                     onPurchase
                                 }: BookDetailDialogProps) {

    // State 관리
    const [book, setBook] = useState<Book>(initialBook);
    const [isLoading, setIsLoading] = useState(false);

    const [reviewText, setReviewText] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [editingReviewText, setEditingReviewText] = useState('');

    // 구매 수량 State 및 가격 설정
    const [purchaseQuantity, setPurchaseQuantity] = useState(1);
    const BOOK_PRICE = book.price || 15000;

    // 도서 상세 정보 조회 API (GET /book/{id})
    useEffect(() => {
        const fetchBookDetail = async () => {
            setIsLoading(true);
            try {
                // apiFetch 사용
                const data: any = await apiFetch(`/book/${initialBook.id}`);

                const parsedBook = {
                    ...data,
                    createdAt: new Date(data.createdAt),
                    ratings: data.ratings || [],
                    reviews: data.reviews?.map((r: any) => ({
                        ...r,
                        timestamp: new Date(r.timestamp)
                    })) || [],
                    stock: data.stock || 0
                };

                setBook(parsedBook);
            } catch (error) {
                console.error("상세 정보 로딩 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookDetail();
    }, [initialBook.id]);

    // 날짜 포맷 함수
    const formatDate = (date: Date | string) => {
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(new Date(date));
    };

    // 평점 계산
    const calculateAverageRating = () => {
        if (!book.ratings || book.ratings.length === 0) return 0;
        const sum = book.ratings.reduce((acc, r) => acc + r.rating, 0);
        return sum / book.ratings.length;
    };

    const userRating = book.ratings?.find(r => r.userId === currentUser.id);
    const currentRating = userRating?.rating || 0;

    // 평점 등록 핸들러
    const handleRating = (rating: number) => {
        const existingRatingIndex = book.ratings.findIndex(r => r.userId === currentUser.id);
        let newRatings = [...book.ratings];

        if (existingRatingIndex >= 0) {
            newRatings[existingRatingIndex] = { userId: currentUser.id, rating, timestamp: new Date() };
        } else {
            newRatings.push({ userId: currentUser.id, rating, timestamp: new Date() });
        }
        const updatedBook = { ...book, ratings: newRatings };
        setBook(updatedBook);
        onUpdateBook(updatedBook);
    };

    // 리뷰 등록 핸들러 (API 연동)
    const handleSubmitReview = async () => {
        if (!reviewText.trim()) {
            alert("내용이 없는 댓글은 작성 불가합니다.");
            return;
        }

        try {
            // apiFetch 사용 (POST /comment/{bookId})
            const responseData: any = await apiFetch(`/comment/${book.id}`, {
                method: 'POST',
                body: JSON.stringify({ description: reviewText.trim() })
            });

            const newReview: Review = {
                id: responseData.commentId.toString(),
                userId: responseData.userId,
                comment: responseData.description,
                timestamp: new Date(responseData.createdAt)
            };

            const updatedReviews = [newReview, ...book.reviews];
            const updatedBook = { ...book, reviews: updatedReviews };

            setBook(updatedBook);
            onUpdateBook(updatedBook);
            setReviewText('');
            alert('한줄평이 성공적으로 등록되었습니다!');

        } catch (error: any) {
            alert(error.message);
        }
    };

    // 리뷰 수정 핸들러
    const handleUpdateReview = async () => {
        if (!editingReviewText.trim()) return;

        try {
            // apiFetch 사용 (PATCH /comment/{commentId}) - 명세서상 수정은 없으나 보통 이렇게 구현
            // 만약 명세서에 없다면 삭제 후 재등록 방식을 쓸 수도 있음
            // 여기서는 임시로 comment/{id}로 PATCH 시도
            await apiFetch(`/comment/${editingReviewId}`, {
                method: 'PATCH',
                body: JSON.stringify({ description: editingReviewText.trim() })
            });

            const updatedReviews = book.reviews.map(r =>
                r.id === editingReviewId ? { ...r, comment: editingReviewText.trim(), timestamp: new Date() } : r
            );
            const updatedBook = { ...book, reviews: updatedReviews };

            setBook(updatedBook);
            onUpdateBook(updatedBook);
            setEditingReviewId(null);
            setEditingReviewText('');
            alert("댓글이 수정되었습니다.");

        } catch (error: any) {
            alert(error.message);
        }
    };

    // 리뷰 삭제 핸들러
    const handleDeleteReview = async (reviewId: string) => {
        if (!confirm("정말로 이 댓글을 삭제하시겠습니까?")) return;

        try {
            // apiFetch 사용 (DELETE /comment/{commentId})
            await apiFetch(`/comment/${reviewId}`, { method: 'DELETE' });

            const updatedReviews = book.reviews.filter(r => r.id !== reviewId);
            const updatedBook = { ...book, reviews: updatedReviews };
            setBook(updatedBook);
            onUpdateBook(updatedBook);
            alert("댓글이 삭제되었습니다.");

        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleEditReview = (reviewId: string) => {
        const review = book.reviews.find(r => r.id === reviewId);
        if (review) {
            setEditingReviewId(reviewId);
            setEditingReviewText(review.comment);
        }
    };

    const handleIncreaseQty = () => {
        if (purchaseQuantity < book.stock) setPurchaseQuantity(prev => prev + 1);
        else alert(`재고가 부족합니다. (최대 ${book.stock}권)`);
    };

    const handleDecreaseQty = () => {
        if (purchaseQuantity > 1) setPurchaseQuantity(prev => prev - 1);
    };

    // ⭐ [관리자용] 재고 증가 핸들러 (API 연동: PUT /book/{bookId}/stock)
    const handleAdminIncreaseStock = async () => {
        const newStock = book.stock + 1;

        // UI 즉시 반영 (Optimistic Update)
        const updatedBook = { ...book, stock: newStock };
        setBook(updatedBook);
        onUpdateBook(updatedBook);

        try {
            // API 호출: PUT /book/{bookId}/stock
            // Body: { stock: 51 } 형태로 보낸다고 가정
            await apiFetch(`/book/${book.id}/stock`, {
                method: "PUT",
                body: JSON.stringify({ stock: newStock })
            });
        } catch (error) {
            console.error("재고 업데이트 실패:", error);
            // 실패 시 롤백
            const rollbackBook = { ...book, stock: book.stock };
            setBook(rollbackBook);
            onUpdateBook(rollbackBook);
            alert("재고 업데이트에 실패했습니다.");
        }
    };

    // ⭐ [관리자용] 재고 감소 핸들러 (API 연동: PUT /book/{bookId}/stock)
    const handleAdminDecreaseStock = async () => {
        if (book.stock <= 0) return;
        const newStock = book.stock - 1;

        // UI 즉시 반영
        const updatedBook = { ...book, stock: newStock };
        setBook(updatedBook);
        onUpdateBook(updatedBook);

        try {
            // API 호출
            await apiFetch(`/book/${book.id}/stock`, {
                method: "PUT",
                body: JSON.stringify({ stock: newStock })
            });
        } catch (error) {
            console.error("재고 업데이트 실패:", error);
            // 실패 시 롤백
            const rollbackBook = { ...book, stock: book.stock };
            setBook(rollbackBook);
            onUpdateBook(rollbackBook);
            alert("재고 업데이트에 실패했습니다.");
        }
    };

    const averageRating = calculateAverageRating();
    const availableStock = book.stock;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-gray-900">도서 상세 정보</h2>
                            <p className="text-sm text-gray-500">
                                {isLoading ? (
                                    <span className="flex items-center gap-1 text-blue-500"><RefreshCw className="w-3 h-3 animate-spin"/> 최신 정보 불러오는 중...</span>
                                ) : (
                                    averageRating > 0 ? (
                                        <span className="inline-flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <span>{averageRating.toFixed(1)}</span>
                                            <span className="text-gray-400">({book.ratings.length}명 평가)</span>
                                        </span>
                                    ) : (
                                        <span>아직 평가가 없습니다</span>
                                    )
                                )}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex gap-6 mb-6">
                        <div className="flex-shrink-0">
                            <img src={book.coverImage} alt={book.title} className="w-48 h-72 object-cover rounded-lg shadow-lg" />
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-2xl text-gray-900">{book.title}</h3>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{book.genre}</span>
                                </div>
                                <p className="text-lg text-gray-600">{book.author}</p>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <h4 className="text-sm text-gray-700 mb-2">설명</h4>
                                <p className="text-gray-600 leading-relaxed">{book.description}</p>
                            </div>

                            <div className="pt-4 border-t border-gray-200 space-y-3">
                                <h4 className="text-sm text-gray-700 mb-3">도서 정보</h4>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 text-gray-600"><Calendar className="w-4 h-4" /><span className="text-sm">출판연도</span></div>
                                    <span className="text-gray-900">{book.publishedYear}년</span>
                                </div>
                                {book.isbn && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 text-gray-600"><Hash className="w-4 h-4" /><span className="text-sm">ISBN</span></div>
                                        <span className="text-gray-900">{book.isbn}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 text-gray-600"><Tag className="w-4 h-4" /><span className="text-sm">장르</span></div>
                                    <span className="text-gray-900">{book.genre}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 text-gray-600"><UserIcon className="w-4 h-4" /><span className="text-sm">등록자</span></div>
                                    <span className="text-gray-900">{book.createdBy}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 text-gray-600"><Calendar className="w-4 h-4" /><span className="text-sm">등록일</span></div>
                                    <span className="text-gray-900">{formatDate(book.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rating Section */}
                    <div className="border-t border-gray-200 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-gray-900 flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500" /> 평가하기</h4>
                            {userRating && <span className="text-sm text-gray-500">내 평가: {currentRating}점</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 transition-transform hover:scale-110"
                                >
                                    <Star className={`w-8 h-8 ${star <= (hoverRating || currentRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                </button>
                            ))}
                            <span className="ml-2 text-sm text-gray-600">
                                {hoverRating > 0 ? `${hoverRating}점` : currentRating > 0 ? `${currentRating}점 평가됨` : '별을 클릭하여 평가하세요'}
                            </span>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="border-t border-gray-200 pt-6 mt-6">
                        <h4 className="text-gray-900 mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-blue-600" /> 한줄평 ({book.reviews.length})</h4>
                        <div className="mb-6 flex gap-2">
                            <input
                                type="text"
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="이 책에 대한 한줄평을 남겨주세요..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitReview(); }}
                            />
                            <button onClick={handleSubmitReview} disabled={!reviewText.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                <Send className="w-4 h-4" /> 등록
                            </button>
                        </div>

                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {book.reviews.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                    <p>아직 한줄평이 없습니다.</p>
                                </div>
                            ) : (
                                book.reviews.map((review) => (
                                    <div key={review.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center"><UserIcon className="w-4 h-4 text-white" /></div>
                                                <div>
                                                    <p className="text-sm text-gray-900">{review.userId}</p>
                                                    <p className="text-xs text-gray-500">{formatDate(review.timestamp)}</p>
                                                </div>
                                            </div>
                                            {review.userId === currentUser.id && (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleEditReview(review.id)} className="p-1 text-gray-500 hover:text-gray-700"><Edit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDeleteReview(review.id)} className="p-1 text-gray-500 hover:text-gray-700"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            )}
                                        </div>
                                        {editingReviewId === review.id ? (
                                            <div className="flex gap-2">
                                                <input type="text" value={editingReviewText} onChange={(e) => setEditingReviewText(e.target.value)} className="flex-1 px-4 py-2 border rounded-lg" />
                                                <button onClick={handleUpdateReview} className="px-4 py-2 bg-blue-600 text-white rounded-lg"><Check className="w-4 h-4" /> 수정</button>
                                                <button onClick={() => setEditingReviewId(null)} className="px-4 py-2 bg-red-600 text-white rounded-lg"><XCircle className="w-4 h-4" /> 취소</button>
                                            </div>
                                        ) : (
                                            <p className="text-gray-700 ml-10">{review.comment}</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Purchase Section */}
                    {currentUser.role !== 'admin' && (
                        <div className="border-t border-gray-200 pt-6 mt-6">
                            <h4 className="text-gray-900 mb-4 flex items-center gap-2 font-bold">
                                <CreditCard className="w-5 h-5 text-indigo-600" /> 구매 옵션
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-5">
                                {book.stock > 0 ? (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-700 font-medium">구매 수량</span>
                                            <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-lg border border-gray-300">
                                                <button onClick={handleDecreaseQty} disabled={purchaseQuantity <= 1} className="p-1 text-gray-500 hover:text-indigo-600 disabled:opacity-30"><Minus className="w-4 h-4" /></button>
                                                <span className="w-8 text-center font-bold text-gray-900">{purchaseQuantity}</span>
                                                <button onClick={handleIncreaseQty} disabled={purchaseQuantity >= book.stock} className="p-1 text-gray-500 hover:text-indigo-600 disabled:opacity-30"><Plus className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-t border-b border-gray-200">
                                            <span className="text-gray-600">총 결제 금액</span>
                                            <div className="text-right">
                                                <span className="text-xl font-bold text-indigo-600">{(BOOK_PRICE * purchaseQuantity).toLocaleString()}원</span>
                                                <p className="text-xs text-gray-400">(개당 {BOOK_PRICE.toLocaleString()}원)</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 mt-2">
                                            <button onClick={() => onAddToCart(book.id, purchaseQuantity)} className="flex-1 px-4 py-3 bg-white border border-indigo-600 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors font-medium flex items-center justify-center gap-2"><ShoppingBag className="w-5 h-5" /> 장바구니</button>
                                            <button onClick={() => onPurchase(book.id, purchaseQuantity, BOOK_PRICE * purchaseQuantity)} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-md flex items-center justify-center gap-2"><CreditCard className="w-5 h-5" /> 바로 구매</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-500 font-medium">현재 품절된 상품입니다.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ⭐ Stock Management Section - Admin Only (API 연동 완료) */}
                    {currentUser.role === 'admin' && (
                        <div className="border-t border-gray-200 pt-6 mt-6">
                            <h4 className="text-gray-900 mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-blue-600" /> 재고 관리</h4>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div><p className="text-sm text-gray-600">총 재고</p><p className="text-2xl text-gray-900">{book.stock}권</p></div>
                                    <div><p className="text-sm text-gray-600">판매 가능</p><p className="text-2xl text-blue-600">{availableStock}권</p></div>
                                </div>
                                <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                                    <button onClick={handleAdminDecreaseStock} disabled={book.stock <= 0} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"><Minus className="w-4 h-4" /> 재고 감소</button>
                                    <button onClick={handleAdminIncreaseStock} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> 재고 증가</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">닫기</button>
                </div>
            </div>
        </div>
    );
}