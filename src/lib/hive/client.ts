import { queryOptions } from "@tanstack/react-query";
import type { Library, OverviewResponse } from "./types";

export const postJson = async <T>(url: string, body: unknown): Promise<T> => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error ?? "Request failed.");
  return data as T;
};

const getJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error ?? "Could not read the graph.");
  return data as T;
};

export const overviewQuery = queryOptions({
  queryKey: ["hive", "overview"],
  queryFn: () => getJson<OverviewResponse>("/api/hive/overview"),
});

export const libraryQuery = queryOptions({
  queryKey: ["hive", "library"],
  queryFn: () => getJson<Library>("/api/hive/library"),
});
