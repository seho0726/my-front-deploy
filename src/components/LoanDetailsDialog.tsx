import { Book } from '../types.tsx';
import { X, User, Calendar, AlertCircle, Clock } from 'lucide-react';

interface LoanDetailsDialogProps {
    book: Book;
    loans: Loan[];
    onClose: () => void;
}

export function LoanDetailsDialog({ book, loans, onClose }: LoanDetailsDialogProps) {
    // Filter active loans for this book
    const activeLoans = loans.filter(l => l.bookId === book.id && !l.returnDate);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatShortDate = (date: string) => {
        return new Date(date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const isOverdue = (dueDate: string) => {
        return new Date(dueDate) < new Date();
    };

    const getDaysRemaining = (dueDate: string) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded shadow-sm"
                        />
                        <div>
                            <h2 className="text-gray-900">{book.title}</h2>
                            <p className="text-sm text-gray-500">{book.author}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Stats */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">총 재고</p>
                            <p className="text-xl text-gray-900">{book.stock}권</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">대출 중</p>
                            <p className="text-xl text-orange-600">{activeLoans.length}권</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">잔여</p>
                            <p className={`text-xl ${
                                book.stock - activeLoans.length === 0
                                    ? 'text-red-600'
                                    : book.stock - activeLoans.length <= 2
                                        ? 'text-yellow-600'
                                        : 'text-green-600'
                            }`}>
                                {book.stock - activeLoans.length}권np
                            </p>
                        </div>
                    </div>
                </div>

                {/* Loan List */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {activeLoans.length === 0 ? (
                        <div className="text-center py-12">
                            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">현재 대출 중인 도서가 없습니다</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeLoans.map((loan, index) => {
                                const overdue = isOverdue(loan.dueDate);
                                const daysRemaining = getDaysRemaining(loan.dueDate);

                                return (
                                    <div
                                        key={loan.id}
                                        className={`p-4 rounded-lg border-2 transition-colors ${
                                            overdue
                                                ? 'bg-red-50 border-red-300'
                                                : daysRemaining <= 2
                                                    ? 'bg-yellow-50 border-yellow-300'
                                                    : 'bg-white border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                    overdue
                                                        ? 'bg-red-100'
                                                        : daysRemaining <= 2
                                                            ? 'bg-yellow-100'
                                                            : 'bg-blue-100'
                                                }`}>
                                                    <User className={`w-5 h-5 ${
                                                        overdue
                                                            ? 'text-red-600'
                                                            : daysRemaining <= 2
                                                                ? 'text-yellow-600'
                                                                : 'text-blue-600'
                                                    }`} />
                                                </div>
                                                <div>
                                                    <p className="text-gray-900">{loan.userId}</p>
                                                    <p className="text-sm text-gray-500">대출자 #{index + 1}</p>
                                                </div>
                                            </div>
                                            {overdue && (
                                                <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span>연체</span>
                                                </div>
                                            )}
                                            {!overdue && daysRemaining <= 2 && (
                                                <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span>반납 임박</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-start gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400 mt-1" />
                                                <div>
                                                    <p className="text-xs text-gray-500">대출일</p>
                                                    <p className="text-sm text-gray-900">{formatShortDate(loan.loanDate)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400 mt-1" />
                                                <div>
                                                    <p className="text-xs text-gray-500">반납예정일</p>
                                                    <p className={`text-sm ${
                                                        overdue
                                                            ? 'text-red-600'
                                                            : daysRemaining <= 2
                                                                ? 'text-yellow-600'
                                                                : 'text-gray-900'
                                                    }`}>
                                                        {formatShortDate(loan.dueDate)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {!overdue && (
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-gray-600">반납까지</p>
                                                    <p className={`text-sm ${
                                                        daysRemaining <= 2 ? 'text-yellow-600' : 'text-gray-900'
                                                    }`}>
                                                        {daysRemaining === 0 ? '오늘' : `${daysRemaining}일 남음`}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {overdue && (
                                            <div className="mt-3 pt-3 border-t border-red-200">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-red-600">연체 기간</p>
                                                    <p className="text-sm text-red-600">
                                                        {Math.abs(daysRemaining)}일 연체
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {loan.extensionCount > 0 && (
                                            <div className="mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded">
                          <Clock className="w-3 h-3" />
                          연장됨 ({loan.extensionCount}회)
                        </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                    <p className="text-sm text-gray-600">
                        총 {activeLoans.length}건의 대출
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
