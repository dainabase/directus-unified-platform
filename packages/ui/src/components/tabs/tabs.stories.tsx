import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./index";

const meta: Meta = {
  title: "Components/Tabs",
  parameters: { layout: "centered" },
};
export default meta;

export const Basic: StoryObj = {
  render: () => (
    <Tabs defaultValue="one">
      <TabsList>
        <TabsTrigger value="one">Onglet 1</TabsTrigger>
        <TabsTrigger value="two">Onglet 2</TabsTrigger>
        <TabsTrigger value="three">Onglet 3</TabsTrigger>
      </TabsList>
      <TabsContent value="one">Contenu 1</TabsContent>
      <TabsContent value="two">Contenu 2</TabsContent>
      <TabsContent value="three">Contenu 3</TabsContent>
    </Tabs>
  ),
};