import { SubPageShell } from "@/components/miscellaneous/sub-page-shell";
import { LocationsList } from "@/components/miscellaneous/locations/LocationsList";
import { MapPin } from "lucide-react";

export default function LocationsPage() {
  return (
    <SubPageShell
      eyebrow="Venues & Addresses"
      title="Locations"
      description="Reusable addresses for auction sites, pickup points, warehouses, and galleries. Auctions reference these by ID instead of re-entering addresses."
      icon={MapPin}
      phase={3}
    >
      <LocationsList />
    </SubPageShell>
  );
}
