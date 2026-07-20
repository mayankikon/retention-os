"use client";

import { useCallback, useEffect, useState } from "react";
import {
  TEMPLATES_UPDATED_EVENT,
  getTemplates,
} from "@/lib/template-store";
import type { MessageTemplate } from "@/types/template";

export function useTemplates(): MessageTemplate[] {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);

  const refresh = useCallback(() => {
    setTemplates(getTemplates());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(TEMPLATES_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(TEMPLATES_UPDATED_EVENT, refresh);
  }, [refresh]);

  return templates;
}

export function useTemplate(templateId: string): MessageTemplate | null {
  const templates = useTemplates();
  return templates.find((template) => template.id === templateId) ?? null;
}
