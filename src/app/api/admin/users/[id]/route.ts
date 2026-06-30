import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcryptjs from "bcryptjs";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Strict authentication & authorization guard
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const targetUserId = params.id;
    const body = await req.json();
    const { role, password } = body;

    const existingUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: Record<string, string> = {};

    // Handle role updates
    if (role) {
      if (!["REPORTER", "EDITOR", "ADMIN"].includes(role)) {
        return NextResponse.json({ error: "Invalid role specified." }, { status: 400 });
      }

      // Self-lockout prevention: Admin cannot remove their own admin privileges
      if (session.user.id === targetUserId && role !== "ADMIN") {
        return NextResponse.json(
          { error: "You cannot revoke your own ADMIN privileges." },
          { status: 400 }
        );
      }
      
      updateData.role = role;
    }

    // Handle password resets
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters long." },
          { status: 400 }
        );
      }
      const hashedPassword = await bcryptjs.hash(password, 12);
      updateData.password = hashedPassword;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update." },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const targetUserId = params.id;

    // Block self-deletion
    if (targetUserId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account." },
        { status: 409 }
      );
    }

    // Check if user has any articles
    const articleCount = await prisma.article.count({
      where: { authorId: targetUserId },
    });

    if (articleCount > 0) {
      return NextResponse.json(
        { error: `This user has ${articleCount} article(s) and cannot be deleted. Remove or reassign their articles first.` },
        { status: 409 }
      );
    }

    await prisma.user.delete({ where: { id: targetUserId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
