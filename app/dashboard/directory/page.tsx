"use client";

import { useRouter } from "next/navigation";
import { StudioDirectoryTile } from "@/components/yoga/StudioDirectoryTile";
import { StudiosDataRibbon } from "@/components/yoga/StudiosDataRibbon";
import { useStudiosForUi } from "@/hooks/use-studios-for-ui";

export default function OperatorDirectoryPage() {
  const router = useRouter();
  const { studios, loading, error, source } = useStudiosForUi();

  return (
    <div className="space-y-6">
      <StudiosDataRibbon loading={loading} error={error} source={source} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {studios.map((s) => (
          <StudioDirectoryTile
            key={s.id}
            studio={s}
            layout="menu"
            onSelect={() => router.push(`/yoga/schedule?studio=${encodeURIComponent(s.id)}`)}
          />
        ))}
      </div>
    </div>
  );
}
