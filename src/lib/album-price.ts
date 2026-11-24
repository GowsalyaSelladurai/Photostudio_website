
import { albumPricing } from "@/config/studio.config";

export function calculateAlbumPrice(
  sizeId: string,
  pageCount: number,
  finishId: string,
): number {
  const size = albumPricing.sizes.find(
    (item) => item.id === sizeId,
  );

  const pages = albumPricing.pages.find(
    (item) => Number(item.id) === pageCount,
  );

  const finish = albumPricing.finishes.find(
    (item) => item.id === finishId,
  );

  if (!size || !pages || !finish) {
    throw new Error("Invalid album configuration.");
  }

  return size.amount + pages.amount + finish.amount;
}

export function formatAlbumPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

