import finalhandler from "finalhandler";
import serveStatic from "serve-static";
import open from "open";
import * as http from "http";

interface config {
  port: number;
  hints: {
    hint: string,
    anyFolderHint: string
  };
  inactive: {
    text: string;
  };
  active: {
    text: string
  };
}

export function entry(
  { StatusBarItem, Notification, RunningConfig, ContextMenu }: any) {

  let launchedServers = {};

  const config: config = {
    port: 5520,
    hints: {
      hint: "List live servers",
      anyFolderHint: "Open some folder"
    },
    inactive: {
      text: "⚡ Run",
    },
    active: {
      text: "🔌 Dispose",
    },
  };

  const anyFolderOpened = () =>
    RunningConfig.data.workspaceConfig.folders.length > 0;

  const BarItem = new StatusBarItem({
    label: "Live Server",
    hint: config.hints.anyFolderHint,
    action(e: MouseEvent) {
      if (!anyFolderOpened()) {
        return;
      }

      new ContextMenu({
        event: e,
        parent: e.target,
        list: RunningConfig.data.workspaceConfig.folders.map(
          ({ name, path }) => {
            const status = launchedServers[path]
              ? config.active.text
              : config.inactive.text;

            return {
              label: `${status} -> ${name}`,
              action() {
                const isRunning = !!launchedServers[path];

                if (isRunning) {
                  launchedServers[path].stop();
                  launchedServers[path] = null;
                }
                else {
                  const serverInstance = runServer(path);
                  launchedServers[path] = serverInstance;
                  launchedServers[path].run();
                }
              },
            };
          }
        ),
      });
    },
  });

  RunningConfig.on("addFolderToRunningWorkspace", () => {
    BarItem.setHint(config.hints.hint);
  });

  function runServer(dir: string): {run: any, stop: any} {
    const serve = serveStatic(dir);

    const server = http.createServer(function (req, res) {
      const done = finalhandler(req, res);
      // @ts-ignore
      serve(req, res, done);
    });

    new Notification({
      title: "LiveServer",
      content: `Serving on port ${config.port}`,
    });

    setTimeout(() => {
      open(`http://localhost:${config.port}`);
    }, 500);

    return {
      run: () => server.listen(config.port),
      stop: () => server.close(),
    };
  }
}
