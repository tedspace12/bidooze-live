import { SubPageShell } from "@/components/miscellaneous/sub-page-shell";
import { AnnouncementsFeed } from "@/components/miscellaneous/announcements/AnnouncementsFeed";
import { Megaphone } from "lucide-react";

export default function AnnouncementsPage() {
  return (
    <SubPageShell
      eyebrow="What's New"
      title="Announcements"
      description="Platform updates, new features, and the product changelog. Know what changed before your next auction."
      icon={Megaphone}
      phase={4}
    >
      <AnnouncementsFeed />
    </SubPageShell>
  );
}
