import type { Category, CleaningMode, Inspection } from "./unicode";

export function startInspection(
  text: string,
  mode: CleaningMode,
  selected: Category[],
): { promise: Promise<Inspection>; cancel: () => void } {
  let worker: Worker | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let settled = false;
  let rejectTask: (error: Error) => void = () => {};
  const stop = () => {
    clearTimeout(timer);
    worker?.terminate();
  };
  const fail = (error: Error) => {
    if (settled) return;
    settled = true;
    stop();
    rejectTask(error);
  };
  const promise = new Promise<Inspection>((resolve, reject) => {
    rejectTask = reject;
    try {
      worker = new Worker("/inspector-worker.js");
      timer = setTimeout(
        () =>
          fail(
            new Error(
              "The inspection worker did not start within 10 seconds. Reload the page and try again.",
            ),
          ),
        10000,
      );
      let ready = false;
      worker.onerror = () =>
        fail(
          new Error(
            "The inspection worker could not load or stopped. Reload the page and try again.",
          ),
        );
      worker.onmessageerror = () =>
        fail(
          new Error(
            "The worker response could not be read. Try inspecting the text again.",
          ),
        );
      worker.onmessage = (event: MessageEvent<unknown>) => {
        if (settled) return;
        const data = event.data;
        if (typeof data !== "object" || data === null || !("type" in data)) {
          fail(new Error("The worker sent an invalid response."));
          return;
        }
        if (data.type === "fatal") {
          fail(
            new Error(
              "error" in data && typeof data.error === "string"
                ? data.error
                : "Text inspection failed.",
            ),
          );
          return;
        }
        if (
          data.type === "ready" &&
          "version" in data &&
          data.version === 1 &&
          !ready
        ) {
          ready = true;
          clearTimeout(timer);
          timer = setTimeout(
            () =>
              fail(
                new Error(
                  "Inspection exceeded 20 seconds. Try a smaller piece of text.",
                ),
              ),
            20000,
          );
          try {
            worker?.postMessage({ id: 1, text, mode, selected });
          } catch {
            fail(new Error("The text could not be sent to the local worker."));
          }
          return;
        }
        if (
          ready &&
          data.type === "success" &&
          "id" in data &&
          data.id === 1 &&
          "result" in data &&
          typeof data.result === "object" &&
          data.result !== null &&
          "cleaned" in data.result &&
          typeof data.result.cleaned === "string" &&
          "findings" in data.result &&
          Array.isArray(data.result.findings)
        ) {
          settled = true;
          stop();
          resolve(data.result as Inspection);
          return;
        }
        fail(
          new Error(
            "The worker version or response did not match this page. Reload and try again.",
          ),
        );
      };
    } catch {
      fail(
        new Error(
          "This browser could not start the local text worker. Try a current browser with workers enabled.",
        ),
      );
    }
  });
  return { promise, cancel: () => fail(new Error("Inspection cancelled.")) };
}
