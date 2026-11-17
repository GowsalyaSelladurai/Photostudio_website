import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { validateEnquiry } from "@/lib/validation";
import { createEnquiry } from "@/services/enquiry.service";

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

  const result = validateEnquiry(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Please correct the highlighted fields.", fields: result.errors },
      { status: 400 },
    );
  }

  try {
    const enquiry = await createEnquiry(result.data);
    return NextResponse.json({ enquiry }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Enquiry submission");
  }
}
