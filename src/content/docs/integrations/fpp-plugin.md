---
title: FPP plugin
description: Install and pair the released FPP-host macro, brightness, and playlist-identity plugin.
pageType: integration
maturity: experimental-active
complexity: advanced
---

Install the ShowMesh plugin on the FPP player to submit macros, control brightness, and report playlist-entry identity. FPP retains scheduling, playlist order, and playback authority.

:::caution[Test the player before a show]
Core and FPP plugin 0.2.0 are pre-alpha prereleases and must be upgraded together. Test installation, brightness, playlist reporting, and recovery on your player before using them during a show. Signed fallback entries can be cached and resolved locally, but they do not provide coordinator-to-node activation delivery or an operational coordinator-outage safeguard. Local fallback refuses to run when `/etc/showmesh-fpp-plugin` is not owned by root.
:::

## Install the plugin

1. Use FPP's Plugin Manager to install [ShowMeshSystems/fpp-showmesh](https://github.com/ShowMeshSystems/fpp-showmesh).
2. Check the installation result. The installer downloads the helper for amd64, arm64, or armv7 from the [plugin 0.2.0 release](https://github.com/ShowMeshSystems/showmesh-fpp-plugin/releases/tag/v0.2.0) and verifies it against committed artifact digests. It refuses a mismatch.
3. Confirm the native component loads for your FPP version. The adapters support FPP 9.4–9.x and FPP 10.x; FPP 8 is unsupported. FPP 10 objects are built against FPP 10.0. When a matching prebuilt object is unavailable, the installer compiles native source against the host's installed FPP headers.
4. Open the plugin page, save the **Coordinator address** as the coordinator API URL (for example, `http://<coordinator-host>:8080`), then pair it with the coordinator. The player must be able to reach that address.

## Pair by code

Add the player's endpoint in **Settings > Connections** first. On the plugin page, select **Pair with coordinator** and read the `XXXX-XXXX` code, then enter that code for the player in ShowMesh's Connections page. Opening a pairing requires `principal:write`.

The CLI equivalent is:

```sh
showmeshctl fpp pair <instance-id> <code>
showmeshctl fpp pairing <instance-id>
```

A pairing stays open for ten minutes and can be used once. Wait for `paired`; `waiting` only means the coordinator is ready for the plugin to finish. If it expires, read a fresh code on the plugin page and try again. Confirm the coordinator address is reachable from the player if it stays waiting.

The plugin receives its own scheduler credential. You save the coordinator address on the player, but do not enter or copy a bearer token. The helper reads `/etc/showmesh-fpp-plugin/credential` and requires mode `0600`; never use a human administrator token or put the plugin credential in a command, URL, or environment variable.

## Check brightness and playlist reporting

Connections and Live Control show each player's observed brightness. Set a brightness ceiling through ShowMesh or the CLI:

```sh
showmeshctl fpp set-brightness-ceiling <instance-id> <0-100>
```

ShowMesh reports confirmation only after the plugin reads the ceiling back. Transition gain is a separate multiplier and does not overwrite the scheduled ceiling. If the result is unconfirmed, inspect the player before retrying.

Use the Playlists tab's **Re-import** button after changing an FPP playlist. It asks the host plugin to send definitions again and distinguishes a sent request from an import that landed. An unconfirmed result gives the reason. See [FPP](../fpp/) for the read-only playlist evidence commands.

## Read the local macro outcome

```sh
showmesh-fpp-plugin status
```

This reads the host-local record without contacting the coordinator:

- `ok`: the macro-run request was accepted; inspect the run to confirm its steps completed.
- `refused`: authentication or authorization failed.
- `rejected`: the coordinator declined the request, such as an unknown macro or conflict.
- `unreachable`: the coordinator could not be reached or returned a server error.
- `local_error`: local credential or configuration validation failed before a request was sent.

Invalid command arguments can fail before writing a status record. A refusal calls for credential repair; an unreachable result calls for network or coordinator checks.

Failed submissions are retained locally and attached to a later successful authenticated submission. The buffer holds at most 50 entries for at most 30 days and counts dropped entries. Check the host-local record while the coordinator is unavailable.
