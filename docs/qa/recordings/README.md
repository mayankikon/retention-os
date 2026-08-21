# QA walkthrough recordings

Browser recordings captured against the local dev server for the SM2-186 – SM2-189
prototype changes. Each clip opens with a title card and carries on-screen captions
describing the behavior being verified.

| File | Ticket | What it verifies |
| --- | --- | --- |
| `SM2-186-to-189-walkthrough.mp4` | all four | Combined walkthrough of every change |
| `sm2-186.mp4` | SM2-186 | `Edit copy` action on an Active campaign, locked-variable validation, save keeps status Active, `Live message copy updated` changelog entry |
| `sm2-187.mp4` | SM2-187 | Leave modal in create mode (`Leave campaign setup?`) and draft edit mode (`Leave draft editing?` with Discard Changes) |
| `sm2-188.mp4` | SM2-188 | Review & Activate exposes only Activate Now and Save Draft, with timing sourced from Configuration |
| `sm2-189.mp4` | SM2-189 | Smart Marketing navigation without Accounts, and `/accounts` returning 404 |

Recordings are regenerated manually; they are not produced by CI.
