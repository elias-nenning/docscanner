"use client";

import { useMemo, useState } from "react";

export default function YogaCommunityPage() {
  const [query, setQuery] = useState("");
  const [friends, setFriends] = useState<Array<{ id: string; name: string; handle: string }>>([
    { id: "1", name: "Maya Chen", handle: "@mayachen" },
    { id: "2", name: "Priya Nair", handle: "@priyanair" },
    { id: "3", name: "Leo Santos", handle: "@leosantos" },
  ]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) => `${f.name} ${f.handle}`.toLowerCase().includes(q));
  }, [query, friends]);

  function addFriend() {
    const q = query.trim();
    if (!q) return;
    const handle = q.startsWith("@") ? q : `@${q.replace(/\s+/g, "").toLowerCase()}`;
    const name = q.replace(/^@/, "").split(" ").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
    setFriends((prev) => [{ id: String(Date.now()), name, handle }, ...prev]);
    setQuery("");
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Community</h1>
          <p className="text-sm text-zinc-600 mt-1">See your friends or add new ones.</p>
        </div>
        <div className="text-sm font-semibold bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl text-zinc-700">{friends.length} friends</div>
      </div>

      <div className="mt-5 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search or add by handle (e.g. @maya)"
          className="flex-1 border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <button onClick={addFriend} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-sm font-semibold">
          Add
        </button>
      </div>

      <div className="mt-4 divide-y divide-zinc-100 border border-zinc-200 rounded-2xl overflow-hidden">
        {filtered.map((f) => (
          <div key={f.id} className="flex items-center justify-between px-4 py-3 bg-white">
            <div className="min-w-0">
              <div className="font-semibold text-zinc-900 truncate">{f.name}</div>
              <div className="text-xs text-zinc-500">{f.handle}</div>
            </div>
            <button className="text-sm font-semibold text-zinc-700 hover:text-zinc-900" onClick={() => setFriends((prev) => prev.filter((x) => x.id !== f.id))}>
              Remove
            </button>
          </div>
        ))}
        {filtered.length === 0 ? <div className="px-4 py-6 text-sm text-zinc-600 bg-zinc-50">No matches.</div> : null}
      </div>
    </div>
  );
}
