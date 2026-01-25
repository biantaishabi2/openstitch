[FLEX: layout]
  { Direction: "Row", Gap: "0" }

  [SIDEBAR: sidebar]
    [FLEX: logo]
      { Gap: "8px", Align: "Center" }
      [ICON: logo_icon] ATTR: Icon("LayoutDashboard")
      [HEADING: brand] CONTENT: "Stitch Admin"

    [TEXT: menu_label] CONTENT: "主菜单"

    [NAV: main_menu]
      [FLEX: nav_dashboard]
        { Gap: "8px", Align: "Center" }
        [ICON: nav_icon_1] ATTR: Icon("LayoutDashboard")
        [TEXT: nav_text_1] CONTENT: "仪表盘"
      [FLEX: nav_users]
        { Gap: "8px", Align: "Center" }
        [ICON: nav_icon_2] ATTR: Icon("Users")
        [TEXT: nav_text_2] CONTENT: "用户管理"
      [FLEX: nav_products]
        { Gap: "8px", Align: "Center" }
        [ICON: nav_icon_3] ATTR: Icon("Package")
        [TEXT: nav_text_3] CONTENT: "产品管理"
      [FLEX: nav_orders]
        { Gap: "8px", Align: "Center" }
        [ICON: nav_icon_4] ATTR: Icon("ShoppingCart")
        [TEXT: nav_text_4] CONTENT: "订单管理"

    [TEXT: system_label] CONTENT: "系统"

    [NAV: system_menu]
      [FLEX: nav_settings]
        { Gap: "8px", Align: "Center" }
        [ICON: nav_icon_5] ATTR: Icon("Settings")
        [TEXT: nav_text_5] CONTENT: "系统设置"
      [FLEX: nav_help]
        { Gap: "8px", Align: "Center" }
        [ICON: nav_icon_6] ATTR: Icon("HelpCircle")
        [TEXT: nav_text_6] CONTENT: "帮助中心"

  [SECTION: main_content]
    [HEADER: topbar]
      [FLEX: header_left]
        { Gap: "8px", Align: "Center" }
        [HEADING: page_title] CONTENT: "仪表盘"
        [BADGE: realtime] ATTR: Variant("Secondary") CONTENT: "实时"
      [FLEX: header_right]
        { Gap: "16px", Align: "Center" }
        [INPUT: search] ATTR: Placeholder("搜索...")
        [BUTTON: notifications] ATTR: Variant("Ghost"), Icon("Bell")

    [GRID: stats]
      { Columns: "4", Gap: "24px" }
      [CARD: stat_users]
        ATTR: Title("总用户"), Icon("Users")
        CONTENT: "24,521"
        [FLEX: trend_1]
          { Gap: "4px", Align: "Center" }
          [ICON: trend_icon_1] ATTR: Icon("TrendingUp")
          [TEXT: trend_text_1] CONTENT: "+12.5%"
      [CARD: stat_revenue]
        ATTR: Title("总收入"), Icon("DollarSign")
        CONTENT: "¥892,450"
        [FLEX: trend_2]
          { Gap: "4px", Align: "Center" }
          [ICON: trend_icon_2] ATTR: Icon("TrendingUp")
          [TEXT: trend_text_2] CONTENT: "+8.2%"
      [CARD: stat_orders]
        ATTR: Title("订单数"), Icon("ShoppingCart")
        CONTENT: "3,842"
        [FLEX: trend_3]
          { Gap: "4px", Align: "Center" }
          [ICON: trend_icon_3] ATTR: Icon("TrendingDown")
          [TEXT: trend_text_3] CONTENT: "-2.4%"
      [CARD: stat_conversion]
        ATTR: Title("转化率"), Icon("Target")
        CONTENT: "3.24%"
        [FLEX: trend_4]
          { Gap: "4px", Align: "Center" }
          [ICON: trend_icon_4] ATTR: Icon("TrendingUp")
          [TEXT: trend_text_4] CONTENT: "+0.8%"

    [GRID: content_area]
      { Columns: "2", Gap: "24px" }
      [CARD: recent_orders]
        ATTR: Title("最近订单")
        [TABLE: orders_table]
          [TEXT: th1] CONTENT: "订单号"
          [TEXT: th2] CONTENT: "客户"
          [TEXT: th3] CONTENT: "产品"
          [TEXT: th4] CONTENT: "状态"
      [CARD: hot_products]
        ATTR: Title("热销产品")
        [LIST: products_list]
          [FLEX: product_1]
            { Justify: "Between", Align: "Center" }
            [TEXT: p1_name] CONTENT: "iPhone 15 Pro"
            [TEXT: p1_price] CONTENT: "¥8,999"
          [FLEX: product_2]
            { Justify: "Between", Align: "Center" }
            [TEXT: p2_name] CONTENT: "MacBook Pro"
            [TEXT: p2_price] CONTENT: "¥14,999"
          [FLEX: product_3]
            { Justify: "Between", Align: "Center" }
            [TEXT: p3_name] CONTENT: "AirPods Pro"
            [TEXT: p3_price] CONTENT: "¥1,899"
