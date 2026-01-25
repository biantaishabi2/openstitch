/**
 * Stitch Canvas Hook - CSS Transform 无限画布
 *
 * 功能：
 * - 滚轮缩放（以鼠标位置为中心）
 * - 拖拽平移画布
 * - 触摸支持：单指拖拽、双指缩放
 * - 状态同步到 LiveView
 */
export const StitchCanvas = {
  mounted() {
    this.scale = 1.0
    this.translateX = 50
    this.translateY = 80
    this.isDragging = false
    this.lastMouseX = 0
    this.lastMouseY = 0

    // 触摸相关状态
    this.lastTouchX = 0
    this.lastTouchY = 0
    this.lastPinchDist = 0
    this.isPinching = false

    // 支持新的 ID 格式：canvas-layer-{id} 或旧格式 canvas-layer
    const canvasId = this.el.dataset.canvasId
    this.canvasLayer = document.getElementById("canvas-layer-" + canvasId) || document.getElementById("canvas-layer")

    this.bindEvents()
    this.bindTouchEvents()
  },

  destroyed() {
    // 清理事件监听
  },

  updateTransform() {
    if (this.canvasLayer) {
      this.canvasLayer.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`
    }
  },

  // 禁用 iframe 的指针事件，防止拦截触摸
  disableIframePointerEvents() {
    this.el.querySelectorAll('iframe').forEach(iframe => {
      iframe.style.pointerEvents = 'none'
    })
  },

  // 恢复 iframe 的指针事件
  enableIframePointerEvents() {
    this.el.querySelectorAll('iframe').forEach(iframe => {
      iframe.style.pointerEvents = 'auto'
    })
  },

  bindEvents() {
    // 滚轮缩放
    this.el.addEventListener("wheel", (e) => {
      e.preventDefault()

      const rect = this.el.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // 计算鼠标在画布坐标系中的位置
      const canvasX = (mouseX - this.translateX) / this.scale
      const canvasY = (mouseY - this.translateY) / this.scale

      // 缩放
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.max(0.1, Math.min(3, this.scale * delta))

      // 调整偏移以保持鼠标位置不变
      this.translateX = mouseX - canvasX * newScale
      this.translateY = mouseY - canvasY * newScale
      this.scale = newScale

      // 立即更新 DOM
      this.updateTransform()

      // 同步到 LiveComponent（使用 this.el 让 LiveView 根据 phx-target 路由）
      this.pushEventTo(this.el, "zoom", {
        scale: this.scale,
        x: this.translateX,
        y: this.translateY
      })
    })

    // 拖拽画布
    this.el.addEventListener("mousedown", (e) => {
      // 只在点击画布背景时拖拽，不在 Screen 内部
      if (e.target === this.el || e.target === this.canvasLayer) {
        this.isDragging = true
        this.lastMouseX = e.clientX
        this.lastMouseY = e.clientY
        this.el.style.cursor = "grabbing"
      }
    })

    document.addEventListener("mousemove", (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastMouseX
        const dy = e.clientY - this.lastMouseY
        this.translateX += dx
        this.translateY += dy
        this.lastMouseX = e.clientX
        this.lastMouseY = e.clientY

        this.updateTransform()
      }
    })

    document.addEventListener("mouseup", () => {
      if (this.isDragging) {
        this.isDragging = false
        this.el.style.cursor = "default"

        // 拖拽结束，同步到 LiveComponent
        this.pushEventTo(this.el, "pan", {
          x: this.translateX,
          y: this.translateY
        })
      }
    })
  },

  bindTouchEvents() {
    // 触摸开始
    this.el.addEventListener("touchstart", (e) => {
      
      e.preventDefault()
      e.stopPropagation()

      // 禁用 iframe 拦截
      this.disableIframePointerEvents()

      if (e.touches.length === 1) {
        // 单指：准备拖拽
        this.isDragging = true
        this.isPinching = false
        this.lastTouchX = e.touches[0].clientX
        this.lastTouchY = e.touches[0].clientY
              } else if (e.touches.length === 2) {
        // 双指：准备缩放
        this.isDragging = false
        this.isPinching = true
        this.lastPinchDist = this.getPinchDist(e.touches)
        this.lastTouchX = (e.touches[0].clientX + e.touches[1].clientX) / 2
        this.lastTouchY = (e.touches[0].clientY + e.touches[1].clientY) / 2
              }
    }, { passive: false })

    // 触摸移动
    this.el.addEventListener("touchmove", (e) => {
      e.preventDefault()
      e.stopPropagation()

      if (e.touches.length === 1 && this.isDragging && !this.isPinching) {
        // 单指拖拽
        const dx = e.touches[0].clientX - this.lastTouchX
        const dy = e.touches[0].clientY - this.lastTouchY
        this.translateX += dx
        this.translateY += dy
        this.lastTouchX = e.touches[0].clientX
        this.lastTouchY = e.touches[0].clientY

        this.updateTransform()
              } else if (e.touches.length === 2 && this.isPinching) {
        // 双指缩放
        const newDist = this.getPinchDist(e.touches)
        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2

        // 计算缩放比例
        const scaleRatio = newDist / this.lastPinchDist
        const newScale = Math.max(0.1, Math.min(3, this.scale * scaleRatio))

        // 以双指中心为缩放中心
        const rect = this.el.getBoundingClientRect()
        const pinchX = centerX - rect.left
        const pinchY = centerY - rect.top

        const canvasX = (pinchX - this.translateX) / this.scale
        const canvasY = (pinchY - this.translateY) / this.scale

        this.translateX = pinchX - canvasX * newScale
        this.translateY = pinchY - canvasY * newScale
        this.scale = newScale

        // 同时处理平移
        const dx = centerX - this.lastTouchX
        const dy = centerY - this.lastTouchY
        this.translateX += dx
        this.translateY += dy

        this.lastPinchDist = newDist
        this.lastTouchX = centerX
        this.lastTouchY = centerY

        this.updateTransform()
      }
    }, { passive: false })

    // 触摸结束
    this.el.addEventListener("touchend", (e) => {
      if (e.touches.length === 0) {
        // 所有手指离开，恢复 iframe
        this.enableIframePointerEvents()

        if (this.isDragging || this.isPinching) {
          this.pushEventTo(this.el, "zoom", {
            scale: this.scale,
            x: this.translateX,
            y: this.translateY
          })
        }
        this.isDragging = false
        this.isPinching = false
      } else if (e.touches.length === 1) {
        // 从双指变单指，切换到拖拽模式
        this.isPinching = false
        this.isDragging = true
        this.lastTouchX = e.touches[0].clientX
        this.lastTouchY = e.touches[0].clientY
      }
    })
  },

  // 计算双指距离
  getPinchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }
}
