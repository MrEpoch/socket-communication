"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import CustomField from "../CustomField";
import { Input } from "@/components/ui/input";

export const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Server name is required" })
    .max(50, { message: "Server name is too long" }),
  imageUrl: z.string().url({ message: "Invalid image URL" }),
});

export default function InitialModal() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const isLoading = form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Dialog open>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Customize your server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Give your server a personality with a name and an image. You can
            always change it later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-8"
            method="POST"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="space-y-8 px-6">
              <div>TODO: Image upload</div>
              <CustomField
                control={form.control}
                name="serverName"
                formLabel={"Server name (3-50 characters)*"}
                formLabelClassName="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70"
                render={({ field }) => (
                  <Input
                    type="text"
                    placeholder="Enter server name"
                    role="action-input-field"
                    value={field.value}
                    {...field}
                    disabled={isLoading}
                    className="bg-zinc-300/50 border-0 
              focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                  />
                )}
              />
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
