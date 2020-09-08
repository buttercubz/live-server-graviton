import liveServer,{ LiveServerParams } from "live-server"
import open  from "open"
import './node_modules/live-server/injected.html'

export function entry({ StatusBarItem, Notification, RunningConfig, ContextMenu }: any) {
  let launchedServers = {}

  const config = {
    port: 5520,
    hint: "List live servers",
    anyFolderHint: "Open some folder",
    inactive: {
      text: "[⚡ Run]",
    },
    active: {
      text: "[🔌 Dispose]",
    },
  };
  
  const anyFolderOpened =  () => RunningConfig.data.workspaceConfig.folders.length > 0
  
  const BarItem = new StatusBarItem({
    label: 'Live Server',
    hint: config.anyFolderHint,
    action(e: MouseEvent) {
     
      if(!anyFolderOpened()) return
      
      new ContextMenu({
        event: e,
        parent:e.target,
        list: RunningConfig.data.workspaceConfig.folders.map(({ name, path }) => {
          
          const status = launchedServers[path] ? config.active.text : config.inactive.text
          
          return {
            label: `${status} -> ${name}`,
            action(){
              const isRunning = !!launchedServers[path]

              if(isRunning){
                launchedServers[path].stop()
                launchedServers[path] = null
              }else{
                const serverInstance = runServer(path)
                launchedServers[path] = serverInstance
                launchedServers[path].run()
              }
            }
          }
        })
      })
    },
  });
  
  RunningConfig.on('addFolderToRunningWorkspace',() => {
    BarItem.setHint(config.hint)
  })
  
  function runServer(dir: string) {
    const liveServerParam: LiveServerParams = {
      port: config.port,
      host: "127.0.0.1",
      open: false,
      wait: 1000,
      logLevel: 0,
      root: dir,
    };
    
    new Notification({
      title: 'LiveServer',
      content: `Serving ${dir} on port ${config.port}`
    })
    
    setTimeout(()=>{
      open("http://localhost:5520/");
    },500)
    
    return {
      run : () => liveServer.start(liveServerParam),
      stop : () => liveServer.shutdown()
    }
  }
}


