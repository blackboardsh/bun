self.onmessage = async event => {
  const message = event.data;

  if (message?.type === "init") {
    self.postMessage({
      type: "ready",
      id: message.manifest?.id ?? "unknown",
    });
    return;
  }

  if (message?.type === "event" && message.name === "boot") {
    self.postMessage({
      type: "action",
      action: "set-tray",
      payload: { title: "Forrager: Calm" },
    });
    return;
  }

  if (message?.type === "request" && message.method === "probe") {
    const result = {
      read: false,
      run: "allowed",
      ffi: "allowed",
    };

    try {
      const fs = await import("node:fs");
      result.read = fs.existsSync(new URL(import.meta.url));
    } catch (error) {
      result.read = String(error);
    }

    try {
      const cmd =
        process.platform === "win32"
          ? ["cmd.exe", "/c", "echo", "bun"]
          : ["/bin/echo", "bun"];
      Bun.spawnSync(cmd, { stdout: "pipe", stderr: "pipe" });
    } catch (error) {
      result.run = String(error instanceof Error ? error.message : error);
    }

    try {
      await import("bun:ffi");
    } catch (error) {
      result.ffi = String(error instanceof Error ? error.message : error);
    }

    self.postMessage({
      type: "response",
      requestId: message.requestId,
      success: true,
      payload: result,
    });
  }
};
