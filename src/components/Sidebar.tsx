import { Book } from '../types.tsx';
import { BarChart3, Filter, X, BookMarked, TrendingUp, ChevronDown, PackageCheck, PackageX, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

export interface User {
    id: string;
    password: string;
    role: 'admin' | 'user';
}

interface SidebarProps {
    books: Book[];
    currentUser: User | null;
    isOpen: boolean;
    selectedGenre: string;
    sortBy: 'title' | 'year' | 'author';
    onGenreChange: (genre: string) => void;
    onSortChange: (sort: 'title' | 'year' | 'author') => void;
    onClose: () => void;
}

export function Sidebar({
                            books,
                            currentUser,
                            isOpen,
                            selectedGenre,
                            onGenreChange,
                            onClose
                        }: SidebarProps) {
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isDistributionOpen, setIsDistributionOpen] = useState(false);
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [isInventoryStatsOpen, setIsInventoryStatsOpen] = useState(false);


    // Calculate inventory statistics
    const inventoryStats = useMemo(() => {
        const totalStock = books.reduce((sum, book) => sum + (book.stock || 0), 0);
        const booksInStock = books.filter(book => (book.stock || 0) > 0).length;
        const booksOutOfStock = books.filter(book => (book.stock || 0) === 0).length;
        const lowStockBooks = books.filter(book => (book.stock || 0) > 0 && (book.stock || 0) <= 3).length;

        return {
            totalStock,
            booksInStock,
            booksOutOfStock,
            lowStockBooks
        };
    }, [books]);

    // Calculate statistics
    const stats = useMemo(() => {
        const genreCounts: Record<string, number> = {};
        const genreRatings: Record<string, number[]> = {};
        let totalBooks = books.length;

        books.forEach(book => {
            genreCounts[book.genre] = (genreCounts[book.genre] || 0) + 1;

            // Collect all ratings for each genre
            if (!genreRatings[book.genre]) {
                genreRatings[book.genre] = [];
            }
            book.ratings.forEach(r => {
                genreRatings[book.genre].push(r.rating);
            });
        });

        // Calculate average rating and sort genres by rating
        const genreRatingData = Object.entries(genreRatings)
            .map(([genre, ratings]) => {
                if (ratings.length === 0) {
                    return { genre, average: 0, ratings: [], hasRatings: false };
                }
                const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
                return { genre, average, ratings, hasRatings: true };
            })
            .sort((a, b) => {
                // If both have no ratings, maintain order
                if (!a.hasRatings && !b.hasRatings) return 0;
                // If only one has no ratings, the one with ratings comes first
                if (!a.hasRatings) return 1;
                if (!b.hasRatings) return -1;

                // If averages are different, sort by average
                if (Math.abs(a.average - b.average) > 0.001) {
                    return b.average - a.average;
                }

                // If averages are the same, compare by higher ratings count
                // Count ratings >= 4 (high ratings)
                const aHighRatings = a.ratings.filter(r => r >= 4).length;
                const bHighRatings = b.ratings.filter(r => r >= 4).length;

                if (aHighRatings !== bHighRatings) {
                    return bHighRatings - aHighRatings;
                }

                // If still tied, count ratings = 5
                const aFiveStars = a.ratings.filter(r => r === 5).length;
                const bFiveStars = b.ratings.filter(r => r === 5).length;

                return bFiveStars - aFiveStars;
            });

        const sortedGenres = Object.entries(genreCounts)
            .sort((a, b) => b[1] - a[1]);

        // Get top 3 genres by rating
        const topGenresByRating = genreRatingData
            .filter(g => g.hasRatings)
            .slice(0, 3);

        return {
            totalBooks,
            genreCounts: sortedGenres,
            topGenresByRating
        };
    }, [books]);

    const genres = ['전체', '소설', 'SF', '판타지', '미스터리', '로맨스', '자기계발', '에세이', '역사', '과학', '기타'];

    return (
        <>
            {/* Overlay - Only for closing sidebar when clicking outside */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 mt-[64px]"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-[64px] left-0 h-[calc(100vh-64px)] bg-white border-r border-gray-200 shadow-xl transition-transform duration-300 z-40 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } w-80 flex flex-col`}
            >
                {/* Sidebar Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-blue-600" />
                        <h2 className="text-gray-900">필터</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Statistics */}
                    <div>
                        <button
                            onClick={() => setIsStatsOpen(!isStatsOpen)}
                            className="w-full flex items-center justify-between mb-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-blue-600" />
                                <h3 className="text-sm text-gray-700">통계</h3>
                            </div>
                            <ChevronDown
                                className={`w-4 h-4 text-gray-500 transition-transform ${
                                    isStatsOpen ? 'rotate-180' : ''
                                }`}
                            />
                        </button>
                        <div
                            className={`space-y-3 overflow-hidden transition-all duration-300 ${
                                isStatsOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                        >
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-blue-700">전체 도서</span>
                                    <BookMarked className="w-4 h-4 text-blue-600" />
                                </div>
                                <p className="text-blue-900">{stats.totalBooks}권</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-purple-700">인기 장르 (평점순)</span>
                                    <TrendingUp className="w-4 h-4 text-purple-600" />
                                </div>
                                <div className="space-y-1">
                                    {stats.topGenresByRating.length > 0 ? (
                                        <>
                                            {stats.topGenresByRating[0] && (
                                                <p className="text-sm text-purple-900">
                                                    1위: {stats.topGenresByRating[0].genre} (⭐ {stats.topGenresByRating[0].average.toFixed(1)})
                                                </p>
                                            )}
                                            {stats.topGenresByRating[1] && (
                                                <p className="text-sm text-purple-800">
                                                    2위: {stats.topGenresByRating[1].genre} (⭐ {stats.topGenresByRating[1].average.toFixed(1)})
                                                </p>
                                            )}
                                            {stats.topGenresByRating[2] && (
                                                <p className="text-sm text-purple-700">
                                                    3위: {stats.topGenresByRating[2].genre} (⭐ {stats.topGenresByRating[2].average.toFixed(1)})
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm text-purple-700">평점 데이터 없음</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inventory Statistics */}
                    {currentUser?.role === 'admin' && (
                        <div>
                            <button
                                onClick={() => setIsInventoryStatsOpen(!isInventoryStatsOpen)}
                                className="w-full flex items-center justify-between mb-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-blue-600" />
                                    <h3 className="text-sm text-gray-700">재고 통계</h3>
                                </div>
                                <ChevronDown
                                    className={`w-4 h-4 text-gray-500 transition-transform ${
                                        isInventoryStatsOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            <div
                                className={`space-y-3 overflow-hidden transition-all duration-300 ${
                                    isInventoryStatsOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
                                }`}
                            >
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-green-700">재고 있는 도서</span>
                                        <PackageCheck className="w-4 h-4 text-green-600" />
                                    </div>
                                    <p className="text-green-900">{inventoryStats.booksInStock}권</p>
                                </div>

                                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-red-700">재고 부족 도서</span>
                                        <PackageX className="w-4 h-4 text-red-600" />
                                    </div>
                                    <p className="text-red-900">{inventoryStats.lowStockBooks}권</p>
                                </div>

                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-gray-700">재고 없음 도서</span>
                                        <AlertCircle className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <p className="text-gray-900">{inventoryStats.booksOutOfStock}권</p>
                                </div>

                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-blue-700">총 재고</span>
                                        <Clock className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <p className="text-blue-900">{inventoryStats.totalStock}권</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Genre Distribution */}
                    {stats.genreCounts.length > 0 && (
                        <div>
                            <button
                                onClick={() => setIsDistributionOpen(!isDistributionOpen)}
                                className="w-full flex items-center justify-between mb-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-blue-600" />
                                    <h3 className="text-sm text-gray-700">장르별 분포</h3>
                                </div>
                                <ChevronDown
                                    className={`w-4 h-4 text-gray-500 transition-transform ${
                                        isDistributionOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            <div
                                className={`space-y-2 overflow-hidden transition-all duration-300 ${
                                    isDistributionOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
                                }`}
                            >
                                {stats.genreCounts.slice(0, 5).map(([genre, count]) => {
                                    const percentage = (count / stats.totalBooks) * 100;
                                    return (
                                        <div key={genre}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-gray-600">{genre}</span>
                                                <span className="text-xs text-gray-500">{count}권</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Category Filter */}
                    <div>
                        <button
                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                            className="w-full flex items-center justify-between mb-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-blue-600" />
                                <h3 className="text-sm text-gray-700">카테고리</h3>
                            </div>
                            <ChevronDown
                                className={`w-4 h-4 text-gray-500 transition-transform ${
                                    isCategoryOpen ? 'rotate-180' : ''
                                }`}
                            />
                        </button>
                        <div
                            className={`space-y-1 overflow-y-auto transition-all duration-300 ${
                                isCategoryOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                        >
                            {genres.map(genre => {
                                const count = genre === '전체'
                                    ? books.length
                                    : books.filter(b => b.genre === genre).length;

                                return (
                                    <button
                                        key={genre}
                                        onClick={() => onGenreChange(genre)}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all ${
                                            selectedGenre === genre
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        <span className="text-sm">{genre}</span>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full ${
                                                selectedGenre === genre
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200 text-gray-600'
                                            }`}
                                        >
                      {count}
                    </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}