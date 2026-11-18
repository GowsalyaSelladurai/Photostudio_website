import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { validateBooking } from "@/lib/validation";
import {
  BookingSlotConflictError,
  createBooking,
} from "@/services/booking.service";

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

  const result = validateBooking(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Please correct the highlighted fields.", fields: result.errors },
      { status: 400 },
    );
  }

  try {
    const booking = await createBooking(result.data);
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof BookingSlotConflictError) {
      return NextResponse.json(
        {
          error:
            "That preferred date and time has just been booked. Please choose another.",
          fields: {
            dateTime: "This date and time is no longer available.",
          },
        },
        { status: 409 },
      );
    }

    return handleApiError(error, "Booking submission");
  }
}