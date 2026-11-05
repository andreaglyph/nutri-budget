import type { ReactNode } from "react";

import { PublicFooter } from "./PublicFooter";
import { PublicHeader } from "./PublicHeader";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
