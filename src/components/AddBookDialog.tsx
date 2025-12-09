import React, { useState, useEffect } from 'react';
import { Book } from '../types'; // types.ts 확인
import { apiFetch } from '../api/client'; // ⭐ apiFetch 임포트
import { X, Sparkles } from 'lucide-react';
import { AIImageGenerator } from './AIImageGenerator';

interface AddBookDialogProps {
    book: Book | null;          // null이면 신규, 있으면 수정
    onClose: () => void;
    onSave: (savedBook: Book) => void; // 저장 완료 후 부모에게 알림
}

export function AddBookDialog({ book, onClose, onSave }: AddBookDialogProps) {
    // 폼 데이터 상태 (구매 시스템에 맞게 stock 추가, genre 통일)
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        genre: '소설',
        description: '',
        coverImage: '',
        publishedYear: new Date().getFullYear(),
        price: 0,
        stock: 50 // 기본 재고 (구매 시스템 필수)
    });

    const [showAIGenerator, setShowAIGenerator] = useState(false);

    // 수정 모드일 때 기존 데이터 채우기
    useEffect(() => {
        if (book) {
            setFormData({
                title: book.title,
                author: book.author,
                genre: book.genre,
                description: book.description,
                coverImage: book.coverImage,
                publishedYear: book.publishedYear,
                price: book.price || 0,
                stock: book.stock
            });
        }
    }, [book]);

    const handleChange = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // ⭐ [API 연동] 저장 버튼 핸들러 (apiFetch 사용)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. URL 및 Method 결정
        const method = book ? "PUT" : "POST";
        const endpoint = book
            ? `/book/${book.id}`  // 수정 (PUT /book/{id})
            : `/book`;            // 등록 (POST /book)

        try {
            // 2. API 호출 (apiFetch 사용)
            // apiFetch가 자동으로 토큰을 붙여주고, 에러 처리도 합니다.
            const result: Book = await apiFetch(endpoint, {
                method,
                body: JSON.stringify(formData)
            });

            // 3. 성공 시 처리
            onSave(result); // App.tsx의 목록 갱신 함수 호출

            alert(book ? "도서가 수정되었습니다." : "도서가 등록되었습니다.");
            onClose();

        } catch (err: any) {
            console.error(err);
            alert(`저장 중 오류가 발생했습니다: ${err.message}`);
        }
    };

    // AI 이미지 적용
    const handleAIGenerate = (url: string) => {
        handleChange("coverImage", url);
        setShowAIGenerator(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold text-gray-900">
                        {book ? "도서 정보 수정" : "신규 도서 등록"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="도서 제목 *" value={formData.title} onChange={(v:any) => handleChange("title", v)} required />
                        <InputField label="저자 *" value={formData.author} onChange={(v:any) => handleChange("author", v)} required />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <SelectField
                            label="장르"
                            value={formData.genre}
                            onChange={(v:any) => handleChange("genre", v)}
                            options={["소설", "SF", "판타지", "미스터리", "로맨스", "자기계발", "에세이", "역사", "과학", "기타"]}
                        />
                        <InputField label="출판년도" type="number" value={formData.publishedYear} onChange={(v:any) => handleChange("publishedYear", Number(v))} />
                        <InputField label="재고 수량" type="number" value={formData.stock} onChange={(v:any) => handleChange("stock", Number(v))} />
                    </div>

                    <InputField label="가격 *" type="number" value={formData.price} onChange={(v:any) => handleChange("price", Number(v))} required placeholder="선택 입력" />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                        <textarea
                            className="w-full px-4 py-2 border rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                        />
                    </div>

                    {/* 표지 이미지 섹션 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">표지 이미지</label>
                        <div className="flex gap-3 items-start">
                            {formData.coverImage ? (
                                <img src={formData.coverImage} className="w-24 h-36 object-cover rounded border" alt="Preview" />
                            ) : (
                                <div className="w-24 h-36 bg-gray-100 rounded border flex items-center justify-center text-gray-400 text-xs">
                                    이미지 없음
                                </div>
                            )}

                            <div className="flex-1 space-y-3">
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="이미지 URL 직접 입력"
                                    value={formData.coverImage}
                                    onChange={(e) => handleChange("coverImage", e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowAIGenerator(true)}
                                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-purple-200 transition-colors"
                                >
                                    <Sparkles className="w-4 h-4" /> AI 표지 생성하기
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">
                            취소
                        </button>
                        <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md">
                            {book ? "수정 완료" : "도서 등록"}
                        </button>
                    </div>
                </form>
            </div>

            {/* AI Generator Popup */}
            {showAIGenerator && (
                <AIImageGenerator
                    bookId={book?.id} // bookId 전달 (수정 시 즉시 저장용)
                    bookTitle={formData.title}
                    bookGenre={formData.genre}
                    onClose={() => setShowAIGenerator(false)}
                    onGenerate={handleAIGenerate}
                />
            )}
        </div>
    );
}

// 하위 컴포넌트들 (타입 적용)
function InputField({ label, value, onChange, type = "text", required = false, placeholder = "" }: any) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required={required}
                placeholder={placeholder}
            />
        </div>
    );
}

function SelectField({ label, value, options, onChange }: any) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
                {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );
}