"use client";

export default function LogoutButton() {
    return (
        <form method="POST" action="/api/store/logout">
            <button
                type="submit"
                className="vf-frame vf-focus osd text-sm px-3 py-2 text-osd-dim hover:text-osd cursor-pointer"
            >
                Salir
            </button>
        </form>
    );
}
