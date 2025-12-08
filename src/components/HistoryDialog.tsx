import { EditRecord, DeleteRecord } from '../types.tsx';
import { X, RotateCcw, Edit3, Trash2, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface HistoryDialogProps {
    editHistory: EditRecord[];
    deleteHistory: DeleteRecord[];
    onClose: () => void;
    onRestore: (record: DeleteRecord) => void;
}

export function HistoryDialog({ editHistory, deleteHistory, onClose, onRestore }: HistoryDialogProps) {
    const [activeTab, setActiveTab] = useState<'edit' | 'delete'>('edit');

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <RotateCcw className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-gray-900">변경 이력</h2>
                            <p className="text-sm text-gray-500">도서 편집 및 삭제 기록</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('edit')}
                        className={`flex-1 px-6 py-3 text-sm transition-colors relative ${
                            activeTab === 'edit'
                                ? 'text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Edit3 className="w-4 h-4" />
                            <span>편집 기록</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                                activeTab === 'edit' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                {editHistory.length}
              </span>
                        </div>
                        {activeTab === 'edit' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('delete')}
                        className={`flex-1 px-6 py-3 text-sm transition-colors relative ${
                            activeTab === 'delete'
                                ? 'text-red-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            <span>삭제 기록</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                                activeTab === 'delete' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                {deleteHistory.length}
              </span>
                        </div>
                        {activeTab === 'delete' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'edit' && (
                        <div className="space-y-4">
                            {editHistory.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Edit3 className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500">편집 기록이 없습니다</p>
                                </div>
                            ) : (
                                editHistory.map(record => (
                                    <div key={record.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="text-gray-900 mb-1">{record.after.title}</h4>
                                                <p className="text-sm text-gray-500">{formatDate(record.timestamp)}</p>
                                            </div>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        편집됨
                      </span>
                                        </div>

                                        <div className="space-y-2">
                                            {record.changes.map((change, index) => (
                                                <div key={index} className="bg-white rounded p-3 border border-gray-200">
                                                    <div className="text-xs text-gray-600 mb-2">{change.field}</div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <div className="flex-1 bg-red-50 border border-red-200 rounded px-3 py-2">
                                                            <div className="text-xs text-red-600 mb-1">변경 전</div>
                                                            <div className="text-red-700 line-clamp-2">{change.oldValue || '-'}</div>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                        <div className="flex-1 bg-green-50 border border-green-200 rounded px-3 py-2">
                                                            <div className="text-xs text-green-600 mb-1">변경 후</div>
                                                            <div className="text-green-700 line-clamp-2">{change.newValue || '-'}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'delete' && (
                        <div className="space-y-4">
                            {deleteHistory.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Trash2 className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500">삭제 기록이 없습니다</p>
                                </div>
                            ) : (
                                deleteHistory.map(record => (
                                    <div key={record.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-start gap-4">
                                            <img
                                                src={record.book.coverImage}
                                                alt={record.book.title}
                                                className="w-16 h-24 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h4 className="text-gray-900 mb-1">{record.book.title}</h4>
                                                        <p className="text-sm text-gray-600">{record.book.author}</p>
                                                    </div>
                                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                            삭제됨
                          </span>
                                                </div>
                                                <p className="text-sm text-gray-500 mb-3">{formatDate(record.timestamp)}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">장르: {record.book.genre}</span>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-gray-500">출판: {record.book.publishedYear}</span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        onRestore(record);
                                                    }}
                                                    className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                    복원하기
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
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
