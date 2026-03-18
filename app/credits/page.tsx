import Nav from "@/components/Nav";
import Link from "next/link";

export default function CreditsPage() {
  const customers = [
    { id: 1, name: "Sofia Müller", email: "sofia@email.com", credits: 14, bookings: 8, attended: 6, lastClass: "Midday Stretch" },
    { id: 2, name: "Jonas Weber", email: "jonas@email.com", credits: 22, bookings: 12, attended: 11, lastClass: "Late Flow" },
    { id: 3, name: "Lena Schmidt", email: "lena@email.com", credits: 8, bookings: 5, attended: 3, lastClass: "Core & Breathe" },
    { id: 4, name: "Max Bauer", email: "max@email.com", credits: 31, bookings: 15, attended: 14, lastClass: "Vinyasa Flow" },
    { id: 5, name: "Anna Klein", email: "anna@email.com", credits: 5, bookings: 3, attended: 2, lastClass: "Morning Flow Yoga" },
    { id: 6, name: "Tim Fischer", email: "tim@email.com", credits: 18, bookings: 9, attended: 8, lastClass: "Late Flow" },
  ];

  const totalCredits = customers.reduce((s, c) => s + c.credits, 0);
  const totalBookings = customers.reduce((s, c) => s + c.bookings, 0);
  const totalAttended = customers.reduce((s, c) => s + c.attended, 0);
  const attendanceRate = Math.round((totalAttended / totalBookings) * 100);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Nav />
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold">Credits Overview</h1>
                <p className="text-zinc-500 mt-1">Zenith Yoga Studio — Customer credit balances</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/yoga/store" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
                  Buy credits
                </Link>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Credits Issued", value: `€${totalCredits}`, color: "text-indigo-600" },
              { label: "Total Bookings", value: totalBookings, color: "text-emerald-600" },
              { label: "Attendance Rate", value: `${attendanceRate}%`, color: "text-amber-600" },
              { label: "Active Customers", value: customers.length, color: "text-rose-600" },
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-zinc-200 rounded-xl p-5">
                <p className="text-zinc-500 text-sm mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-zinc-200">
              <h2 className="font-semibold text-lg">Customer Credits</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200">
                  {["Customer", "Email", "Credits", "Bookings", "Attended", "Last Class"].map((h) => (
                    <th key={h} className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={c.id} className={`border-b border-zinc-200/70 hover:bg-zinc-50 transition ${i === customers.length - 1 ? "border-0" : ""}`}>
                    <td className="px-5 py-4 font-semibold">{c.name}</td>
                    <td className="px-5 py-4 text-zinc-600 text-sm">{c.email}</td>
                    <td className="px-5 py-4">
                      <span className="bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 text-sm px-3 py-1 rounded-full font-semibold">€{c.credits}</span>
                    </td>
                    <td className="px-5 py-4 text-zinc-600">{c.bookings}</td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-semibold ${Math.round((c.attended / c.bookings) * 100) >= 80 ? "text-green-700" : "text-amber-700"}`}>
                        {c.attended} ({Math.round((c.attended / c.bookings) * 100)}%)
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-600 text-sm">{c.lastClass}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
