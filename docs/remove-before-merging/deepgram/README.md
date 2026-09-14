# Raw Deepgram responses

Kept whole — the prose files under `writing/late-stage-agentic/dictations/` are
the readable half, and these carry what that half throws away: per-word
timings, confidences and alternatives, which is what a subtitle track is built
from.

Produced by, with the audio as the request body:

```
POST https://api.deepgram.com/v1/listen
  ?model=nova-3&smart_format=true&punctuate=true
  &paragraphs=true&diarize=true&detect_language=true
```

Language came back `ru` on both without being asked for.

| File                          | Source                                                       |
| ----------------------------- | ------------------------------------------------------------ |
| `p1-the-idea.deepgram.json`   | `../p1-the-idea.m4a`, 4:33, dictated to a phone              |
| `p2-the-limits.deepgram.json` | audio extracted from `../first-content.mp4`, 6:42, on camera |

The extraction is `ffmpeg -i <video> -vn -ac 1 -c:a aac -b:a 64k <out>.m4a` —
mono at 64 kbit/s, which took the 84 MB video down to 3.3 MB with nothing that
matters to speech recognition lost.
