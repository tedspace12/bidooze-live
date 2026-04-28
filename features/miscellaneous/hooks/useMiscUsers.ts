import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { miscService } from "../services/miscService";
import type { User, InviteUserPayload } from "@/lib/miscellaneous/types";

const QUERY_KEY = ["miscellaneous", "users"] as const;

type UpdatePayload = Partial<Pick<User, "role" | "custom_permissions" | "auction_access" | "is_active">>;

export function useMiscUsers() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: QUERY_KEY });

  const users = useQuery({
    queryKey: QUERY_KEY,
    queryFn: miscService.listUsers,
  });

  const invite = useMutation({
    mutationFn: (payload: InviteUserPayload) => miscService.inviteUser(payload),
    onSuccess: () => { invalidate(); toast.success("Invitation sent"); },
    onError: () => toast.error("Failed to send invitation"),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePayload }) =>
      miscService.updateUser(id, payload),
    onSuccess: () => { invalidate(); toast.success("User updated"); },
    onError: () => toast.error("Failed to update user"),
  });

  const transferOwnership = useMutation({
    mutationFn: (toUserId: string) => miscService.transferOwnership(toUserId),
    onSuccess: () => { invalidate(); toast.success("Ownership transferred"); },
    onError: () => toast.error("Failed to transfer ownership"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => miscService.removeUser(id),
    onSuccess: () => { invalidate(); toast.success("User removed"); },
    onError: () => toast.error("Failed to remove user"),
  });

  return { users, invite, update, transferOwnership, remove };
}
