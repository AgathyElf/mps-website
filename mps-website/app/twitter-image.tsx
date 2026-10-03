import { ImageResponse } from "next/og";
import { MpsSocialCard } from "@/components/social-card";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(<MpsSocialCard />, size);
}
