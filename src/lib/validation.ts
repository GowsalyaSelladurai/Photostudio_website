// Existing photography services (unchanged).
export const photographyShootTypes = [
  "Wedding",
  "Pre-Wedding",
  "Baby",
  "Passport-Size",
  "Events",
  "Video",
  "Editing",
  "Portrait",
] as const;

// Film / Video services added to the same shared service list.
export const filmShootTypes = [
  "Pre-Wedding Films",
  "Post-Wedding Films",
  "Wedding Cinematography",
  "Maternity Photoshoots",
  "Fashion Films",
  "Cinematic Videos",
  "Birthday and Event Films",
  "Couple Photoshoots",
  "Studio Photoshoots",
  "Other Custom Film Services",
] as const;

// Single source of truth used by the Book Now form, the Enquiry form,
// the API validation and the database layer.
export const bookingShootTypes = [
  ...photographyShootTypes,
  ...filmShootTypes,
] as const;

export type ServiceCategory = "PHOTOGRAPHY" | "FILM";

export function getServiceCategory(serviceType: string): ServiceCategory {
  return (filmShootTypes as readonly string[]).includes(serviceType)
    ? "FILM"
    : "PHOTOGRAPHY";
}

export type BookingInput = {
  name: string;
  mobile: string;
  shootType: string;
  dateTime: string;
  location: string;
  requirements?: string;
  serviceCategory: ServiceCategory;
};

export type EnquiryInput = {
  name: string;
  email?: string;
  mobile?: string;
  message: string;
  serviceType?: string;
  serviceCategory?: ServiceCategory;
};

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(
  body: Record<string, unknown>,
  key: string,
  maxLength: number,
  required = true,
): string | undefined {
  const value = body[key];

  if (value === undefined && !required) return undefined;
  if (typeof value !== "string") return undefined;

  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) return undefined;
  return normalized;
}

function isBookingShootType(value: string): boolean {
  return (bookingShootTypes as readonly string[]).includes(value);
}

function isValidZonedDateTime(value: string): boolean {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})$/i.exec(
      value,
    );

  if (!match) return false;

  const [, year, month, day, hour, minute, second = "0"] = match;
  const yearNumber = Number(year);
  const monthNumber = Number(month);
  const dayNumber = Number(day);
  const hourNumber = Number(hour);
  const minuteNumber = Number(minute);
  const secondNumber = Number(second);

  if (
    yearNumber < 1000 ||
    monthNumber < 1 ||
    monthNumber > 12 ||
    dayNumber < 1 ||
    dayNumber > new Date(Date.UTC(yearNumber, monthNumber, 0)).getUTCDate() ||
    hourNumber > 23 ||
    minuteNumber > 59 ||
    secondNumber > 59
  ) {
    return false;
  }

  return Number.isFinite(Date.parse(value));
}

export function validateBooking(
  value: unknown,
): ValidationResult<BookingInput> {
  if (!isRecord(value)) {
    return { success: false, errors: { form: "A valid form submission is required." } };
  }

  const name = readText(value, "name", 120) ?? null;
  const mobile = readText(value, "mobile", 32) ?? null;
  const shootType = readText(value, "shootType", 80) ?? null;
  const dateTime = readText(value, "dateTime", 40) ?? null;
  const location = readText(value, "location", 300) ?? null;
  const requirements = readText(value, "requirements", 2000, false);
  const errors: Record<string, string> = {};

  if (!name) errors.name = "Enter your name.";
  const mobileDigitCount = mobile?.replace(/\D/g, "").length ?? 0;
  if (
    !mobile ||
    !/^[+()\d\s.-]{7,32}$/.test(mobile) ||
    mobileDigitCount < 7 ||
    mobileDigitCount > 15
  ) {
    errors.mobile = "Enter a valid phone number.";
  }
  if (!shootType || !isBookingShootType(shootType)) {
    errors.shootType = "Choose a shoot type from the list.";
  }
  if (!dateTime || !isValidZonedDateTime(dateTime)) {
    errors.dateTime = "Choose a valid date and time.";
  } else if (Date.parse(dateTime) <= Date.now()) {
    errors.dateTime = "Choose a future date and time.";
  }
  if (!location) errors.location = "Enter a location.";
  if (
    value.requirements !== undefined &&
    typeof value.requirements !== "string"
  ) {
    errors.requirements = "Requirements must be 2,000 characters or fewer.";
  }
  if (
    typeof value.requirements === "string" &&
    value.requirements.trim().length > 2000
  ) {
    errors.requirements = "Requirements must be 2,000 characters or fewer.";
  }

  if (
    name === null ||
    mobile === null ||
    shootType === null ||
    dateTime === null ||
    location === null ||
    Object.keys(errors).length > 0
  ) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name,
      mobile,
      shootType,
      dateTime,
      location,
      requirements,
      serviceCategory: getServiceCategory(shootType),
    },
  };
}

export function validateEnquiry(
  value: unknown,
): ValidationResult<EnquiryInput> {
  if (!isRecord(value)) {
    return { success: false, errors: { form: "A valid form submission is required." } };
  }

  const name = readText(value, "name", 120) ?? null;
  const email = readText(value, "email", 254, false);
  const mobile = readText(value, "mobile", 32, false);
  const message = readText(value, "message", 4000) ?? null;
  const serviceType = readText(value, "serviceType", 80, false);
  const errors: Record<string, string> = {};
  const mobileDigitCount = mobile?.replace(/\D/g, "").length ?? 0;

  if (!name) errors.name = "Enter your name.";
  if (!message) errors.message = "Enter a message.";
  if (
    value.email !== undefined &&
    value.email !== "" &&
    (email === undefined || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  ) {
    errors.email = "Enter a valid email address.";
  }
  if (
    value.mobile !== undefined &&
    value.mobile !== "" &&
    (mobile === undefined ||
      !/^[+()\d\s.-]{7,32}$/.test(mobile) ||
      mobileDigitCount < 7 ||
      mobileDigitCount > 15)
  ) {
    errors.mobile = "Enter a valid phone number.";
  }
  if (!email && !mobile) {
    errors.contact = "Provide an email address or phone number.";
  }
  if (
    value.serviceType !== undefined &&
    value.serviceType !== "" &&
    (serviceType === undefined || !isBookingShootType(serviceType))
  ) {
    errors.serviceType = "Choose a service from the list.";
  }

  if (
    name === null ||
    message === null ||
    Object.keys(errors).length > 0
  ) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name,
      email,
      mobile,
      message,
      serviceType,
      serviceCategory: serviceType ? getServiceCategory(serviceType) : undefined,
    },
  };
}
