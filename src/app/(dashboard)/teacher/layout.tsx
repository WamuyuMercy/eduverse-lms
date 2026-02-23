import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !["TEACHER", "ADMIN"].includes(session.user.role)) {
    redirect("/unauthorized");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
