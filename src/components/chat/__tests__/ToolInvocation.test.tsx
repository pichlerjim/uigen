import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocation, getToolMessage } from "../ToolInvocation";

afterEach(() => {
  cleanup();
});

// getToolMessage — str_replace_editor commands

test("getToolMessage maps create to 'Created <file>'", () => {
  const message = getToolMessage("str_replace_editor", {
    command: "create",
    path: "/components/Button.tsx",
  });
  expect(message).toBe("Created Button.tsx");
});

test("getToolMessage maps str_replace to 'Edited <file>'", () => {
  const message = getToolMessage("str_replace_editor", {
    command: "str_replace",
    path: "/components/Button.tsx",
  });
  expect(message).toBe("Edited Button.tsx");
});

test("getToolMessage maps insert to 'Edited <file>'", () => {
  const message = getToolMessage("str_replace_editor", {
    command: "insert",
    path: "/components/Button.tsx",
  });
  expect(message).toBe("Edited Button.tsx");
});

test("getToolMessage maps view to 'Viewing <file>'", () => {
  const message = getToolMessage("str_replace_editor", {
    command: "view",
    path: "/components/Button.tsx",
  });
  expect(message).toBe("Viewing Button.tsx");
});

test("getToolMessage maps undo_edit to 'Reverted changes to <file>'", () => {
  const message = getToolMessage("str_replace_editor", {
    command: "undo_edit",
    path: "/components/Button.tsx",
  });
  expect(message).toBe("Reverted changes to Button.tsx");
});

// getToolMessage — file_manager commands

test("getToolMessage maps rename to 'Renamed <file> to <newFile>'", () => {
  const message = getToolMessage("file_manager", {
    command: "rename",
    path: "/a/Old.tsx",
    new_path: "/b/New.tsx",
  });
  expect(message).toBe("Renamed Old.tsx to New.tsx");
});

test("getToolMessage maps delete to 'Deleted <file>'", () => {
  const message = getToolMessage("file_manager", {
    command: "delete",
    path: "/components/Button.tsx",
  });
  expect(message).toBe("Deleted Button.tsx");
});

// getToolMessage — fallbacks

test("getToolMessage falls back to toolName when args are empty", () => {
  const message = getToolMessage("str_replace_editor", {});
  expect(message).toBe("str_replace_editor");
});

test("getToolMessage falls back to toolName for an unknown tool", () => {
  const message = getToolMessage("mystery_tool", {
    command: "create",
    path: "/components/Button.tsx",
  });
  expect(message).toBe("mystery_tool");
});

test("getToolMessage falls back to toolName for an unknown command", () => {
  const message = getToolMessage("str_replace_editor", {
    command: "explode",
    path: "/components/Button.tsx",
  });
  expect(message).toBe("str_replace_editor");
});

test("getToolMessage falls back to toolName when rename is missing new_path", () => {
  const message = getToolMessage("file_manager", {
    command: "rename",
    path: "/a/Old.tsx",
  });
  expect(message).toBe("file_manager");
});

// getToolMessage — file name extraction

test("getToolMessage uses only the file name from a nested path", () => {
  const message = getToolMessage("str_replace_editor", {
    command: "create",
    path: "/src/components/ui/Card.tsx",
  });
  expect(message).toBe("Created Card.tsx");
});

test("getToolMessage handles a bare filename with no slashes", () => {
  const message = getToolMessage("str_replace_editor", {
    command: "create",
    path: "Card.tsx",
  });
  expect(message).toBe("Created Card.tsx");
});

// ToolInvocation component

test("ToolInvocation renders the friendly message", () => {
  render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="result"
      args={{ command: "create", path: "/components/Button.tsx" }}
      result="ok"
    />
  );
  expect(screen.getByText("Created Button.tsx")).toBeDefined();
});

test("ToolInvocation shows the completed dot when state is result with a result", () => {
  const { container } = render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="result"
      args={{ command: "create", path: "/components/Button.tsx" }}
      result="ok"
    />
  );
  expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolInvocation shows the spinner while in progress", () => {
  const { container } = render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="call"
      args={{ command: "create", path: "/components/Button.tsx" }}
    />
  );
  expect(container.querySelector(".animate-spin")).not.toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolInvocation falls back to the raw tool name with empty args", () => {
  render(
    <ToolInvocation toolName="str_replace_editor" state="call" args={{}} />
  );
  expect(screen.getByText("str_replace_editor")).toBeDefined();
});
