import { prisma } from "@repo/database";
import styles from "./page.module.css";


export default async function Home() {
  const user = await prisma.user.count()
  return (
    <div className={styles.page}>
      {user || "No user added yet"}
    </div>
  );
}