import {
  albumPricing,
  framePricing,
  services,
  studioConfig,
} from "@/config/studio.config";
import { formatPrice } from "@/lib/format";

function escapePdfText(value: string): string {
  return value
    .replace(/[^\x20-\x7e]/g, "-")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export function createPriceCataloguePdf(): Buffer {
  const lines = [
    { text: studioConfig.name, size: 24 },
    { text: "DEMO PRICE CATALOGUE", size: 13 },
    { text: "Illustrative sample amounts only; not client-approved prices.", size: 10 },
    { text: "", size: 10 },
    { text: "SERVICES - sample starting prices", size: 12 },
    ...services.map((service) => ({
      text: `${service.name} - from ${formatPrice(service.startingPrice)}`,
      size: 10,
    })),
    { text: "", size: 10 },
    { text: "FRAMES - sample base prices", size: 12 },
    ...framePricing.sizes.map((option) => ({
      text: `${option.label} - from ${formatPrice(option.amount)}`,
      size: 10,
    })),
    { text: "", size: 10 },
    { text: "ALBUMS - sample base prices", size: 12 },
    ...albumPricing.sizes.map((option) => ({
      text: `${option.label} - from ${formatPrice(option.amount)}`,
      size: 10,
    })),
    { text: "", size: 10 },
    { text: "Materials, customization, pages, and finishes may change estimates.", size: 9 },
    { text: "All studio information, services, and amounts are demonstration data.", size: 9 },
    { text: studioConfig.contact.email, size: 9 },
  ];

  let verticalPosition = 748;
  let content = "BT\n";

  for (const line of lines) {
    content += `/F1 ${line.size} Tf\n1 0 0 1 52 ${verticalPosition} Tm\n(${escapePdfText(line.text)}) Tj\n`;
    verticalPosition -= line.size >= 20 ? 34 : line.size >= 12 ? 24 : 19;
  }

  content += "ET\n";

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(content, "ascii")} >>\nstream\n${content}endstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "ascii"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const crossReferenceOffset = Buffer.byteLength(pdf, "ascii");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${crossReferenceOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "ascii");
}
