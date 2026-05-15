import { Providers } from "@/components/session-provider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
