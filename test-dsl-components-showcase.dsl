[FLEX: root]
  { Direction: "Row", Gap: "NONE", ClassName: "min-h-screen bg-background" }

  [STACK: sidebar]
    { Gap: "XS", ClassName: "w-56 border-r bg-muted/30 p-4 sticky top-0 h-screen overflow-y-auto shrink-0" }
    [TEXT: title]
      { ClassName: "font-bold text-lg mb-4" }
      CONTENT: "Stitch 组件库"

    [TEXT: cat1]
      { ClassName: "text-xs text-muted-foreground font-medium uppercase tracking-wider mt-4 mb-2" }
      CONTENT: "页面组件"
    [LINK: l1]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#hero")
      CONTENT: "Hero 主视觉"
    [LINK: l2]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#section")
      CONTENT: "Section 区块"

    [TEXT: cat2]
      { ClassName: "text-xs text-muted-foreground font-medium uppercase tracking-wider mt-4 mb-2" }
      CONTENT: "导航组件"
    [LINK: l3]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#breadcrumb")
      CONTENT: "Breadcrumb 面包屑"
    [LINK: l4]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#stepper")
      CONTENT: "Stepper 步骤条"
    [LINK: l5]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#tabs")
      CONTENT: "Tabs 标签页"

    [TEXT: cat3]
      { ClassName: "text-xs text-muted-foreground font-medium uppercase tracking-wider mt-4 mb-2" }
      CONTENT: "基础组件"
    [LINK: l6]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#button")
      CONTENT: "Button 按钮"
    [LINK: l7]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#badge")
      CONTENT: "Badge 徽章"
    [LINK: l8]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#icon")
      CONTENT: "Icon 图标"
    [LINK: l9]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#image")
      CONTENT: "Image 图片"
    [LINK: l10]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#avatar")
      CONTENT: "Avatar 头像"

    [TEXT: cat4]
      { ClassName: "text-xs text-muted-foreground font-medium uppercase tracking-wider mt-4 mb-2" }
      CONTENT: "数据展示"
    [LINK: l10]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#card")
      CONTENT: "Card 卡片"
    [LINK: l11]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#statistic")
      CONTENT: "Statistic 统计"
    [LINK: l12]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#table")
      CONTENT: "Table 表格"
    [LINK: l13]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#list")
      CONTENT: "List 列表"
    [LINK: l14]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#timeline")
      CONTENT: "Timeline 时间线"
    [LINK: l15]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#accordion")
      CONTENT: "Accordion 折叠"

    [TEXT: cat5]
      { ClassName: "text-xs text-muted-foreground font-medium uppercase tracking-wider mt-4 mb-2" }
      CONTENT: "表单组件"
    [LINK: l16]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#form")
      CONTENT: "Form 表单"

    [TEXT: cat6]
      { ClassName: "text-xs text-muted-foreground font-medium uppercase tracking-wider mt-4 mb-2" }
      CONTENT: "反馈组件"
    [LINK: l17]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#alert")
      CONTENT: "Alert 提示"
    [LINK: l18]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#progress")
      CONTENT: "Progress 进度"
    [LINK: l19]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#skeleton")
      CONTENT: "Skeleton 骨架屏"
    [LINK: l20]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#empty")
      CONTENT: "EmptyState 空状态"
    [LINK: l21]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#dialog")
      CONTENT: "Dialog 对话框"
    [LINK: l22]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#tooltip")
      CONTENT: "Tooltip 提示"

    [TEXT: cat7]
      { ClassName: "text-xs text-muted-foreground font-medium uppercase tracking-wider mt-4 mb-2" }
      CONTENT: "布局组件"
    [LINK: l23]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#layout")
      CONTENT: "Layout 布局"

    [TEXT: cat8]
      { ClassName: "text-xs text-muted-foreground font-medium uppercase tracking-wider mt-4 mb-2" }
      CONTENT: "其他"
    [LINK: l24]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#separator")
      CONTENT: "Separator 分隔线"
    [LINK: l25]
      { ClassName: "block text-sm py-1 px-2 rounded hover:bg-muted text-foreground no-underline" }
      ATTR: Href("#codeblock")
      CONTENT: "CodeBlock 代码块"

    [TEXT: cat9]
      { ClassName: "text-xs text-muted-foreground font-medium uppercase tracking-wider mt-4 mb-2" }
      CONTENT: "组件清单"
    [GRID: comp_list]
      { Columns: "2", Gap: "XS", ClassName: "text-[11px] text-muted-foreground" }
      [BADGE: c1] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "Div"
      [BADGE: c2] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "Span"
      [BADGE: c3] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "Text"
      [BADGE: c4] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "Link"
      [LINK: c5] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#image") CONTENT: "Image"
      [LINK: c6] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#layout") CONTENT: "Layout"
      [LINK: c7] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#grid") CONTENT: "Grid"
      [LINK: c8] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#columns") CONTENT: "Columns"
      [LINK: c9] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#split") CONTENT: "Split"
      [BADGE: c10] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "Stack"
      [BADGE: c11] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "Flex"
      [LINK: c12] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#rows") CONTENT: "Rows"
      [BADGE: c13] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "Page"
      [LINK: c14] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#center") CONTENT: "Center"
      [LINK: c15] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#spacer") CONTENT: "Spacer"
      [LINK: c16] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#layout_divider_demo") CONTENT: "LayoutDivider"
      [LINK: c17] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#hero") CONTENT: "Hero"
      [LINK: c18] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#section") CONTENT: "Section"
      [BADGE: c19] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "Container"
      [LINK: c20] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#card") CONTENT: "Card"
      [BADGE: c21] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "CardHeader"
      [BADGE: c22] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "CardTitle"
      [BADGE: c23] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "CardDescription"
      [BADGE: c24] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "CardContent"
      [BADGE: c25] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "CardFooter"
      [LINK: c26] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#tabs") CONTENT: "Tabs"
      [BADGE: c27] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "TabsList"
      [BADGE: c28] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "TabsTrigger"
      [BADGE: c29] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "TabsContent"
      [LINK: c30] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#breadcrumb") CONTENT: "Breadcrumb"
      [BADGE: c31] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "BreadcrumbList"
      [BADGE: c32] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "BreadcrumbItem"
      [BADGE: c33] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "BreadcrumbLink"
      [BADGE: c34] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "BreadcrumbPage"
      [BADGE: c35] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "BreadcrumbSeparator"
      [LINK: c36] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#stepper") CONTENT: "Stepper"
      [BADGE: c37] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "Step"
      [LINK: c38] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#table") CONTENT: "Table"
      [BADGE: c39] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "TableHeader"
      [BADGE: c40] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "TableBody"
      [BADGE: c41] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "TableRow"
      [BADGE: c42] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "TableHead"
      [BADGE: c43] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "TableCell"
      [LINK: c44] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#timeline") CONTENT: "Timeline"
      [BADGE: c45] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "TimelineItem"
      [BADGE: c46] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "TimelineContent"
      [BADGE: c47] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "TimelineHeader"
      [BADGE: c48] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "TimelineTitle"
      [BADGE: c49] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "TimelineDescription"
      [BADGE: c50] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "TimelineTime"
      [BADGE: c51] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "TimelineConnector"
      [BADGE: c52] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "TimelineEmpty"
      [LINK: c53] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#accordion") CONTENT: "Accordion"
      [BADGE: c54] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "AccordionItem"
      [BADGE: c55] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "AccordionTrigger"
      [BADGE: c56] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "AccordionContent"
      [LINK: c57] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#list") CONTENT: "List"
      [BADGE: c58] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "ListItem"
      [LINK: c59] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#statistic") CONTENT: "Statistic"
      [BADGE: c60] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "StatisticCard"
      [LINK: c61] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#codeblock") CONTENT: "CodeBlock"
      [BADGE: c62] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "InlineCode"
      [LINK: c63] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#button") CONTENT: "Button"
      [LINK: c64] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#form") CONTENT: "Input"
      [LINK: c65] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#form") CONTENT: "Label"
      [LINK: c66] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#form") CONTENT: "Checkbox"
      [BADGE: c67] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "RadioGroup"
      [BADGE: c68] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "RadioGroupItem"
      [LINK: c69] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#form") CONTENT: "Switch"
      [BADGE: c70] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "Slider"
      [LINK: c71] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#alert") CONTENT: "Alert"
      [BADGE: c72] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "AlertTitle"
      [BADGE: c73] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "AlertDescription"
      [LINK: c74] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#badge") CONTENT: "Badge"
      [LINK: c75] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#progress") CONTENT: "Progress"
      [LINK: c76] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#dialog") CONTENT: "Dialog"
      [BADGE: c77] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "DialogTrigger"
      [BADGE: c78] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "DialogContent"
      [BADGE: c79] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "DialogHeader"
      [BADGE: c80] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "DialogTitle"
      [BADGE: c81] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "DialogDescription"
      [BADGE: c82] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "DialogFooter"
      [LINK: c83] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#tooltip") CONTENT: "Tooltip"
      [BADGE: c84] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "TooltipProvider"
      [BADGE: c85] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "TooltipTrigger"
      [BADGE: c86] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "TooltipContent"
      [LINK: c87] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#skeleton") CONTENT: "Skeleton"
      [LINK: c88] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#empty") CONTENT: "EmptyState"
      [LINK: c89] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#icon") CONTENT: "Icon"
      [LINK: c90] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#avatar") CONTENT: "Avatar"
      [BADGE: c91] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "AvatarImage"
      [BADGE: c92] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "AvatarFallback"
      [BADGE: c93] { ClassName: "rounded bg-muted px-1.5 py-0.5 text-muted-foreground cursor-not-allowed" } CONTENT: "Separator"

  [STACK: main]
    { Gap: "LG", ClassName: "flex-1 p-6 overflow-y-auto" }

    [CARD: hero]
      ATTR: Title("Hero 主视觉"), Description("页面顶部的主视觉区域")
      [HERO: demo_hero]
        { Align: "Center", ClassName: "bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg" }
        [HEADING: hero_title]
          ATTR: Size("3XL")
          CONTENT: "欢迎使用 Stitch"
        [TEXT: hero_desc]
          { Size: "LG", ClassName: "text-muted-foreground mt-2" }
          CONTENT: "JSON Schema 驱动的 UI 渲染引擎"
        [FLEX: hero_btns]
          { Gap: "SM", ClassName: "mt-4" }
          [BUTTON: hero_b1]
            CONTENT: "开始使用"
          [BUTTON: hero_b2]
            ATTR: Variant("outline")
            CONTENT: "查看文档"

    [CARD: section]
      ATTR: Title("Section 区块"), Description("页面内容分区组件")
      [SECTION: demo_section]
        ATTR: Title("功能特性"), Subtitle("我们提供的核心能力")
        [TEXT: section_desc]
          { ClassName: "text-muted-foreground" }
          CONTENT: "Section 组件用于组织页面内容，支持标题和副标题。"

    [CARD: breadcrumb]
      ATTR: Title("Breadcrumb 面包屑"), Description("页面层级导航")
      [BREADCRUMB: demo_bc]
        [TEXT: bc1]
          CONTENT: "首页"
        [TEXT: bc2]
          CONTENT: "组件"
        [TEXT: bc3]
          CONTENT: "面包屑"

    [CARD: stepper]
      ATTR: Title("Stepper 步骤条"), Description("引导用户完成多步骤流程")
      [STEPPER: demo_stepper]
        [CARD: st1]
          ATTR: Title("基本信息")
          [TEXT: st1d]
            CONTENT: "填写账号信息"
        [CARD: st2]
          ATTR: Title("身份验证")
          [TEXT: st2d]
            CONTENT: "验证手机号"
        [CARD: st3]
          ATTR: Title("完成注册")
          [TEXT: st3d]
            CONTENT: "设置密码"

    [CARD: tabs]
      ATTR: Title("Tabs 标签页"), Description("切换不同内容面板的标签导航")
      [TABS: demo_tabs]
        [CARD: tab1]
          ATTR: Title("概览")
          [TEXT: tab1c]
            CONTENT: "项目总体概况和关键指标。"
        [CARD: tab2]
          ATTR: Title("分析")
          [TEXT: tab2c]
            CONTENT: "详细的数据分析图表。"
        [CARD: tab3]
          ATTR: Title("报告")
          [TEXT: tab3c]
            CONTENT: "生成的各类报告。"

    [CARD: button]
      ATTR: Title("Button 按钮"), Description("各种变体和尺寸的按钮组件")
      [STACK: btn_demo]
        { Gap: "MD" }
        [TEXT: btn_l1]
          { ClassName: "text-sm font-medium" }
          CONTENT: "变体 Variants:"
        [FLEX: btn_r1]
          { Gap: "SM", ClassName: "flex-wrap" }
          [BUTTON: btn1]
            ATTR: Variant("default")
            CONTENT: "Default"
          [BUTTON: btn2]
            ATTR: Variant("secondary")
            CONTENT: "Secondary"
          [BUTTON: btn3]
            ATTR: Variant("outline")
            CONTENT: "Outline"
          [BUTTON: btn4]
            ATTR: Variant("ghost")
            CONTENT: "Ghost"
          [BUTTON: btn5]
            ATTR: Variant("destructive")
            CONTENT: "Destructive"
        [TEXT: btn_l2]
          { ClassName: "text-sm font-medium mt-2" }
          CONTENT: "尺寸 Sizes:"
        [FLEX: btn_r2]
          { Gap: "SM", Align: "Center" }
          [BUTTON: btn6]
            ATTR: Size("SM")
            CONTENT: "Small"
          [BUTTON: btn7]
            CONTENT: "Default"
          [BUTTON: btn8]
            ATTR: Size("LG")
            CONTENT: "Large"
        [TEXT: btn_l3]
          { ClassName: "text-sm font-medium mt-2" }
          CONTENT: "带图标 With Icons:"
        [FLEX: btn_r3]
          { Gap: "SM" }
          [BUTTON: btn9]
            ATTR: Icon("Plus")
            CONTENT: "添加"
          [BUTTON: btn10]
            ATTR: Icon("Download")
            CONTENT: "下载"
          [BUTTON: btn11]
            ATTR: Icon("Settings"), Variant("outline")
            CONTENT: "设置"

    [CARD: badge]
      ATTR: Title("Badge 徽章"), Description("用于标记状态或分类的徽章")
      [FLEX: badge_demo]
        { Gap: "SM" }
        [BADGE: b1]
          CONTENT: "默认"
        [BADGE: b2]
          ATTR: Variant("secondary")
          CONTENT: "次要"
        [BADGE: b3]
          ATTR: Variant("outline")
          CONTENT: "边框"
        [BADGE: b4]
          ATTR: Variant("destructive")
          CONTENT: "危险"

    [CARD: icon]
      ATTR: Title("Icon 图标"), Description("基于 Lucide 的图标组件")
      [FLEX: icon_demo]
        { Gap: "MD", ClassName: "flex-wrap" }
        [ICON: ic1]
          ATTR: Icon("Home")
        [ICON: ic2]
          ATTR: Icon("Settings")
        [ICON: ic3]
          ATTR: Icon("User")
        [ICON: ic4]
          ATTR: Icon("Search")
        [ICON: ic5]
          ATTR: Icon("Bell")
        [ICON: ic6]
          ATTR: Icon("Heart")
        [ICON: ic7]
          ATTR: Icon("Star")
        [ICON: ic8]
          ATTR: Icon("Mail")

    [CARD: image]
      ATTR: Title("Image 图片"), Description("图片展示组件，支持圆角和宽高比")
      [FLEX: image_demo]
        { Gap: "MD" }
        [IMAGE: img1]
          { ClassName: "rounded-lg" }
          ATTR: Src("https://picsum.photos/200/200"), Alt("示例图片1")
        [IMAGE: img2]
          { ClassName: "rounded-lg" }
          ATTR: Src("https://picsum.photos/201/201"), Alt("示例图片2")

    [CARD: avatar]
      ATTR: Title("Avatar 头像"), Description("用户头像展示组件")
      [FLEX: avatar_demo]
        { Gap: "MD", Align: "Center" }
        [AVATAR: av1]
          ATTR: Fallback("张")
        [AVATAR: av2]
          ATTR: Fallback("李")
        [AVATAR: av3]
          ATTR: Fallback("王")

    [CARD: card]
      ATTR: Title("Card 卡片"), Description("容器组件，用于展示相关内容")
      [GRID: card_demo]
        { Columns: "3", Gap: "MD" }
        [CARD: c1]
          ATTR: Title("基础卡片")
          CONTENT: "这是基础卡片内容。"
        [CARD: c2]
          ATTR: Title("带图标"), Icon("Star")
          CONTENT: "带图标的卡片。"
        [CARD: c3]
          ATTR: Title("带操作")
          [TEXT: c3_desc]
            CONTENT: "包含操作按钮。"
          [FLEX: c3_actions]
            { Gap: "SM", ClassName: "mt-2" }
            [BUTTON: c3_b1]
              ATTR: Size("SM")
              CONTENT: "确认"
            [BUTTON: c3_b2]
              ATTR: Size("SM"), Variant("outline")
              CONTENT: "取消"

    [CARD: statistic]
      ATTR: Title("Statistic 统计卡片"), Description("展示关键数据指标")
      [GRID: stat_demo]
        { Columns: "4", Gap: "MD" }
        [STATISTIC_CARD: s1]
          ATTR: Title("总用户"), Icon("Users")
          CONTENT: "12,345"
        [STATISTIC_CARD: s2]
          ATTR: Title("订单数"), Icon("ShoppingCart")
          CONTENT: "8,901"
        [STATISTIC_CARD: s3]
          ATTR: Title("收入"), Icon("DollarSign")
          CONTENT: "¥99,999"
        [STATISTIC_CARD: s4]
          ATTR: Title("增长率"), Icon("TrendingUp")
          CONTENT: "+15.3%"

    [CARD: table]
      ATTR: Title("Table 数据表格"), Description("展示结构化数据")
      [TABLE: table_demo]
        [FLEX: th]
          [TEXT: th1]
            CONTENT: "姓名"
          [TEXT: th2]
            CONTENT: "年龄"
          [TEXT: th3]
            CONTENT: "城市"
        [FLEX: tr1]
          [TEXT: td1]
            CONTENT: "张三"
          [TEXT: td2]
            CONTENT: "28"
          [TEXT: td3]
            CONTENT: "北京"
        [FLEX: tr2]
          [TEXT: td4]
            CONTENT: "李四"
          [TEXT: td5]
            CONTENT: "32"
          [TEXT: td6]
            CONTENT: "上海"

    [CARD: list]
      ATTR: Title("List 列表"), Description("简洁的列表展示")
      [LIST: list_demo]
        [TEXT: li1]
          CONTENT: "列表项 1 - 项目概述"
        [TEXT: li2]
          CONTENT: "列表项 2 - 功能说明"
        [TEXT: li3]
          CONTENT: "列表项 3 - 使用指南"

    [CARD: timeline]
      ATTR: Title("Timeline 时间线"), Description("展示时间顺序的事件")
      [STACK: timeline_content]
        { Gap: "LG" }
        [TIMELINE: component_Timeline]
          [TIMELINE_ITEM: component_TimelineItem]
            ATTR: Title("项目启动"), Description("完成项目立项和团队组建"), Status("completed")
          [TIMELINE_ITEM: tl_item_2]
            ATTR: Title("需求分析"), Description("完成用户调研和需求文档"), Status("completed")
          [TIMELINE_ITEM: tl_item_3]
            ATTR: Title("开发阶段"), Description("正在进行核心功能开发"), Status("in-progress")
          [TIMELINE_ITEM: tl_item_4]
            ATTR: Title("测试上线"), Description("等待开发完成后进行测试"), Status("pending")

        [CARD: timeline_sub_demo]
          { ClassName: "border-dashed" }
          [STACK: timeline_sub_content]
            { Gap: "MD" }
            [TIMELINE_CONTENT: component_TimelineContent]
              [TIMELINE_HEADER: component_TimelineHeader]
                [TIMELINE_TITLE: component_TimelineTitle]
                  CONTENT: "里程碑说明"
                [TIMELINE_TIME: component_TimelineTime]
                  ATTR: Date("2024-01-20")
              [TIMELINE_DESCRIPTION: component_TimelineDescription]
                CONTENT: "演示子组件结构化排版"

            [FLEX: timeline_connector_demo]
              { Gap: "SM", Align: "Center" }
              [TIMELINE_CONNECTOR: component_TimelineConnector]
                { ClassName: "h-8" }
                ATTR: Status("in-progress")
              [TEXT: connector_label]
                { ClassName: "text-xs text-muted-foreground" }
                CONTENT: "连接线示例"

            [TIMELINE_EMPTY: component_TimelineEmpty]
              CONTENT: "暂无事件"

    [CARD: accordion]
      ATTR: Title("Accordion 折叠面板"), Description("可折叠的内容区域")
      [ACCORDION: component_Accordion]
        ATTR: Type("single"), Collapsible("true")
        [ACCORDION_ITEM: component_AccordionItem]
          ATTR: Value("item-1")
          [ACCORDION_TRIGGER: component_AccordionTrigger]
            CONTENT: "什么是 Stitch？"
          [ACCORDION_CONTENT: component_AccordionContent]
            CONTENT: "Stitch 是一个 JSON Schema 驱动的 UI 渲染引擎，可以通过 JSON 配置快速构建用户界面。"

        [ACCORDION_ITEM: acc_item_2]
          ATTR: Value("item-2")
          [ACCORDION_TRIGGER: acc_trigger_2]
            CONTENT: "支持哪些组件？"
          [ACCORDION_CONTENT: acc_content_2]
            CONTENT: "支持布局、表单、数据展示、反馈等多种类型的组件，基于 shadcn/ui 构建。"

        [ACCORDION_ITEM: acc_item_3]
          ATTR: Value("item-3")
          [ACCORDION_TRIGGER: acc_trigger_3]
            CONTENT: "如何使用？"
          [ACCORDION_CONTENT: acc_content_3]
            CONTENT: "编写 JSON Schema 描述 UI 结构，然后使用渲染器将其转换为 React 组件。"

    [CARD: form]
      ATTR: Title("Form 表单"), Description("表单输入组件")
      [STACK: form_demo]
        { Gap: "MD" }
        [FLEX: form_r1]
          { Gap: "MD" }
          [STACK: f1]
            [LABEL: l1]
              CONTENT: "姓名"
            [INPUT: i1]
              ATTR: Placeholder("请输入姓名")
          [STACK: f2]
            [LABEL: l2]
              CONTENT: "邮箱"
            [INPUT: i2]
              ATTR: Placeholder("请输入邮箱")
        [FLEX: form_checks]
          { Gap: "LG" }
          [CHECKBOX: c1]
            ATTR: Label("记住我")
          [SWITCH: s1]
            ATTR: Label("接收通知")
        [FLEX: form_btns]
          { Gap: "SM" }
          [BUTTON: submit]
            CONTENT: "提交"
          [BUTTON: reset]
            ATTR: Variant("outline")
            CONTENT: "重置"

    [CARD: alert]
      ATTR: Title("Alert 提示"), Description("各种类型的提示信息")
      [STACK: alert_demo]
        { Gap: "MD" }
        [ALERT: a1]
          ATTR: Variant("default"), Title("提示")
          CONTENT: "这是一条默认提示信息。"
        [ALERT: a2]
          ATTR: Variant("destructive"), Title("错误")
          CONTENT: "操作失败，请重试。"

    [CARD: progress]
      ATTR: Title("Progress 进度条"), Description("展示操作进度")
      [STACK: progress_demo]
        { Gap: "MD" }
        [TEXT: pg_l1]
          { ClassName: "text-sm" }
          CONTENT: "下载进度: 30%"
        [PROGRESS: pg1]
          ATTR: Value("30")
        [TEXT: pg_l2]
          { ClassName: "text-sm" }
          CONTENT: "上传进度: 70%"
        [PROGRESS: pg2]
          ATTR: Value("70")
        [TEXT: pg_l3]
          { ClassName: "text-sm" }
          CONTENT: "完成: 100%"
        [PROGRESS: pg3]
          ATTR: Value("100")

    [CARD: skeleton]
      ATTR: Title("Skeleton 骨架屏"), Description("加载状态占位")
      [STACK: skeleton_demo]
        { Gap: "SM" }
        [FLEX: skel_row]
          { Gap: "MD", Align: "Center" }
          [SKELETON: sk1]
            { ClassName: "h-12 w-12 rounded-full" }
          [STACK: skel_text]
            { Gap: "XS" }
            [SKELETON: sk2]
              { ClassName: "h-4 w-48" }
            [SKELETON: sk3]
              { ClassName: "h-4 w-36" }
        [SKELETON: sk4]
          { ClassName: "h-24 w-full" }

    [CARD: empty]
      ATTR: Title("EmptyState 空状态"), Description("无数据时的展示")
      [EMPTY_STATE: es1]
        ATTR: Title("暂无数据"), Icon("Inbox")
        CONTENT: "当前没有任何数据，请稍后再试。"

    [CARD: layout]
      ATTR: Title("Layout 布局"), Description("常用布局组件")
      [STACK: layout_demo]
        { Gap: "MD" }
        [TEXT: layout_l1]
          { ClassName: "text-sm font-medium" }
          CONTENT: "Grid 网格布局:"
        [GRID: layout_g1]
          { Columns: "3", Gap: "SM" }
          [BADGE: lg1]
            CONTENT: "Grid 1"
          [BADGE: lg2]
            CONTENT: "Grid 2"
          [BADGE: lg3]
            CONTENT: "Grid 3"
        [TEXT: layout_l2]
          { ClassName: "text-sm font-medium mt-4" }
          CONTENT: "Flex 弹性布局:"
        [FLEX: layout_f1]
          { Gap: "SM", Justify: "Between" }
          [BADGE: lf1]
            CONTENT: "Flex 1"
          [BADGE: lf2]
            CONTENT: "Flex 2"
          [BADGE: lf3]
            CONTENT: "Flex 3"
        [TEXT: layout_l3]
          { ClassName: "text-sm font-medium mt-4" }
          CONTENT: "Stack 堆叠布局:"
        [STACK: layout_s1]
          { Gap: "XS" }
          [BADGE: ls1]
            CONTENT: "Stack 1"
          [BADGE: ls2]
            CONTENT: "Stack 2"
          [BADGE: ls3]
            CONTENT: "Stack 3"

    [CARD: dialog]
      ATTR: Title("Dialog 对话框"), Description("模态对话框组件（静态预览）")
      [STACK: dialog_demo]
        { Gap: "MD" }
        [TEXT: dialog_desc]
          { ClassName: "text-muted-foreground" }
          CONTENT: "Dialog 用于需要用户确认或输入的场景。"
        [BUTTON: dialog_trigger]
          ATTR: Variant("outline")
          CONTENT: "打开对话框"

    [CARD: tooltip]
      ATTR: Title("Tooltip 工具提示"), Description("鼠标悬停时显示提示信息（静态预览）")
      [FLEX: tooltip_demo]
        { Gap: "MD" }
        [TOOLTIP: tt1]
          ATTR: Content("这是提示内容")
          [BUTTON: tt_btn1]
            ATTR: Variant("outline")
            CONTENT: "悬停查看"
        [TOOLTIP: tt2]
          ATTR: Content("另一个提示")
          [BADGE: tt_badge]
            CONTENT: "悬停我"

    [CARD: separator]
      ATTR: Title("Separator 分隔线"), Description("内容分隔")
      [STACK: sep_demo]
        { Gap: "MD" }
        [TEXT: sep_t1]
          CONTENT: "上方内容"
        [SEPARATOR: sep1]
        [TEXT: sep_t2]
          CONTENT: "下方内容"
        [FLEX: sep_row]
          { Gap: "MD", Align: "Center" }
          [TEXT: sep_t3]
            CONTENT: "左侧"
          [SEPARATOR: sep2]
            { ClassName: "h-4" }
            ATTR: Orientation("vertical")
          [TEXT: sep_t4]
            CONTENT: "右侧"

    [CARD: codeblock]
      ATTR: Title("CodeBlock 代码块"), Description("代码展示组件")
      [STACK: code_demo]
        { Gap: "MD" }
        [CODE: code1]
          ATTR: Language("javascript")
          CONTENT: "const greeting = 'Hello, Stitch!';\nconsole.log(greeting);"
        [CODE: code2]
          ATTR: Language("typescript")
          CONTENT: "interface User {\n  name: string;\n  age: number;\n}"

    [CARD: grid]
      ATTR: Title("Grid 网格布局")
      [GRID: grid_demo]
        { Columns: "4", Gap: "SM" }
        [CARD: grid1]
          { ClassName: "bg-blue-50 p-4 text-center" }
          [TEXT: g1]
            CONTENT: "1"
        [CARD: grid2]
          { ClassName: "bg-green-50 p-4 text-center" }
          [TEXT: g2]
            CONTENT: "2"
        [CARD: grid3]
          { ClassName: "bg-yellow-50 p-4 text-center" }
          [TEXT: g3]
            CONTENT: "3"
        [CARD: grid4]
          { ClassName: "bg-red-50 p-4 text-center" }
          [TEXT: g4]
            CONTENT: "4"

    [CARD: columns]
      ATTR: Title("Columns 多栏布局 (1:2:1 比例)")
      [COLUMNS: columns_demo]
        { Layout: "1:2:1", Gap: "MD" }
        [CARD: col1]
          { ClassName: "bg-blue-50 p-4" }
          [TEXT: c1]
            CONTENT: "左栏 (1份)"
        [CARD: col2]
          { ClassName: "bg-green-50 p-4" }
          [TEXT: c2]
            CONTENT: "中栏 (2份)"
        [CARD: col3]
          { ClassName: "bg-yellow-50 p-4" }
          [TEXT: c3]
            CONTENT: "右栏 (1份)"

    [CARD: split]
      ATTR: Title("Split 分割布局（左右）")
      [SPLIT: split_lr]
        { Ratio: "1:2", Gap: "MD" }
        [CARD: split_l]
          { ClassName: "bg-purple-50 p-4 h-20" }
          [TEXT: sl]
            CONTENT: "左侧 (1份)"
        [CARD: split_r]
          { ClassName: "bg-pink-50 p-4 h-20" }
          [TEXT: sr]
            CONTENT: "右侧 (2份)"

    [CARD: split_vertical]
      ATTR: Title("Split 分割布局（上下）")
      [SPLIT: split_tb]
        { Vertical: "true", Ratio: "1:1", Gap: "MD" }
        [CARD: split_t]
          { ClassName: "bg-cyan-50 p-4" }
          [TEXT: st]
            CONTENT: "上方区域"
        [CARD: split_b]
          { ClassName: "bg-orange-50 p-4" }
          [TEXT: sb]
            CONTENT: "下方区域"

    [CARD: rows]
      ATTR: Title("Rows 行布局")
      [ROWS: rows_demo]
        { Gap: "SM" }
        [CARD: row1]
          { ClassName: "bg-slate-100 p-3" }
          [TEXT: r1]
            CONTENT: "第一行"
        [CARD: row2]
          { ClassName: "bg-slate-200 p-3" }
          [TEXT: r2]
            CONTENT: "第二行"
        [CARD: row3]
          { ClassName: "bg-slate-300 p-3" }
          [TEXT: r3]
            CONTENT: "第三行"

    [CARD: center]
      ATTR: Title("Center 居中布局")
      [CENTER: center_demo]
        { MaxWidth: "md", ClassName: "bg-muted py-8" }
        [CARD: center_card]
          { ClassName: "w-full p-4 text-center" }
          [TEXT: center_text]
            CONTENT: "内容居中，最大宽度 md"

    [CARD: spacer]
      ATTR: Title("Spacer 间距组件")
      [STACK: spacer_content]
        { ClassName: "bg-muted p-4 rounded" }
        [BADGE: sp1]
          CONTENT: "上方内容"
        [SPACER: spacer1]
          ATTR: Size("4")
        [BADGE: sp2]
          CONTENT: "间隔4后"
        [SPACER: spacer2]
          ATTR: Size("8")
        [BADGE: sp3]
          CONTENT: "间隔8后"

    [CARD: layout_divider_demo]
      ATTR: Title("LayoutDivider 布局分割线")
      [STACK: divider_content]
        { Gap: "MD" }
        [TEXT: ld1]
          CONTENT: "段落一"
        [DIVIDER: ld_div1]
        [TEXT: ld2]
          CONTENT: "段落二"
        [DIVIDER: ld_div2]
          ATTR: Label("分节标题")
        [TEXT: ld3]
          CONTENT: "段落三"
