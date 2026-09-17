import { revalidatePath } from "next/cache";

/** Every page that renders task rows: `/` and each `/lists/<id>`. */
export function revalidateTaskPages(): void {
  revalidatePath("/");
  revalidatePath("/lists/[id]", "page");
}
