import { Link } from "@tanstack/react-router";
import { signOut, useSession } from "@/features/auth/auth-client";

export default function Header() {
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="p-4 flex items-center justify-between bg-gray-800 text-white shadow-lg">
      <h1 className="text-xl font-semibold">
        <Link to="/">NippoNikki</Link>
      </h1>
      <div className="flex items-center gap-4">
        {isPending ? (
          <span className="text-gray-400 text-sm">読み込み中...</span>
        ) : session?.user ? (
          <>
            <span className="text-sm text-gray-300">{session.user.name}</span>
            {session.user.image && (
              <img
                src={session.user.image}
                alt={session.user.name}
                className="w-8 h-8 rounded-full"
              />
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ログアウト
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
          >
            ログイン
          </Link>
        )}
      </div>
    </header>
  );
}
