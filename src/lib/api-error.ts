import { NextResponse } from "next/server";

type PrismaError = Error & {
  code: string;
};

function isPrismaError(error: unknown): error is PrismaError {
  return (
    error instanceof Error &&
    "code" in error &&
    typeof error.code === "string"
  );
}

export function handleApiError(error: unknown, context: string) {
  if (isPrismaError(error) && error.code === "P2002") {
    return NextResponse.json(
      { error: "That time is no longer available. Please choose another." },
      { status: 409 },
    );
  }

  if (
    (error instanceof Error &&
      error.name === "PrismaClientInitializationError") ||
    (isPrismaError(error) &&
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