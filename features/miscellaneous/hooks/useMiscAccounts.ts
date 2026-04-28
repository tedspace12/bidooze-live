import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { miscService } from "../services/miscService";
import type { CreateAccountPayload } from "@/lib/miscellaneous/types";

const QUERY_KEY = ["miscellaneous", "accounts"] as const;

export function useMiscAccounts() {
  const qc = useQueryClient();

  const accounts = useQuery({
    queryKey: QUERY_KEY,
    queryFn: miscService.listAccounts,
  });

  const create = useMutation({
    mutationFn: (payload: CreateAccountPayload) => miscService.createAccount(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Account created");
    },
    onError: () => toast.error("Failed to create account"),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateAccountPayload> }) =>
      miscService.updateAccount(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Account updated");
    },
    onError: () => toast.error("Failed to update account"),
  });

  const remove = useMutation({
    mutationFn: (id: number) => miscService.deleteAccount(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Account deleted");
    },
    onError: () => toast.error("Failed to delete account"),
  });

  const seedDefaults = useMutation({
    mutationFn: miscService.seedDefaultAccounts,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Default accounts seeded");
    },
    onError: () => toast.error("Failed to seed default accounts"),
  });

  return { accounts, create, update, remove, seedDefaults };
}
