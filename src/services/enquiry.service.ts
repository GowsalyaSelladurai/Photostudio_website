import { prisma } from "@/lib/prisma";
import type { EnquiryInput } from "@/lib/validation";

export async function createEnquiry(input: EnquiryInput) {
  return prisma.enquiry.create({
    data: {
      name: input.name,
      email: input.email,
      mobile: input.mobile,
      message: input.message,
    },
    select: {
      id: true,
      createdAt: true,
    },
  });
}
