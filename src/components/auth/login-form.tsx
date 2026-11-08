'use client';

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Loader2, ArrowRight, Eye, EyeClosed } from "lucide-react";

export default function LoginForm() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState<boolean>(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		const formData = new FormData(e.currentTarget);
		const username = formData.get("username") as string;
		const password = formData.get("password") as string;

		try {
			const result = await signIn("credentials", {
				username: username.toLowerCase().trim(),
				password,
				redirect: false,
			});

			if (result?.error) {
				setError(result.code === "rate_limited"
					? "Demasiados intentos fallidos. Probá de nuevo en 15 minutos."
					: "Usuario o contraseña incorrectos");
				setIsLoading(false);
				return;
			}

			router.push("/admin/orders");
			router.refresh();
		} catch (err) {
			setError("Error de conexión. Inténtalo de nuevo.");
			setIsLoading(false);
		}
	};

	// LoginForm
	const labelClasses = "text-xs font-bold text-zinc-600 uppercase tracking-[0.2em] mb-2 ml-1 block";
	const inputClasses = "w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-base transition-all outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 disabled:bg-zinc-50 placeholder:text-zinc-400 text-zinc-900";
	const buttonClasses = "w-full bg-zinc-900 text-white py-3.5 rounded-xl text-base font-bold hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm";

	return (
		<div className="bg-white p-8 md:p-10 rounded-3xl border border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
			{/* Header */}
			<header className="mb-10 flex flex-col items-center text-center">
				{/* eslint-disable-next-line @next/next/no-img-element -- logo fijo de /public */}
				<img src="/icon-192.png" alt="" width={48} height={48} className="mb-4" />
				<h1 className="text-3xl text-zinc-900">
					Projaska
				</h1>
				<p className="text-xs uppercase text-zinc-500 mt-1">Panel de gestión</p>
			</header>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Username */}
				<div className="flex flex-col">
					<label htmlFor="username" className={labelClasses}>Usuario</label>
					<input
						id="username"
						name="username"
						type="text"
						required
						autoComplete="username"
						placeholder="Nombre de usuario"
						disabled={isLoading}
						className={inputClasses}
					/>
				</div>

				{/* Password */}
				<div className="flex flex-col">
					<div className="flex justify-between items-end mb-2 px-1">
						<label htmlFor="password" className="text-xs font-bold text-zinc-600 uppercase tracking-[0.2em]">
							Contraseña
						</label>
					</div>
					<div className="relative">
						<input
							id="password"
							name="password"
							type={!showPassword ? "password" : "text"}
							required
							autoComplete="current-password"
							placeholder="••••••••"
							disabled={isLoading}
							className={inputClasses}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
							aria-pressed={showPassword}
							className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 inline-flex items-center justify-center text-zinc-500 hover:text-zinc-900 cursor-pointer"
						>
							{showPassword ? <Eye size={22} aria-hidden="true" /> : <EyeClosed size={22} aria-hidden="true" />}
						</button>
					</div>
				</div>

				{/* Error */}
				{error && (
					<div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm font-medium text-center animate-in fade-in zoom-in-95">
						{error}
					</div>
				)}

				{/* Submit */}
				<button type="submit" disabled={isLoading} className={buttonClasses}>
					{isLoading ? (
						<Loader2 className="w-5 h-5 animate-spin" />
					) : (
						<>
							Entrar
							<ArrowRight className="w-5 h-5" />
						</>
					)}
				</button>
			</form>

			{/* Footer */}
			<footer className="mt-10 pt-6 border-t border-zinc-100 text-center">
				<p className="text-xs text-zinc-400 uppercase tracking-widest font-medium">
					Cuarzo Studio
				</p>
			</footer>
		</div>
	);
}