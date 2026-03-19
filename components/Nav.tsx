import Link from "next/link";

export default function Nav({ embedded }: { embedded?: boolean }) {
  return (
    <nav className={`flex items-center justify-between ${embedded ? "px-4 py-0" : "px-8 py-4 border-b border-zinc-200"} bg-white dark:bg-zinc-950 dark:border-zinc-800`}>
      <Link href="/" className="flex items-center gap-2">
        <span className="text-lg">⚡</span>
        <span className="font-bold text-zinc-900 dark:text-white">FlowFill</span>
      </Link>
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white px-4 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition text-sm">
          Dashboard
        </Link>
        <Link href="/credits" className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white px-4 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition text-sm">
          Credits
        </Link>
        <Link href="/yoga/home" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
          Homepage
        </Link>
      </div>
    </nav>
  );
}
