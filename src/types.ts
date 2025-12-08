// src/types.ts

export interface Review {
    id: string;
    userId: string;
    comment: string;
    timestamp: Date;
}

export interface Rating {
    userId: string;
    rating: number;
    timestamp: Date;
}

export interface Book {
    id: string;
    title: string;
    author: string;
    genre: string;
    description: string;
    coverImage: string;
    publishedYear: number;
    isbn?: string;
    createdBy: string;
    createdAt: Date;
    stock: number;
    price?: number;      // 가격 (없으면 기본값 사용)
    ratings: Rating[];
    reviews: Review[];
}

export interface User {
    id: string;
    password?: string;
    role: 'admin' | 'user';
}

export interface Order {
    id: string;
    bookId: string;
    userId: string;
    quantity: number;
    totalPrice: number;
    purchaseDate: Date;
}

// 변경 이력 관리용 (EditHistory)
export interface EditRecord {
    id: string;
    bookId: string;
    timestamp: Date;
    before: Book;
    after: Book;
    changes: {
        field: string;
        oldValue: string;
        newValue: string;
    }[];
}

// 삭제 이력 관리용 (DeleteHistory)
export interface DeleteRecord {
    id: string;
    book: Book;
    timestamp: Date;
}