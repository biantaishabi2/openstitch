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
      [LINK: c1] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Div") CONTENT: "Div"
      [LINK: c2] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Span") CONTENT: "Span"
      [LINK: c3] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Text") CONTENT: "Text"
      [LINK: c4] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Link") CONTENT: "Link"
      [LINK: c5] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Image") CONTENT: "Image"
      [LINK: c6] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Layout") CONTENT: "Layout"
      [LINK: c7] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Grid") CONTENT: "Grid"
      [LINK: c8] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Columns") CONTENT: "Columns"
      [LINK: c9] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Split") CONTENT: "Split"
      [LINK: c10] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Stack") CONTENT: "Stack"
      [LINK: c11] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Flex") CONTENT: "Flex"
      [LINK: c12] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Rows") CONTENT: "Rows"
      [LINK: c13] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Page") CONTENT: "Page"
      [LINK: c14] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Center") CONTENT: "Center"
      [LINK: c15] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Spacer") CONTENT: "Spacer"
      [LINK: c16] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-LayoutDivider") CONTENT: "LayoutDivider"
      [LINK: c17] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Hero") CONTENT: "Hero"
      [LINK: c18] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Section") CONTENT: "Section"
      [LINK: c19] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Container") CONTENT: "Container"
      [LINK: c20] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Card") CONTENT: "Card"
      [LINK: c21] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-CardHeader") CONTENT: "CardHeader"
      [LINK: c22] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-CardTitle") CONTENT: "CardTitle"
      [LINK: c23] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-CardDescription") CONTENT: "CardDescription"
      [LINK: c24] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-CardContent") CONTENT: "CardContent"
      [LINK: c25] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-CardFooter") CONTENT: "CardFooter"
      [LINK: c26] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Tabs") CONTENT: "Tabs"
      [LINK: c27] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-TabsList") CONTENT: "TabsList"
      [LINK: c28] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-TabsTrigger") CONTENT: "TabsTrigger"
      [LINK: c29] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-TabsContent") CONTENT: "TabsContent"
      [LINK: c30] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Breadcrumb") CONTENT: "Breadcrumb"
      [LINK: c31] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-BreadcrumbList") CONTENT: "BreadcrumbList"
      [LINK: c32] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-BreadcrumbItem") CONTENT: "BreadcrumbItem"
      [LINK: c33] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-BreadcrumbLink") CONTENT: "BreadcrumbLink"
      [LINK: c34] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-BreadcrumbPage") CONTENT: "BreadcrumbPage"
      [LINK: c35] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-BreadcrumbSeparator") CONTENT: "BreadcrumbSeparator"
      [LINK: c36] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Stepper") CONTENT: "Stepper"
      [LINK: c37] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Step") CONTENT: "Step"
      [LINK: c38] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Table") CONTENT: "Table"
      [LINK: c39] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-TableHeader") CONTENT: "TableHeader"
      [LINK: c40] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-TableBody") CONTENT: "TableBody"
      [LINK: c41] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-TableRow") CONTENT: "TableRow"
      [LINK: c42] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-TableHead") CONTENT: "TableHead"
      [LINK: c43] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-TableCell") CONTENT: "TableCell"
      [LINK: c44] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Timeline") CONTENT: "Timeline"
      [LINK: c45] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-TimelineItem") CONTENT: "TimelineItem"
      [LINK: c46] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-TimelineContent") CONTENT: "TimelineContent"
      [LINK: c47] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-TimelineHeader") CONTENT: "TimelineHeader"
      [LINK: c48] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-TimelineTitle") CONTENT: "TimelineTitle"
      [LINK: c49] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-TimelineDescription") CONTENT: "TimelineDescription"
      [LINK: c50] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-TimelineTime") CONTENT: "TimelineTime"
      [LINK: c51] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-TimelineConnector") CONTENT: "TimelineConnector"
      [LINK: c52] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-TimelineEmpty") CONTENT: "TimelineEmpty"
      [LINK: c53] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Accordion") CONTENT: "Accordion"
      [LINK: c54] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-AccordionItem") CONTENT: "AccordionItem"
      [LINK: c55] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-AccordionTrigger") CONTENT: "AccordionTrigger"
      [LINK: c56] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-AccordionContent") CONTENT: "AccordionContent"
      [LINK: c57] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-List") CONTENT: "List"
      [LINK: c58] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-ListItem") CONTENT: "ListItem"
      [LINK: c59] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Statistic") CONTENT: "Statistic"
      [LINK: c60] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-StatisticCard") CONTENT: "StatisticCard"
      [LINK: c61] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-CodeBlock") CONTENT: "CodeBlock"
      [LINK: c62] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-InlineCode") CONTENT: "InlineCode"
      [LINK: c63] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Button") CONTENT: "Button"
      [LINK: c64] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Input") CONTENT: "Input"
      [LINK: c65] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Label") CONTENT: "Label"
      [LINK: c66] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Checkbox") CONTENT: "Checkbox"
      [LINK: c67] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-RadioGroup") CONTENT: "RadioGroup"
      [LINK: c68] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-RadioGroupItem") CONTENT: "RadioGroupItem"
      [LINK: c69] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Switch") CONTENT: "Switch"
      [LINK: c70] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Slider") CONTENT: "Slider"
      [LINK: c71] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Alert") CONTENT: "Alert"
      [LINK: c72] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-AlertTitle") CONTENT: "AlertTitle"
      [LINK: c73] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-AlertDescription") CONTENT: "AlertDescription"
      [LINK: c74] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Badge") CONTENT: "Badge"
      [LINK: c75] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Progress") CONTENT: "Progress"
      [LINK: c76] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Dialog") CONTENT: "Dialog"
      [LINK: c77] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-DialogTrigger") CONTENT: "DialogTrigger"
      [LINK: c78] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-DialogContent") CONTENT: "DialogContent"
      [LINK: c79] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-DialogHeader") CONTENT: "DialogHeader"
      [LINK: c80] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-DialogTitle") CONTENT: "DialogTitle"
      [LINK: c81] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-DialogDescription") CONTENT: "DialogDescription"
      [LINK: c82] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-DialogFooter") CONTENT: "DialogFooter"
      [LINK: c83] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Tooltip") CONTENT: "Tooltip"
      [LINK: c84] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-TooltipProvider") CONTENT: "TooltipProvider"
      [LINK: c85] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-TooltipTrigger") CONTENT: "TooltipTrigger"
      [LINK: c86] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-TooltipContent") CONTENT: "TooltipContent"
      [LINK: c87] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Skeleton") CONTENT: "Skeleton"
      [LINK: c88] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-EmptyState") CONTENT: "EmptyState"
      [LINK: c89] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Icon") CONTENT: "Icon"
      [LINK: c90] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Avatar") CONTENT: "Avatar"
      [LINK: c91] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-AvatarImage") CONTENT: "AvatarImage"
      [LINK: c92] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-AvatarFallback") CONTENT: "AvatarFallback"
      [LINK: c93] { ClassName: "rounded bg-muted px-1.5 py-0.5 no-underline hover:bg-muted/80 text-foreground" } ATTR: Href("#component-Separator") CONTENT: "Separator"

  [STACK: main]
    { Gap: "LG", ClassName: "flex-1 p-6 overflow-y-auto" }

    [CARD: hero]
      ATTR: Title("Hero 主视觉"), Description("页面顶部的主视觉区域")
      [HERO: demo_hero]
        { Align: "Center", ClassName: "bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg" }
        [HEADING: hero_title]
          ATTR: Size("XL")
          CONTENT: "欢迎使用 Stitch"
        [TEXT: hero_desc]
          { ClassName: "text-muted-foreground mt-2" }
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
