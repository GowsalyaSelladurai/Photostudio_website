import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { isBookingTimeAvailable } from "@/services/booking.service";

export async function GET(request: Request) {
  const dateTime = new URL(request.url).searchParams.get("dateTime");
  if (
    !dateTime ||
    !/(Z|[+-]\d{2}:\d{2})$/i.test(dateTime) ||
    !Number.isFinite(Date.parse(dateTime))
  ) {
    return NextResponse.json(
      { error: "Provide dateTime as an ISO date-time with a timezone." },
      { status: 400 },
    );
  }

  try {
    const available = await isBookingTimeAvailable(new Date(dateTime));
    return NextResponse.json({ available });
  } catch (error) {
    return handleApiError(error, "Availability check");
  }
}
