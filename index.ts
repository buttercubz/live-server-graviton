import liveServer, { LiveServerParams } from "live-server";
import open from "open";

export function entry({ StatusBarItem, Notification, RunningConfig }: any) {
  let active = false;

  const config = {
    port: 5520,
    inactive: {
      text: "Live Server",
      hint: "Click to run live server",
      middle: "⚡ Starting",
    },
    active: {
      text: "Server on Port: 5520",
      hint: "Click to close server",
      middle: "🔌 Disposing",
    },
  };

  function main(dir: string) {
    const liveServerParam: LiveServerParams = {
      port: 5520,
      host: "127.0.0.1",
      open: false,
      wait: 1000,
      logLevel: 0,
      root: dir,
    };

    const run = () => liveServer.start(liveServerParam);
    const stop = () => liveServer.shutdown();

    const bar = new StatusBarItem({
      label: active ? config.active.text : config.inactive.text,
      hint: active ? config.active.hint : config.inactive.hint,
      action() {
        bar.setLabel(active ? config.active.middle : config.inactive.middle);
        setTimeout(() => {
          active = !active;
          if (active) {
            run();
            open("http://localhost:5520/");
          } else {
            stop();
          }
          bar.setLabel(active ? config.active.text : config.inactive.text);
          bar.setHint(active ? config.active.hint : config.inactive.hint);
        }, 2000);
      },
    });
  }

  RunningConfig.on("addFolderToRunningWorkspace", ({ folderPath }: any) => {
    try {
      main(folderPath);
    } catch (err) {
      new Notification({
        title: "Live Server (Error)",
        lifeTime: 9000,
        content: err.message,
      });
    }
  });
}

// module.exports = {
//   entry,
// };
