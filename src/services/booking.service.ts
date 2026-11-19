
import { prisma } from "@/lib/prisma";
import type { BookingInput } from "@/lib/validation";

export class BookingSlotConflictError extends Error {
  constructor() {
    super("The requested booking time is no longer available.");
    this.name = "BookingSlotConflictError";
  }
}

function isStartsAtUniqueViolation(error: unknown): boolean {
  if (
    !(error instanceof Error) ||
    !("code" in error) ||
    error.code !== "P2002"
  ) {
    return false;
  }

  const target = "meta" in error && error.meta &&
    typeof error.meta === "object" && "target" in error.meta
      ? error.meta.target
      : undefined;

  return Array.isArray(target)
    ? target.includes("startsAt")
    : typeof target === "string" && target.includes("startsAt");
}

export async function isBookingTimeAvailable(startsAt: Date): Promise<boolean> {
  const existingBooking = await prisma.booking.findUnique({
    where: { startsAt },
    select: { id: true },
  });

  return existingBooking === null;
}

export async function createBooking(input: BookingInput) {
  try {
    const booking = await prisma.booking.create({
      data: {
        name: input.name,
        mobile: input.mobile,
        shootType: input.shootType,
        startsAt: new Date(input.dateTime),
        location: input.location,
        requirements: input.requirements,
      },
      select: {
        referenceNumber: true,
        startsAt: true,
      },
    });

    return {
      reference: `SF-${String(booking.referenceNumber).padStart(6, "0")}`,
      startsAt: booking.startsAt.toISOString(),
    };
  } catch (error) {
    if (isStartsAtUniqueViolation(error)) {
      throw new BookingSlotConflictError();
    }

    throw error;
  }
}
