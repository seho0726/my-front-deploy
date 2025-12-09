import React, { useState, useEffect } from 'react';
import { User, Book, Order } from '../types'; // types.ts 확인
import { apiFetch } from '../api/client'; // ⭐ apiFetch 임포트
import { X, BookOpen, ShoppingBag, Calendar, CheckCircle, Edit2, Trash2, Key, AlertCircle, LogOut } from 'lucide-react';

interface MyPageProps {
    user: User;
    allBooks: Book[];   // 전체 책 목록 (주문 내역 매칭용)
    onClose: () => void;
    onPasswordChange: (newPassword: string) => void;
    onEditBook: (book: Book) => void;
    onDeleteBook: (id: string) => void;
    onLogout: () => void; // 로그아웃 핸들러 추가
}

export function MyPage({ user, allBooks, onClose, onPasswordChange, onEditBook, onDeleteBook, onLogout }: MyPageProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'admin'>('info');

    // ⭐ [추가] API로 불러온 데이터를 저장할 State
    const [myBooks, setMyBooks] = useState<Book[]>([]);
    const [myOrders, setMyOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // 비밀번호 변경 State (기존 유지)
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // ⭐ [핵심] 컴포넌트 마운트 시 API 호출
    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            try {
                // 1. 본인 주문 목록 조회 (GET /user/order/{userId})
                const ordersData = await apiFetch<Order[]>(`/user/order/${user.id}`);
                // 최신순 정렬
                const sortedOrders = ordersData.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
                setMyOrders(sortedOrders);

                // 2. 본인 등록 도서 조회 (GET /user/book/{userId})
                const booksData = await apiFetch<Book[]>(`/user/book/${user.id}`);
                setMyBooks(booksData);

            } catch (error) {
                console.error("데이터 로딩 실패:", error);
                // 에러 시 빈 배열 유지
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [user.id]);

    // 날짜 포맷 함수
    const formatDate = (date: Date | string) => {
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(new Date(date));
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess(false);

        if (currentPassword !== user.password) {
            setPasswordError('현재 비밀번호가 일치하지 않습니다.');
            return;
        }
        if (newPassword.length < 4) {
            setPasswordError('새 비밀번호는 4자 이상이어야 합니다.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        onPasswordChange(newPassword);
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(false), 3000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full shadow-sm">
                            <UserIconWrapper role={user.role} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">마이페이지</h2>
                            <p className="text-sm text-gray-500">{user.id}님 환영합니다</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Menu */}
                    <div className="w-60 bg-gray-50 border-r flex flex-col p-4 gap-2">
                        <MenuButton
                            active={activeTab === 'info'}
                            onClick={() => setActiveTab('info')}
                            icon={<Key className="w-4 h-4"/>}
                            label="내 정보 관리"
                        />
                        <MenuButton
                            active={activeTab === 'orders'}
                            onClick={() => setActiveTab('orders')}
                            icon={<ShoppingBag className="w-4 h-4"/>}
                            label="구매 내역"
                        />
                        {/* 관리자이거나 등록한 책이 있을 때만 표시 */}
                        {(user.role === 'admin' || myBooks.length > 0) && (
                            <MenuButton
                                active={activeTab === 'admin'}
                                onClick={() => setActiveTab('admin')}
                                icon={<BookOpen className="w-4 h-4"/>}
                                label="등록 도서 관리"
                            />
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-8 overflow-y-auto bg-white">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center text-gray-500">
                                데이터를 불러오는 중입니다...
                            </div>
                        ) : (
                            <>
                                {/* 1. 내 정보 탭 */}
                                {activeTab === 'info' && (
                                    <div className="max-w-md">
                                        <h3 className="text-lg font-bold mb-6 border-b pb-2">비밀번호 변경</h3>
                                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                            <InputGroup label="현재 비밀번호" type="password" value={currentPassword} onChange={setCurrentPassword} />
                                            <InputGroup label="새 비밀번호" type="password" value={newPassword} onChange={setNewPassword} />
                                            <InputGroup label="새 비밀번호 확인" type="password" value={confirmPassword} onChange={setConfirmPassword} />

                                            {passwordError && (
                                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                                    <AlertCircle className="w-4 h-4" /> {passwordError}
                                                </div>
                                            )}
                                            {passwordSuccess && (
                                                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                                                    <CheckCircle className="w-4 h-4" /> 변경 완료!
                                                </div>
                                            )}
                                            <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
                                                변경하기
                                            </button>
                                        </form>

                                        <div className="mt-8 pt-6 border-t">
                                            <button onClick={onLogout} className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium">
                                                <LogOut className="w-4 h-4" /> 로그아웃
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* 2. 구매 내역 탭 */}
                                {activeTab === 'orders' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-bold flex items-center gap-2">
                                                <ShoppingBag className="w-5 h-5 text-indigo-600"/>
                                                구매 내역 <span className="text-gray-400 text-sm font-normal">({myOrders.length}건)</span>
                                            </h3>
                                        </div>

                                        {myOrders.length === 0 ? (
                                            <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                                <p className="text-gray-500">아직 구매한 도서가 없습니다.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {myOrders.map(order => {
                                                    // 전체 책 목록(allBooks)에서 책 정보 찾기
                                                    const bookInfo = allBooks.find(b => b.id === order.bookId);

                                                    return (
                                                        <div key={order.id} className="flex gap-5 p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                                                            <div className="w-20 h-28 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border">
                                                                <img
                                                                    src={bookInfo ? bookInfo.coverImage : 'https://via.placeholder.com/150?text=No+Img'}
                                                                    alt="cover"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-1 flex flex-col justify-between">
                                                                <div>
                                                                    <div className="flex justify-between items-start">
                                                                        <h4 className="text-lg font-bold text-gray-900 line-clamp-1">
                                                                            {bookInfo ? bookInfo.title : '(삭제된 도서)'}
                                                                        </h4>
                                                                        <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200 flex items-center gap-1">
                                                                            <CheckCircle className="w-3 h-3" /> 결제완료
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-500 mt-1">{bookInfo?.author}</p>
                                                                </div>
                                                                <div className="flex items-end justify-between mt-3">
                                                                    <div className="text-sm text-gray-500 flex flex-col gap-1">
                                                                        <span className="flex items-center gap-1.5">
                                                                            <Calendar className="w-3.5 h-3.5" />
                                                                            {formatDate(order.purchaseDate)}
                                                                        </span>
                                                                        <span className="text-xs text-gray-400">주문번호: {order.id.slice(0, 8)}</span>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="text-sm text-gray-500 mr-2">{order.quantity}권</span>
                                                                        <span className="text-xl font-bold text-indigo-600">
                                                                            {order.totalPrice.toLocaleString()}원
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 3. 등록 도서 관리 탭 (본인이 등록한 책) */}
                                {activeTab === 'admin' && (
                                    <div>
                                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-indigo-600"/>
                                            등록한 도서 <span className="text-gray-400 text-sm font-normal">({myBooks.length}권)</span>
                                        </h3>
                                        {myBooks.length === 0 ? (
                                            <p className="text-gray-500">등록한 도서가 없습니다.</p>
                                        ) : (
                                            <div className="grid gap-3">
                                                {myBooks.map(book => (
                                                    <div key={book.id} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <img src={book.coverImage} className="w-10 h-14 object-cover rounded bg-gray-100" alt="cover" />
                                                            <div>
                                                                <div className="font-bold">{book.title}</div>
                                                                <div className="text-xs text-gray-500">재고: {book.stock}권</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => onEditBook(book)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"><Edit2 className="w-4 h-4"/></button>
                                                            <button onClick={() => { if(confirm('정말 삭제하시겠습니까?')) onDeleteBook(book.id) }} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4"/></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// 하위 컴포넌트들
function MenuButton({ active, onClick, icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                active ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            {icon}
            {label}
        </button>
    );
}

function InputGroup({ label, type, value, onChange }: any) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                required
            />
        </div>
    );
}

function UserIconWrapper({ role }: { role: string }) {
    return <div className={`text-${role === 'admin' ? 'purple' : 'indigo'}-600 font-bold`}>
        {role === 'admin' ? 'A' : 'U'}
    </div>;
}