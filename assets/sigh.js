/*
 * softPause live sigh: the breath the app's free tier gives everyone.
 *
 * TIMINGS: these mirror the app's engine, protocol "P1" (the physiological
 * sigh) in the app repo at packages/core/src/data/engine.json:
 *   inhale 2000 ms (easeOut) · inhaleTopUp 1000 ms (easeOut) · exhale 6000 ms (easeIn)
 *   dose: { breaths: 3 }  ->  3 x 9 s = 27 s
 * If P1 changes in engine.json, change it here in the same release.
 *
 * One shared file for every language. Each page passes its own words on the
 * [data-sigh] element (data-label-inhale, data-claim, ...). Layout mirrors in
 * RTL; the timing never does.
 *
 * Testing: ?speed=10 on the page URL runs the breath ten times faster.
 */
(function () {
  'use strict'

  var PHASES = [
    { kind: 'inhale', ms: 2000, scale: 0.86, ease: 'cubic-bezier(0, 0, 0.58, 1)' },
    { kind: 'inhaleTopUp', ms: 1000, scale: 1, ease: 'cubic-bezier(0, 0, 0.58, 1)' },
    { kind: 'exhale', ms: 6000, scale: 0.56, ease: 'cubic-bezier(0.42, 0, 1, 1)' }
  ]
  var BREATHS = 3
  var REST_SCALE = 0.56

  // A short pulse at each phase change (Android; skipped where unsupported).
  var PULSE = { inhale: 40, inhaleTopUp: [18, 50, 18], exhale: 70 }

  // A DEMO record, shown as an example only: [before, after] on the app's
  // five-level scale, 5 = Overwhelmed ... 1 = Okay. Not anyone's data.
  var DEMO_RECORD = [
    [4, 2], [3, 2], [5, 3], [3, 3], [4, 2], [2, 1], [4, 3], [3, 4],
    [5, 2], [3, 1], [4, 2], [2, 2], [3, 2], [4, 1], [3, 2]
  ]
  // The app's level glazes (day, third shade): Okay ... Overwhelmed.
  var GLAZE = { 1: '#44967C', 2: '#77833E', 3: '#925A06', 4: '#913C01', 5: '#7F211B' }

  var speed = 1
  try {
    var s = Number(new URLSearchParams(window.location.search).get('speed'))
    if (s >= 1 && s <= 100) speed = s
  } catch (e) {}

  var reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false }

  function fill(template, values) {
    return String(template || '').replace(/\{(\w+)\}/g, function (m, key) {
      return key in values ? values[key] : m
    })
  }

  function pulse(pattern) {
    try {
      if (typeof navigator.vibrate === 'function') navigator.vibrate(pattern)
    } catch (e) {}
  }

  function demoChart(svgNS) {
    var n = DEMO_RECORD.length
    var w = 18
    var top = 10
    var step = 20 // px per level
    var svg = document.createElementNS(svgNS, 'svg')
    svg.setAttribute('viewBox', '0 0 ' + n * w + ' ' + (top * 2 + step * 4))
    svg.setAttribute('class', 'sigh-chart')
    svg.setAttribute('aria-hidden', 'true')
    svg.setAttribute('focusable', 'false')
    DEMO_RECORD.forEach(function (p, i) {
      var x = i * w + w / 2
      var y1 = top + (5 - p[0]) * step
      var y2 = top + (5 - p[1]) * step
      var color = GLAZE[p[0]]
      var line = document.createElementNS(svgNS, 'line')
      line.setAttribute('x1', x)
      line.setAttribute('x2', x)
      line.setAttribute('y1', y1)
      line.setAttribute('y2', y2)
      line.setAttribute('stroke', color)
      line.setAttribute('stroke-width', '2')
      line.setAttribute('stroke-linecap', 'round')
      if (p[1] > p[0]) line.setAttribute('stroke-dasharray', '3 3')
      svg.appendChild(line)
      var ring = document.createElementNS(svgNS, 'circle')
      ring.setAttribute('cx', x)
      ring.setAttribute('cy', y1)
      ring.setAttribute('r', '4.5')
      ring.setAttribute('fill', 'none')
      ring.setAttribute('stroke', color)
      ring.setAttribute('stroke-width', '1.6')
      svg.appendChild(ring)
      var dot = document.createElementNS(svgNS, 'circle')
      dot.setAttribute('cx', x)
      dot.setAttribute('cy', y2)
      dot.setAttribute('r', '4')
      dot.setAttribute('fill', color)
      svg.appendChild(dot)
    })
    return svg
  }

  function setup(root) {
    var d = root.dataset
    var labels = {
      inhale: d.labelInhale || 'In',
      inhaleTopUp: d.labelTopUp || 'More',
      exhale: d.labelExhale || 'Out'
    }
    var orb = root.querySelector('.sigh-orb')
    var label = root.querySelector('.sigh-label')
    var count = root.querySelector('.sigh-count')
    var button = root.querySelector('.sigh-button')
    var progress = root.querySelector('.sigh-progress')
    var after = root.querySelector('.sigh-after')
    var vibrateNote = root.querySelector('.sigh-vibrate-note')
    if (!orb || !label || !button || !progress) return

    // Only mention the pulse on a touch device that can actually vibrate.
    if (vibrateNote && typeof navigator.vibrate === 'function' && navigator.maxTouchPoints > 0) {
      vibrateNote.hidden = false
    }

    // The progress line: one breath, split into its phases in proportion.
    var fills = PHASES.map(function (p) {
      var seg = document.createElement('span')
      seg.className = 'sigh-seg'
      seg.style.flexGrow = String(p.ms)
      var f = document.createElement('i')
      seg.appendChild(f)
      progress.appendChild(seg)
      return f
    })

    // The claim, computed from the demo record.
    var claimEl = root.querySelector('.sigh-claim')
    var chartSlot = root.querySelector('.sigh-chart-slot')
    if (claimEl) {
      var lower = DEMO_RECORD.filter(function (p) { return p[1] < p[0] }).length
      claimEl.textContent = fill(d.claim, { k: lower, n: DEMO_RECORD.length })
    }
    if (chartSlot) chartSlot.appendChild(demoChart('http://www.w3.org/2000/svg'))

    var timer = null
    var running = false
    var idleText = label.textContent
    var idleCount = count ? count.textContent : ''
    var startText = button.textContent

    function setOrb(scale, ms, ease) {
      if (reduceMotion.matches) {
        orb.style.transition = 'none'
        orb.style.transform = ''
        return
      }
      orb.style.transitionDuration = ms + 'ms'
      orb.style.transitionTimingFunction = ease || 'ease'
      orb.style.transform = 'scale(' + scale + ')'
    }

    function resetFills() {
      fills.forEach(function (f) {
        f.style.transition = 'none'
        f.style.width = '0%'
      })
    }

    function enter(step) {
      var breath = Math.floor(step / PHASES.length)
      var p = PHASES[step % PHASES.length]
      var ms = p.ms / speed
      if (step % PHASES.length === 0) resetFills()
      var f = fills[step % PHASES.length]
      f.style.transition = 'none'
      f.style.width = '0%'
      void f.offsetWidth // restart the fill from empty
      f.style.transition = 'width ' + ms + 'ms linear'
      f.style.width = '100%'
      label.textContent = labels[p.kind]
      root.setAttribute('data-phase', p.kind)
      if (count) count.textContent = fill(d.breathOf, { i: breath + 1, n: BREATHS })
      setOrb(p.scale, ms, p.ease)
      pulse(PULSE[p.kind])
    }

    function run(t0, step) {
      if (!running) return
      if (step >= BREATHS * PHASES.length) return finish()
      enter(step)
      var elapsed = 0
      for (var i = 0; i <= step; i++) elapsed += PHASES[i % PHASES.length].ms / speed
      timer = window.setTimeout(function () {
        run(t0, step + 1)
      }, Math.max(0, t0 + elapsed - performance.now()))
    }

    function start() {
      running = true
      root.setAttribute('data-state', 'running')
      if (after) after.hidden = true
      button.textContent = d.stop || 'Stop'
      run(performance.now(), 0)
    }

    function stop(done) {
      running = false
      window.clearTimeout(timer)
      setOrb(REST_SCALE, 900, 'ease-out')
      root.removeAttribute('data-phase')
      if (!done) {
        root.setAttribute('data-state', 'idle')
        resetFills()
        label.textContent = idleText
        if (count) count.textContent = idleCount
        button.textContent = startText
      }
    }

    function finish() {
      stop(true)
      root.setAttribute('data-state', 'done')
      label.textContent = d.labelDone || ''
      if (count) count.textContent = ''
      button.textContent = d.again || startText
      if (after) {
        after.hidden = false
        var focusTarget = after.querySelector('[tabindex="-1"]')
        if (focusTarget) focusTarget.focus({ preventScroll: false })
      }
    }

    button.addEventListener('click', function () {
      if (running) stop(false)
      else start()
    })
    root.addEventListener('keydown', function (e) {
      if (running && (e.key === 'Escape' || e.key === 'Esc')) stop(false)
    })

    root.setAttribute('data-state', 'idle')
    setOrb(REST_SCALE, 0)
  }

  function init() {
    var roots = document.querySelectorAll('[data-sigh]')
    for (var i = 0; i < roots.length; i++) setup(roots[i])
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()
