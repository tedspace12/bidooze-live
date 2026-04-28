import { MiscTabNav } from "@/components/miscellaneous/misc-tab-nav";
import { MiscSearchProvider } from "@/components/miscellaneous/misc-search";

export default function MiscellaneousLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MiscSearchProvider>
      <div className="flex min-h-full flex-col -mx-3 -mb-3 sm:-mx-4 sm:-mb-4 md:-mx-6 md:-mb-6">
        <MiscTabNav />
        <div className="flex-1">{children}</div>
      </div>
    </MiscSearchProvider>
  );
}
