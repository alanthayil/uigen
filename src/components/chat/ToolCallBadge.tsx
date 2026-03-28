"use client";

import { Loader2 } from "lucide-react";

const COMMAND_LABELS: Record<string, Record<string, string>> = {
  str_replace_editor: {
    create: "Creating",
    str_replace: "Editing",
    insert: "Editing",
    view: "Viewing",
    undo_edit: "Undoing edit in",
  },
  file_manager: {
    rename: "Renaming",
    delete: "Deleting",
  },
};

function getLabel(toolName: string, command: string | undefined): string {
  return COMMAND_LABELS[toolName]?.[command ?? ""] ?? toolName;
}

function getFilename(path: string | undefined): string | null {
  if (!path) return null;
  return path.split("/").filter(Boolean).pop() ?? path;
}

function getDisplayText(
  toolName: string,
  args: { command?: string; path?: string }
): string {
  const label = getLabel(toolName, args.command);
  const filename = getFilename(args.path);
  return filename ? `${label} ${filename}` : label;
}

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: { command?: string; path?: string; [key: string]: unknown };
  state: "result" | "call" | "partial-call";
  result?: unknown;
}

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const { toolName, args, state, result } = toolInvocation;
  const isDone = state === "result" && result != null;
  const displayText = getDisplayText(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{displayText}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{displayText}</span>
        </>
      )}
    </div>
  );
}
