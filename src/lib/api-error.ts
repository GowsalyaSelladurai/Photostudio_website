import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export function handleApiError(error: unknown, context: string) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return NextResponse.json(
      { error: "That time is no longer available. Please choose another." },
      { status: 409 },
    );
  }

  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      ["P1000", "P1001", "P1002", "P1017"].includes(error.code))
  ) {
    console.error(`${context}: database is unavailable`);
    return NextResponse.json(
      { error: "The service is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }

  const errorName = error instanceof Error ? error.name : "UnknownError";
  console.error(`${context}: request failed (${errorName})`);
  return NextResponse.json(
    { error: "We could not complete your request. Please try again." },
    { status: 500 },
  );
}
