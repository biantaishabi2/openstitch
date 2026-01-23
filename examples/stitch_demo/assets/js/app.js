// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// import "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html"
// Establish Phoenix Socket and LiveView configuration.
import {Socket} from "phoenix"
import {LiveSocket} from "phoenix_live_view"
import topbar from "../vendor/topbar"

let Hooks = {}

Hooks.StitchUI = {
  mounted() {
    this.onClick = this.onClick.bind(this)
    this.onPointerDown = this.onPointerDown.bind(this)
    this.onPointerMove = this.onPointerMove.bind(this)
    this.onPointerUp = this.onPointerUp.bind(this)
    this.onToggle = this.onToggle.bind(this)

    this.el.addEventListener("click", this.onClick)
    this.el.addEventListener("pointerdown", this.onPointerDown)
    this.el.addEventListener("toggle", this.onToggle, true)

    this.activeSlider = null
    this.syncAll()
  },

  destroyed() {
    this.el.removeEventListener("click", this.onClick)
    this.el.removeEventListener("pointerdown", this.onPointerDown)
    this.el.removeEventListener("toggle", this.onToggle, true)
    this.detachPointerListeners()
  },

  onClick(event) {
    const tabTrigger = event.target.closest("[data-slot='tabs-trigger']")
    if (tabTrigger) {
      this.activateTab(tabTrigger)
      return
    }

    const copyButton = event.target.closest("[data-code-copy]")
    if (copyButton) {
      event.preventDefault()
      this.copyCode(copyButton)
    }
  },

  onPointerDown(event) {
    const slider = event.target.closest("[data-slot='slider']")
    if (!slider) return
    event.preventDefault()
    this.activeSlider = slider
    this.updateSliderFromEvent(slider, event)
    this.attachPointerListeners()
  },

  onPointerMove(event) {
    if (!this.activeSlider) return
    this.updateSliderFromEvent(this.activeSlider, event)
  },

  onPointerUp() {
    this.activeSlider = null
    this.detachPointerListeners()
  },

  onToggle(event) {
    const item = event.target.closest("details[data-slot='accordion-item']")
    if (!item) return
    this.updateAccordionItem(item)
  },

  attachPointerListeners() {
    window.addEventListener("pointermove", this.onPointerMove)
    window.addEventListener("pointerup", this.onPointerUp)
  },

  detachPointerListeners() {
    window.removeEventListener("pointermove", this.onPointerMove)
    window.removeEventListener("pointerup", this.onPointerUp)
  },

  syncAll() {
    this.syncTabs()
    this.syncAccordion()
    this.syncSliders()
  },

  syncTabs() {
    this.el.querySelectorAll("[data-slot='tabs']").forEach((tabs) => {
      let activeValue = tabs.getAttribute("data-value")
      if (!activeValue) {
        const activeTrigger = tabs.querySelector("[data-slot='tabs-trigger'][data-state='active']")
        activeValue = activeTrigger && activeTrigger.getAttribute("data-value")
      }
      if (!activeValue) {
        const firstTrigger = tabs.querySelector("[data-slot='tabs-trigger']")
        activeValue = firstTrigger && firstTrigger.getAttribute("data-value")
      }
      if (activeValue) {
        this.setActiveTab(tabs, activeValue)
      }
    })
  },

  activateTab(trigger) {
    const tabs = trigger.closest("[data-slot='tabs']")
    const value = trigger.getAttribute("data-value")
    if (!tabs || !value) return
    this.setActiveTab(tabs, value)
  },

  setActiveTab(tabs, value) {
    tabs.setAttribute("data-value", value)
    tabs.querySelectorAll("[data-slot='tabs-trigger']").forEach((el) => {
      const isActive = el.getAttribute("data-value") === value
      el.setAttribute("data-state", isActive ? "active" : "inactive")
    })
    tabs.querySelectorAll("[data-slot='tabs-content']").forEach((el) => {
      const isActive = el.getAttribute("data-value") === value
      el.setAttribute("data-state", isActive ? "active" : "inactive")
      el.hidden = !isActive
    })
  },

  syncAccordion() {
    this.el.querySelectorAll("details[data-slot='accordion-item']").forEach((item) => {
      this.updateAccordionItem(item)
    })
  },

  updateAccordionItem(item) {
    const state = item.open ? "open" : "closed"
    item.setAttribute("data-state", state)
    const trigger = item.querySelector("[data-slot='accordion-trigger']")
    if (trigger) trigger.setAttribute("data-state", state)
    const content = item.querySelector("[data-slot='accordion-content']")
    if (content) content.setAttribute("data-state", state)
  },

  syncSliders() {
    this.el.querySelectorAll("[data-slot='slider']").forEach((slider) => {
      this.updateSlider(slider)
    })
  },

  updateSliderFromEvent(slider, event) {
    const track = slider.querySelector("[data-slot='slider-track']")
    if (!track) return
    const rect = track.getBoundingClientRect()
    const min = this.parseNumber(slider.getAttribute("data-min"), 0)
    const max = this.parseNumber(slider.getAttribute("data-max"), 100)
    const step = this.parseNumber(slider.getAttribute("data-step"), 1)
    const range = max - min
    if (range <= 0) return
    let percent = (event.clientX - rect.left) / rect.width
    percent = this.clamp(percent, 0, 1)
    let value = min + percent * range
    value = Math.round(value / step) * step
    value = this.clamp(value, min, max)
    slider.setAttribute("data-value", value)
    this.updateSlider(slider)
  },

  updateSlider(slider) {
    const min = this.parseNumber(slider.getAttribute("data-min"), 0)
    const max = this.parseNumber(slider.getAttribute("data-max"), 100)
    const value = this.parseNumber(slider.getAttribute("data-value"), min)
    const range = max - min
    const percent = range === 0 ? 0 : ((value - min) / range) * 100
    const rangeEl = slider.querySelector("[data-slot='slider-range']")
    const thumbEl = slider.querySelector("[data-slot='slider-thumb']")
    if (rangeEl) rangeEl.style.width = `${percent}%`
    if (thumbEl) thumbEl.style.left = `${percent}%`
  },

  copyCode(button) {
    const container =
      button.closest("[data-language]") || button.closest("[data-slot='code-block']")
    const codeEl = container ? container.querySelector("code") : null
    const text = codeEl ? codeEl.innerText : ""
    if (!text) return

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => this.flashCopy(button))
        .catch(() => this.copyWithFallback(text, button))
    } else {
      this.copyWithFallback(text, button)
    }
  },

  copyWithFallback(text, button) {
    const textarea = document.createElement("textarea")
    textarea.value = text
    textarea.setAttribute("readonly", "true")
    textarea.style.position = "absolute"
    textarea.style.left = "-9999px"
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand("copy")
    document.body.removeChild(textarea)
    this.flashCopy(button)
  },

  flashCopy(button) {
    const original = button.innerText
    button.innerText = "Copied"
    button.setAttribute("data-copied", "true")
    setTimeout(() => {
      button.innerText = original
      button.removeAttribute("data-copied")
    }, 1200)
  },

  parseNumber(value, fallback) {
    const num = Number.parseFloat(value)
    return Number.isFinite(num) ? num : fallback
  },

  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
  }
}

let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")
let liveSocket = new LiveSocket("/live", Socket, {
  hooks: Hooks,
  longPollFallbackMs: 2500,
  params: {_csrf_token: csrfToken}
})

// Show progress bar on live navigation and form submits
topbar.config({barColors: {0: "#29d"}, shadowColor: "rgba(0, 0, 0, .3)"})
window.addEventListener("phx:page-loading-start", _info => topbar.show(300))
window.addEventListener("phx:page-loading-stop", _info => topbar.hide())

// connect if there are any LiveViews on the page
liveSocket.connect()

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket
