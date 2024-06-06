import { edenTreaty } from "@elysiajs/eden";
import { type ApiType } from "@glowlabs-org/crm-bindings";
export const elysiaClient = edenTreaty<ApiType>(
  "https://gca-crm-backend-production.up.railway.app"
);
