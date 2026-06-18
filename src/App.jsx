import { useEffect, useRef, useState, useCallback } from 'react'
import './App.css'
import musicSrc from './music/Aankhon Se Batana Dikshant 320 Kbps.mp3'

// ─── Sequence configuration ────────────────────────────────────────────────
const SEQUENCES = [
  { folder: 'start',    prefix: 'start',      frameCount: 96, pad: 5, chapter: '01' },
  { folder: 'start 2',  prefix: 'start 2',    frameCount: 96, pad: 5, chapter: '02' },
  { folder: 'start 3',  prefix: 'start 3',    frameCount: 96, pad: 5, chapter: '03' },
  { folder: 'start 4',  prefix: 'start 4',    frameCount: 96, pad: 5, chapter: '04' },
  { folder: 'start 5',  prefix: 'start 5',    frameCount: 96, pad: 5, chapter: '05' },
  { folder: 'start 6',  prefix: 'start 6',    frameCount: 96, pad: 5, chapter: '06' },
  { folder: 'start 7',  prefix: 'start 7',    frameCount: 96, pad: 5, chapter: '07' },
  { folder: 'start 8',  prefix: 'Comp 1_2',   frameCount: 96, pad: 5, chapter: '08' },  // files: Comp 1_2_XXXXX.png
  { folder: 'start 9',  prefix: 'start 9',    frameCount: 96, pad: 5, chapter: '09' },
  { folder: 'start 10', prefix: 'start 10',   frameCount: 96, pad: 5, chapter: '10' },
  { folder: 'start 11', prefix: 'start 11',   frameCount: 96, pad: 5, chapter: '11' },
  // start 12 skipped — folder contains only start 12.mp4, no PNG frames
  { folder: 'start 13', prefix: 'start 13',   frameCount: 96, pad: 5, chapter: '12' },
  { folder: 'start 14', prefix: 'start 14',   frameCount: 96, pad: 5, chapter: '13' },
]

// ─── Scene story data — desktop (ALL CAPS headline + paragraph) and mobile (title + caption) ──
const SCENE_DATA = [
  {
    dHead: 'WHEN IT ALL BEGAN',
    dText: 'On an ordinary day, beneath the warm sunlight and rustling leaves,\ntwo strangers crossed paths, unaware they were about to become\neach other\'s forever.',
    mHead: 'When It All Began',
    mText: 'A simple meeting that changed everything.',
  },
  {
    dHead: 'BEST FRIENDS',
    dText: 'Long before love found its way into their hearts,\nthey spent their days sharing laughter, adventures,\nand memories that would last a lifetime.',
    mHead: 'Best Friends',
    mText: 'Before love, there was friendship.',
  },
  {
    dHead: 'FIRST CRUSH',
    dText: 'As the years passed, something quietly changed.\nThe smiles lingered longer, the glances felt different,\nand friendship slowly turned into the first feeling of love.',
    mHead: 'First Crush',
    mText: 'Friendship became something more.',
  },
  {
    dHead: 'MEETING AGAIN',
    dText: 'Life took them down different paths,\nbut destiny had other plans.\nWhen they met again, it felt as though\ntime had been waiting for them.',
    mHead: 'Meeting Again',
    mText: 'Destiny brought us back together.',
  },
  {
    dHead: 'ONE UMBRELLA, TWO HEARTS',
    dText: 'The rain painted the world in silver reflections.\nBeneath a single umbrella, every step felt warmer,\nand every heartbeat felt shared.',
    mHead: 'One Umbrella, Two Hearts',
    mText: 'The rain fell, but I only saw you.',
  },
  {
    dHead: 'THE HAPPIEST MOMENTS',
    dText: 'Love was never found in grand gestures.\nIt lived in quiet laughter, playful moments,\nand the simple joy of being together.',
    mHead: 'The Happiest Moments',
    mText: 'Love lived in simple moments.',
  },
  {
    dHead: 'THE QUESTION',
    dText: 'With a hopeful heart and dreams of forever,\none question was asked.\nIn that moment, their future became a promise.',
    mHead: 'The Question',
    mText: 'Will you stay forever?',
  },
  {
    dHead: "A FAMILY'S BLESSING",
    dText: 'Two families came together to celebrate not only love,\nbut the beginning of a new chapter.\nTheir blessings became the foundation of a beautiful future.',
    mHead: "A Family's Blessing",
    mText: 'Two families, one future.',
  },
  {
    dHead: 'FOREVER BEGINS',
    dText: 'Surrounded by flowers, laughter, and loved ones,\nthey promised to walk through every season of life\nhand in hand.',
    mHead: 'Forever Begins',
    mText: 'A promise for a lifetime.',
  },
  {
    dHead: 'OUR GREATEST BLESSING',
    dText: 'A tiny heartbeat entered their world\nand filled it with a new kind of love—\none deeper than they had ever known.',
    mHead: 'Our Greatest Blessing',
    mText: 'Love found a new heartbeat.',
  },
  {
    dHead: 'BUILDING A HOME',
    dText: 'The years passed quietly.\nEvery smile, every challenge, and every memory\nbecame part of the beautiful life they built together.',
    mHead: 'Building A Home',
    mText: 'We built a beautiful life.',
  },
  {
    dHead: 'THE GIFT OF TIME',
    dText: 'Seasons changed and years flew by,\nyet every passing day became more precious\nbecause it was shared together.',
    mHead: 'The Gift Of Time',
    mText: 'Time only brought us closer.',
  },
  {
    dHead: 'STILL YOU',
    dText: 'The years touched their faces but never their hearts.\nAfter a lifetime of memories, adventures, and dreams,\nthey still found their happiest place beside each other.',
    mHead: 'Still You',
    mText: "After all these years, it's still you.",
  },
]

