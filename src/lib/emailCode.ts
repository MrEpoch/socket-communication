import { TimeSpan, createDate, isWithinExpirationDate } from "oslo";
import { generateRandomString, alphabet } from "oslo/crypto";
import { prisma } from "./db";
import type { User } from "lucia";

export async function generateEmailVerificationCode(
  userId: string,
  email: string,
): Promise<string> {
  await prisma.emailVerificationCode.deleteMany({
    where: {
      userId,
    },
  });
  const code = generateRandomString(8, alphabet("0-9"));

  await prisma.emailVerificationCode.create({
    data: {
      userId,
      email,
      code,
      expires_at: createDate(new TimeSpan(5, "m")),
    },
  });

  return code;
}

export async function verifyEmailCode(
  user: User,
  code: string,
): Promise<boolean> {
  try {
    const email_verify_code = await prisma.emailVerificationCode.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!email_verify_code || email_verify_code.code !== code) {
      return false;
    }

    await prisma.emailVerificationCode.delete({
      where: {
        id: email_verify_code.id,
      },
    });

    if (
      !isWithinExpirationDate(email_verify_code.expires_at) ||
      email_verify_code.email !== user.email
    ) {
      return false;
    }

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
