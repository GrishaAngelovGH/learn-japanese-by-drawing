import type { Metadata } from "next";
import { LayoutClient } from "./layout-client";

export const metadata: Metadata = {
  title: "Learn Japanese by Drawing",
  description: "Practice writing Japanese characters by drawing them on screen.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <LayoutClient>{children}</LayoutClient>;
}
