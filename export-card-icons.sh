#!/bin/bash
# 导出功能卡片图标

FIGMA_TOKEN="${FIGMA_TOKEN:-}"  # 从环境变量读取，不要硬编码"
FILE_KEY="GgNqIztxMCacqG0u4TnRtm"
OUTPUT_DIR="./test-fixtures/figma-to-stitch-demo/icons"

# 功能卡片图标节点 IDs
ICON_IDS=(
  "13:114"    # 福利平台
  "14:44"     # 员工帮扶 (困难帮扶)
  "15:46"     # 组织机构
  "15:61"     # 职代会
  "15:87"     # 职工之家
  "15:99"     # 个人中心
  "15:84"     # 胸科闲余
)

# 图标名称
ICON_NAMES=(
  "welfare"
  "help"
  "organization"
  "congress"
  "home"
  "profile"
  "leisure"
)

mkdir -p "$OUTPUT_DIR"

# 导出 SVG
echo "Exporting icons from Figma..."
IDS=$(IFS=,; echo "${ICON_IDS[*]}")

RESPONSE=$(curl -s -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/images/$FILE_KEY?ids=$IDS&format=svg&scale=1")

echo "Response: $RESPONSE"

# 下载每个图标
for i in "${!ICON_IDS[@]}"; do
  ID="${ICON_IDS[$i]}"
  NAME="${ICON_NAMES[$i]}"
  URL=$(echo "$RESPONSE" | grep -o '"'$ID'":"[^"]*"' | cut -d'"' -f4)
  
  if [ -n "$URL" ] && [ "$URL" != "null" ]; then
    echo "Downloading $NAME..."
    curl -s "$URL" -o "$OUTPUT_DIR/$NAME.svg"
  else
    echo "Failed to get URL for $NAME"
  fi
done

echo "Done! Icons saved to $OUTPUT_DIR"
ls -la "$OUTPUT_DIR"
