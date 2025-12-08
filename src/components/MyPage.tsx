import React, { useState } from 'react';
import { User, Book, Order } from '../types'; // types.ts에서 타입 가져오기
import { X, BookOpen, ShoppingBag, Calendar, CheckCircle, Edit2, Trash2, Key, AlertCircle } from 'lucide-react';

interface MyPageProps {
    user: User;
    books: Book[];      // 내가 등록한 책 (관리자용)
    allBooks: Book[];   // 전체 책 (구매 내역에서 책 정보 찾기용)
    orders: Order[];    // ⭐ 구매 내역 데이터
    onClose: () => void;
    onPasswordChange: (newPassword: string) => void;
    onEditBook: (book: Book) => void;
    onDeleteBook: (id: string) => void;
}

export function MyPage({ user, books, allBooks, orders, onClose, onPasswordChange, onEditBook, onDeleteBook }: MyPageProps) {
    // 탭 상태 관리 ('info': 내 정보, 'orders': 구매 내역, 'admin': 등록 도서)
    const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'admin'>('info');

    // 비밀번호 변경 관련 State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // ⭐ [핵심 로직] 내 주문 내역만 필터링하고, 최신순으로 정렬
    const myOrders = orders
        .filter(o => o.userId === user.id)
        .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

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
                        {user.role === 'admin' && (
                            <MenuButton
                                active={activeTab === 'admin'}
                                onClick={() => setActiveTab('admin')}
                                icon={<BookOpen className="w-4 h-4"/>}
                                label="도서 관리"
                            />
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-8 overflow-y-auto bg-white">
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
                                            <CheckCircle className="w-4 h-4" /> 비밀번호가 변경되었습니다.
                                        </div>
                                    )}
                                    <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
                                        변경하기
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* 2. ⭐ 구매 내역 탭 (여기가 핵심!) */}
                        {activeTab === 'orders' && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <ShoppingBag className="w-5 h-5 text-indigo-600"/>
                                        구매 내역 <span className="text-gray-400 text-sm font-normal">({myOrders.length}건)</span>
                                    </h3>
                                </div>

                                {myOrders.length === 0 ? (
                                    <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                        <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500">아직 구매한 도서가 없습니다.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {myOrders.map(order => {
                                            // 주문 정보에 있는 bookId로 전체 책 목록에서 책 정보를 찾아옴
                                            const bookInfo = allBooks.find(b => b.id === order.bookId);

                                            return (
                                                <div key={order.id} className="flex gap-5 p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                                                    {/* 책 이미지 */}
                                                    <div className="w-20 h-28 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border">
                                                        <img
                                                            src={bookInfo ? bookInfo.coverImage : 'https://via.placeholder.com/150?text=Deleted'}
                                                            alt="cover"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    {/* 주문 정보 */}
                                                    <div className="flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex justify-between items-start">
                                                                <h4 className="text-lg font-bold text-gray-900 line-clamp-1">
                                                                    {bookInfo ? bookInfo.title : '(삭제된 도서입니다)'}
                                                                </h4>
                                                                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200 flex items-center gap-1">
                                                                    <CheckCircle className="w-3 h-3" /> 구매확정
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
                                                                <span>주문번호: {order.id.slice(0, 8)}...</span>
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

                        {/* 3. 관리자용: 도서 관리 탭 */}
                        {activeTab === 'admin' && user.role === 'admin' && (
                            <div>
                                <h3 className="text-lg font-bold mb-6">등록 도서 관리</h3>
                                <div className="grid gap-3">
                                    {books.map(book => (
                                        <div key={book.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                                            <div className="flex items-center gap-3">
                                                <img src={book.coverImage} className="w-10 h-14 object-cover rounded bg-gray-100" />
                                                <div>
                                                    <div className="font-bold">{book.title}</div>
                                                    <div className="text-xs text-gray-500">재고: {book.stock}권</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => onEditBook(book)} className="p-2 text-gray-500 hover:bg-gray-100 rounded"><Edit2 className="w-4 h-4"/></button>
                                                <button onClick={() => { if(confirm('삭제?')) onDeleteBook(book.id) }} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- 하위 컴포넌트 (깔끔한 코드를 위해 분리) ---

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
    // 그냥 아이콘 감싸개용
    return <div className={`text-${role === 'admin' ? 'purple' : 'indigo'}-600 font-bold`}>
        {role === 'admin' ? 'A' : 'U'}
    </div>;
}