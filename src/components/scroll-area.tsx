import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "../lib/cn";

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      className={cn("rqs-scroll-area", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport className="rqs-scroll-area__viewport">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.ScrollAreaScrollbar
        orientation="vertical"
        className="rqs-scroll-area__scrollbar"
      >
        <ScrollAreaPrimitive.ScrollAreaThumb className="rqs-scroll-area__thumb" />
      </ScrollAreaPrimitive.ScrollAreaScrollbar>
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

export { ScrollArea };
