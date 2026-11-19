import type { Metadata } from "next";
import "../frame-studio.css";
import FrameStudio from "../../components/frames/FrameStudio";

export const metadata: Metadata = {
  title: "Frame Studio | Create your frame",
  description: "Choose a frame size and orientation and see your frame take shape.",
};

export default function FramesPage() {
  return (
    <main>
      <FrameStudio />
    </main>
  );
}