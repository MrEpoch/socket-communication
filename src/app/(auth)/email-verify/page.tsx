import ResendEmailVerificationCode from "@/components/shared/auth/ResendEmailVerificationCode";
import EmailInfoModal from "@/components/shared/modals/emailInfoModal";
import { validateRequest } from "@/lib/validateRequest";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await validateRequest();

  if (!user.session || !user.user) {
    throw redirect("/login");
  }

  if (user.user.emailVerified) {
    throw redirect("/account");
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <EmailInfoModal />
      <ResendEmailVerificationCode />
    </div>
  );
}
