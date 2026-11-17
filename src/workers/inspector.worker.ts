import {
  inspectText,
  categories,
  type Category,
  type CleaningMode,
} from "../lib/unicode";

function fatal(reason: unknown) {
  self.postMessage({
    type: "fatal",
    error: reason instanceof Error ? reason.message : "Text inspection failed.",
  });
}
self.onmessage = (
  event: MessageEvent<{
    id: number;
    text: string;
    mode: CleaningMode;
    selected: Category[];
  }>,
) => {
  try {
    const { id, text, mode, selected } = event.data;
    if (
      id !== 1 ||
      typeof text !== "string" ||
      !["safe", "advanced"].includes(mode) ||
      !Array.isArray(selected) ||
      selected.some(
        (value) => !categories.some((category) => category.id === value),
      )
    )
      throw new Error("Invalid inspection request.");
    const result = inspectText(text, mode, selected);
    self.postMessage({ type: "success", id, result });
  } catch (error) {
    fatal(error);
  }
};
self.onmessageerror = () =>
  fatal(new Error("The worker could not read the text. Try pasting it again."));
self.addEventListener("unhandledrejection", (event) => {
  event.preventDefault();
  fatal(event.reason);
});
self.addEventListener("error", (event) =>
  fatal(new Error(event.message || "The inspection worker stopped.")),
);
self.postMessage({ type: "ready", version: 1 });
