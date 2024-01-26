import { ActionPanel, List, Action, Color, Icon } from "@raycast/api";
import { execSync } from "child_process";
import { useEffect, useState } from "react";

class Connection {
  id: string;
  name: string;
  status: string;

  constructor(id: string, name: string, status: string) {
    this.id = id;
    this.name = name;
    this.status = status
  }

  public isConnected(): Boolean {
    return this.status.includes("secs") || this.status.includes("min")
  }

  public isConnecting(): Boolean {
    return !this.isConnected() && this.status != "Disconnected"
  }

  public connect() {
    execSync(`pritunl-client start ${this.id}`, { shell: "/bin/zsh" })
  }

  public disconnect() {
    execSync(`pritunl-client stop ${this.id}`, { shell: "/bin/zsh" })
  }

  public stylizedText() {
    if (this.isConnected()) {
      return { value: "Connected", color: Color.Green }
    }

    if (this.isConnecting()) {
      return { value: "Connecting...", color: Color.Yellow }
    }

    return { value: "Disconnected" }
  }

  public icon() {
    if (this.isConnected()) {
      return Icon.Wifi
    }

    return Icon.WifiDisabled
  }

}

function fetchProfiles(stateCallback: any) {
  let rawConnection = JSON.parse(execSync("pritunl-client list -j", { shell: "/bin/zsh" }).toString());
  let connections = rawConnection.map((connection: any) => new Connection(connection.id, connection.name, connection.status))
  stateCallback(() => connections)
}


export default function Command() {
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    fetchProfiles(setConnections)
    let id = setInterval(() => fetchProfiles(setConnections), 1000)
    return () => {
      clearInterval(id)
    }
  }, [])

  return (
    <List>
      {connections.map((connection: any) => (
        <List.Item
          key={connection.id}
          icon={connection.icon()}
          title={connection.name}
          accessories={[{ text: connection.stylizedText() }]}
          subtitle={connection.isConnected() ? connection.status : ""}
          actions={
            <ActionPanel>
              <Action title="Connect" onAction={() => connection.connect()} />
              <Action title="Disconnect" onAction={() => connection.disconnect()} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
