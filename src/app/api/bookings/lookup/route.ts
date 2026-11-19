
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("reference" in body) ||
    !("mobile" in body)
  ) {
    return NextResponse.json(
      { error: "Please enter your booking details." },
      { status: 400 },
    );
  }

  const reference =
    typeof body.reference === "string" ? body.reference.trim() : "";

  const mobile =
    typeof body.mobile === "string" ? body.mobile.trim() : "";

  const match = reference.match(/^SF-(\d{6,})$/i);

  if (!match || !mobile || mobile.length > 32) {
    return NextResponse.json(
      { error: "Please enter a valid reference and mobile number." },
      { status: 400 },
    );
  }

  const referenceNumber = Number(match[1]);

  if (
    !Number.isSafeInteger(referenceNumber) ||
    referenceNumber <= 0 ||
    referenceNumber > 2147483647
  ) {
    return NextResponse.json(
      { error: "Please enter a valid booking reference." },
      { status: 400 },
    );
  }

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        referenceNumber,
        mobile,
      },
      select: {
        referenceNumber: true,
        shootType: true,
        startsAt: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          error:
            "No booking found. Please check your reference number and mobile number.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      booking: {
        reference: `SF-${String(booking.referenceNumber).padStart(6, "0")}`,
        shootType: booking.shootType,
        startsAt: booking.startsAt.toISOString(),
        status: "PENDING" as const,
      },
    });
  } catch (error) {
    return handleApiError(error, "Booking lookup");
  }
}