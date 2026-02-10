# CraftMine

A 3D browser-based Minecraft-inspired voxel game built with Three.js. Single-file web application that runs entirely in the browser.

## Running the Project

Open `index.html` in any modern web browser. No build step or installation required. Requires internet connection for Three.js CDN.

## Architecture

Single-file monolithic application (`index.html`, ~5000+ lines). All code, styles, and markup are inline.

### Core Technologies
- Three.js v0.160.0 (3D rendering)
- Web Workers (multi-threaded mesh generation)
- Web Audio API (procedural sound synthesis)
- HTML5 Canvas (procedural texture generation)
- Pointer Lock API (mouse control)

### Major Classes
- `AudioSystem` - Synthesized audio using Web Audio API (30+ sound effects)
- `TextureGenerator` - Procedural Canvas textures for all 46 blocks and 19 weapons
- `WorkerPool` - Manages worker threads for async mesh generation
- `SimplexNoise` - Procedural noise for terrain generation
- `World` - Chunk management, terrain generation, biomes, caves, ores
- `MeshBuilder` - Converts voxel data to Three.js geometries via workers
- `ProjectileSystem` - Weapons, explosions, particles, visual effects
- `Entity` - Base class for mobs with AI, physics, health
- `EntityManager` - Spawns and updates all mobs
- `Player` - Physics, collision detection, movement, health, creative mode
- `Game` - Main game loop, day/night cycle, weather, water, UI

### Key Configuration (CONFIG object)
- `CHUNK_SIZE: 16` - Blocks per chunk dimension
- `WORLD_HEIGHT: 128` - Maximum build height
- `RENDER_DISTANCE: 6` - Chunk render distance
- `DAY_LENGTH: 600` - Seconds per full day cycle
- `MAX_HEALTH: 10` - Player health (hearts)
- `WORKER_COUNT: navigator.hardwareConcurrency || 4`

## Controls

| Key | Action |
|-----|--------|
| WASD | Move |
| Mouse | Look around |
| Space | Jump / Fly up (creative) |
| Shift | Sneak / Fly down (creative) |
| Scroll | Switch items |
| Left click | Attack / Break block |
| Right click | Place block |
| 1-9, 0 | Select hotbar slot |
| C | Toggle creative mode |
| F | Toggle flying (creative mode) |
| Escape | Pause menu |
| F1 | Toggle UI (screenshot mode) |
| F3 | Toggle debug info |

## Game Features

### World
- Procedurally generated infinite terrain
- 5 biomes: Plains, Desert, Snow, Forest, Ocean
- Underground caves with lava at depth
- Ore distribution by depth (Coal, Iron, Gold, Diamond)
- 46 block types with procedural Canvas textures

**Block Categories:**
- Natural: Grass, Dirt, Stone, Sand, Gravel, Clay, Snow, Ice
- Plants: Wood, Leaves, Cactus
- Ores: Coal, Iron, Gold, Diamond
- Building: Cobblestone, Planks, Brick, Glass, Obsidian
- Fluids: Water (placeable, drowning, underwater effects), Lava (damage)
- DOOM: Metal Floor, Metal Wall, Rusty Metal, Grate, Flesh, Blood, Bone, Skull Wall, Hell Brick, Marble, Tech Panel, Computer, Pipes, Vent, Warning, Nuke Barrel, Pentagram, Lava Rock, Ash, Corruption

### Mobs (36 types!)

**Passive (12):**
- Pig, Cow, Chicken, Sheep (fluffy), Rabbit (jumpy), Duck
- Horse (fast), Frog (jumpy), Turtle (armored shell), Penguin (waddles)
- Bat (flying), Fish (swimming)

**Hostile Ground (12):**
- Zombie, Skeleton (ranged), Creeper (explodes)
- Spider (8 legs), Slime (bouncy, splits), Wolf (pack hunter)
- Witch (shoots potions, pointy hat), Enderman (teleports, tall)
- Worm (segmented, burrows), Mimic (looks like chest, teeth)
- Magma Cube (glowing, splits), Ice Elemental (freezing crystals)

**Explosive (3):**
- Creeper, Charged Creeper (huge explosion, electric aura), TNT Zombie (TNT head)

**Flying (9):**
- Blaze (fireballs), Ghost (transparent), Bomber (dive bombs)
- Phantom (swoops), Fire Elemental (flame swirls), Bee (swarms)
- Bat, Dragon (boss, huge wings)

**Bosses (6):**
- Mega Zombie (2.5x, spikes), King Slime (4x, crown), Giant Slime (3x)
- Golem (armored, 150 HP), Hydra (3 heads, triple fireballs)
- Dragon (flying boss, 200 HP), Titan (5x scale, 300 HP, earthquakes)

**AI Features:**
- Pathfinding and obstacle jumping
- Knockback and death animations
- Flying mobs hover and circle
- Slimes/Magma Cubes split into smaller versions
- Pack animals (wolves) and swarms (bees) spawn in groups
- Enderman teleports when damaged
- Witch shoots potions, Hydra shoots triple fireballs
- Titan causes screen-shaking earthquakes

### Combat (19 weapons!)

**Melee & Ranged:**
- Chainsaw (sparks, gore), Sword (slash attack), Bow (arcing arrows)
- Shotgun (8 pellet spread, pump action)

**Automatic:**
- Minigun (rapid fire), Flamethrower (continuous flames)

**Energy:**
- Laser Rifle (instant hit), Plasma Cannon (fast energy ball)
- Railgun (penetrating shot), Lightning Staff (chain lightning)
- Freeze Ray (ice particles), Gravity Gun (pushes enemies)

**Explosives:**
- TNT Launcher, Rocket Launcher (bigger boom), Grenade (bouncy)
- Cluster Bomb (splits into 6 bomblets)

**Super Weapons:**
- BFG 9000 (massive green energy ball, radius 10)
- Nuke Launcher (radius 15, secondary explosions, mushroom cloud)
- Black Hole Gun (pulls in enemies, crushes them)

**Features:**
- All weapons have procedural Canvas texture icons in hotbar
- Weapons damage both blocks and mobs
- Explosions chain-react with TNT blocks
- Screen shake scales with weapon power
- Unique particle trails per weapon
- DOOM-style sound effects (shotgun pump, demon growls, gore splatter, BFG charge)

### Visual
- Procedural Canvas textures for all 46 blocks (grass blades, stone cracks, wood grain, ore deposits, etc.)
- Procedural weapon icons (detailed pixel art style)
- Day/night cycle with dynamic sky colors
- Sun position changes throughout day
- Weather system (rain)
- Underwater effects (blue overlay, wave animation, air meter, bubbles)
- Particle effects for explosions, block breaking
- Screen shake on weapon fire
- Water animation (flowing texture offset)

### Modes
- Survival: Health, fall damage, mob attacks
- Creative: Flying, no damage, instant break

## Code Conventions

- Classes use PascalCase
- Methods and variables use camelCase
- Constants use CONSTANT_CASE (BLOCKS, WEAPONS, CONFIG, MOB_TYPES, BIOMES)
- Section comments: `// ============================================`
- No external dependencies except Three.js CDN

## Performance Features

- Mesh generation offloaded to Web Workers
- Chunk culling based on render distance
- Frustum culling - chunks outside view are hidden
- TypedArrays for efficient memory
- Face-culling - only renders visible block faces
- Particle count limiter (max 500)
- Geometry caching and material reuse
