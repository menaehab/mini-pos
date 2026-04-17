/* eslint-disable */
import { lang } from '@erag/lang-sync-inertia/react';
import { Head, useForm } from '@inertiajs/react';
export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const { __ } = lang();

    return (
        <>
            <div className="flex h-screen w-full">
                <Head title="تسجيل الدخول - SOLVEX" />

                {/* Left Side: Branding Section */}
                <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-t from-[#000000] to-[#404040] lg:flex lg:w-4/5">
                    <div className="pointer-events-none absolute -bottom-20 -left-20 h-[500px] w-[500px] opacity-40">
                        <svg
                            viewBox="0 0 500 500"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-full w-full"
                        >
                            {/* الدائرة الداخلية */}
                            <circle
                                cx="130"
                                cy="350"
                                r="180"
                                stroke="white"
                                strokeWidth="1.8"
                                fill="none"
                                opacity="1.7"
                            />
                            <circle
                                cx="200"
                                cy="350"
                                r="160"
                                stroke="white"
                                strokeWidth="1.8"
                                fill="none"
                                opacity="1.7"
                            />
                        </svg>
                    </div>
                    <div className="z-10 p-8 text-center">
                        {/* Logo Section */}
                        <div className="mb-6 flex flex-col items-center">
                            <img
                                src="logo_1.png"
                                alt="logo"
                                width="480px"
                                height="159"
                            />
                        </div>

                        {/* Slogan */}
                        <h2 className="mt-3 text-4xl font-light leading-relaxed text-white">
                            خلّي البيع يمشي صح وبسهولة
                        </h2>
                    </div>
                </div>

                {/* Right Side: Form Section */}
                <div className="flex w-full flex-col items-center justify-center bg-white px-8 md:px-16 lg:w-1/2">
                    <div className="w-full max-w-md">
                        {/* Greeting Header */}
                        <div className="mx-2 mb-12 text-start" dir="rtl">
                            <h3 className="mb-2 text-3xl font-bold text-gray-900">
                                نورتنا تاني
                            </h3>
                            <p className="text-start text-gray-500">
                                رجوعك فرّحنا
                            </p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={submit} className="space-y-6" dir="rtl">
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    autoComplete="username"
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    } // تحديث البيانات
                                    placeholder="عنوان البريد الإلكتروني"
                                    className="w-full rounded-full border border-gray-100 bg-gray-50 px-5 py-4 pr-12 transition-all focus:outline-none focus:ring-2 focus:ring-black"
                                    required
                                />
                                <span className="absolute inset-y-0 right-4 flex items-center text-gray-400">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                </span>
                                {/* error message */}
                                {errors.email && (
                                    <div className="mr-4 mt-1 text-xs text-red-500">
                                        {errors.email}
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <input
                                    type="password"
                                    name="password"
                                    value={data.password} // ربط القيمة
                                    autoComplete="current-password"
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    } // تحديث البيانات
                                    placeholder="كلمة المرور"
                                    className="w-full rounded-full border border-gray-100 bg-gray-50 px-5 py-4 pr-12 transition-all focus:outline-none focus:ring-2 focus:ring-black"
                                    required
                                />
                                <span className="absolute inset-y-0 right-4 flex items-center text-gray-400">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                </span>
                                {/* error message */}
                                {errors.password && (
                                    <div className="mr-4 mt-1 text-xs text-red-500">
                                        {errors.password}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className={`w-full rounded-full bg-black py-4 text-lg font-bold text-white shadow-lg transition-colors hover:bg-gray-800 ${processing ? 'cursor-not-allowed opacity-50' : ''}`}
                            >
                                {processing
                                    ? 'جاري تسجيل الدخول...'
                                    : 'تسجيل الدخول'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
