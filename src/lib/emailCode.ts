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
      expiresAt: createDate(new TimeSpan(5, "m")),
    },
  });

  return code;
}


