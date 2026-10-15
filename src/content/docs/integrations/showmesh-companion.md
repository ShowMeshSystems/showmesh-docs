---
title: Set up ShowMesh Companion
description: Supervise Resolume locally, inspect received LTC, and collect crash reports through the coordinator.
pageType: integration
maturity: experimental-active
complexity: advanced
---

ShowMesh Companion runs on the computer beside Resolume Arena. It can launch Arena when Arena is absent and supervision is armed, display LTC received by that computer, and upload macOS Arena crash reports. The coordinator owns Show Night state; Companion applies its local arming policy.

:::note[Versions and testing]
Companion 0.2.0 has a published macOS package. Crash-report upload and retrieval require Core 0.4.0, whose source is available but whose release artifacts are not yet published. Core 0.3.1 does not provide that API. Test supervision and LTC on your equipment before relying on them during a show.
:::

## Before you start

- Use the [Companion 0.2.0 release](https://github.com/ShowMeshSystems/showmesh-companion/releases/tag/v0.2.0). The published package is a universal macOS disk image; do not assume a Windows or Linux package is available.
- Record the coordinator address, such as `http://<coordinator-host>:8080`, and confirm the computer can reach it on the show-management network.
- Locate the Arena application and, for LTC observation, the audio input and channel carrying timecode.
- Use an administrator identity to create the report-upload credential when the required Core version is installed. Companion itself needs only the narrow `companion` role.

## 1. Install and configure the local modules

1. Open the disk image, copy ShowMesh Companion to Applications, and start it. Open settings from its tray menu. Closing the settings window leaves Companion running.
2. Enter a distinct **Companion name** and the **Coordinator address**.
3. Choose **Always disarmed** while setting up. Check for a saved manual override and choose **Clear override** so the configured policy applies.
4. To supervise Arena, enable **Resolume supervision** and select the Arena application path. Confirm the local status recognizes an already-running Arena process.
5. To inspect LTC, enable **LTC observation**, select the audio input, and set its channel. Confirm the displayed timecode advances and inspect lock state, frame rate, frame age, and input level. A decoded signal proves receipt on this computer; check Arena separately to confirm that it follows timecode.
6. Save settings. Start Companion manually after logging in: **Open at login** saves a preference but does not register automatic startup.

## 2. Choose when supervision is armed

**Follow Show Night** arms supervision from preparation through fading out, and disarms it when the Night is inactive or stopped. **Always armed** and **Always disarmed** apply regardless of the Night. Tray overrides take precedence over these policies and survive a Companion restart.

:::caution[Disarm before maintenance]
While armed, Companion launches Arena if its process disappears. Disarm it before intentionally quitting Arena, updating it, or changing its project. Companion does not kill or forcibly restart a running process, and process presence does not prove usable output.
:::

For a controlled test, use a non-show composition, arm supervision, and quit Arena. Confirm Arena relaunches, then inspect its composition, outputs, and receiver. Disarm supervision if it repeatedly fails to launch and fix the application path or launch error before trying again.

If the coordinator stops answering after a successful read, Companion holds the last Night state in memory. Supervision can remain armed during an outage. A restart during that outage loses the held state and starts with an unknown Night, which **Follow Show Night** treats as disarmed. This policy reads the Night without a token; it cannot follow a coordinator that requires authenticated reads. Inspect the connection reason and use a deliberate local policy rather than assuming an unknown state is live.

## 3. Enable crash-report upload

On the required Core version:

1. In **System → Access**, create a machine principal with the `companion` role. Give each computer its own principal and token so you can revoke one independently.
2. Issue a token and store its one-time value securely. Paste it into Companion's **Coordinator token** field, enable **Crash reports**, and save. There is no Companion enrollment code.
3. Inspect the Crash reports status. It must no longer report a missing address or token. On macOS, Companion checks the user's DiagnosticReports directory and its Retired folder every 30 seconds for Arena `.ips` and `.crash` files.
4. If an existing report is present, confirm the sent count increases and retrieve the same file from the coordinator. Do not deliberately crash Arena during a show to test reporting.

Companion stores the token in its local settings file, readable only by the current user. Leaving the field blank preserves a saved token. To remove it, select **Remove the saved token** and save; revoke the token in Access as well if the computer or credential is no longer trusted.

## 4. Retrieve a report

Use a CLI matching the required Core version. Replace `<report-id>` with an ID returned by the list:

```sh
showmeshctl companion-reports list
showmeshctl companion-reports get <report-id>
```

The list shows summaries, newest first. To filter it, use `--companion <companion-id>` with an identifier from the list. `get` prints the report text; use `--output json` before the ID for content and metadata together. The API equivalents are `GET /api/v1/companion-reports` and `GET /api/v1/companion-reports/{reportId}`. There is no report browser in the Operator UI.

The coordinator keeps the newest 200 reports per Companion and deduplicates repeated content from the same Companion. Save a required report to a protected location before it ages out. Report reads follow the coordinator's ordinary observation-read policy: they are anonymous unless reads are closed, then require `observation:read`. A `companion` token can upload reports but cannot read them when reads are closed.

:::caution[Protect report contents]
Crash reports can contain usernames, file paths, and other machine details. Restrict network access to the coordinator, review its read policy, and inspect reports before sharing them. Companion sends report text to the configured coordinator; ShowMesh does not forward it to a remote service.
:::

## Recover a failed upload

| Symptom | Action and recovery check |
| --- | --- |
| Coordinator cannot be reached | Check the address and network. Uploads retry on a later scan; confirm the sent count and coordinator list afterward. |
| Token is rejected | Check the principal role, token expiry, and revocation. Issue a replacement, save it, and confirm the error clears. |
| Report folder cannot be read | Give Companion access to that user's diagnostic reports and inspect its status again. |
| Report is invalid or too large | Preserve the original locally. Reports over 4 MiB are not uploaded, and permanently refused content is not retried. |
| No reports are listed | Confirm the required Core version, module status, correct Companion identifier, and presence of a matching local report. An empty list does not prove Arena has never crashed. |

Apart from crash reports, Companion does not publish supervision or LTC status to the coordinator. Use its local window to inspect those modules. For coordinator-side composition recovery, see [Resolume Arena](../resolume/); for received timing, see [SMPTE / LTC](../smpte-ltc/).
