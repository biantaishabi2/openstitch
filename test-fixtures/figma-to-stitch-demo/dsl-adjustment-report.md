# DSL 调整报告

## 状态: 需要调整

## 发现的问题

1. **layout**: 功能卡片区域
   - 问题: 卡片没有使用 grid 布局，而是垂直排列
   - 建议: 添加 grid grid-cols-3 gap-4

2. **naming**: 组件命名
   - 问题: 使用 Rectangle_1, Group_1 等无意义命名
   - 建议: 改为 banner, user_card 等语义化命名

3. **color**: 颜色使用
   - 问题: 使用硬编码颜色如 bg-[#ffffff]
   - 建议: 改为 Tailwind 语义化类如 bg-white

## 调整后的 DSL

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
    [SECTION: ...
```