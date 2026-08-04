"use server";

import { revalidatePath } from "next/cache";
import { seedDemoData, clearData } from "./demo-data";

export async function loadDemoData(): Promise<void> {
  await seedDemoData();
  revalidatePath("/", "layout");
}

export async function clearAllData(): Promise<void> {
  await clearData();
  revalidatePath("/", "layout");
}
