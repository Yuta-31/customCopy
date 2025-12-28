import { Button } from "@/components/ui/button";

interface DownloadProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  icon: React.ReactNode;
  text: string;
  disabled?: boolean;
  onClick?: () => void;
}

const HoverExpandButton = ({ variant = "outline", icon, text, onClick, disabled = false }: DownloadProps) => {
  return (
    <Button variant={variant} className="cursor-pointer group gap-0" onClick={onClick} disabled={disabled}>
      {icon}
      <span
        className="
          ml-0
          max-w-0
          opacity-0
          whitespace-nowrap
          transition-all duration-300 ease-in
          overflow-hidden
          group-hover:ml-2
          group-hover:max-w-[80px]
          group-hover:opacity-100"
      >
        {text}
      </span>
    </Button>
  );
};

export default HoverExpandButton;
