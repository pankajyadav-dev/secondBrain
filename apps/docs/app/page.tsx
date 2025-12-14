import { prisma } from "@repo/database";
import styles from "./page.module.css";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";


export default async function Home() {
  const user = await prisma.user.count()
  return (
    <div className="bg-blue-1000">
      {user || "No user added yet"}
      <p className="bg-red-1000">hi there</p>
      <Button appName={"demo"} children={<h1>hi there</h1>} className={"bg-red-900 hover:bg-blue-1000"} />
    </div>
  );
}