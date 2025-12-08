import React, { useState, useEffect } from 'react';
import { X, Sparkles, Wand2, RefreshCw, Palette, Image as ImageIcon, CheckCircle, Key } from 'lucide-react';

interface AIImageGeneratorProps {
    bookId: string;
    bookTitle: string;
    bookGenre: string;
    bookDescription?: string;
    onClose: () => void;
    onGenerate: (imageUrl: string) => void;
}

export function AIImageGenerator({ bookId, bookTitle, bookGenre, bookDescription, onClose, onGenerate }: AIImageGeneratorProps) {
    // ⭐ [수정] API Key를 state로 관리 (초기값은 로컬 스토리지에서 가져옴)
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai_api_key') || '');

    const [prompt, setPrompt] = useState('');
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [activeStyle, setActiveStyle] = useState<'auto' | 'minimalist' | 'fantasy' | 'vintage' | 'modern'>('auto');

    const styleOptions = [
        { id: 'auto' as const, label: '자동', icon: <Sparkles className="w-4 h-4" />, description: 'AI가 알아서 추천' },
        { id: 'minimalist' as const, label: '미니멀', icon: <Palette className="w-4 h-4" />, description: '심플하고 여백의 미' },
        { id: 'fantasy' as const, label: '판타지', icon: <Wand2 className="w-4 h-4" />, description: '몽환적이고 화려함' },
        { id: 'vintage' as const, label: '빈티지', icon: <ImageIcon className="w-4 h-4" />, description: '고전적인 종이 질감' },
        { id: 'modern' as const, label: '모던', icon: <Palette className="w-4 h-4" />, description: '세련된 현대 미술' }
    ];

    // ⭐ [추가] API Key 입력 핸들러 (입력할 때마다 로컬 스토리지에 자동 저장)
    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newKey = e.target.value;
        setApiKey(newKey);
        localStorage.setItem('openai_api_key', newKey);
    };

    const handleGenerate = async () => {
        // ⭐ [체크] 키가 없으면 경고
        if (!apiKey.trim()) {
            alert("상단의 입력창에 OpenAI API Key를 입력해주세요!");
            return;
        }

        setIsGenerating(true);
        setGeneratedImages([]);
        setSelectedImage(null);

        try {
            const basePrompt = `Book cover design for a book titled "${bookTitle}". Genre is ${bookGenre}.`;
            const descPrompt = bookDescription ? `Context: ${bookDescription}.` : "";
            const userPrompt = prompt ? `Additional details: ${prompt}.` : "";
            const stylePrompt = activeStyle !== 'auto' ? `Art style: ${activeStyle}.` : "";

            const finalPrompt = `${basePrompt} ${descPrompt} ${userPrompt} ${stylePrompt} High quality, professional book cover design, no text overlay.`;

            const response = await fetch("https://api.openai.com/v1/images/generations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // ⭐ [수정] 입력받은 apiKey 사용
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "dall-e-3",
                    prompt: finalPrompt,
                    n: 1,
                    size: "1024x1024",
                    quality: "standard",
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                // API 키 오류일 경우 명확하게 알려줌
                if (response.status === 401) {
                    throw new Error("API Key가 올바르지 않습니다. 키를 확인해주세요.");
                }
                throw new Error(errorData.error?.message || "이미지 생성 실패");
            }

            const data = await response.json();
            const imageUrl = data.data[0].url;
            setGeneratedImages([imageUrl]);

        } catch (error: any) {
            console.error("OpenAI API Error:", error);
            alert(`오류 발생: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUseImage = async () => {
        if (!selectedImage) return;

        try {
            const response = await fetch(`http://localhost:8080/api/book/${bookId}/cover`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ coverImage: selectedImage })
            });

            if (!response.ok) {
                throw new Error("서버 저장 실패");
            }

            onGenerate(selectedImage);
            onClose();
            alert("표지가 성공적으로 적용되었습니다!");

        } catch (error) {
            console.error("표지 저장 오류:", error);
            alert("표지 저장 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">AI 표지 생성기</h2>
                            <p className="text-sm text-purple-100">GPT-4(DALL-E 3)가 책 내용을 분석해 표지를 디자인합니다</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">

                    {/* ⭐ [추가] API Key Input Section */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                        <label className="block text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
                            <Key className="w-4 h-4" /> OpenAI API Key 입력
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={handleApiKeyChange}
                            placeholder="sk-..."
                            className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-sm bg-white"
                        />
                        <p className="text-xs text-yellow-600 mt-2">
                            * 입력한 키는 브라우저에 안전하게 저장되며 서버로 전송되지 않습니다.
                        </p>
                    </div>

                    {/* Book Info Summary */}
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-6 flex gap-4 items-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                            <Wand2 className="w-6 h-6"/>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">{bookTitle}</h3>
                            <p className="text-sm text-gray-600">{bookGenre} {bookDescription && `· ${bookDescription.slice(0, 30)}...`}</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="mb-6 space-y-4">
                        {/* Style Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">디자인 스타일</label>
                            <div className="grid grid-cols-5 gap-2">
                                {styleOptions.map((style) => (
                                    <button
                                        key={style.id}
                                        onClick={() => setActiveStyle(style.id)}
                                        className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-2 ${
                                            activeStyle === style.id
                                                ? 'border-purple-600 bg-purple-50 text-purple-700 ring-1 ring-purple-600'
                                                : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                        }`}
                                    >
                                        {style.icon}
                                        <span className="text-xs font-medium">{style.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Prompt Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">추가 요청사항 (선택)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="예: 어두운 분위기, 달이 떠있는 배경, 고양이 한 마리..."
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !isGenerating) handleGenerate(); }}
                                />
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                                >
                                    {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5"/>}
                                    {isGenerating ? '생성 중...' : '이미지 생성'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Result Area */}
                    <div className="border-t pt-6">
                        <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-purple-600"/> 생성 결과
                        </h3>

                        {generatedImages.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center">
                                {generatedImages.map((imageUrl, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setSelectedImage(imageUrl)}
                                        className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                                            selectedImage === imageUrl ? 'border-purple-600 ring-2 ring-purple-200 shadow-xl' : 'border-gray-200 hover:border-purple-300'
                                        }`}
                                    >
                                        <img src={imageUrl} alt="Generated Cover" className="w-full h-auto object-cover" />

                                        {/* Selection Overlay */}
                                        <div className={`absolute inset-0 bg-purple-900/20 flex items-center justify-center transition-opacity ${selectedImage === imageUrl ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                            {selectedImage === imageUrl && (
                                                <div className="bg-white text-purple-600 px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                                                    <CheckCircle className="w-5 h-5"/> 선택됨
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    {isGenerating ? <RefreshCw className="w-8 h-8 text-purple-500 animate-spin"/> : <Sparkles className="w-8 h-8 text-gray-300"/>}
                                </div>
                                <p className="text-gray-500 font-medium">
                                    {isGenerating ? "AI가 책의 내용을 분석하여 표지를 그리고 있습니다..." : "상단에 API Key를 입력하고 생성 버튼을 눌러주세요."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3 sticky bottom-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                    >
                        닫기
                    </button>
                    <button
                        onClick={handleUseImage}
                        disabled={!selectedImage}
                        className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    >
                        이 표지로 저장하기
                    </button>
                </div>
            </div>
        </div>
    );
}