import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { miscService } from "../services/miscService";
import type { CreateLocationPayload } from "@/lib/miscellaneous/types";

const QUERY_KEY = ["miscellaneous", "locations"] as const;

export function useMiscLocations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: QUERY_KEY });

  const locations = useQuery({
    queryKey: QUERY_KEY,
    queryFn: miscService.listLocations,
  });

  const create = useMutation({
    mutationFn: (payload: CreateLocationPayload) => miscService.createLocation(payload),
    onSuccess: () => { invalidate(); toast.success("Location created"); },
    onError: () => toast.error("Failed to create location"),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateLocationPayload> }) =>
      miscService.updateLocation(id, payload),
    onSuccess: () => { invalidate(); toast.success("Location updated"); },
    onError: () => toast.error("Failed to update location"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => miscService.deleteLocation(id),
    onSuccess: () => { invalidate(); toast.success("Location deleted"); },
    onError: () => toast.error("Failed to delete location"),
  });

  return { locations, create, update, remove };
}
