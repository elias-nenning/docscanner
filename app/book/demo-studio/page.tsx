import Nav from "@/components/Nav";
import PageHeader from "@/components/PageHeader";

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Nav />
      <main className="max-w-4xl mx-auto px-8 py-8">
        <PageHeader
          title="Book a Class"
          subtitle="Demo Studio"
        />
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <p className="text-zinc-600">Select a class to book.</p>
        </div>
      </main>
    </div>
  );
}
