
import { studioConfig } from "@/config/studio.config";

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat(studioConfig.locale, {
    style: "currency",
    currency: studioConfig.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatAlbumPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