// ─── Opening hero / title card ─────────────────────────────────────────────
const HERO = {
  dHead: 'A JOURNEY THROUGH TIME',
  dText: 'From childhood laughter to a lifetime of love,\nthis is the story of two hearts that grew together\nthrough every season of life.',
  mHead: 'A Journey Through Time',
  mText: 'A love story across a lifetime.',
}

// ─── Per-chapter aurora hue palettes [hue1, hue2, hue3] in degrees ──────────
const CHAPTER_AURORA_HUES = [
  [330, 290, 260],  // 01 — Dawn: rose → violet → indigo
  [ 35,  20, 340],  // 02 — First light: amber → orange → rose
  [260, 220, 190],  // 03 — Morning: indigo → blue → sky
  [150, 120, 180],  // 04 — Bloom: emerald → lime → violet
  [185, 200, 230],  // 05 — Afternoon: teal → cyan → blue
  [ 40,  25,  10],  // 06 — Golden hour: gold → amber → sienna
  [280, 310, 250],  // 07 — Dusk: purple → magenta → violet
  [220, 245, 200],  // 08 — Twilight: cobalt → sapphire → teal
  [350, 320, 280],  // 09 — Night: crimson → rose → violet
  [210, 230, 190],  // 10 — Midnight: steel blue → navy → teal
  [ 20,  35, 280],  // 11 — Deep night: ember → amber → indigo
  [270, 300, 230],  // 12 — Before dawn: mauve → violet → periwinkle
  [ 45,  30, 350],  // 13 — Rebirth: honey → gold → rose
]

const SCROLL_PX_PER_FRAME = 60
const SLIDE_SCROLL_PX     = 400
const PAD                 = 0.03   // subtle padding fraction on each side
const PRELOAD_TARGET      = 6      // frames needed before hiding loader

function getFramePath(seq, fi) {
  const num = String(fi).padStart(seq.pad, '0')
  // encodeURI handles spaces in folder/filename (e.g. "start 2" → "start%202")
  return encodeURI(`/src/video/${seq.folder}/${seq.prefix}_${num}.png`)
}
const ALL_PATHS = SEQUENCES.map(seq =>
  Array.from({ length: seq.frameCount }, (_, i) => getFramePath(seq, i))
)

const TOTAL_SCROLL = SEQUENCES.reduce((acc, seq) =>
  acc + seq.frameCount * SCROLL_PX_PER_FRAME + SLIDE_SCROLL_PX, 0
)
const SEQ_START_SCROLL = SEQUENCES.map((_, si) => {
  let off = 0
  for (let i = 0; i < si; i++)
    off += SEQUENCES[i].frameCount * SCROLL_PX_PER_FRAME + SLIDE_SCROLL_PX
  return off
})

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }
function easeOut(t)        { return 1 - Math.pow(1 - t, 3) }
function easeInOut(t)      { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2 }

// ─── Draw frame full-screen (cover) ──────────────────────────────────────
function drawFrameAt(ctx, img, cw, ch, yOffset) {
  if (!img) return
  // "contain" scaling: fit within the padded area
  const aw    = cw * (1 - PAD * 2)
  const ah    = ch * (1 - PAD * 2)
  const scale = Math.min(aw / img.naturalWidth, ah / img.naturalHeight)
  const sw    = img.naturalWidth  * scale
  const sh    = img.naturalHeight * scale
  ctx.drawImage(img, (cw - sw) / 2, (ch - sh) / 2 + yOffset, sw, sh)
}

// ══════════════════════════════════════════════════════════════════════════════
//  PARTICLE SYSTEM
// ══════════════════════════════════════════════════════════════════════════════

const PETAL_COLORS = [
  [255, 210, 225], [255, 235, 245], [255, 250, 230],
  [235, 215, 255], [220, 240, 255], [255, 245, 200],
]

