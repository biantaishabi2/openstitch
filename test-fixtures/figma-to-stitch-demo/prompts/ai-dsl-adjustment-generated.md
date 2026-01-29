# AI DSL 调整提示词

> 用于 Workflow 步骤 3: AI 检查/调整 DSL

## 参考图片

请对比以下两张图片来检查 DSL 是否需要调整：
- Figma 设计原图：`test-fixtures/figma-to-stitch-demo/reference/figma-design.png`
- 当前生成的 HTML 截图：`test-fixtures/figma-to-stitch-demo/generated/screenshot.png`

## 当前 DSL

```dsl
[SECTION: Rectangle_1]
  { ClassName: "w-[375px] h-[180px]" }
[IMAGE: 轮播图]
  { ClassName: "w-[343px] h-[148px]" }
  ATTR: Src("c1e19157272456c4b6833b0b962df2b24578fb86"), Alt("轮播图")
  [SECTION: Rectangle_2]
    { ClassName: "w-[343px] h-[148px] bg-[#d9d9d9] rounded-[16px]" }
  [SECTION: 19771756969732_pic_hd_1]
    { ClassName: "w-[345px] h-[236px]" }
  [SECTION: 轮播点]
    { ClassName: "w-[40px] h-[8px]" }
    [SECTION: Ellipse_1]
      { ClassName: "w-[8px] h-[8px] bg-[#ffffff]" }
    [SECTION: Ellipse_2]
      { ClassName: "w-[8px] h-[8px] bg-[#ffffff]" }
    [SECTION: Ellipse_3]
      { ClassName: "w-[8px] h-[8px] bg-[#ffffff]" }
[SECTION: Ellipse_4]
  { ClassName: "w-[40px] h-[40px] bg-[#ffffff]" }
[TEXT: xkyy0325]
  { ClassName: "w-[73px] h-[16px] bg-[#ffffff] text-[16px] text-[#ffffff]" }
  CONTENT: "xkyy0325"
[SECTION: Group_1]
  { ClassName: "w-[83px] h-[14px]" }
  CONTENT: "活跃度：20"
  [TEXT: 活跃度_20]
    { ClassName: "w-[69px] h-[12px] bg-[#ffffff] text-[12px] text-[#ffffff]" }
    CONTENT: "活跃度：20"
  [ICON: 活跃_1]
    { ClassName: "w-[14px] h-[14px]" }
    [SECTION: Vector]
      { ClassName: "w-[8.621672630310059px] h-[10.500092506408691px] bg-[#ffffff]" }
[SECTION: 今日步数]
  { ClassName: "w-[67px] h-[24px]" }
  CONTENT: "3098"
  [TEXT: 3098]
    { ClassName: "w-[55px] h-[24px] bg-[#ffffff] text-[24px] text-[#ffffff]" }
    CONTENT: "3098"
  [TEXT: 步]
    { ClassName: "w-[12px] h-[12px] bg-[#ffffff] text-[12px] text-[#ffffff]" }
    CONTENT: "步"
[CARD: 1]
  { ClassName: "w-[104px] h-[94px]" }
  CONTENT: "福利平台"
  [TEXT: 福利平台]
    { ClassName: "w-[57px] h-[14px] bg-[#000000] text-[14px] text-[#000000]" }
    CONTENT: "福利平台"
  [SECTION: Rectangle_5]
    { ClassName: "w-[25px] h-[10px] bg-[#0098ff]" }
  [ICON: icon_弹性福利平台_1]
    { ClassName: "w-[40px] h-[40px]" }
    [SECTION: Vector]
      { ClassName: "w-[16.600013732910156px] h-[30.430749893188477px] bg-[#0098ff]" }
    [SECTION: Vector]
      { ClassName: "w-[17.24444580078125px] h-[30.9677791595459px] bg-[#0098ff]" }
    [SECTION: Vector]
      { ClassName: "w-[16.666675567626953px] h-[30.438718795776367px] bg-[#0098ff]" }
    [SECTION: Vector]
      { ClassName: "w-[17.22222137451172px] h-[31.083703994750977px] bg-[#0098ff]" }
[CARD: 2]
  { ClassName: "w-[104px] h-[94px]" }
  CONTENT: "会员登记"
  [TEXT: 会员登记]
    { ClassName: "w-[57px] h-[14px] bg-[#000000] text-[14px] text-[#000000]" }
    CONTENT: "会员登记"
  [ICON: 用户注册_1]
    { ClassName: "w-[40px] h-[40px]" }
    [SECTION: Vector]
      { ClassName: "w-[35px] h-[32px] bg-[#0098ff]" }
    [SECTION: Vector]
      { ClassName: "w-[15px] h-[15px] bg-[#0098ff]" }
    [SECTION: Vector]
      { ClassName: "w-[9px] h-[15px] bg-[#0098ff]" }
[CARD: 3]
  { ClassName: "w-[104px] h-[94px]" }
  CONTENT: "工会动态"
  [TEXT: 工会动态]
    { ClassName: "w-[57px] h-[14px] bg-[#000000] text-[14px] text-[#000000]" }
    CONTENT: "工会动态"
  [SECTION: Rectangle_6]
    { ClassName: "w-[21px] h-[29px] bg-[#0098ff]" }
  [ICON: 新闻动态_1]
    { ClassName: "w-[40px] h-[40px]" }
    [SECTION: Vector]
      { ClassName: "w-[33.18333053588867px] h-[33.13333511352539px] bg-[#0098ff]" }
    [SECTION: Vector]
      { ClassName: "w-[14.383333206176758px] h-[18.241666793823242px] bg-[#0098ff]" }
[CARD: 4]
  { ClassName: "w-[104px] h-[94px]" }
  CONTENT: "困难帮扶"
  [TEXT: 困难帮扶]
    { ClassName: "w-[57px] h-[14px] bg-[#000000] text-[14px] text-[#000000]" }
    CONTENT: "困难帮扶"
  [SECTION: Vector]
    { ClassName: "w-[16px] h-[14px] bg-[#0098ff]" }
  [ICON: 员工帮扶_1]
    { ClassName: "w-[40px] h-[40px]" }
    [SECTION: Vector]
      { ClassName: "w-[32px] h-[14px] bg-[#0098ff]" }
    [SECTION: Vector]
      { ClassName: "w-[23px] h-[20px] bg-[#0098ff]" }
[CARD: 5]
  { ClassName: "w-[104px] h-[94px]" }
  CONTENT: "组织机构"
  [TEXT: 组织机构]
    { ClassName: "w-[57px] h-[14px] bg-[#000000] text-[14px] text-[#000000]" }
    CONTENT: "组织机构"
  [SECTION: Union]
    { ClassName: "w-[30px] h-[6.689453125px] bg-[#0098ff]" }
    [SECTION: Rectangle_7]
      { ClassName: "w-[7px] h-[6.688889503479004px] bg-[#0098ff]" }
    [SECTION: Rectangle_8]
      { ClassName: "w-[7px] h-[6.688889503479004px] bg-[#0098ff]" }
    [SECTION: Rectangle_9]
      { ClassName: "w-[7px] h-[6.688889503479004px] bg-[#0098ff]" }
  [ICON: 组织机构_1_1]
    { ClassName: "w-[40px] h-[40px]" }
    [SECTION: Vector]
      { ClassName: "w-[32.38500213623047px] h-[30.409997940063477px] bg-[#0098ff]" }
    [SECTION: Vector]
      { ClassName: "w-[25.275005340576172px] h-[12.395000457763672px] bg-[#0098ff]" }
[CARD: 6]
  { ClassName: "w-[104px] h-[94px]" }
  CONTENT: "职代会"
  [TEXT: 职代会]
    { ClassName: "w-[57px] h-[14px] bg-[#000000] text-[14px] text-[#000000]" }
    CONTENT: "职代会"
  [SECTION: Rectangle_10]
    { ClassName: "w-[32px] h-[4.777777671813965px] bg-[#0098ff]" }
  [ICON: 职代会_1]
    { ClassName: "w-[40px] h-[40px]" }
    [SECTION: Vector]
      { ClassName: "w-[36.019901275634766px] h-[32.45900344848633px]" }
[CARD: 7]
  { ClassName: "w-[104px] h-[94px]" }
  CONTENT: "职工之家"
  [TEXT: 职工之家]
    { ClassName: "w-[57px] h-[14px] bg-[#000000] text-[14px] text-[#000000]" }
    CONTENT: "职工之家"
  [SECTION: Ellipse_5]
    { ClassName: "w-[20px] h-[19.11111068725586px] bg-[#0098ff]" }
  [ICON: 机关职工之家_1]
    { ClassName: "w-[40px] h-[40px]" }
    [SECTION: Vector]
      { ClassName: "w-[33.33373260498047px] h-[33.33351516723633px] bg-[#0098ff]" }
    [SECTION: Vector]
      { ClassName: "w-[9.059000968933105px] h-[9.059000015258789px] bg-[#0098ff]" }
    [SECTION: Vector]
      { ClassName: "w-[14.549333572387695px] h-[8.274667739868164px] bg-[#0098ff]" }
[CARD: 8]
  { ClassName: "w-[104px] h-[94px]" }
  CONTENT: "个人中心"
  [TEXT: 个人中心]
    { ClassName: "w-[57px] h-[14px] bg-[#000000] text-[14px] text-[#000000]" }
    CONTENT: "个人中心"
  [SECTION: Ellipse_6]
    { ClassName: "w-[13px] h-[13px] bg-[#0098ff]" }
  [ICON: 个人中心_1_1]
    { ClassName: "w-[40px] h-[40px]" }
    [SECTION: Vector]
      { ClassName: "w-[21.25px] h-[21.25px] bg-[#0098ff]" }
    [SECTION: Vector]
      { ClassName: "w-[28.495718002319336px] h-[10px] bg-[#0098ff]" }
    [SECTION: Vector]
      { ClassName: "w-[11.120718002319336px] h-[5.004908084869385px] bg-[#0098ff]" }
[CARD: 9]
  { ClassName: "w-[104px] h-[94px]" }
  CONTENT: "胸科闲余"
  [TEXT: 胸科闲余]
    { ClassName: "w-[57px] h-[14px] bg-[#000000] text-[14px] text-[#000000]" }
    CONTENT: "胸科闲余"
  [ICON: 职代会_1]
    { ClassName: "w-[40px] h-[40px]" }
    [SECTION: Vector]
      { ClassName: "w-[30px] h-[16px] bg-[#0098ff]" }
    [SECTION: Ellipse_7]
      { ClassName: "w-[20px] h-[20px] bg-[#0098ff]" }
    [SECTION: Vector]
      { ClassName: "w-[14.51171875px] h-[14.92231273651123px] bg-[#0098ff]" }
[SECTION: 新闻专区]
  { ClassName: "w-[375px] h-[235px]" }
  CONTENT: "新闻专区"
  [TEXT: 新闻专区]
    { ClassName: "w-[66px] h-[16px] bg-[#000000] text-[16px] text-[#000000]" }
    CONTENT: "新闻专区"
  [CARD: Group_2]
    { ClassName: "w-[166px] h-[82px]" }
    CONTENT: "新闻政策"
    [SECTION: Rectangle_13]
      { ClassName: "w-[166px] h-[82px] bg-[#0077ff] rounded-[8px]" }
    [SECTION: Group_6]
      { ClassName: "w-[166px] h-[82px]" }
      [SECTION: Rectangle_14]
        { ClassName: "w-[166px] h-[82px] bg-[#0077ff] rounded-[8px]" }
      [SECTION: Ellipse_8]
        { ClassName: "w-[107px] h-[107px] bg-[#0098ff]" }
    [TEXT: 新闻政策]
      { ClassName: "w-[57px] h-[14px] bg-[#000000] text-[14px] text-[#000000]" }
      CONTENT: "新闻政策"
    [TEXT: 关注时事热点]
      { ClassName: "w-[75px] h-[12px] bg-[#999999] text-[12px] text-[#666666]" }
      CONTENT: "关注时事热点"
    [TEXT: 去看看]
      { ClassName: "w-[75px] h-[12px] bg-[#0098ff] text-[12px] text-[#0098ff]" }
      CONTENT: "去看看 >"
    [ICON: 新闻政策_nor_1]
      { ClassName: "w-[56px] h-[56px]" }
      [SECTION: Vector]
        { ClassName: "w-[45.0078125px] h-[45.0078125px]" }
  [CARD: Group_3]
    { ClassName: "w-[166px] h-[82px]" }
    CONTENT: "劳模风采"
    [SECTION: Rectangle_13]
      { ClassName: "w-[166px] h-[82px] bg-[#ff9d00] rounded-[8px]" }
    [SECTION: Group_6]
      { ClassName: "w-[166px] h-[82px] rounded-[8px]" }
      [SECTION: Rectangle_14]
        { ClassName: "w-[166px] h-[82px] bg-[#0077ff] rounded-[8px]" }
      [SECTION: Ellipse_8]
        { ClassName: "w-[107px] h-[107px] bg-[#ff9d00]" }
    [TEXT: 劳模风采]
      { ClassName: "w-[57px] h-[14px] bg-[#000000] text-[14px] text-[#000000]" }
      CONTENT: "劳模风采"
    [TEXT: 彰显榜样力量]
      { ClassName: "w-[75px] h-[12px] bg-[#999999] text-[12px] text-[#666666]" }
      CONTENT: "彰显榜样力量"
    [TEXT: 去看看]
      { ClassName: "w-[75px] h-[12px] bg-[#ff9d00] text-[12px] text-[#ff9d00]" }
      CONTENT: "去看看 >"
    [ICON: 男医生_面_1]
      { ClassName: "w-[56px] h-[56px]" }
      [SECTION: Vector]
        { ClassName: "w-[41.73451614379883px] h-[53.95984649658203px]" }
  [SECTION: Group_4]
    { ClassName: "w-[166px] h-[82px]" }
    CONTENT: "政策文件"
    [SECTION: Rectangle_13]
      { ClassName: "w-[166px] h-[82px] bg-[#ff7476] rounded-[8px]" }
    [ICON: Group_6]
      { ClassName: "w-[166px] h-[82px]" }
      [SECTION: Rectangle_14]
        { ClassName: "w-[166px] h-[82px] bg-[#0077ff] rounded-[8px]" }
      [SECTION: Ellipse_8]
        { ClassName: "w-[107px] h-[107px] bg-[#ff7476]" }
      [ICON: 政策文件2_1]
        { ClassName: "w-[44px] h-[44px]" }
        [SECTION: Vector]
          { ClassName: "w-[43.64380645751953px] h-[40.755001068115234px]" }
    [TEXT: 政策文件]
      { ClassName: "w-[57px] h-[14px] bg-[#000000] text-[14px] text-[#000000]" }
      CONTENT: "政策文件"
    [TEXT: 传递发展方向]
      { ClassName: "w-[75px] h-[12px] bg-[#999999] text-[12px] text-[#666666]" }
      CONTENT: "传递发展方向"
    [TEXT: 去看看]
      { ClassName: "w-[75px] h-[12px] bg-[#ff7476] text-[12px] text-[#ff7476]" }
      CONTENT: "去看看 >"
  [SECTION: Group_5]
    { ClassName: "w-[166px] h-[82px]" }
    CONTENT: "退休感言"
    [SECTION: Rectangle_13]
      { ClassName: "w-[166px] h-[82px] bg-[#51ff00] rounded-[8px]" }
    [SECTION: Group_6]
      { ClassName: "w-[166px] h-[82px]" }
      [SECTION: Rectangle_14]
        { ClassName: "w-[166px] h-[82px] bg-[#0077ff] rounded-[8px]" }
      [SECTION: Ellipse_8]
        { ClassName: "w-[107px] h-[107px] bg-[#51ff00]" }
      [ICON: 046_对话_1]
        { ClassName: "w-[58px] h-[58px]" }
        [SECTION: Vector]
          { ClassName: "w-[31.745933532714844px] h-[23.329238891601562px] bg-[#c4fbe0]" }
        [ICON: Subtract]
          { ClassName: "w-[38.4013671875px] h-[28.220369338989258px]" }
          [SECTION: Vector]
            { ClassName: "w-[38.401206970214844px] h-[28.21999740600586px] bg-[#000000]" }
          [SECTION: Vector]
            { ClassName: "w-[5.833984375px] h-[5.833984375px] bg-[#ffffff]" }
          [SECTION: Vector]
            { ClassName: "w-[5.833984375px] h-[5.833984375px] bg-[#ffffff]" }
          [SECTION: Vector]
            { ClassName: "w-[5.833984375px] h-[5.833984375px] bg-[#ffffff]" }
    [TEXT: 退休感言]
      { ClassName: "w-[57px] h-[14px] bg-[#000000] text-[14px] text-[#000000]" }
      CONTENT: "退休感言"
    [TEXT: 分享退休心语]
      { ClassName: "w-[75px] h-[12px] bg-[#999999] text-[12px] text-[#666666]" }
      CONTENT: "分享退休心语"
    [TEXT: 去看看]
      { ClassName: "w-[75px] h-[12px] bg-[#65c47a] text-[12px] text-[#65c47a]" }
      CONTENT: "去看看 >"
[SECTION: 活动专区]
  { ClassName: "w-[375px] h-[142px]" }
  CONTENT: "活动专区"
  [TEXT: 活动专区]
    { ClassName: "w-[66px] h-[16px] bg-[#000000] text-[16px] text-[#000000]" }
    CONTENT: "活动专区"
  [IMAGE: Group_2]
    { ClassName: "w-[166px] h-[82px]" }
    CONTENT: "线上活动"
    ATTR: Src("c5ce8c2e58ef876c2624328c35d8c3c06f4cee96"), Alt("Group_2")
    [SECTION: Rectangle_13]
      { ClassName: "w-[166px] h-[82px] rounded-[8px]" }
    [TEXT: 线上活动]
      { ClassName: "w-[74px] h-[14px] bg-[#ffffff] text-[16px] text-[#ffffff]" }
      CONTENT: "线上活动"
    [TEXT: 丰富业余生活]
      { ClassName: "w-[75px] h-[12px] bg-[#ffffff] text-[12px] text-[#ffffff]" }
      CONTENT: "丰富业余生活"
    [SECTION: Rectangle_17]
      { ClassName: "w-[48px] h-[48px] bg-[#00b5ff] rounded-[40px]" }
    [SECTION: 花瓣素材_常规图标系列3D科技风磨砂质感蓝色渐变喇叭元素_1]
      { ClassName: "w-[48px] h-[48px]" }
  [IMAGE: Group_3]
    { ClassName: "w-[166px] h-[86px]" }
    CONTENT: "兴趣小组"
    ATTR: Src("ed450d8a9a3ff321e24a8fbdbf2fbe4887fde32e"), Alt("Group_3")
    [SECTION: Rectangle_13]
      { ClassName: "w-[166px] h-[82px] rounded-[8px]" }
    [TEXT: 兴趣小组]
      { ClassName: "w-[71px] h-[14px] bg-[#ffffff] text-[16px] text-[#ffffff]" }
      CONTENT: "兴趣小组"
    [TEXT: 寻找志同道合]
      { ClassName: "w-[75px] h-[12px] bg-[#ffffff] text-[12px] text-[#ffffff]" }
      CONTENT: "寻找志同道合"
    [SECTION: Rectangle_17]
      { ClassName: "w-[48px] h-[48px] bg-[#01dad5] rounded-[35px]" }
    [SECTION: 1efd7c5bf0cc622a434d025b4787ba]
      { ClassName: "w-[80px] h-[80px]" }
[SECTION: 资讯]
  { ClassName: "w-[343px] h-[248px]" }
  CONTENT: "新闻资讯"
  [TEXT: 新闻资讯]
    { ClassName: "w-[66px] h-[16px] bg-[#000000] text-[16px] text-[#000000]" }
    CONTENT: "新闻资讯"
  [TEXT: 更多]
    { ClassName: "w-[66px] h-[16px] bg-[#bfbfbf] text-[14px] text-[#bfbfbf]" }
    CONTENT: "更多 >"
  [IMAGE: Group_2]
    { ClassName: "w-[343px] h-[106px]" }
    CONTENT: "弘扬延安精神，践行初心使命..."
    ATTR: Src("6560f139e4f1b77c32f0553da569f31882c52c82"), Alt("Group_2")
    [SECTION: Rectangle_13]
      { ClassName: "w-[343px] h-[106px] bg-[#000000] rounded-[8px]" }
    [SECTION: Rectangle_18]
      { ClassName: "w-[106px] h-[106px]" }
    [TEXT: 弘扬延安精神_践行初心使命]
      { ClassName: "w-[205px] h-[14px] bg-[#000000] text-[14px] text-[#000000]" }
      CONTENT: "弘扬延安精神，践行初心使命..."
    [TEXT: 为传承红色基因_持续加强党员的理想信念教育和党性修养锤炼_9]
      { ClassName: "w-[205px] h-[32px] bg-[#666666] text-[12px] text-[#666666]" }
      CONTENT: "为传承红色基因，持续加强党员的理想信念教育和党性修养锤炼，9月5..."
    [TEXT: 2025_09_16_16_22]
      { ClassName: "w-[100px] h-[12px] bg-[#bfbfbf] text-[12px] text-[#bfbfbf]" }
      CONTENT: "2025-09-16 16:22"
    [TEXT: 详情]
      { ClassName: "w-[32px] h-[12px] bg-[#0098ff] text-[12px] text-[#0098ff]" }
      CONTENT: "详情>"
  [IMAGE: Group_3]
    { ClassName: "w-[343px] h-[106px]" }
    CONTENT: "北京胸科医院“一扫双筛”公益..."
    ATTR: Src("3a4225753b377d2aee377b89cea5a20b0fe5ef79"), Alt("Group_3")
    [SECTION: Rectangle_13]
      { ClassName: "w-[343px] h-[106px] bg-[#000000] rounded-[8px]" }
    [SECTION: Rectangle_18]
      { ClassName: "w-[106px] h-[106px]" }
    [TEXT: 北京胸科医院_一扫双筛_公益]
      { ClassName: "w-[205px] h-[14px] bg-[#000000] text-[14px] text-[#000000]" }
      CONTENT: "北京胸科医院“一扫双筛”公益..."
    [TEXT: 2025年9月10日至14日_中国国际服务贸易交易会_以下简]
      { ClassName: "w-[205px] h-[32px] bg-[#666666] text-[12px] text-[#666666]" }
      CONTENT: "2025年9月10日至14日，中国国际服务贸易交易会（以下简称“服贸会“..."
    [TEXT: 2025_09_16_16_22]
      { ClassName: "w-[100px] h-[12px] bg-[#bfbfbf] text-[12px] text-[#bfbfbf]" }
      CONTENT: "2025-09-16 16:22"
    [TEXT: 详情]
      { ClassName: "w-[32px] h-[12px] bg-[#0098ff] text-[12px] text-[#0098ff]" }
      CONTENT: "详情>"
```

