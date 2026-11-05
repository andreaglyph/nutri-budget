import type { UserRole } from "@/domain/models";

/**
 * Demo accounts for the prototype. Credentials are fictitious and only valid
 * inside the simulated auth service — never real user data.
 */
export interface DemoAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  onboardingCompleted: boolean;
}

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    id: "usr_laura",
    name: "Laura Martínez",
    email: "laura@demo.nutribudget.co",
    password: "Demo1234",
    role: "USER",
    onboardingCompleted: true,
  },
  {
    id: "usr_admin",
    name: "Andrés Ríos",
    email: "admin@demo.nutribudget.co",
    password: "Admin1234",
    role: "ADMIN",
    onboardingCompleted: true,
  },
];
