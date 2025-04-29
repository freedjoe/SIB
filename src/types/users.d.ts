import { Role } from "./roles";
import { Wilaya } from "./wilayas";

export interface User {
  id: string;
  email: string;
  password: string;
  full_name: string | null;
  role_id: string;
  organization: string | null;
  phone: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  position: string | null;
  structure: string | null;
  wilaya_id: string;
  created_at: string;
}

export interface UserWithRelations extends User {
  role?: Role;
  profile?: UserProfile & {
    wilaya?: Wilaya;
  };
}

export type NewUser = Omit<User, "id" | "created_at">;
export type UpdateUser = Partial<NewUser>;

export type NewUserProfile = Omit<UserProfile, "id" | "created_at">;
export type UpdateUserProfile = Partial<NewUserProfile>;
