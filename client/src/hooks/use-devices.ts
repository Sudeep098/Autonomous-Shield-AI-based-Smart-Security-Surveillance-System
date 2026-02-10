import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Device } from "@shared/schema";

export function useDevices() {
  return useQuery({
    queryKey: [api.devices.list.path],
    queryFn: async () => {
      const res = await fetch(api.devices.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch devices");
      return api.devices.list.responses[200].parse(await res.json());
    },
    refetchInterval: 10000,
  });
}

export function useDevice(id: number) {
  return useQuery({
    queryKey: [api.devices.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.devices.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch device");
      return api.devices.get.responses[200].parse(await res.json());
    },
  });
}
