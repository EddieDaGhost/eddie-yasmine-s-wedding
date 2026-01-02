import { Link } from "react-router-dom";
import { useAdminAuth } from "../contexts/AdminAuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAdminAuth();

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-6">
        <h2 className="text-xl font-bold mb-8">Admin</h2>

        <nav className="flex flex-col gap-4">
          <Link to="/admin" className="hover:text-gray-300">Dashboard</Link>
          <Link to="/admin/rsvps" className="hover:text-gray-300">RSVPs</Link>
          <Link to="/admin/guestbook" className="hover:text-gray-300">Guestbook</Link>
          <Link to="/admin/photos" className="hover:text-gray-300">Photos</Link>
          <Link to="/admin/content" className="hover:text-gray-300">Content</Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-y-auto">

        {/* Header */}
        <header className="w-full bg-white border-b px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>

          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">
              {user?.email}
            </span>

            <button
              onClick={logout}
              className="px-3 py-1 text-sm bg-gray-900 text-white rounded hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="p-8">
          {children}
        </div>

      </main>
    </div>
  );
}