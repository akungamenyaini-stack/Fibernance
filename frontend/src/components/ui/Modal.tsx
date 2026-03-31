import { useEffect, useId, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cn } from "./cn";

export interface ModalProps {
  open: boolean;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  className?: string;
  contentClassName?: string;
  overlayClassName?: string;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

export function Modal({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  className,
  contentClassName,
  overlayClassName,
  closeOnOverlayClick = true,
  showCloseButton = true,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return createPortal(
    <div
      className={cn("fixed inset-0 z-50 bg-black/60 px-4 py-6", overlayClassName)}
      onClick={handleOverlayClick}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descriptionId : undefined}
          className={cn("w-full max-w-2xl border border-gray-300 bg-white rounded-none", className)}
        >
          {(title || description || showCloseButton) && (
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
              <div className="space-y-1">
                {title && (
                  <h2 id={titleId} className="text-sm font-semibold font-sans uppercase tracking-[0.18em] text-black">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id={descriptionId} className="text-sm font-sans text-charcoal">
                    {description}
                  </p>
                )}
              </div>

              {showCloseButton && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="border border-gray-300 px-3 py-2 text-xs font-medium font-sans uppercase tracking-[0.18em] text-black rounded-none transition-colors duration-200 hover:border-black hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black focus:ring-offset-2"
                >
                  Close
                </button>
              )}
            </div>
          )}

          <div className={cn("px-6 py-6", contentClassName)}>{children}</div>

          {footer && <div className="border-t border-gray-200 px-6 py-5">{footer}</div>}
        </div>
      </div>
    </div>,
    document.body,
  );
}