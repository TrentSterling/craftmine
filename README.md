# CraftMine

My nephews wanted Minecraft with guns. I opened a blank HTML file, pointed Claude at it, and by the end of the day we had a playable voxel game in the browser. It kept growing from there.

**[Play Now](https://tront.xyz/craftmine/play/)** | **[Landing Page](https://tront.xyz/craftmine/)** | **[Blog Post](https://blog.tront.xyz/posts/craftmine/)**

![CraftMine — snowy biome with trees at sunrise](screenshots/craftmine-og.png)

## What is this

A complete Minecraft-style voxel game in a single HTML file. 6,820 lines, zero build tools, one CDN dependency (Three.js). Procedural terrain, caves, biomes, 36 mobs with AI, 19 weapons with physics, day/night cycle, weather, P2P multiplayer, and a procedural lo-fi soundtrack. All vibe-coded with Claude.

![CraftMine — mountain landscape](screenshots/craftmine-mountains.png)

## Stats

- **46 block types** — grass, stone, ores, TNT, plus 21 DOOM-themed hell blocks (flesh, bone, skull walls, pentagrams)
- **36 mob types** — from chickens and rabbits to a 300 HP Titan boss that causes earthquakes
- **19 weapons** — diamond sword, shotgun, railgun, BFG 9000, black hole gun, nuke launcher
- **5 biomes** — plains, desert, snow, forest, ocean
- **16x16x128 chunks** with web worker mesh generation
- **P2P multiplayer** with NPC bots and PvP combat
- **Procedural lo-fi soundtrack** via [lofigen](https://tront.xyz/lofigen/) — seeded music, no audio files
- **1 file**, 0 build steps, ~350KB

![CraftMine — flying over snowy mountains](screenshots/craftmine-landscape.png)

## Controls

| Action | Key |
|--------|-----|
| Move | W A S D |
| Jump | Space |
| Sneak | Shift |
| Look | Mouse |
| Break / Shoot | Left Click |
| Place block | Right Click |
| Switch weapon | Scroll |
| Creative mode | C |
| Fly (creative) | F |
| Pause | Esc |
| Hide UI | F1 |
| Debug info | F3 |

## Tech

- Single HTML file with `<script type="module">`
- Three.js from CDN (only external dependency)
- 6 simplex noise generators for terrain, caves, ores, biomes
- Web worker thread pool for async chunk mesh generation
- Procedural Canvas textures for all blocks and weapons (no image files)
- Web Audio API for 30+ synthesized sound effects
- Procedural mob AI with day/night spawn cycles, pack behavior, boss mechanics
- Hitscan + projectile weapon systems with proper ballistics and gravity
- P2P multiplayer with entity sync and deterministic player colors
- Seeded procedural lo-fi music generation (world seed = soundtrack)

## How it was made

Vibe-coded with Claude. I described what I wanted, Claude wrote the code, my nephews stress-tested it. Each feature started as a prompt — "add creepers", "add a shotgun", "make it nighttime so zombies spawn". The DOOM layer happened because we ran out of Minecraft ideas and started adding hell blocks. The multiplayer came later after the nephews went home.

## Author

[Trent Sterling](https://tront.xyz) — [Discord](https://tront.xyz/discord/)
