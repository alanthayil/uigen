import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

function makeInvocation(
  toolName: string,
  args: { command?: string; path?: string },
  state: "result" | "call" | "partial-call" = "result",
  result: unknown = "Success"
) {
  return { toolCallId: "test-id", toolName, args, state, result };
}

// --- str_replace_editor command mappings ---

test("renders 'Creating <filename>' for str_replace_editor create command", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "create",
        path: "src/components/Card.jsx",
      })}
    />
  );
  expect(screen.getByText("Creating Card.jsx")).toBeDefined();
});

test("renders 'Editing <filename>' for str_replace_editor str_replace command", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "str_replace",
        path: "src/App.tsx",
      })}
    />
  );
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
});

test("renders 'Editing <filename>' for str_replace_editor insert command", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "insert",
        path: "src/index.tsx",
      })}
    />
  );
  expect(screen.getByText("Editing index.tsx")).toBeDefined();
});

test("renders 'Viewing <filename>' for str_replace_editor view command", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "view",
        path: "src/utils.ts",
      })}
    />
  );
  expect(screen.getByText("Viewing utils.ts")).toBeDefined();
});

test("renders 'Undoing edit in <filename>' for str_replace_editor undo_edit command", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "undo_edit",
        path: "src/Button.tsx",
      })}
    />
  );
  expect(screen.getByText("Undoing edit in Button.tsx")).toBeDefined();
});

// --- file_manager command mappings ---

test("renders 'Renaming <filename>' for file_manager rename command", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("file_manager", {
        command: "rename",
        path: "src/OldName.tsx",
      })}
    />
  );
  expect(screen.getByText("Renaming OldName.tsx")).toBeDefined();
});

test("renders 'Deleting <filename>' for file_manager delete command", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("file_manager", {
        command: "delete",
        path: "src/Unused.tsx",
      })}
    />
  );
  expect(screen.getByText("Deleting Unused.tsx")).toBeDefined();
});

// --- filename extraction ---

test("extracts filename from deeply nested path", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "create",
        path: "src/components/ui/deep/Button.tsx",
      })}
    />
  );
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("uses filename when path has no directory separator", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "create",
        path: "Button.tsx",
      })}
    />
  );
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("renders label only when path is undefined", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "create",
      })}
    />
  );
  expect(screen.getByText("Creating")).toBeDefined();
});

// --- loading vs done state ---

test("shows spinner and no green dot when state is 'call'", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create", path: "src/Card.jsx" },
        "call",
        undefined
      )}
    />
  );
  expect(container.querySelector(".animate-spin")).not.toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows spinner and no green dot when state is 'partial-call'", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create", path: "src/Card.jsx" },
        "partial-call",
        undefined
      )}
    />
  );
  expect(container.querySelector(".animate-spin")).not.toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows green dot and no spinner when state is 'result' with result", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create", path: "src/Card.jsx" },
        "result",
        { success: true }
      )}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("shows spinner when state is 'result' but result is null", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create", path: "src/Card.jsx" },
        "result",
        null
      )}
    />
  );
  expect(container.querySelector(".animate-spin")).not.toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

// --- unknown tool fallback ---

test("falls back to raw toolName for unknown tool", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("unknown_tool", {
        command: "create",
        path: "src/file.ts",
      })}
    />
  );
  expect(screen.getByText("unknown_tool file.ts")).toBeDefined();
});

test("renders raw toolName for unknown tool with no command and no path", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("some_other_tool", {})}
    />
  );
  expect(screen.getByText("some_other_tool")).toBeDefined();
});

// --- CSS classes ---

test("applies correct CSS classes to the wrapper element", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "create",
        path: "src/Card.jsx",
      })}
    />
  );
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper.className).toContain("inline-flex");
  expect(wrapper.className).toContain("bg-neutral-50");
  expect(wrapper.className).toContain("rounded-lg");
  expect(wrapper.className).toContain("font-mono");
  expect(wrapper.className).toContain("border-neutral-200");
});
