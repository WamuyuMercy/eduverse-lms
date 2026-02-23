import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRoleDashboard } from "@/lib/utils";

// Root page — redirect authenticated users to their dashboard
// Unauthenticated users go to login
export default async function RootPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  redirect(getRoleDashboard(session.user.role));
}
