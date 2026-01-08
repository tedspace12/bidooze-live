import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService, Consignor, Bidder } from "../services/customerService";

export const useCustomer = () => {
  const queryClient = useQueryClient();

  // Consignors
  const useConsignors = (params?: Parameters<typeof customerService.getConsignors>[0]) => {
    return useQuery({
      queryKey: ["consignors", params],
      queryFn: () => customerService.getConsignors(params),
    });
  };

  const useConsignorById = (id: string | number) => {
    return useQuery({
      queryKey: ["consignor", id],
      queryFn: () => customerService.getConsignorById(id),
      enabled: !!id,
    });
  };

  const createConsignor = useMutation({
    mutationFn: (data: Partial<Consignor>) => customerService.createConsignor(data),
    mutationKey: ["create-consignor"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consignors"] });
    },
  });

  const updateConsignor = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<Consignor> }) =>
      customerService.updateConsignor(id, data),
    mutationKey: ["update-consignor"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consignors"] });
    },
  });

  // Bidders
  const useBidders = (params?: Parameters<typeof customerService.getBidders>[0]) => {
    return useQuery({
      queryKey: ["bidders", params],
      queryFn: () => customerService.getBidders(params),
    });
  };

  const useBidderById = (id: string | number) => {
    return useQuery({
      queryKey: ["bidder", id],
      queryFn: () => customerService.getBidderById(id),
      enabled: !!id,
    });
  };

  return {
    // Consignors
    useConsignors,
    useConsignorById,
    createConsignor,
    updateConsignor,
    // Bidders
    useBidders,
    useBidderById,
  };
};

