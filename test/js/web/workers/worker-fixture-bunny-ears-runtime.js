self.onmessage = event => {
  if (event.data !== "boot") {
    self.postMessage({
      ok: false,
      error: `unknown message: ${String(event.data)}`,
    });
    return;
  }

  const carrot = new Worker(new URL("worker-fixture-bunny-ears-carrot.js", import.meta.url).href, {
    type: "module",
    permissions: {
      read: true,
      write: true,
      env: false,
      run: false,
      ffi: false,
      addons: false,
      worker: false,
    },
  });

  const actions = [];
  let settled = false;

  const finish = payload => {
    if (settled) return;
    settled = true;
    carrot.terminate();
    self.postMessage(payload);
  };

  carrot.onerror = error => {
    finish({
      ok: false,
      error: error.message || String(error.error || error),
    });
  };

  carrot.onmessage = ({ data }) => {
    if (data?.type === "ready") {
      carrot.postMessage({ type: "event", name: "boot" });
      carrot.postMessage({ type: "request", requestId: 1, method: "probe" });
      return;
    }

    if (data?.type === "action") {
      actions.push(data);
      return;
    }

    if (data?.type === "response" && data.requestId === 1) {
      finish({
        ok: true,
        actions,
        probe: data.payload,
      });
    }
  };

  carrot.postMessage({
    type: "init",
    manifest: {
      id: "dev.electrobun.forrager",
    },
  });
};
