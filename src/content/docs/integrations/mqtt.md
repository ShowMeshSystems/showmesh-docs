---
title: Integration MQTT
description: Use explicitly configured external MQTT brokers as advanced show-action targets.
status: advanced
---

ShowMesh actions can publish to external MQTT brokers for integrations that do not have a dedicated adapter. This is an advanced, configuration-driven path: the coordinator does not discover brokers or devices, and a bad topic can operate the wrong equipment.

## Declare brokers at startup

Set a comma-separated list of IDs and URLs on the coordinator:

```sh
SHOWMESH_INTEGRATION_BROKERS='home-automation=tcp://10.0.0.5:1883'
SHOWMESH_INTEGRATION_BROKER_HOME_AUTOMATION_USERNAME='showmesh'
SHOWMESH_INTEGRATION_BROKER_HOME_AUTOMATION_PASSWORD='<password>'
```

Broker IDs use lowercase letters, digits, and hyphens. Credential variable names uppercase the ID and replace hyphens with underscores. URLs may not contain embedded credentials.

The native ShowMesh control-plane broker is deliberately **not** registered as an integration broker. FPP status MQTT is also separate. An MQTT action must name an explicitly declared integration broker or configuration is rejected.

## Author an action

Use the ShowMesh action editor/API to define the broker ID, publish topic, payload, quality of service, retain behavior, and—where the device supports it—an expected response. ShowMesh validates the target shape when the action revision is written.

An action with no response expectation can only report that publishing succeeded; it cannot confirm that the device changed state. Prefer a device response on a dedicated topic when one exists, and test its negative and malformed replies before using the action in a show macro.

## Operational cautions

- Use a dedicated, least-privilege broker account and narrow topic ACLs.
- Never copy integration credentials into public documentation or action JSON.
- A timeout after publish is an uncertain result; check the device before repeating the command.
- Broker configuration is environment-driven in this snapshot, so changing it requires a coordinator restart.
