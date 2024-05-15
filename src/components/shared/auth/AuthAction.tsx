"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CustomField from "../CustomField";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Must be 3 or more characters long" })
    .max(50, { message: "Must be 50 or fewer characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Must be 8 or more characters long" })
    .max(50, { message: "Must be 50 or fewer characters long" }),
  confirmPassword: z
    .string()
    .min(8, { message: "Must be 8 or more characters long" })
    .max(50, { message: "Must be 50 or fewer characters long" }),
});

export default function ActionForm({ isLogin }: { isLogin?: boolean }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isLogin
      ? {
          email: "",
          password: "",
        }
      : {
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        },
  });

  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  async function onSubmit(data: z.infer<typeof formSchema>) {
    form.trigger();
    setSubmitting(true);

    if (isLogin) {
      const loginData = {
        email: data.email,
        password: data.password,
      };
    } else {
      if (data.password !== data.confirmPassword) {
        setSubmitting(false);
        toast({
          title: "Error",
          description: "Passwords don't match",
          variant: "destructive",
        });
        return;
      }

      const registerData = {
        email: data.email,
        username: data.username,
        password: data.password,
      };
    }

    setSubmitting(false);
    return;
  }

  return (
    <Form {...form}>
      <form
        encType="multipart/form-data"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 w-full"
        role="action-form"
      >
        {!isLogin && (
          <CustomField
            control={form.control}
            name="username"
            formLabel={"Username (3-50 characters)*"}
            render={({ field }) => (
              <Input role="action-input-field" value={field.value} {...field} />
            )}
          />
        )}
        <CustomField
          control={form.control}
          name="email"
          formLabel={"Email*"}
          render={({ field }) => (
            <Input
              type="email"
              role="action-input-field"
              value={field.value}
              {...field}
            />
          )}
        />
        <CustomField
          control={form.control}
          name="password"
          formLabel={"Password (8-50 characters)*"}
          render={({ field }) => (
            <Input
              role="action-input-field"
              value={field.value}
              {...field}
              type="password"
            />
          )}
        />
        {!isLogin && (
          <CustomField
            control={form.control}
            name="confirmPassword"
            formLabel={"Confirm Password (8-50 characters)*"}
            render={({ field }) => (
              <Input
                role="action-input-field"
                value={field.value}
                {...field}
                type="password"
              />
            )}
          />
        )}
        <Button disabled={submitting} type="submit">
          {isLogin ? "Login" : "Register"}
        </Button>
      </form>
    </Form>
  );
}
