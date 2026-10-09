---
title: Measured timing behavior
description: Small timing differences to expect between ShowMesh outputs, and how to correct for them in a receiving device.
pageType: reference
maturity: experimental-active
---

Use this page when a receiving device must match ShowMesh output more closely than the default behavior provides. Each entry gives a timing difference that was measured on real equipment, the conditions it applies to, and the correction you can make in the receiver.

These differences are within the accepted tolerance. They are not faults, and most installations do not need to correct for them.

:::caution[Measure your own installation]
Every value on this page comes from one installation. Audio interfaces, frame rates, and receivers differ. Confirm a value on your own equipment before you depend on it for a show.
:::

## LTC and program audio

Linear timecode (LTC) and program audio leave the same audio node through the same audio interface. After a playback change, the timecode at the LTC output can be slightly ahead of or behind the audio position.

The following table gives the measured difference for each kind of playback change at 30 frames per second, where one frame is 33.3 ms. The accepted tolerance is 2 frames. A start or a resume stays within one frame. A seek leaves timecode behind the audio by one to two frames.

| Playback change | Timecode compared with program audio | Largest difference |
| --- | --- | --- |
| Start an audio session | 24 ms ahead to 5 ms behind | 0.73 frame |
| Seek during playback | 19 ms to 53 ms behind | 1.59 frames |
| Resume after a pause | 11 ms ahead to 12 ms behind | 0.36 frame |

When you interpret these values:

- The node sets the difference once, at the start, seek, or resume. The difference then stays constant until the next playback change.
- Program audio and timecode play at the same rate, so the difference does not grow during a long item.
- After a seek, a device that follows timecode shows its content about 40 ms later than the audio. The next start or resume returns the difference to within one frame.

### Correct for the difference in the receiver

Use the timecode offset setting on the receiving device. ShowMesh does not have a setting that removes this difference.

If your show seeks during playback and the receiver must match the audio more closely, set the receiver to run about one frame early. Then seek during playback and confirm the result on the receiver.

A fixed offset reduces the difference after a seek but cannot remove it, because that difference varied between 19 ms and 53 ms from one seek to the next. The same offset also moves starts and resumes, which were already within one frame.

The LTC start offset in the audio settings moves timecode by whole frames for every session. Use it to match timecode to a receiver's timeline. Do not use it as a fine correction.

### When timecode starts, stops, and jumps

A receiver can report a short loss of signal or a jump at these moments:

- After a start or a resume, the LTC output is silent for 6 or 7 frames. The first frame that follows carries the correct value for its position.
- While an audio session is paused, the LTC output is silent.
- At a seek during playback, timecode changes from the old value directly to the new value with no silence between them.

How a receiver reacts at these moments depends on the receiver. Check its behavior on the device you use.

### Where these values apply

The values apply to these conditions:

- One audio node with a four-channel USB audio interface, with LTC and program audio on separate channels of that interface.
- LTC at 30 frames per second with a start offset of `00:00:00:00`.
- Audio sessions controlled directly with start, seek, pause, and resume commands, on a node with no other load.

The measurement did not include:

- A node under heavy processor load.
- Scheduled starts, starts on more than one audio node, or Cue activation from FPP.
- Playlist item changes, or playback longer than about 20 seconds after a change.
- Frame rates other than 30, or a start offset other than `00:00:00:00`.
- A receiving device. These values describe the LTC output, not how Resolume Arena or another receiver locks to it.

### Check the difference on your equipment

To measure your own installation, connect the LTC output and one program audio output to two inputs of the same audio interface and record both inputs together. Play a file that has a clear, sudden sound at a known position. In the recording, compare the timecode value at the moment the sound begins with the sound's position in the file.

Use two inputs of one interface so that both signals pass through the same output and input delay.

For LTC configuration and limits, see [SMPTE / LTC](../../integrations/smpte-ltc/).
