# Episode 1 — Generated OpenArt Assets

OpenArt project: **Sharehouse.AI** (`pUqEdTp0Rx62tqhNLcr9`). Model: `nano-banana-pro`.
These CDN URLs are hosted by OpenArt (`cdn.openart.ai`) — treat them as the canonical source; re-download into `generated/` locally if you need offline copies for editing.

## Character reference sheets (text2image, 2K, 3:2)
Generated once per character from the prompts in `01-character-bible.md`; every subsequent shot uses these as its `visualReferences` image2image anchor to hold face/outfit/palette consistent.

| Character | historyId | URL |
|---|---|---|
| Kai | `FoQkF41ujxZ1Y8QAsxec` | https://cdn.openart.ai/openart-ai/production/2026-08/create-image/8OJcrRIKGHMGulqdgwyp/image_1788037576085_5ea0e285_1788037576525_416e71ab.png |
| Marcus | `qBM972StjsL6rHMwP3ht` | https://cdn.openart.ai/openart-ai/production/2026-08/create-image/8OJcrRIKGHMGulqdgwyp/image_1788037578455_541ca57a_1788037579321_8801b474.png |
| Priya | `7ERFY6tbV7BLl7kNtyLy` | https://cdn.openart.ai/openart-ai/production/2026-08/create-image/8OJcrRIKGHMGulqdgwyp/image_1788037580740_ca93c92c_1788037581171_991edf76.png |
| Dave | `rrznleV4lzjjRDiYRYLV` | https://cdn.openart.ai/openart-ai/production/2026-08/create-image/8OJcrRIKGHMGulqdgwyp/image_1788037584997_e1c2ed72_1788037585097_97fa3d04.png |

## Proof-of-concept storyboard shots (image2image, chained off the sheets above, 2K, 16:9)

| Shot | Description | historyId | URL |
|---|---|---|---|
| 1.13 | Dave frozen mid-sweater-pull, heart-mug gag setup | `piHq9K3SQbN6sLavEN9b` | https://cdn.openart.ai/openart-ai/production/2026-08/create-image/8OJcrRIKGHMGulqdgwyp/image_1788037666061_8ebaf6ad_1788037667268_82a02a92.png |
| 2.1 | Wide group shot, all 4 flatmates in living room "pit crew" | `JOPnkM7QGdxuB5g4VgQx` | https://cdn.openart.ai/openart-ai/production/2026-08/create-image/8OJcrRIKGHMGulqdgwyp/image_1788037674991_fa20e23c_1788037675670_f3d3ba1e.png |
| 2.10 | Kai + Dave "unbothered lean" sight gag | `wjpmC88AGy6BpzETGVnd` | https://cdn.openart.ai/openart-ai/production/2026-08/create-image/8OJcrRIKGHMGulqdgwyp/image_1788037698312_d1c7895f_1788037698623_025afbcb.png |
| 3.13 | Priya close-up, savoring Dave's stolen trauma line | `CDOfIOQYSpxCXHI6HMeR` | https://cdn.openart.ai/openart-ai/production/2026-08/create-image/8OJcrRIKGHMGulqdgwyp/image_1788037687191_24417e85_1788037688230_39d1b3e0.png |
| 3.20 | Dave's tragic-dignity exit, spotlight + sad-trumpet beat | `FXvRWyYw4UJwPGasuzYg` | https://cdn.openart.ai/openart-ai/production/2026-08/create-image/8OJcrRIKGHMGulqdgwyp/image_1788037687924_3f35b998_1788037688464_726b9938.png |
| T.7 | Freeze-frame tag, Kai + mug swap, title card overlay | `ztikiD3VCgMwVWHeQyt1` | https://cdn.openart.ai/openart-ai/production/2026-08/create-image/8OJcrRIKGHMGulqdgwyp/image_1788037686800_c44d0c41_1788037687523_39223f34.png |

## Remaining shots
The other 49 shots in `storyboard.md` / `image-prompts.md` are written and ready to generate the same way: pull the relevant character reference sheet URL(s) above into `visualReferences`, use the matching prompt row from `image-prompts.md`, and submit via `openart_generate_image` (`nano-banana-pro`, `image2image`) into the **Sharehouse.AI** project. At ~40 credits per 2K image, the remaining 49 shots cost roughly 2,000 credits (account balance at time of writing: 10,670).

## Audio / video
No standalone TTS or SFX-only model is exposed through this OpenArt MCP connection — see `audio-prompts.md` for the full voice/SFX/laughter-track prompt set, written to drop into either OpenArt's audio-capable video models (`byte-plus-seedance-2-5`, `gemini-omni-flash` — both support synchronized dialogue/SFX and a reference-voice element for locking each character's voice) or a dedicated TTS/SFX platform for the final mix.
