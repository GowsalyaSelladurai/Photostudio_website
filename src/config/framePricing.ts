import type { FrameDesignId, FrameMaterialId } from "../types/frame";

export interface FramePricingConfig {
  currency: string;
  currencySymbol: string;
  profiles: Record<FrameDesignId, { basePrice: number; name: string }>;
  materials: Record<FrameMaterialId, { extraCharge: number; name: string }>;
}

/**
 * Centralized dynamic pricing configuration for custom frames.
 * Formula: Total Price = Selected Frame Base Price + Selected Material Extra Charge.
 * Colour selection does not incur an extra charge.
 */
export const FRAME_PRICING: FramePricingConfig = {
  currency: "INR",
  currencySymbol: "₹",
  profiles: {
    modern_flat: { basePrice: 180, name: "Modern Flat" },
    classic_bevel: { basePrice: 200, name: "Classic Bevel" },
    gallery_style: { basePrice: 220, name: "Gallery Box" },
    ornate_decorative: { basePrice: 250, name: "Ornate Sculpted" },
    shadow_box: { basePrice: 260, name: "Deep Shadow Box" },
    rounded_edge: { basePrice: 190, name: "Soft Bullnose" },
  },
  materials: {
    mdf: { extraCharge: 0, name: "MDF" },
    wood: { extraCharge: 50, name: "Solid Wood" },
    aluminium: { extraCharge: 70, name: "Aluminium" },
  },
};

export interface FramePriceBreakdown {
  basePrice: number;
  materialExtra: number;
  totalPrice: number;
  currencySymbol: string;
  profileName: string;
  materialName: string;
  formattedBasePrice: string;
  formattedMaterialExtra: string;
  formattedTotalPrice: string;
}

/**
 * Calculates the live frame price breakdown from active profile and material selections.
 */
export function calculateFramePrice(
  profileId: FrameDesignId,
  materialId: FrameMaterialId,
): FramePriceBreakdown {
  const profileConfig = FRAME_PRICING.profiles[profileId] ?? {
    basePrice: 200,
    name: "Classic Bevel",
  };
  const materialConfig = FRAME_PRICING.materials[materialId] ?? {
    extraCharge: 0,
    name: "MDF",
  };

  const basePrice = profileConfig.basePrice;
  const materialExtra = materialConfig.extraCharge;
  const totalPrice = basePrice + materialExtra;
  const symbol = FRAME_PRICING.currencySymbol;

  return {
    basePrice,
    materialExtra,
    totalPrice,
    currencySymbol: symbol,
    profileName: profileConfig.name,
    materialName: materialConfig.name,
    formattedBasePrice: `${symbol}${basePrice}`,
    formattedMaterialExtra:
      materialExtra > 0 ? `+${symbol}${materialExtra}` : `${symbol}0 (Included)`,
    formattedTotalPrice: `${symbol}${totalPrice}`,
  };
}

