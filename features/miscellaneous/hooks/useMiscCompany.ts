import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { miscService } from "../services/miscService";
import type { Company } from "@/lib/miscellaneous/types";

const QUERY_KEY = ["miscellaneous", "company"] as const;

type CompanyPayload = Partial<Omit<Company, "id" | "tenant_id" | "created_at" | "updated_at">>;

export function useMiscCompany() {
  const qc = useQueryClient();

  const company = useQuery({
    queryKey: QUERY_KEY,
    queryFn: miscService.getCompany,
  });

  const update = useMutation({
    mutationFn: (payload: CompanyPayload) => miscService.updateCompany(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Company settings saved");
    },
    onError: () => toast.error("Failed to save company settings"),
  });

  return { company, update };
}
