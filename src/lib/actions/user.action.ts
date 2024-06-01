"use server";

import { z } from "zod";
import { prisma } from "../db";
import { Argon2id } from "oslo/password";
import { isWithinExpirationDate } from "oslo";
import { cookies } from "next/headers";
import { lucia } from "../auth";
import { validateRequest } from "../validateRequest";
import { generateEmailVerificationCode } from "../emailCode";
import { sendMail } from "../SendMail";

interface clientUser {
  username: string;
  email: string;
  password: string;
}

export async function createUser(user: clientUser) {
  try {
    const userZod = z.object({
      username: z.string(),
      email: z.string().email(),
      password: z.string(),
    });

    const userZodResult = userZod.safeParse(user);
    if (!userZodResult.success) {
      return { data: null, error: "Invalid values" };
    }

    const argon2id = new Argon2id();
    const passwordHash = await argon2id.hash(userZodResult.data.password);
    if (passwordHash === null) {
      return { data: null, error: "Failed to hash password" };
    }

    const data = await prisma.user.create({
      data: {
        username: userZodResult.data.username,
        email: userZodResult.data.email,
        password_hash: passwordHash,
      },
    });

    if (!data) {
      return { data: null, error: "Failed to create user" };
    }

    const verificationCode = await generateEmailVerificationCode(
      data.id,
      data.email,
    );

    await sendMail({
      to: data.email,
      subject: "Verify your email",
      text: `Your verification code is ${verificationCode}`,
    });


    const session = await lucia.createSession(data.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    return { data: data, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "Failed to create user" };
  }
}

export async function logIn(email: string, password: string) {
  try {
    const emailZodCheck = z.string().email();
    const emailZodResult = emailZodCheck.safeParse(email);
    if (!emailZodResult.success) {
      return { data: null, error: "Invalid email" };
    }

    const passwordZodCheck = z.string().min(8).max(255);
    const passwordZodResult = passwordZodCheck.safeParse(password);
    if (!passwordZodResult.success) {
      return { data: null, error: "Invalid password" };
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return { data: null, error: "User not found" };
    }

    const argon2id = new Argon2id();
    const passwordMatch = await argon2id.verify(
      user.password_hash,
      passwordZodResult.data,
    );

    if (!passwordMatch) {
      return { data: null, error: "Invalid password" };
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    return { data: user, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "Failed to log in" };
  }
}

export async function verifyEmailCode(
  user: any,
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
      !isWithinExpirationDate(email_verify_code.expiresAt) ||
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

export async function getUserFromSessionCookie() {
  const sessionId = cookies().get("session")?.value;
  if (!sessionId) {
    return { user: null, error: true };
  }
  const { user } = await lucia.validateSession(sessionId);

  if (!user) {
    return { user: null, error: true };
  }
  return { user, error: null };
}

// Multiple functions for updating user: updatePassword, updateEmail, updateUsername for UX

interface updateUserReturn {
  username?: string;
  email?: string;
  password?: string;
}

export async function updatePassword(password: string): Promise<any> {
  try {
    const userLucia = await validateRequest();

    if (!userLucia.session) {
      return { data: null, error: "Invalid session" };
    }

    const passwordZodCheck = z.string().min(8).max(255);
    const passwordZodResult = passwordZodCheck.safeParse(password);
    if (!passwordZodResult.success) {
      return { data: null, error: "Invalid password" };
    }

    const argon2Id = new Argon2id();
    const hashed_password = await argon2Id.hash(passwordZodResult.data);
    await prisma.user.update({
      where: {
        id: userLucia.user.id,
      },
      data: {
        password_hash: hashed_password,
      },
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function updateEmail(email: string): Promise<any> {
  try {
    const userLucia = await validateRequest();

    if (!userLucia.session) {
      return { data: null, error: "Invalid session" };
    }

    if (!userLucia.user) {
      return { data: null, error: "Invalid session" };
    }

    if (!userLucia.user.emailVerified) {
      return { data: null, error: "Email not verified" };
    }

    const emailZodCheck = z.string().email();
    const emailZodResult = emailZodCheck.safeParse(email);
    if (!emailZodResult.success) {
      return { data: null, error: "Invalid email" };
    }

    await prisma.user.update({
      where: {
        id: userLucia.user.id,
      },
      data: {
        email: emailZodResult.data,
      },
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function updateUsername(username: string): Promise<any> {
  try {
    const userLucia = await validateRequest();

    if (!userLucia.session) {
      return { data: null, error: "Invalid session" };
    }

    if (!userLucia.user) {
      return { data: null, error: "Invalid session" };
    }

    if (!userLucia.user?.emailVerified) {
      return { data: null, error: "Email not verified" };
    }

    const usernameZodCheck = z.string().min(3).max(255);
    const usernameZodResult = usernameZodCheck.safeParse(username);
    if (!usernameZodResult.success) {
      return { data: null, error: "Invalid username" };
    }

    await prisma.user.update({
      where: {
        id: userLucia.user.id,
      },
      data: {
        username: usernameZodResult.data,
      },
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

// TODO: Need to add some logic for when user deletes account what will then happen to his data and servers with channels, will it be deleted or inherited by another user? Or single user server case?

export async function deleteUser(): Promise<any> {
  const userLucia = await validateRequest();

  if (!userLucia.session) {
    return { data: null, error: "Invalid session" };
  }

  if (!userLucia.user) {
    return { data: null, error: "Invalid session" };
  }

  if (!userLucia.user.emailVerified) {
    return { data: null, error: "Email not verified" };
  }

  return await prisma.user.delete({
    where: {
      id: userLucia.user.id,
    },
  });
}
