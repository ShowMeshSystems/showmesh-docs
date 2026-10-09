---
title: Measured timing behavior
description: Small timing offsets measured on real hardware that sit inside tolerance, and how to compensate for them in a receiver.
pageType: reference
maturity: experimental-active
---

This page records small timing offsets that were measured on real hardware and accepted as inside tolerance. None of them is a fault. Use the numbers when a receiving device needs a tighter match than ShowMesh gives by default and you want to correct for the difference in that device.

Each entry states the build, the equipment, and what the measurement did not cover. A number here describes that setup. Measure your own installation before you rely on it.

## LTC against program audio

LTC and program audio leave the same audio node on the same interface. This entry is how far the timecode on the wire sits from the audio position after each kind of playback change.

| Playback change | Events | LTC against program audio | Largest offset |
| --- | --- | --- | --- |
| Session start | 16 | 24 ms ahead to 5 ms behind | 0.73 frame |
| Seek during playback | 14 | 19 ms to 53 ms behind | 1.59 frames |
| Resume after a pause | 8 | 11 ms ahead to 12 ms behind | 0.36 frame |

Frames are at 30 frames per second, where one frame is 33.3 ms. The accepted tolerance is 2 frames.

What the numbers mean for a receiver:

- The offset is set once, at the start, seek, or resume, and then holds. Within one uninterrupted run it moved by less than 0.01 ms over 20 seconds.
- Program audio and LTC ran at the same rate. Both stayed within 0.001 percent of the interface clock.
- A start or a resume lands within one frame, usually with LTC a few milliseconds ahead.
- A seek leaves LTC behind the audio by about 40 ms on average. A device that follows LTC shows its content that much later than the audio until the next start or resume.

### Compensate in the receiver

Most timecode receivers have an offset setting. If seeks matter in your show and the receiver needs a closer match, set the receiver to run about one frame early. Check the result on the receiver itself.

A fixed correction centers the seek offset; it does not remove it. The offset after a seek varied between 19 ms and 53 ms from one seek to the next, and the same correction also moves starts and resumes, which were already close.

The LTC start offset in the audio settings moves timecode by whole frames for every session. Use it to line up timecode with a receiver's timeline, not as a fine correction.

### Timecode at the edges of playback

- After a start or a resume, the first LTC frame on the wire is 6 or 7 frames past the position where playback began. The output is silent before that frame, and the first frame carries the correct value.
- While a session is paused, the LTC output is silent.
- At a seek during playback there is no gap. Timecode jumps from the old value straight to the new one.

A receiver sees these as a short loss of signal or a jump. How it reacts depends on the receiver and was not measured.

### How it was measured

- Build: a development build after v0.2.0, commit `22313e54`.
- Equipment: one audio node on Debian with a four-channel USB audio interface, PipeWire output, PTP-locked clock, and LTC at 30 frames per second with a start offset of `00:00:00:00`.
- Method: the LTC output and one program output were cabled back into two inputs of the same interface and recorded together. The program file was silence with a short tone burst every 5 seconds. The offset is the burst's file position minus the timecode decoded at the sample where the burst starts. Both signals take the same output and input path, so the interface delay cancels.
- The analysis reported known injected offsets of 100 ms, 840 ms, and 1300 ms to within 0.01 ms before it was used on the recordings.

### What it did not cover

- A node under CPU load. The node was idle.
- Scheduled starts, multi-node starts, and Cue activation from FPP. Every start was a direct session start.
- Runs longer than about 20 seconds after a change, and playlist item boundaries.
- Frame rates other than 30, and a non-zero LTC start offset.
- A receiving device. Nothing here shows how Resolume or any other receiver locks to the signal.
- Other audio interfaces. The method assumes every channel of the interface has the same output and input delay.

For LTC configuration and limits, see [SMPTE / LTC](../../integrations/smpte-ltc/).
