/** Se vuelve a montar en cada navegación: la pantalla nueva entra haciendo foco (ver .admin-focus). */
export default function AdminTemplate({ children }: { children: React.ReactNode }) {
    return <div className="admin-focus">{children}</div>;
}
