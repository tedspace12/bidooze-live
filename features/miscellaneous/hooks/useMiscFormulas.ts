import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { miscService } from "../services/miscService";
import type { Formula } from "@/lib/miscellaneous/types";

const QUERY_KEY = ["miscellaneous", "formulas"] as const;

type FormulaPayload = Omit<Formula, "id" | "tenant_id" | "auction_reference_count" | "created_at" | "updated_at">;

export function useMiscFormulas() {
  const qc = useQueryClient();

  const formulas = useQuery({
    queryKey: QUERY_KEY,
    queryFn: miscService.listFormulas,
  });

  const create = useMutation({
    mutationFn: (payload: FormulaPayload) => miscService.createFormula(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Formula created");
    },
    onError: () => toast.error("Failed to create formula"),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<FormulaPayload> }) =>
      miscService.updateFormula(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Formula updated");
    },
    onError: () => toast.error("Failed to update formula"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => miscService.deleteFormula(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Formula deleted");
    },
    onError: () => toast.error("Failed to delete formula"),
  });

  return { formulas, create, update, remove };
}
