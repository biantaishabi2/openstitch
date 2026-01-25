[FLEX: showcase_layout]
  { Direction: "Row", Gap: "0" }

  [SIDEBAR: sidebar]
    [HEADING: logo] CONTENT: "Showcase"
    [NAV: nav]
      [TEXT: n1] CONTENT: "基础组件"
      [TEXT: n2] CONTENT: "布局组件"
      [TEXT: n3] CONTENT: "复合组件"
      [TEXT: n4] CONTENT: "映射组件"

  [SECTION: main]
    [HEADER: header]
      [HEADING: title] CONTENT: "组件 Showcase"
      [BADGE: version] CONTENT: "v1.0"

    [GRID: content]
      { Columns: 2, Gap: "24px" }

      [CARD: text_demo]
        ATTR: Title("Text 文本"), Icon("Type")
        [TEXT: t1] CONTENT: "普通文本"
        [TEXT: t2] CONTENT: "另一段文本"

      [CARD: button_demo]
        ATTR: Title("Button 按钮"), Icon("MousePointer")
        [BUTTON: b1] CONTENT: "默认按钮"
        [BUTTON: b2] ATTR: Variant("outline") CONTENT: "轮廓按钮"
        [BUTTON: b3] ATTR: Variant("ghost") CONTENT: "幽灵按钮"

      [CARD: icon_demo]
        ATTR: Title("Icon 图标"), Icon("Smile")
        [FLEX: icons]
          { Gap: "16px" }
          [ICON: i1] ATTR: Icon("Home")
          [ICON: i2] ATTR: Icon("Settings")
          [ICON: i3] ATTR: Icon("User")
          [ICON: i4] ATTR: Icon("Bell")

      [CARD: badge_demo]
        ATTR: Title("Badge 徽章"), Icon("Tag")
        [FLEX: badges]
          { Gap: "8px" }
          [BADGE: bg1] CONTENT: "默认"
          [BADGE: bg2] ATTR: Variant("secondary") CONTENT: "次要"
          [BADGE: bg3] ATTR: Variant("outline") CONTENT: "轮廓"

      [CARD: input_demo]
        ATTR: Title("Input 输入框"), Icon("TextCursor")
        [FORM: form1]
          [INPUT: inp1] ATTR: Placeholder("请输入用户名")
          [INPUT: inp2] ATTR: Placeholder("请输入密码")

      [CARD: link_demo]
        ATTR: Title("Link 链接"), Icon("Link")
        [LINK: l1] ATTR: Href("#") CONTENT: "普通链接"
        [LINK: l2] ATTR: Href("#") CONTENT: "另一个链接"

      [CARD: grid_demo]
        ATTR: Title("Grid 网格"), Icon("Grid3x3")
        [GRID: g1]
          { Columns: 3, Gap: "8px" }
          [TEXT: g1t1] CONTENT: "1"
          [TEXT: g1t2] CONTENT: "2"
          [TEXT: g1t3] CONTENT: "3"
          [TEXT: g1t4] CONTENT: "4"
          [TEXT: g1t5] CONTENT: "5"
          [TEXT: g1t6] CONTENT: "6"

      [CARD: flex_demo]
        ATTR: Title("Flex 弹性"), Icon("Columns")
        [FLEX: f1]
          { Direction: "Row", Gap: "8px", Justify: "Between" }
          [TEXT: f1t1] CONTENT: "左"
          [TEXT: f1t2] CONTENT: "中"
          [TEXT: f1t3] CONTENT: "右"

      [CARD: alert_demo]
        ATTR: Title("Alert 警告"), Icon("AlertCircle")
        [ALERT: a1]
          [HEADING: at1] CONTENT: "注意"
          [TEXT: ad1] CONTENT: "这是一条警告信息"

      [CARD: table_demo]
        ATTR: Title("Table 表格"), Icon("Table")
        [TABLE: tb1]
          [TEXT: th1] CONTENT: "名称"
          [TEXT: th2] CONTENT: "类型"
          [TEXT: th3] CONTENT: "状态"

      [CARD: list_demo]
        ATTR: Title("List 列表"), Icon("List")
        [LIST: lst1]
          [FLEX: li1]
            { Justify: "Between" }
            [TEXT: li1t] CONTENT: "列表项 1"
            [BADGE: li1b] CONTENT: "标签"
          [FLEX: li2]
            { Justify: "Between" }
            [TEXT: li2t] CONTENT: "列表项 2"
            [BADGE: li2b] CONTENT: "标签"

      [CARD: quote_demo]
        ATTR: Title("Quote 引用"), Icon("Quote")
        [QUOTE: q1] CONTENT: "这是一段引用文本，通常用于展示名言或重要内容。"

      [CARD: image_demo]
        ATTR: Title("Image 图片"), Icon("Image")
        [IMAGE: img1] ATTR: Src("https://via.placeholder.com/200"), Alt("示例图片")

      [CARD: divider_demo]
        ATTR: Title("Divider 分割线"), Icon("Minus")
        [TEXT: div_t1] CONTENT: "上方内容"
        [DIVIDER: div1]
        [TEXT: div_t2] CONTENT: "下方内容"

      [CARD: spacer_demo]
        ATTR: Title("Spacer 间隔"), Icon("Space")
        [TEXT: sp_t1] CONTENT: "上方"
        [SPACER: sp1] ATTR: Size("lg")
        [TEXT: sp_t2] CONTENT: "下方"

      [CARD: code_demo]
        ATTR: Title("Code 代码"), Icon("Code")
        [CODE: code1] CONTENT: "const greeting = 'Hello World';"

      [CARD: container_demo]
        ATTR: Title("Container 容器"), Icon("Box")
        [CONTAINER: cont1]
          [TEXT: cont_t1] CONTENT: "容器内的内容会被限制最大宽度"

      [CARD: tabs_demo]
        ATTR: Title("Tabs 标签页"), Icon("Layers")
        [TABS: tabs1]

      [CARD: modal_demo]
        ATTR: Title("Modal 对话框"), Icon("Square")
        [TEXT: modal_t1] CONTENT: "Modal 组件映射为 Dialog"

    [FOOTER: footer]
      [TEXT: copyright] CONTENT: "© 2024 Stitch UI"
      [TEXT: version] CONTENT: "Compiler v1.0"
