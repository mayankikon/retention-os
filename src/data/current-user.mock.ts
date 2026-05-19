import type { AppUser } from "@/types/user";

/** Mock signed-in user until auth is integrated. */
export const MOCK_CURRENT_USER: AppUser = {
  id: "u-current",
  name: "Sarah Chen",
  email: "sarah.chen@ikongps.com",
  initials: "SC",
  role: "Campaign w/ reports",
  dealership: "Ikon Motors North",
};
