function formatError(error) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return String(error);
}

self.onmessage = async event => {
  const probe = event.data;

  try {
    switch (probe) {
      case "read": {
        const fs = await import("node:fs");
        self.postMessage({
          status: "allowed",
          value: fs.existsSync(new URL(import.meta.url)),
        });
        return;
      }

      case "env": {
        const env = process.env;
        const proc = process;
        self.postMessage({
          status: "allowed",
          value: {
            direct: process.env.HOME ?? null,
            directNested: process["env"]["HOME"] ?? null,
            viaVar: env.HOME ?? null,
            viaProc: proc.env.HOME ?? null,
            keys: Object.keys(process.env),
          },
        });
        return;
      }

      case "run": {
        const cmd =
          process.platform === "win32"
            ? ["cmd.exe", "/c", "echo", "bun"]
            : ["/bin/echo", "bun"];
        const result = Bun.spawnSync(cmd, { stdout: "pipe", stderr: "pipe" });
        self.postMessage({
          status: "allowed",
          value: result.stdout.toString().trim(),
        });
        return;
      }

      case "ffi": {
        await import("bun:ffi");
        self.postMessage({
          status: "allowed",
          value: "ffi",
        });
        return;
      }

      case "nested-read": {
        const nested = new Worker(
          new URL(import.meta.url).href,
          {
            permissions: {
              read: true,
            },
          },
        );

        const result = await new Promise((resolve, reject) => {
          nested.onmessage = message => resolve(message.data);
          nested.onerror = error => reject(error.message || error.error || error);
          nested.postMessage("read");
        });
        nested.terminate();
        self.postMessage(result);
        return;
      }

      case "nested-worker": {
        const nested = new Worker(new URL(import.meta.url).href, {});
        nested.terminate();
        self.postMessage({
          status: "allowed",
          value: true,
        });
        return;
      }

      default: {
        self.postMessage({
          status: "blocked",
          error: `unknown probe: ${probe}`,
        });
      }
    }
  } catch (error) {
    self.postMessage({
      status: "blocked",
      error: formatError(error),
    });
  }
};
