import React, { useState } from "react";
import { AlertCircle, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SignUpScreen() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const res = await fetch("http://localhost:8080/user/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                setError(data?.["Error Message"] ?? "회원가입에 실패했습니다.");
                return;
            }

            setSuccess("회원가입이 완료되었습니다!");
            setTimeout(() => {
                navigate("/login"); // 로그인 화면으로 이동
            }, 1200);

        } catch (err) {
            console.error(err);
            setError("서버 연결에 실패했습니다.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    회원가입
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-700 mb-1">
                            이름
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError("");
                            }}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="이름을 입력하세요"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-1">
                            이메일
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError("");
                            }}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="이메일을 입력하세요"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-1">
                            비밀번호
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError("");
                            }}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center text-green-600">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 shadow-md"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span>회원가입</span>
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    이미 계정이 있으신가요?{" "}
                    <button
                        className="text-purple-600 hover:underline"
                        onClick={() => navigate("/login")}
                    >
                        로그인
                    </button>
                </p>
            </div>
        </div>
    );
}
