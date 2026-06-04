"use client";

import { FormField } from "@/components/campaigns/setup/FormField";
import { Input } from "@/components/ui/input";
import {
  getSuppressionListAcceptAttribute,
  parseSuppressionListFile,
} from "@/lib/suppression-list";

interface SuppressionListUploadProps {
  fileName: string | null;
  entryCount: number | null;
  error?: string;
  onChange: (fileName: string | null, entryCount: number | null) => void;
}

export function SuppressionListUpload({
  fileName,
  entryCount,
  error,
  onChange,
}: SuppressionListUploadProps) {
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      onChange(null, null);
      return;
    }

    const parsed = await parseSuppressionListFile(file);
    onChange(parsed.fileName, parsed.entryCount);
  };

  return (
    <FormField
      label="Suppression list"
      htmlFor="suppressionList"
      hint="Optional. Upload a CSV or TXT file with one phone number per line. Opted-out and do-not-contact numbers will be excluded from this campaign."
      error={error}
    >
      <Input
        id="suppressionList"
        type="file"
        accept={getSuppressionListAcceptAttribute()}
        onChange={handleFileChange}
        className="cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm"
      />
      {fileName ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Loaded{" "}
          <span className="font-medium text-foreground">{fileName}</span>
          {entryCount !== null
            ? ` — ${entryCount.toLocaleString("en-US")} numbers`
            : null}
        </p>
      ) : null}
    </FormField>
  );
}
