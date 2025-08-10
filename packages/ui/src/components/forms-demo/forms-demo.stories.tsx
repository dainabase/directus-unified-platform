import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";

import { Form, FormItem, FormLabel, FormControl, FormDescription, FormField } from "../form";
import { Input } from "../input";
import { Textarea } from "../textarea";
import { Select } from "../select";
import { Switch } from "../switch";
import { Checkbox } from "../checkbox";
import { Button } from "../button";

const schema = z.object({
  name: z.string().min(2, "Au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  role: z.string().nonempty("Choisissez un rôle"),
  newsletter: z.boolean().optional(),
  terms: z.literal(true, { errorMap: () => ({ message: "Vous devez accepter les conditions" }) }),
  bio: z.string().max(200, "200 caractères max").optional(),
});

type FormValues = z.infer<typeof schema>;

function DemoForm() {
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      newsletter: true,
      terms: false,
      bio: "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: FormValues) => {
    alert(JSON.stringify(values, null, 2));
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit) as any} className="w-[420px] bg-white p-4 rounded-lg border border-border">
        <FormItem>
          <FormLabel htmlFor="name">Nom</FormLabel>
          <FormField<FormValues> name="name" render={(field) => (
            <FormControl>
              <Input id="name" {...field} placeholder="Jean Dupont" />
            </FormControl>
          )} />
        </FormItem>

        <FormItem>
          <FormLabel htmlFor="email">Email</FormLabel>
          <FormField<FormValues> name="email" render={(field) => (
            <FormControl>
              <Input id="email" type="email" {...field} placeholder="jean@company.com" />
            </FormControl>
          )} />
        </FormItem>

        <FormItem>
          <FormLabel>Rôle</FormLabel>
          <FormField<FormValues> name="role" render={(field) => (
            <FormControl>
              <Select items={[
                { label: "Admin", value: "admin" },
                { label: "Manager", value: "manager" },
                { label: "Viewer", value: "viewer" },
              ]} value={field.value} onValueChange={field.onChange} />
            </FormControl>
          )} />
          <FormDescription>Détermine les permissions par défaut.</FormDescription>
        </FormItem>

        <FormItem>
          <FormField<FormValues> name="newsletter" render={(field) => (
            <FormControl>
              <Switch checked={!!field.value} onCheckedChange={field.onChange} label="Recevoir la newsletter" />
            </FormControl>
          )} />
        </FormItem>

        <FormItem>
          <FormLabel htmlFor="bio">Bio (optionnel)</FormLabel>
          <FormField<FormValues> name="bio" render={(field) => (
            <FormControl>
              <Textarea id="bio" {...field} placeholder="Présentez-vous en quelques mots…" />
            </FormControl>
          )} />
        </FormItem>

        <FormItem>
          <FormField<FormValues> name="terms" render={(field) => (
            <FormControl>
              <Checkbox checked={!!field.value} onCheckedChange={field.onChange as any} label="J'accepte les conditions" />
            </FormControl>
          )} />
        </FormItem>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button">Annuler</Button>
          <Button type="submit">Enregistrer</Button>
        </div>
      </Form>
    </FormProvider>
  );
}

const meta: Meta = {
  title: "Forms/Demo",
  parameters: { layout: "centered" },
};
export default meta;

export const Basic: StoryObj = { render: () => <DemoForm /> };