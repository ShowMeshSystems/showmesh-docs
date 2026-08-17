---
title: Resolume Arena
description: Configure Arena observation, upload composition identity, and use evidence-confirmed actions.
status: experimental-testing
---

ShowMesh integrates with Resolume Arena through its REST API and WebSocket updates, with polling as a fallback. It can track one or more store-configured instances; the legacy environment seam supports one instance.

## Prepare Arena

1. Enable Arena's Webserver/API.
2. Confirm the coordinator can reach its base URL, commonly on port `8080` or the port configured in Arena.
3. Add the instance in the Operator UI configuration page with a unique ShowMesh ID and URL.
4. Upload the exact `.avc` composition file through **Resolume → Composition**. ShowMesh parses stable deck, layer, column, and clip identities from the file.

Composition upload stores an identity map; it does not upload or open that composition in Arena.

## Check status

```sh
showmeshctl resolume status
showmeshctl resolume composition show
showmeshctl resolume action list
```

The status view distinguishes collection failure, stale evidence, and genuinely empty or unknown composition state.

## Available actions

- launch a clip;
- clear a layer;
- launch a column;
- select a deck;
- blackout tracked layers;
- set layer bypass;
- set a layer master value.

Run these from the UI, action/macro system, or the `showmeshctl resolume action ...` commands. They require the Resolume command scope and wait for confirming evidence.

## Recovery

ShowMesh can record a known Arena state and perform a manual or opt-in automatic restore after a detected restart. Treat this as advanced: verify the loaded composition identity and recovery preview on a test machine before enabling automatic restore. The default settle delay is a code default, not a guarantee measured across every Arena host.
