import Konva from "konva"

// Stitch Canvas Editor - 可视化组件编辑器
export const CanvasEditor = {
  mounted() {
    this.initCanvas()
    this.bindEvents()
    this.setupZoom()
  },

  destroyed() {
    if (this.stage) {
      this.stage.destroy()
    }
  },

  initCanvas() {
    const container = this.el
    const width = container.offsetWidth
    const height = container.offsetHeight || 600

    // 创建舞台
    this.stage = new Konva.Stage({
      container: container,
      width: width,
      height: height,
      draggable: true,
    })

    // 背景层（网格）
    this.gridLayer = new Konva.Layer()
    this.stage.add(this.gridLayer)
    this.drawGrid()

    // 组件层
    this.componentLayer = new Konva.Layer()
    this.stage.add(this.componentLayer)

    // 选择变换器
    this.transformer = new Konva.Transformer({
      rotateEnabled: false,
      borderStroke: '#2563eb',
      borderStrokeWidth: 2,
      anchorStroke: '#2563eb',
      anchorFill: '#fff',
      anchorSize: 8,
    })
    this.componentLayer.add(this.transformer)

    // 已选中的组件
    this.selectedNodes = []

    // 添加一些示例组件
    this.addSampleComponents()
  },

  drawGrid() {
    const gridSize = 20
    const width = 2000
    const height = 2000
    const offsetX = -500
    const offsetY = -500

    // 垂直线
    for (let x = offsetX; x < width + offsetX; x += gridSize) {
      this.gridLayer.add(new Konva.Line({
        points: [x, offsetY, x, height + offsetY],
        stroke: '#e5e7eb',
        strokeWidth: 1,
      }))
    }

    // 水平线
    for (let y = offsetY; y < height + offsetY; y += gridSize) {
      this.gridLayer.add(new Konva.Line({
        points: [offsetX, y, width + offsetX, y],
        stroke: '#e5e7eb',
        strokeWidth: 1,
      }))
    }
  },

  addSampleComponents() {
    // Card 组件
    this.addComponent({
      type: 'Card',
      x: 100,
      y: 100,
      width: 300,
      height: 200,
      fill: '#ffffff',
      stroke: '#e5e7eb',
      cornerRadius: 8,
      shadowColor: 'rgba(0,0,0,0.1)',
      shadowBlur: 10,
      shadowOffsetY: 4,
    })

    // Button 组件
    this.addComponent({
      type: 'Button',
      x: 150,
      y: 250,
      width: 100,
      height: 36,
      fill: '#2563eb',
      cornerRadius: 6,
      text: 'Button',
      textColor: '#ffffff',
    })

    // Text 组件
    this.addComponent({
      type: 'Text',
      x: 120,
      y: 130,
      text: 'Card Title',
      fontSize: 18,
      fontStyle: 'bold',
      fill: '#1e293b',
    })

    // 另一个 Card
    this.addComponent({
      type: 'Card',
      x: 450,
      y: 100,
      width: 250,
      height: 150,
      fill: '#f8fafc',
      stroke: '#e5e7eb',
      cornerRadius: 8,
    })
  },

  addComponent(config) {
    let node

    if (config.type === 'Text') {
      node = new Konva.Text({
        x: config.x,
        y: config.y,
        text: config.text,
        fontSize: config.fontSize || 14,
        fontStyle: config.fontStyle || 'normal',
        fill: config.fill || '#000000',
        draggable: true,
      })
    } else {
      // Card, Button 等矩形组件
      const group = new Konva.Group({
        x: config.x,
        y: config.y,
        draggable: true,
      })

      const rect = new Konva.Rect({
        width: config.width,
        height: config.height,
        fill: config.fill || '#ffffff',
        stroke: config.stroke,
        strokeWidth: config.stroke ? 1 : 0,
        cornerRadius: config.cornerRadius || 0,
        shadowColor: config.shadowColor,
        shadowBlur: config.shadowBlur || 0,
        shadowOffsetY: config.shadowOffsetY || 0,
      })
      group.add(rect)

      // 如果有文字
      if (config.text) {
        const text = new Konva.Text({
          text: config.text,
          fontSize: 14,
          fill: config.textColor || '#000000',
          width: config.width,
          height: config.height,
          align: 'center',
          verticalAlign: 'middle',
        })
        group.add(text)
      }

      node = group
    }

    // 存储组件元数据
    node.setAttr('componentType', config.type)
    node.setAttr('componentConfig', config)

    // 点击选中
    node.on('click tap', (e) => {
      e.cancelBubble = true
      this.selectNode(node)
    })

    // 拖拽结束同步到 LiveView
    node.on('dragend', () => {
      this.syncToLiveView()
    })

    // 变换结束同步
    node.on('transformend', () => {
      this.syncToLiveView()
    })

    this.componentLayer.add(node)
    this.componentLayer.batchDraw()

    return node
  },

  selectNode(node) {
    this.selectedNodes = [node]
    this.transformer.nodes([node])
    this.componentLayer.batchDraw()

    // 通知 LiveView
    const config = node.getAttr('componentConfig')
    this.pushEvent('component_selected', {
      type: node.getAttr('componentType'),
      config: config,
    })
  },

  clearSelection() {
    this.selectedNodes = []
    this.transformer.nodes([])
    this.componentLayer.batchDraw()
  },

  bindEvents() {
    // 点击空白处取消选择
    this.stage.on('click tap', (e) => {
      if (e.target === this.stage) {
        this.clearSelection()
      }
    })

    // 监听 LiveView 事件
    this.handleEvent('add_component', (data) => {
      this.addComponent(data)
    })

    this.handleEvent('export_schema', () => {
      this.exportToSchema()
    })
  },

  setupZoom() {
    const scaleBy = 1.1

    this.stage.on('wheel', (e) => {
      e.evt.preventDefault()

      const oldScale = this.stage.scaleX()
      const pointer = this.stage.getPointerPosition()

      const mousePointTo = {
        x: (pointer.x - this.stage.x()) / oldScale,
        y: (pointer.y - this.stage.y()) / oldScale,
      }

      const direction = e.evt.deltaY > 0 ? -1 : 1
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy

      // 限制缩放范围
      const limitedScale = Math.max(0.1, Math.min(5, newScale))

      this.stage.scale({ x: limitedScale, y: limitedScale })

      const newPos = {
        x: pointer.x - mousePointTo.x * limitedScale,
        y: pointer.y - mousePointTo.y * limitedScale,
      }
      this.stage.position(newPos)

      // 更新缩放显示
      this.pushEvent('zoom_changed', { zoom: Math.round(limitedScale * 100) })
    })
  },

  syncToLiveView() {
    const components = []
    this.componentLayer.children.forEach((node) => {
      if (node === this.transformer) return

      const type = node.getAttr('componentType')
      if (!type) return

      components.push({
        type: type,
        x: Math.round(node.x()),
        y: Math.round(node.y()),
        width: node.width ? Math.round(node.width()) : null,
        height: node.height ? Math.round(node.height()) : null,
      })
    })

    this.pushEvent('canvas_updated', { components })
  },

  exportToSchema() {
    const schema = {
      type: 'Page',
      children: [],
    }

    this.componentLayer.children.forEach((node) => {
      if (node === this.transformer) return

      const type = node.getAttr('componentType')
      const config = node.getAttr('componentConfig')
      if (!type) return

      schema.children.push({
        type: type,
        props: {
          style: {
            position: 'absolute',
            left: `${Math.round(node.x())}px`,
            top: `${Math.round(node.y())}px`,
          },
        },
        children: config.text || [],
      })
    })

    this.pushEvent('schema_exported', { schema })
    console.log('Exported Schema:', JSON.stringify(schema, null, 2))
  },
}