class Petal {
  constructor(cw, ch, initial = false) { this.init(cw, ch, initial) }
  init(cw, ch, initial = false) {
    this.x         = Math.random() * cw
    this.y         = initial ? Math.random() * ch : -30 - Math.random() * 80
    this.size      = 7 + Math.random() * 15
    this.rot       = Math.random() * Math.PI * 2
    this.rotV      = (Math.random() - 0.5) * 0.03
    this.vx        = (Math.random() - 0.4) * 0.7
    this.vy        = 0.3 + Math.random() * 0.65
    this.swayPhase = Math.random() * Math.PI * 2
    this.swayAmp   = 0.5 + Math.random() * 2.0
    this.alpha     = 0.2 + Math.random() * 0.45
    this.color     = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)]
  }
  update(t, cw, ch) {
    this.x   += this.vx + Math.sin(t * 0.0007 + this.swayPhase) * this.swayAmp
    this.y   += this.vy + Math.sin(t * 0.0015 + this.swayPhase * 0.7) * 0.25
    this.rot += this.rotV
    if (this.y > ch + 40) this.init(cw, ch, false)
    if (this.x < -40)     this.x = cw + 20
    if (this.x > cw + 40) this.x = -20
  }
  draw(ctx) {
    const [r, g, b] = this.color
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rot)
    // Petal: two offset ellipses overlapping
    ctx.fillStyle = `rgb(${r},${g},${b})`
    ctx.beginPath()
    ctx.ellipse(this.size * 0.12, -this.size * 0.25, this.size * 0.32, this.size * 0.72, 0.15, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(-this.size * 0.12, this.size * 0.25, this.size * 0.32, this.size * 0.72, -0.15, 0, Math.PI * 2)
    ctx.fill()
    // Soft center highlight
    ctx.globalAlpha = this.alpha * 0.4
    ctx.fillStyle = `rgb(${Math.min(r+30,255)},${Math.min(g+30,255)},${Math.min(b+30,255)})`
    ctx.beginPath()
    ctx.ellipse(0, 0, this.size * 0.12, this.size * 0.35, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

class Dust {
  constructor(cw, ch) { this.init(cw, ch, true) }
  init(cw, ch, initial = false) {
    this.x      = Math.random() * cw
    this.y      = initial ? Math.random() * ch : ch + 5
    this.r      = 0.4 + Math.random() * 2.2
    this.vx     = (Math.random() - 0.5) * 0.22
    this.vy     = -(0.06 + Math.random() * 0.32)
    this.alpha  = 0.06 + Math.random() * 0.2
    this.phase  = Math.random() * Math.PI * 2
    this.lifeMax= 1000 + Math.random() * 1400
    this.life   = initial ? Math.random() * this.lifeMax : 0
    this.warm   = Math.random() > 0.5  // golden vs silver
  }
  update(t, cw, ch) {
    this.x += this.vx + Math.sin(t * 0.0005 + this.phase) * 0.35
    this.y += this.vy + Math.cos(t * 0.0003 + this.phase) * 0.1
    this.life++
    if (this.y < -5 || this.life > this.lifeMax) this.init(cw, ch, false)
  }
  draw(ctx) {
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.fillStyle = this.warm ? 'rgba(255,240,200,1)' : 'rgba(220,235,255,1)'
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

class WindLine {
  constructor(cw, ch) { this.init(cw, ch) }
  init(cw, ch) {
    this.y      = Math.random() * ch
    this.x      = -150
    this.len    = 30 + Math.random() * 140
    this.speed  = 3.5 + Math.random() * 7
    this.alpha  = 0.03 + Math.random() * 0.09
    this.width  = 0.5 + Math.random() * 1.2
    this.active = false
    this.delay  = Math.floor(Math.random() * 400)
  }
  update(cw, ch) {
    if (!this.active) {
      if (--this.delay <= 0) this.active = true
      return
    }
    this.x += this.speed
    if (this.x > cw + 200) this.init(cw, ch)
  }
  draw(ctx, cw) {
    if (!this.active) return
    ctx.save()
    const grad = ctx.createLinearGradient(this.x, 0, this.x + this.len, 0)
    grad.addColorStop(0,   'rgba(255,255,255,0)')
    grad.addColorStop(0.45,'rgba(255,255,255,1)')
    grad.addColorStop(0.55,'rgba(255,255,255,1)')
    grad.addColorStop(1,   'rgba(255,255,255,0)')
    ctx.strokeStyle = grad
    ctx.globalAlpha = this.alpha
    ctx.lineWidth   = this.width
    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.x + this.len, this.y)
    ctx.stroke()
    ctx.restore()
  }
}

// ── HSL helper for Aurora ────────────────────────────────────────────────────
function hslToRgb(h, s, l) {
  let r, g, b
  if (s === 0) { r = g = b = l } else {
    const q = l < 0.5 ? l*(1+s) : l+s-l*s, p = 2*l-q
    const hue2 = (p,q,t) => {
      t = ((t%1)+1)%1
      if (t<1/6) return p+(q-p)*6*t
      if (t<1/2) return q
      if (t<2/3) return p+(q-p)*(2/3-t)*6
      return p
    }
    r=hue2(p,q,h+1/3); g=hue2(p,q,h); b=hue2(p,q,h-1/3)
  }
  return [Math.round(r*255), Math.round(g*255), Math.round(b*255)]
}

// ── Aurora: large drifting elliptical colour nebula blobs ────────────────────
class Aurora {
  constructor(cw, ch) { this.init(cw, ch, true) }
  init(cw, ch, initial = false) {
    this.x     = initial ? Math.random() * cw : (Math.random() < 0.5 ? -250 : cw + 250)
    this.y     = Math.random() * ch
    this.rx    = 220 + Math.random() * 320   // horizontal radius
    this.ry    = 90  + Math.random() * 180   // vertical radius
    this.hue   = Math.random() * 360
    this.alpha = 0.06 + Math.random() * 0.10
    this.vx    = (Math.random() - 0.5) * 0.25
    this.vy    = (Math.random() - 0.5) * 0.12
    this.phase = Math.random() * Math.PI * 2
    this.hueV  = (Math.random() - 0.5) * 0.4   // hue drift speed
  }
  update(tick, cw, ch) {
    this.x   += this.vx + Math.sin(tick * 0.0004 + this.phase) * 0.6
    this.y   += this.vy + Math.cos(tick * 0.0003 + this.phase) * 0.35
    this.hue  = (this.hue + this.hueV + 360) % 360
    const pad = this.rx * 2
    if (this.x < -pad)      this.x = cw + this.rx
    if (this.x > cw + pad)  this.x = -this.rx
    if (this.y < -this.ry * 3) this.y = ch + this.ry
    if (this.y > ch + this.ry * 3) this.y = -this.ry
  }
  draw(ctx) {
    const [r,g,b] = hslToRgb(this.hue/360, 0.75, 0.55)
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.scale(1, this.ry / this.rx)   // squash into ellipse
    const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, this.rx)
    grd.addColorStop(0,   `rgba(${r},${g},${b},${this.alpha.toFixed(3)})`)
    grd.addColorStop(0.45,`rgba(${r},${g},${b},${(this.alpha*0.45).toFixed(3)})`)
    grd.addColorStop(1,   `rgba(${r},${g},${b},0)`)
    ctx.fillStyle = grd
    ctx.beginPath()
    ctx.arc(0, 0, this.rx, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

// ── Bokeh: large soft glowing light orbs that drift slowly ──────────────────
const BOKEH_COLORS = [
  [200,169,110], // warm gold
  [180,130,200], // soft violet
  [120,170,230], // cool blue
  [230,180,130], // warm amber
  [170,220,200], // seafoam
  [255,210,230], // blush pink
]
class Bokeh {
  constructor(cw, ch) { this.init(cw, ch, true) }
  init(cw, ch, initial = false) {
    this.x     = initial ? Math.random() * cw : (Math.random() < 0.5 ? -80 : cw + 80)
    this.y     = Math.random() * ch
    this.r     = 40 + Math.random() * 110
    this.vx    = (Math.random() - 0.5) * 0.18
    this.vy    = (Math.random() - 0.5) * 0.12
    this.alpha = 0.03 + Math.random() * 0.09   // stronger — more visible
    this.phase = Math.random() * Math.PI * 2
    this.pulse = 0.004 + Math.random() * 0.008
    this.color = BOKEH_COLORS[Math.floor(Math.random() * BOKEH_COLORS.length)]
  }
  update(t, cw, ch) {
    this.x += this.vx + Math.sin(t * 0.0004 + this.phase) * 0.4
    this.y += this.vy + Math.cos(t * 0.0003 + this.phase) * 0.3
    const pad = this.r * 3
    if (this.x < -pad) this.x = cw + pad * 0.5
    if (this.x > cw + pad) this.x = -pad * 0.5
    if (this.y < -pad) this.y = ch + pad * 0.5
    if (this.y > ch + pad) this.y = -pad * 0.5
  }
  draw(ctx, t) {
    const [r,g,b] = this.color
    const pulse   = 1 + Math.sin(t * this.pulse + this.phase) * 0.12
    const radius  = this.r * pulse
    const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, radius)
    grd.addColorStop(0,   `rgba(${r},${g},${b},${(this.alpha * 1.6).toFixed(3)})`)
    grd.addColorStop(0.4, `rgba(${r},${g},${b},${(this.alpha * 0.8).toFixed(3)})`)
    grd.addColorStop(1,   `rgba(${r},${g},${b},0)`)
    ctx.save()
    ctx.fillStyle = grd
    ctx.beginPath()
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

// ── Sparkle: tiny 4-point stars that fade in and out ────────────────────────
class Sparkle {
  constructor(cw, ch) { this.init(cw, ch, true) }
  init(cw, ch, initial = false) {
    this.x       = Math.random() * cw
    this.y       = Math.random() * ch
    this.size    = 1.2 + Math.random() * 3.5
    this.alpha   = 0
    this.maxA    = 0.35 + Math.random() * 0.55
    this.life    = initial ? Math.floor(Math.random() * 120) : 0
    this.maxLife = 100 + Math.random() * 160
    this.gold    = Math.random() > 0.45
    this.rot     = Math.random() * Math.PI * 0.5
  }
  update(cw, ch) {
    this.life++
    const t = this.life / this.maxLife
    // Ease in then ease out
    this.alpha = this.maxA * Math.sin(t * Math.PI)
    if (this.life >= this.maxLife) this.init(cw, ch, false)
  }
  draw(ctx) {
    if (this.alpha < 0.01) return
    const [r,g,b] = this.gold ? [220,180,100] : [255,250,240]
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rot)
    // 4-pointed star via 4 thin ellipses
    ctx.fillStyle = `rgb(${r},${g},${b})`
    for (let i = 0; i < 4; i++) {
      ctx.save()
      ctx.rotate(i * Math.PI / 2)
      ctx.beginPath()
      ctx.ellipse(0, -this.size * 0.55, this.size * 0.13, this.size * 0.6, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
    // bright centre dot
    ctx.globalAlpha = this.alpha * 0.9
    ctx.fillStyle = `rgba(255,255,255,0.9)`
    ctx.beginPath()
    ctx.arc(0, 0, this.size * 0.18, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const canvasRef     = useRef(null)
  const partCanvasRef = useRef(null)
  const cursorRingRef = useRef(null)
  const cursorDotRef  = useRef(null)

  const imgCache     = useRef(SEQUENCES.map(s => new Array(s.frameCount).fill(null)))
  const loadingSet   = useRef(new Set())
  const renderState  = useRef({ seqIndex: 0, frameIndex: 0, slideT: 0 })
  const hasShown     = useRef(false)
  const readyCount   = useRef(0)
  const prevSeqRef   = useRef(-1)

  const [seqIndex,       setSeqIndex]       = useState(0)
  const [slideT,         setSlideT]         = useState(0)
  const [showUI,         setShowUI]         = useState(true)
  const [isLoaded,       setIsLoaded]       = useState(false)
  const [loadPct,        setLoadPct]        = useState(0)
  const [scrollPct,      setScrollPct]      = useState(0)

  const musicRef      = useRef(null)

  const rafRef        = useRef(null)
  const partRafRef    = useRef(null)
  const uiHideTimer   = useRef(null)
  // Shared: particle loop writes current aurora hues; main loop reads them for bg fill
  const bgHuesRef     = useRef([330, 290, 260])


  // ── Load image ──────────────────────────────────────────────────────────
  const loadImage = useCallback((si, fi) => {
    const key = `${si}_${fi}`
    if (loadingSet.current.has(key) || imgCache.current[si][fi]) return
    loadingSet.current.add(key)
    const img = new Image()
    img.src = ALL_PATHS[si][fi]
    img.onload = () => {
      imgCache.current[si][fi] = img
      loadingSet.current.delete(key)
      // Track first-sequence load progress for the loader
      if (si === 0 && !hasShown.current) {
        readyCount.current++
        setLoadPct(Math.min(100, Math.round((readyCount.current / PRELOAD_TARGET) * 100)))
        if (readyCount.current >= PRELOAD_TARGET) {
          hasShown.current = true
          setTimeout(() => setIsLoaded(true), 600)
        }
      }
    }
    img.onerror = () => loadingSet.current.delete(key)
  }, [])

  // Load every frame of a sequence in PRIORITY ORDER starting from `startFrom`
  // This ensures frames near the current position enter the browser's download
  // queue first — critical because browsers allow only ~6 concurrent requests.
  const loadFullSequence = useCallback((si, startFrom = 0) => {
    if (si < 0 || si >= SEQUENCES.length) return
    const total = SEQUENCES[si].frameCount
    // Load outward from startFrom so nearest frames always have highest priority
    for (let i = 0; i < total; i++) {
      const f = (startFrom + i) % total
      loadImage(si, f)
    }
  }, [loadImage])

  // Tight window preload — frames immediately adjacent to cursor
  const preloadNear = useCallback((si, fi) => {
    const lo = Math.max(0, fi - 3)
    const hi = Math.min(SEQUENCES[si].frameCount - 1, fi + 15)
    for (let f = lo; f <= hi; f++) loadImage(si, f)
  }, [loadImage])



  // ── Canvas resize ───────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      ;[canvasRef.current, partCanvasRef.current].forEach(c => {
        if (!c) return
        c.width  = window.innerWidth
        c.height = window.innerHeight
        c.style.width  = window.innerWidth  + 'px'
        c.style.height = window.innerHeight + 'px'
      })
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // ── Custom cursor ─────────────────────────────────────────────────────────
  useEffect(() => {
    let rx = 0, ry = 0  // ring position (lerped)
    let dx = 0, dy = 0  // dot position (direct)
    let rafId
    const onMove = (e) => { dx = e.clientX; dy = e.clientY }
    window.addEventListener('mousemove', onMove)
    const animCursor = () => {
      // Dot follows exactly
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate(${dx}px,${dy}px) translate(-50%,-50%)`
      }
      // Ring lags behind with lerp for smooth trailing
      rx += (dx - rx) * 0.12
      ry += (dy - ry) * 0.12
      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`
      }
      rafId = requestAnimationFrame(animCursor)
    }
    rafId = requestAnimationFrame(animCursor)
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(rafId) }
  }, [])



  // ── Eager startup: preload seq 0 + seq 1 fully ──────────────────────────
  useEffect(() => {
    loadFullSequence(0)   // current on load
    loadFullSequence(1)   // next, so seq 1 is ready when seq 0 ends
  }, [loadFullSequence])

  // ── Auto-play music on first scroll ────────────────────────────────
  useEffect(() => {
    const tryPlay = () => {
      const audio = musicRef.current
      if (audio && audio.paused) {
        audio.play().catch(() => {})
      }
      window.removeEventListener('scroll', tryPlay)
      window.removeEventListener('click',  tryPlay)
    }
    window.addEventListener('scroll', tryPlay, { passive: true })
    window.addEventListener('click',  tryPlay)
    return () => {
      window.removeEventListener('scroll', tryPlay)
      window.removeEventListener('click',  tryPlay)
    }
  }, [])

  // ── Scroll handler ───────────────────────────────────────────────────────
  const activeSeqRef = useRef(0)   // track which sequence we last kicked off a full load for

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY

      setShowUI(true)
      clearTimeout(uiHideTimer.current)
      uiHideTimer.current = setTimeout(() => setShowUI(false), 2000)

      let si = 0, localY = scrollY
      for (let i = 0; i < SEQUENCES.length; i++) {
        const len = SEQUENCES[i].frameCount * SCROLL_PX_PER_FRAME + SLIDE_SCROLL_PX
        if (localY < len || i === SEQUENCES.length - 1) { si = i; break }
        localY -= len
      }

      const seqPx = SEQUENCES[si].frameCount * SCROLL_PX_PER_FRAME
      const fi    = clamp(Math.floor(localY / SCROLL_PX_PER_FRAME), 0, SEQUENCES[si].frameCount - 1)

      // Global scroll progress for the top line
      setScrollPct(scrollY / (TOTAL_SCROLL + window.innerHeight - 1))

      // ── On sequence change: load ENTIRE current + next, starting from fi ──
      if (si !== activeSeqRef.current) {
        activeSeqRef.current = si
        loadFullSequence(si, fi)      // current seq, prioritising frames from fi onward
        loadFullSequence(si + 1, 0)   // next seq from frame 0
      }
      let t = 0
      if (localY > seqPx && si < SEQUENCES.length - 1) {
        t = clamp((localY - seqPx) / SLIDE_SCROLL_PX, 0, 1)
      }

      renderState.current = { seqIndex: si, frameIndex: fi, slideT: t }
      setSeqIndex(si)
      setSlideT(t)
      preloadNear(si, fi)   // also keep the fast near-window topped up
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [loadFullSequence, preloadNear])

  // ── Main image render loop ──────────────────────────────────────────────────────
  // Keeps a ref to the last successfully drawn image per sequence so we
  // never show a blank frame while a new one is still loading.
  const lastGoodImg = useRef(SEQUENCES.map(() => null))

  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current
      if (!canvas) { rafRef.current = requestAnimationFrame(render); return }

      const ctx = canvas.getContext('2d')
      const cw  = canvas.width  || window.innerWidth
      const ch  = canvas.height || window.innerHeight
      const { seqIndex: si, frameIndex: fi, slideT: t } = renderState.current
      const [h0, h1, h2] = bgHuesRef.current

      // ── 1. Fill background with aurora colour gradient ─────────────────────
      // This colour shows through the black areas of the image frames
      ctx.clearRect(0, 0, cw, ch)
      const bgGrad = ctx.createRadialGradient(cw * 0.5, ch * 0.45, 0, cw * 0.5, ch * 0.5, Math.max(cw, ch) * 0.75)
      bgGrad.addColorStop(0,    `hsla(${h0.toFixed(1)}, 85%, 22%, 1)`)
      bgGrad.addColorStop(0.35, `hsla(${h1.toFixed(1)}, 80%, 14%, 1)`)
      bgGrad.addColorStop(0.70, `hsla(${h2.toFixed(1)}, 75%, 8%,  1)`)
      bgGrad.addColorStop(1,    'hsl(0, 0%, 2%)')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, cw, ch)

      // ── 2. Draw image frame(s) with screen blend — black = transparent ─────
      // Screen mode: result = 1-(1-img)(1-bg). Black(0) → bg shows through.
      ctx.globalCompositeOperation = 'screen'

      if (t > 0 && si + 1 < SEQUENCES.length) {
        const ease    = easeOut(t)
        const nextY   = (1 - ease) * ch
        // Use last good frame so slide-up never shows blank
        const curImg  = lastGoodImg.current[si] ||
                        imgCache.current[si]?.[SEQUENCES[si].frameCount - 1]
        const nextImg = imgCache.current[si + 1]?.[0] ||
                        lastGoodImg.current[si + 1]

        // 1. Current frame — static, behind
        if (curImg) drawFrameAt(ctx, curImg, cw, ch, 0)

        // 2. Next frame — slides up from below, clipped
        ctx.save()
        ctx.beginPath()
        ctx.rect(0, nextY, cw, ch)
        ctx.clip()
        if (nextImg) drawFrameAt(ctx, nextImg, cw, ch, nextY)
        ctx.restore()

        // 3. Shadow at seam
        if (nextImg && nextY > 2) {
          const grd = ctx.createLinearGradient(0, nextY - 24, 0, nextY + 6)
          grd.addColorStop(0, 'rgba(0,0,0,0)')
          grd.addColorStop(1, 'rgba(0,0,0,0.4)')
          ctx.fillStyle = grd
          ctx.fillRect(0, nextY - 24, cw, 30)
        }
      } else {
        const img = imgCache.current[si]?.[fi]
        if (img) {
          lastGoodImg.current[si] = img        // remember last successfully loaded
          drawFrameAt(ctx, img, cw, ch, 0)
        } else if (lastGoodImg.current[si]) {  // still loading → hold last good frame
          drawFrameAt(ctx, lastGoodImg.current[si], cw, ch, 0)
        }
      }

      rafRef.current = requestAnimationFrame(render)
    }
    rafRef.current = requestAnimationFrame(render)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  // ── Background effects render loop ────────────────────────────────────────
  useEffect(() => {
    const cw0 = window.innerWidth, ch0 = window.innerHeight

    // ── Drifting aurora blobs (large soft colour orbs) ────────────────────
    const blobs = Array.from({ length: 8 }, (_, i) => ({
      x:      Math.random() * cw0,
      y:      Math.random() * ch0,
      r:      120 + Math.random() * 200,
      vx:     (Math.random() - 0.5) * 0.3,
      vy:     (Math.random() - 0.5) * 0.2,
      phase:  Math.random() * Math.PI * 2,
      hueIdx: i % 3,
      alpha:  0.25 + Math.random() * 0.30,
      pulse:  0.002 + Math.random() * 0.003,
    }))

    // ── Floating sparkle stars ────────────────────────────────────────────
    const stars = Array.from({ length: 60 }, () => ({
      x:       Math.random() * cw0,
      y:       Math.random() * ch0,
      r:       0.5 + Math.random() * 2.0,
      alpha:   0,
      maxA:    0.3 + Math.random() * 0.6,
      life:    Math.floor(Math.random() * 180),
      maxLife: 120 + Math.random() * 200,
      hueIdx:  Math.floor(Math.random() * 3),
    }))

    // ── Shimmer lines (horizontal light sweeps) ────────────────────────────
    const shimmerLines = Array.from({ length: 5 }, () => ({
      y:      Math.random() * ch0,
      x:      -300,
      w:      80 + Math.random() * 180,
      speed:  1.2 + Math.random() * 2.5,
      alpha:  0.04 + Math.random() * 0.08,
      delay:  Math.floor(Math.random() * 300),
      active: false,
    }))

    // Smoothly interpolated chapter index
    let smoothSi = 0
    let tick = 0

    const loop = () => {
      const canvas = partCanvasRef.current
      if (!canvas) { partRafRef.current = requestAnimationFrame(loop); return }

      const ctx = canvas.getContext('2d')
      const cw  = canvas.width  || window.innerWidth
      const ch  = canvas.height || window.innerHeight

      // ── Hue interpolation (shared with main canvas bg) ────────────────
      const targetSi = renderState.current.seqIndex
      smoothSi += (targetSi - smoothSi) * 0.008
      const si0  = Math.floor(smoothSi)
      const si1  = Math.min(si0 + 1, CHAPTER_AURORA_HUES.length - 1)
      const blend = smoothSi - si0
      const hues0 = CHAPTER_AURORA_HUES[si0]
      const hues1 = CHAPTER_AURORA_HUES[si1]
      const hues  = hues0.map((h, i) => {
        let diff = hues1[i] - h
        if (diff >  180) diff -= 360
        if (diff < -180) diff += 360
        return (h + diff * blend + 360) % 360
      })
      bgHuesRef.current = hues

      ctx.clearRect(0, 0, cw, ch)

      // ══════════════════════════════════════════════════════════════════
      // All effects use 'destination-over':
      // → they paint ONLY where the main canvas (images) is dark/black
      // → they never cover bright image content
      // ══════════════════════════════════════════════════════════════════
      ctx.globalCompositeOperation = 'source-over'

      // ── 1. Drifting aurora colour blobs ──────────────────────────────
      blobs.forEach(b => {
        b.x += b.vx + Math.sin(tick * 0.0006 + b.phase) * 0.5
        b.y += b.vy + Math.cos(tick * 0.0004 + b.phase) * 0.35
        // Wrap around
        if (b.x < -b.r * 2) b.x = cw + b.r
        if (b.x > cw + b.r * 2) b.x = -b.r
        if (b.y < -b.r * 2) b.y = ch + b.r
        if (b.y > ch + b.r * 2) b.y = -b.r

        const hue    = hues[b.hueIdx]
        const pulse  = 1 + Math.sin(tick * b.pulse + b.phase) * 0.15
        const radius = b.r * pulse
        const grd    = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, radius)
        grd.addColorStop(0,   `hsla(${hue.toFixed(1)},90%,65%,${b.alpha.toFixed(3)})`)
        grd.addColorStop(0.5, `hsla(${hue.toFixed(1)},85%,55%,${(b.alpha * 0.4).toFixed(3)})`)
        grd.addColorStop(1,   `hsla(${hue.toFixed(1)},80%,50%,0)`)
        ctx.save()
        ctx.globalCompositeOperation = 'screen'
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(b.x, b.y, radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // ── 2. Sparkle stars ─────────────────────────────────────────────
      stars.forEach(s => {
        s.life++
        const t = s.life / s.maxLife
        s.alpha = s.maxA * Math.sin(t * Math.PI)
        if (s.life >= s.maxLife) {
          // Respawn at new position
          s.x = Math.random() * cw
          s.y = Math.random() * ch
          s.life = 0
          s.maxLife = 120 + Math.random() * 200
          s.maxA = 0.3 + Math.random() * 0.6
          s.hueIdx = Math.floor(Math.random() * 3)
        }
        if (s.alpha < 0.02) return
        const hue = hues[s.hueIdx]
        ctx.save()
        ctx.globalCompositeOperation = 'screen'
        ctx.globalAlpha = s.alpha
        // 4-point star
        ctx.fillStyle = `hsla(${hue.toFixed(1)},100%,85%,1)`
        ctx.translate(s.x, s.y)
        ctx.beginPath()
        for (let arm = 0; arm < 4; arm++) {
          ctx.save()
          ctx.rotate(arm * Math.PI / 2)
          ctx.ellipse(0, -s.r * 1.8, s.r * 0.25, s.r * 1.8, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
        // Centre dot
        ctx.globalAlpha = s.alpha * 0.9
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        ctx.beginPath()
        ctx.arc(0, 0, s.r * 0.4, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // ── 3. Shimmer sweep lines ────────────────────────────────────────
      shimmerLines.forEach(sl => {
        if (!sl.active) {
          if (--sl.delay <= 0) { sl.active = true; sl.x = -sl.w - 20; sl.y = Math.random() * ch }
          return
        }
        sl.x += sl.speed
        if (sl.x > cw + 20) { sl.active = false; sl.delay = Math.floor(Math.random() * 400 + 100) }
        ctx.save()
        ctx.globalCompositeOperation = 'screen'
        const hue = hues[0]
        const g = ctx.createLinearGradient(sl.x, 0, sl.x + sl.w, 0)
        g.addColorStop(0,    'rgba(255,255,255,0)')
        g.addColorStop(0.4,  `hsla(${hue.toFixed(1)},100%,90%,${sl.alpha.toFixed(3)})`)
        g.addColorStop(0.6,  `hsla(${hue.toFixed(1)},100%,90%,${sl.alpha.toFixed(3)})`)
        g.addColorStop(1,    'rgba(255,255,255,0)')
        ctx.strokeStyle = g
        ctx.lineWidth   = 1
        ctx.globalAlpha = 1
        ctx.beginPath()
        ctx.moveTo(sl.x, sl.y)
        ctx.lineTo(sl.x + sl.w, sl.y)
        ctx.stroke()
        ctx.restore()
      })

      // ── 4. Vignette — edge darkening ─────────────────────────────────
      ctx.globalCompositeOperation = 'source-over'
      const vig = ctx.createRadialGradient(cw*0.5, ch*0.5, ch*0.18, cw*0.5, ch*0.5, ch*0.88)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, 'rgba(0,0,0,0.60)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, cw, ch)

      tick++
      partRafRef.current = requestAnimationFrame(loop)
    }
    partRafRef.current = requestAnimationFrame(loop)
    return () => { if (partRafRef.current) cancelAnimationFrame(partRafRef.current) }
  }, [])


  const seq        = SEQUENCES[seqIndex]
  // Hero shows before first scroll, scene text shows while scrolling
  const heroVisible = isLoaded && scrollPct < 0.012

  return (
    <div className="app-root">

      {/* ── Custom cursor ── */}
      <div ref={cursorRingRef} className="cursor-ring" />
      <div ref={cursorDotRef}  className="cursor-dot"  />

      {/* ── Loading screen ── */}
      <div className={`loader ${isLoaded ? 'loader--done' : ''}`}>
        <div className="loader__inner">
          <div className="loader__eyebrow">A Visual Journey</div>
          <div className="loader__title">
            {'LOVE'.split('').map((l, i) => <span key={i}>{l}</span>)}
          </div>
          <div className="loader__bar-wrap">
            <div className="loader__bar-track">
              <div className="loader__bar-fill" style={{ width: `${loadPct}%` }} />
            </div>
            <span className="loader__pct">{loadPct} %</span>
          </div>
        </div>
      </div>

      {/* ── Scroll spacer ── */}
      <div className="scroll-spacer" style={{ height: TOTAL_SCROLL + window.innerHeight + 'px' }} />

      {/* ── Fixed viewport — only canvases & letterbox inside (zoom-affected) ── */}
      <div className="sticky-canvas-wrapper">
        <canvas ref={canvasRef}     className="main-canvas" />
        <canvas ref={partCanvasRef} className="part-canvas" />
        <div className="letterbox-top" />
        <div className="letterbox-bot" />
      </div>

      {/* ── UI overlays — outside scaled wrapper, always visible ── */}

      {/* Global scroll progress — 1px gold line at top */}
      <div className="scroll-line" style={{ width: `${scrollPct * 100}%` }} />

      {/* Chapter indicator — top left */}
      <div className={`chapter-indicator ${showUI ? 'visible' : ''}`}>
        <span className="chapter-eyebrow">Chapter</span>
        <div className="chapter-num">
          <em>{seq.chapter}</em>
        </div>
        <div className="chapter-rule" />
        <span className="chapter-of">of {String(SEQUENCES.length).padStart(2,'0')}</span>
      </div>

      {/* ── Hero panel — opening title card (fades out on first scroll) ── */}
      <div className={`story-panel ${(isLoaded && heroVisible) ? 'story-panel--in' : ''}`}>
        <div className="story-dt">
          <span className="story-dt__rule" />
          <h2 className="story-dt__head">{HERO.dHead}</h2>
          <p className="story-dt__body">{HERO.dText}</p>
        </div>
        <div className="story-mb">
          <h3 className="story-mb__head">{HERO.mHead}</h3>
          <p className="story-mb__sub">{HERO.mText}</p>
        </div>
      </div>

      {/* ── Per-scene story panel — top-right on desktop, bottom bar on mobile ── */}
      {(() => {
        const sd = SCENE_DATA[seqIndex]
        if (!sd) return null
        const sceneIn = showUI && !heroVisible
        return (
          <div key={seqIndex} className={`story-panel ${sceneIn ? 'story-panel--in' : ''}`}>
            <div className="story-dt">
              <span className="story-dt__rule" />
              <h2 className="story-dt__head">{sd.dHead}</h2>
              <p className="story-dt__body">{sd.dText}</p>
            </div>
            <div className="story-mb">
              <h3 className="story-mb__head">{sd.mHead}</h3>
              <p className="story-mb__sub">{sd.mText}</p>
            </div>
          </div>
        )
      })()}
      {/* ── Background music (auto-plays on first interaction) ── */}
      <audio ref={musicRef} src={musicSrc} loop preload="auto" />

      {/* ── Signature ── */}
      <div className="signature">
        <span className="signature__made">Made by</span>
        <span className="signature__name">Suguda</span>
      </div>

    </div>
  )
}
