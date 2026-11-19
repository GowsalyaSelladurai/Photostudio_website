import { createPriceCataloguePdf } from "@/services/price-catalogue.service";

export const dynamic = "force-dynamic";

export function GET() {
  const pdf = createPriceCataloguePdf();

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="studioframe-demo-price-catalogue.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
