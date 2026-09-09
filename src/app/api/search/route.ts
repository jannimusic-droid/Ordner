import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ topics: [], tasks: [], people: [], departments: [], comments: [] });
  }

  const [topics, tasks, people, departments, comments] = await Promise.all([
    prisma.topic.findMany({
      where: {
        OR: [{ title: { contains: q } }, { description: { contains: q } }],
      },
      select: { id: true, title: true, department: { select: { name: true } } },
      take: 6,
    }),
    prisma.task.findMany({
      where: {
        OR: [{ title: { contains: q } }, { description: { contains: q } }],
      },
      select: { id: true, title: true, topic: { select: { id: true, title: true } } },
      take: 6,
    }),
    prisma.user.findMany({
      where: { name: { contains: q } },
      select: { id: true, name: true, email: true },
      take: 6,
    }),
    prisma.department.findMany({
      where: { name: { contains: q } },
      select: { id: true, name: true },
      take: 6,
    }),
    prisma.comment.findMany({
      where: { text: { contains: q } },
      select: {
        id: true,
        text: true,
        taskId: true,
        topicId: true,
        task: { select: { id: true, title: true } },
        topic: { select: { id: true, title: true } },
      },
      take: 6,
    }),
  ]);

  return NextResponse.json({ topics, tasks, people, departments, comments });
}
