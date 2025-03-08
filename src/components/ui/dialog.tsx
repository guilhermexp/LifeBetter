
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(({
  className,
  ...props
}, ref) => (
  <DialogPrimitive.Overlay 
    ref={ref} 
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", 
      className
    )} 
    {...props} 
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(({
  className,
  children,
  ...props
}, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content 
      ref={ref} 
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-[95%] max-w-md translate-x-[-50%] translate-y-[-50%] gap-0 border bg-white p-0 shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl rounded-lg overflow-hidden", 
        className
      )} 
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn(
      "bg-gradient-to-r from-purple-600 to-indigo-600 p-5 text-white", 
      className
    )} 
    {...props} 
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 p-4 border-t border-gray-100 bg-gray-50", 
      className
    )} 
    {...props} 
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(({
  className,
  ...props
}, ref) => (
  <DialogPrimitive.Title 
    ref={ref} 
    className={cn(
      "text-lg font-semibold text-white", 
      className
    )} 
    {...props} 
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(({
  className,
  ...props
}, ref) => (
  <DialogPrimitive.Description 
    ref={ref} 
    className={cn(
      "text-sm text-white/90", 
      className
    )} 
    {...props} 
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const DialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn(
      "p-5 space-y-4", 
      className
    )} 
    {...props} 
  />
);
DialogBody.displayName = "DialogBody";

export { 
  Dialog, 
  DialogPortal, 
  DialogOverlay, 
  DialogClose, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogBody, 
  DialogFooter, 
  DialogTitle, 
  DialogDescription 
};