## 任务

请对比 Figma 设计图和生成的截图，检查以下方面：

### 1. 布局结构
- [ ] 整体布局是否一致（网格、行列数）
- [ ] 元素间距是否正确
- [ ] 对齐方式是否匹配

### 2. 视觉样式
- [ ] 背景色是否一致
- [ ] 卡片圆角是否匹配
- [ ] 阴影效果是否一致
- [ ] 边框是否正确

### 3. 内容元素
- [ ] 图标是否正确显示
- [ ] 文字内容是否完整
- [ ] 文字颜色/大小是否匹配

### 4. 尺寸精度
- [ ] 整体尺寸是否接近
- [ ] 元素比例是否正确

## 输出格式

如果发现差异，请输出调整后的 DSL：

```json
{
  "hasIssues": true,
  "issues": [
    {
      "type": "layout",
      "element": "功能卡片网格",
      "problem": "缺少 grid 布局，卡片没有正确排列",
      "solution": "添加 grid grid-cols-3 gap-4"
    },
    {
      "type": "color", 
      "element": "卡片背景",
      "problem": "使用硬编码颜色 #ffffff",
      "solution": "改为 bg-white 或使用 token"
    }
  ],
  "adjustedDSL": "[SECTION: ...]"
}
```

如果没有问题：

```json
{
  "hasIssues": false,
  "issues": [],
  "adjustedDSL": "{{CURRENT_DSL}}"
}
```

## DSL 调整规则

### 布局类优先使用 Tailwind
- 网格: `grid grid-cols-3 gap-4`
- Flex: `flex flex-col items-center`
- 间距: `p-4`, `m-2`, `gap-4`
- 尺寸: `w-full`, `h-10`

### 颜色使用语义化
- 白色背景: `bg-white` 而不是 `bg-[#ffffff]`
- 主色: `text-primary` 或 `text-blue-500`
- 灰色: `text-gray-500` 而不是 `text-[#666666]`

### 命名语义化
- `Rectangle_1` → `banner`
- `Group_1` → `user_card`
- `1` → `welfare_card`
