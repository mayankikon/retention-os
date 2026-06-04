"use client";

import { useRef } from "react";
import { ImagePlus, Upload } from "lucide-react";
import { FormField } from "@/components/campaigns/setup/FormField";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OptionalImageUploadProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  fileName?: string | null;
  previewUrl: string | null;
  onChange: (fileName: string | null, previewUrl: string | null) => void;
}

function revokePreviewUrl(previewUrl: string | null) {
  if (previewUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(previewUrl);
  }
}

export function OptionalImageUpload({
  label,
  htmlFor,
  hint,
  error,
  fileName,
  previewUrl,
  onChange,
}: OptionalImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasImage = Boolean(previewUrl);

  const handleBrowseClick = () => {
    inputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    revokePreviewUrl(previewUrl);
    onChange(file.name, URL.createObjectURL(file));
  };

  const handleRemove = () => {
    revokePreviewUrl(previewUrl);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onChange(null, null);
  };

  return (
    <FormField label={label} htmlFor={htmlFor} hint={hint} error={error}>
      <input
        ref={inputRef}
        id={htmlFor}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="sr-only"
        aria-label={`Upload ${label.toLowerCase()}`}
      />

      {hasImage ? (
        <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
          <div className="flex items-center justify-center bg-muted/50 p-4">
            <img
              src={previewUrl ?? undefined}
              alt={`${label} preview`}
              className="max-h-64 w-full object-contain"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="min-w-0 text-sm text-muted-foreground">
              <span className="sr-only">Selected file:</span>
              <span className="truncate font-medium text-foreground">
                {fileName ?? "Uploaded image"}
              </span>
            </p>

            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleBrowseClick}
              >
                <Upload className="h-4 w-4" />
                Change image
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleBrowseClick}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center transition-colors hover:border-brand-primary hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            error && "border-red-500",
          )}
        >
          <ImagePlus className="h-8 w-8 text-muted-foreground" aria-hidden />
          <span className="text-sm font-medium text-foreground">
            Choose an image
          </span>
          <span className="text-xs text-muted-foreground">
            PNG, JPG, or WebP
          </span>
        </button>
      )}
    </FormField>
  );
}
