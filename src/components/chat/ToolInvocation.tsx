"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocationProps {
  toolName: string;
  state: "partial-call" | "call" | "result";
  args?: Record<string, any>;
  result?: any;
}

function getFileName(path: string): string {
  return path.split("/").filter(Boolean).pop() ?? path;
}

export function getToolMessage(
  toolName: string,
  args?: Record<string, any>
): string {
  const command = args?.command;
  const path = args?.path;

  if (!command || !path) {
    return toolName;
  }

  const file = getFileName(path);

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create":
        return `Created ${file}`;
      case "str_replace":
      case "insert":
        return `Edited ${file}`;
      case "view":
        return `Viewing ${file}`;
      case "undo_edit":
        return `Reverted changes to ${file}`;
      default:
        return toolName;
    }
  }

  if (toolName === "file_manager") {
    switch (command) {
      case "rename":
        if (!args?.new_path) {
          return toolName;
        }
        return `Renamed ${file} to ${getFileName(args.new_path)}`;
      case "delete":
        return `Deleted ${file}`;
      default:
        return toolName;
    }
  }

  return toolName;
}

export function ToolInvocation({
  toolName,
  state,
  args,
  result,
}: ToolInvocationProps) {
  const message = getToolMessage(toolName, args);
  const isComplete = state === "result" && result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{message}</span>
    </div>
  );
}
