import InitialModal from "@/components/shared/modals/initialModal";
import { lucia } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { validateRequest } from "@/lib/validateRequest";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const auth = await validateRequest();

  if (!auth.session || !auth.user) {
    throw redirect("/login");
  }

  if (!auth.user.emailVerified) {
    throw redirect("/email-verify");
  }

  const server = await prisma.server.findFirst({
    where: {
      members: {
        some: {
          userId: auth.user.id,
        },
      },
    },
  });

  if (server) return redirect("/servers/" + server.id);

  return <InitialModal />;
}
