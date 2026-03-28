import { fetchData, postData, updateData, deleteData } from "./api";

export type AdminPosition = "ADMIN" | "MODERATOR";

export interface TeamMember {
  id: string;
  userId: string;
  position: "SUPER_ADMIN" | "ADMIN" | "MODERATOR";
  modules: string[];
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    image: string | null;
    username: string;
    createdAt: string;
  };
}

export interface UserSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string | null;
  username: string;
}

export const ALL_MODULES = [
  { key: "users", label: "Users & Members" },
  { key: "reservations", label: "Bookings & Venues" },
  { key: "vendors", label: "Vendors" },
  { key: "events", label: "Events & Ticketing" },
  { key: "vault", label: "The Vault (Shop)" },
  { key: "media", label: "CMS / Media" },
  { key: "withdrawals", label: "Financials & Withdrawals" },
];

export function getTeam(): Promise<TeamMember[]> {
  return fetchData<TeamMember[]>("/auth/a/team");
}

export function searchUsersForTeam(q: string): Promise<UserSearchResult[]> {
  return fetchData<UserSearchResult[]>(`/auth/a/team/search?q=${encodeURIComponent(q)}`);
}

export function addTeamMember(dto: {
  userId: string;
  position: AdminPosition;
  modules: string[];
}): Promise<TeamMember> {
  return postData<TeamMember>("/auth/a/team", dto);
}

export function updateTeamMember(
  id: string,
  dto: { position?: AdminPosition; modules?: string[] }
): Promise<TeamMember> {
  return updateData<TeamMember>(`/auth/a/team/${id}`, dto);
}

export function removeTeamMember(id: string): Promise<{ message: string }> {
  return deleteData<{ message: string }>(`/auth/a/team/${id}`);
}
