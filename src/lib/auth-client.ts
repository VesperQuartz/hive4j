import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL: window.location.origin,
  plugins: [adminClient(), inferAdditionalFields<typeof auth>()],
});
