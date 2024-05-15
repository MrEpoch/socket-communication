import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import React from "react";
import { Control } from "react-hook-form";

type customFieldType = {
  control: Control<any> | undefined;
  name: string;
  render: (props: { field: any }) => React.ReactNode;
  className?: string;
  formLabel?: string;
};

export default function CustomField({
  control,
  render,
  name,
  formLabel,
  className = "",
}: customFieldType) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {formLabel && <FormLabel>{formLabel}</FormLabel>}
          <FormControl>{render({ field })}</FormControl>
        </FormItem>
      )}
    />
  );
}
