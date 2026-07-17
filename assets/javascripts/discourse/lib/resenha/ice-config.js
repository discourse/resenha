function parseServerList(setting) {
  return (setting || "")
    .split("|")
    .map((url) => url.trim())
    .filter(Boolean);
}

export function iceServers(siteSettings) {
  const servers = [];

  parseServerList(siteSettings.resenha_stun_servers).forEach((url) => {
    servers.push({ urls: url });
  });

  const turnServers = parseServerList(siteSettings.resenha_turn_servers);
  if (turnServers.length) {
    const username = siteSettings.resenha_turn_username;
    const credential = siteSettings.resenha_turn_credential;

    turnServers.forEach((url) => {
      const server = { urls: url };
      if (username) {
        server.username = username;
      }
      if (credential) {
        server.credential = credential;
      }
      servers.push(server);
    });
  }

  return servers;
}

// When only TURN servers are configured (no STUN), force all traffic
// through the relay so peers don't waste time on host/srflx candidates
// that can never connect.
export function iceTransportPolicy(siteSettings) {
  const hasStun = parseServerList(siteSettings.resenha_stun_servers).length > 0;
  const hasTurn = parseServerList(siteSettings.resenha_turn_servers).length > 0;

  return !hasStun && hasTurn ? "relay" : "all";
}
