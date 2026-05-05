"use client";

import { useEffect } from "react";
import { getEcho, isBroadcastingConfigured } from "@/lib/broadcasting";

export type AuctionBroadcastEventName =
  | "AuctionStatusChanged"
  | "LotStarted"
  | "LotSold"
  | "LotPassed"
  | "LotExtended"
  | "BidPlaced"
  | "HighestBidUpdated";

export type AuctionBroadcastRole = "auctioneer" | "buyer";

type AuctionBroadcastEvent = {
  name: AuctionBroadcastEventName;
  payload: unknown;
};

type UseAuctionBroadcastsOptions = {
  auctionId: string | number;
  role: AuctionBroadcastRole;
  enabled?: boolean;
  onEvent?: (event: AuctionBroadcastEvent) => void;
  onHere?: (users: unknown[]) => void;
  onJoining?: (user: unknown) => void;
  onLeaving?: (user: unknown) => void;
};

const AUCTION_EVENTS: AuctionBroadcastEventName[] = [
  "AuctionStatusChanged",
  "LotStarted",
  "LotSold",
  "LotPassed",
  "LotExtended",
  "BidPlaced",
  "HighestBidUpdated",
];

export const useAuctionBroadcasts = ({
  auctionId,
  role,
  enabled = true,
  onEvent,
  onHere,
  onJoining,
  onLeaving,
}: UseAuctionBroadcastsOptions) => {
  useEffect(() => {
    if (!enabled || !auctionId || !isBroadcastingConfigured()) return;

    const echo = getEcho();
    if (!echo) return;

    const channelName =
      role === "auctioneer"
        ? `private-auctioneer.${auctionId}`
        : `presence-auction.${auctionId}`;

    const channel = (role === "auctioneer"
      ? echo.private(channelName)
      : echo.join(channelName)) as {
      listen: (event: string, callback: (payload: unknown) => void) => unknown;
      stopListening: (event: string) => unknown;
      here?: (callback: (users: unknown[]) => void) => unknown;
      joining?: (callback: (user: unknown) => void) => unknown;
      leaving?: (callback: (user: unknown) => void) => unknown;
    };

    if (role === "buyer") {
      if (onHere) channel.here?.(onHere);
      if (onJoining) channel.joining?.(onJoining);
      if (onLeaving) channel.leaving?.(onLeaving);
    }

    AUCTION_EVENTS.forEach((name) => {
      channel.listen(`.${name}`, (payload: unknown) => onEvent?.({ name, payload }));
    });

    return () => {
      AUCTION_EVENTS.forEach((name) => {
        channel.stopListening(`.${name}`);
      });
      echo.leave(channelName);
    };
  }, [auctionId, enabled, role, onEvent, onHere, onJoining, onLeaving]);
};
