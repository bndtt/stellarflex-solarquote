import { cn } from "@/lib/utils";

interface SectionDividerProps {
  variant?: "wave" | "curve" | "slant";
  color?: string;
  flip?: boolean;
  className?: string;
}

const paths: Record<string, string> = {
  wave: "M0,32 C360,80 720,0 1080,48 C1260,64 1380,24 1440,32 L1440,64 L0,64 Z",
  curve: "M0,48 Q720,0 1440,48 L1440,64 L0,64 Z",
  slant: "M0,64 L1440,0 L1440,64 Z",
};

export default function SectionDivider({
  variant = "wave",
  color = "fill-white",
  flip = false,
  className,
}: SectionDividerProps) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden leading-[0] -mb-px",
        flip && "rotate-180",
        className,
      )}
    >
      <svg
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        className="w-full h-10 sm:h-12 lg:h-16"
      >
        <path d={paths[variant]} className={color} />
      </svg>
    </div>
  );
}
