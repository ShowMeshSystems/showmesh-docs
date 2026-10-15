---
title: Handle a weather delay
description: Configure weather alerts, pause or cancel a night, interpret target evidence, and deliberately resume output.
pageType: procedure
maturity: experimental-active
complexity: advanced
---

Use **Weather delay** when the show may resume tonight, or **Cancel night** when tonight's operation must end. Both stop display output and start the configured alert. FPP remains the calendar and playhead authority; ShowMesh manages the interruption and its output gates.

## Before you start

- Have an operator or administrator credential. Starting, cancelling, and answering a trigger question require `show:weatherdelay:invoke`; resuming or clearing cancellation requires the separate `show:weatherdelay:resume` scope. Configuration requires `config:write`.
- Check the installation's weather decision and physical safety procedures. Confirm how you will inspect unreachable equipment and stop it locally.
- Upload the intended alert files and confirm delivery to the audio nodes that must play them.

:::caution[These controls affect output immediately]
Weather delay and Cancel night have no confirmation step. They stop configured FPP players, silence declared audio nodes, and black out configured Resolume instances and declared render surfaces. Inspect every target outcome; a successful request does not prove the site is safe.
:::

## 1. Configure weather handling

Before operation, open **Settings → Weather delay**.

1. Under **Alert**, choose separate **Delay alert** and **Cancel-night alert** assets. Set **Repeat count** from 1 through 50; the default is 10. Select the target nodes. An empty selection means every declared audio node.
2. If an external power controller needs dark-state evidence, add **Power groups** and select each group's FPP instances, Resolume instances, and render nodes. Enable the group's dark heartbeat only when the external controller is configured to consume it. ShowMesh reports darkness; it never switches the group's power itself.
3. If you use automatic triggers, set their answer windows and **Dismiss quiet minutes**. The default ordinary answer window is 30 seconds; the cancel question uses 180 seconds. Dismiss suppresses the same warning for 30 minutes by default; zero disables this quiet period.
4. Optionally enable the **Weather service poller**. It reads US National Weather Service alerts and is off by default. Enter the site latitude, longitude, and required contact, then select the event types and polling interval. Defaults are a 60-second interval and Tornado Warning and Severe Thunderstorm Warning events.
5. Choose **Save weather delay**. Resolve any validation or stale-revision error before continuing.

The alert, power groups, and triggers are optional. Leaving an alert unset does not prevent the stop, but provides no alert file for that kind of interruption. In **Live Control**, check alert readiness for every intended node. The CLI reports the same file-presence evidence:

```sh
showmeshctl weather-delay status
```

A present, hash-verified alert is ready for delivery; confirm audible playback separately in a safe test window. Check source health after enabling the poller rather than treating a saved configuration as a working feed.

## 2. Start a delay or cancel the night

In **Live Control**, choose **Weather delay** or **Cancel night**. You can also turn an active delay into a cancellation with **Cancel night** in its banner.

CLI equivalents:

```sh
showmeshctl weather-delay start
showmeshctl weather-delay cancel-night
```

Run only the command matching your decision. Starting an already active delay re-sends the operation without resetting its start time. Start cannot turn an existing cancellation back into a delay.

The banner remains visible throughout the workspace. Check who started the interruption, its elapsed time, and each target's result in Live Control. While a delay or cancellation is active, output-starting operations such as Playlists, Cues, and forward Night transitions are inhibited. Stop, blackout, power-off, and Emergency Stop remain available.

For each power group, read **Confirmed dark**, **Not dark**, or the unavailable-state reason. Investigate members that are not confirmed dark before allowing an external controller to remove power. Missing or stale evidence is not a dark confirmation.

Cancel night starts the configured graceful Night shutdown after its alert finishes, with a bounded wait. Watch Night status and target outcomes rather than assuming the initial cancellation response confirms shutdown. Cancellation remains set across coordinator restarts until deliberately cleared.

## 3. Answer an automatic trigger question

A weather source can raise a question across the workspace. Read the reason, deadline, and stated consequence before choosing **Start weather delay**, **Cancel night**, or **Dismiss**, as offered. These answers have no extra confirmation step.

An ordinary question defaults to delaying when its answer window expires. A source that explicitly suggests cancellation raises the delay-or-cancel question, whose default is cancellation. The banner states which action will run. Do not assume ShowMesh inferred the remaining show time from FPP's calendar. An automatic trigger never resumes the display.

Dismiss runs neither stop action and suppresses that same warning for the configured quiet period. A new warning can still raise a question. A stale or expired question can disappear without running its action; check the banner and current state before acting on an earlier notification.

External systems can report triggers or hold a pre-signed start for use when the coordinator is unreachable. Use `showmeshctl weather-delay trigger --help` and `showmeshctl weather-delay presign --help` with the [API reference](../../reference/api/) when commissioning that integration. A pre-signed start can delay or cancel, never resume. Treat its payload as a credential and keep it out of public logs and screenshots.

## 4. Resume or clear cancellation

Check weather conditions, the installation's safety procedure, target reachability, and fresh evidence before relighting the display.

- For an active delay, choose **Resume** in its banner, or run `showmeshctl weather-delay resume`. A show that was live or about to start returns to its enter-show transition and starts again from the top. Pre-show and intershow resting playback restart their resting playlist; they do not jump directly into a show. Other lifecycle states and degraded sessions need their own Night recovery.
- For a cancelled night, choose **Clear cancellation**, or run `showmeshctl weather-delay clear`. This releases the cancellation without restarting or changing the Night session. Prepare and start a Night separately if operation is to continue.

After either action, check `showmeshctl weather-delay status`, Night status, current runs, and every target outcome. Confirm that the interruption cleared and the intended output is observed. Do not assume a cleared coordinator state means an unreachable player received the release.

## Recover an incomplete operation

| Observation | Action |
| --- | --- |
| A target failed, refused, or was not confirmed | Preserve the result and inspect that target directly. Restore connectivity or stop it locally. Recheck fresh evidence before retrying. |
| **Weather delay state unknown** | Restore the coordinator connection and read status before running the display. Do not infer an inactive delay from the failed read. |
| **Not saved** after starting | The stop was attempted but durable state could not be saved. Keep the site stopped, preserve the result, and repair coordinator storage before relying on restart recovery. Recheck status and target state. |
| **Players held dark** after the coordinator reports no active delay | Read the named players and reasons. Once safe, use the banner's **Resume** to release their gates and check every returned outcome. |
| Resume leaves the Night degraded or in a closing state | Follow [Show Night recovery](../../troubleshooting/show-night/). Do not repeatedly send output-start commands. |
| Poller or notification delivery fails | Preserve source health, the error, and recent Activity. Check that integration separately; a notification failure is not evidence that the stop failed or that conditions are safe. |

If local recovery fails, collect weather status, Night status, per-target results, source health, and relevant coordinator and agent logs. Remove credentials before sharing them. Use [Emergency Stop](../../using-showmesh/emergency-stop/) when immediate intervention is required, and verify affected equipment directly.
