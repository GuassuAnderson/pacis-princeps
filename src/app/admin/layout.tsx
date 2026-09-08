import "../../styles/legacy-admin.css";import "../../styles/legacy-admin-connection.css";import AdminShell from "@/components/admin-shell";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/server/auth";
export default async function AdminLayout({children}:{children:React.ReactNode}){
  if (!(await currentAdmin())) redirect("/login");
  return <AdminShell>{children}</AdminShell>;
}
