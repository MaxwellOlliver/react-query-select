import { Loader2Icon } from "lucide-react";
import { cn } from "../lib/cn";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("rqs-spinner", className)}
      {...props}
    />
  );
}

export { Spinner };
