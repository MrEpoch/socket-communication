import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { lucia } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyEmailCode } from "@/lib/actions/user.action";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);

  const formData = await request.formData();
  const emailCode = formData.get("email_code");

  const sessionId = cookies().get("session")?.value;
  if (!sessionId) {
    return NextResponse.redirect(requestUrl + "/auth/login", { status: 400 });
  }
  const { user } = await lucia.validateSession(sessionId);

  if (!user) {
    return NextResponse.redirect(requestUrl + "/auth/login", { status: 400 });
  }

  if (user.emailVerified) {
    return NextResponse.redirect(
      requestUrl + "/auth/user?error=already_verified",
      { status: 400 },
    );
  }

  const emailCodeZod = z.string().length(8);
  const emailCodeResult = emailCodeZod.safeParse(emailCode);

  if (!emailCodeResult.success) {
    return NextResponse.redirect(
      requestUrl + "/auth/email-verify?error=invalid_code",
      { status: 400 },
    );
  }

  try {
    const validCode = await verifyEmailCode(user, emailCodeResult.data);

    if (!validCode) {
      return NextResponse.redirect(
        requestUrl + "/auth/email-verify?error=invalid_code",
        { status: 400 },
      );
    }

    await lucia.invalidateUserSessions(user.id);
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: true,
      },
    });

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookies().set("session", sessionCookie?.value, { path: "/" });
    return NextResponse.redirect(requestUrl.origin + "/auth/user", {
      status: 301,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.redirect(
      requestUrl + "/auth/email-verify?error=unknown_error",
      { status: 400 },
    );
  }
}
