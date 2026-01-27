/**
 * SlottedTable - Table 组件的插槽包装器
 *
 * 将 slots.header / slots.body 正确分发到
 * TableHeader / TableBody 子组件
 */

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface SlottedTableProps extends React.HTMLAttributes<HTMLTableElement> {
  /** 插槽内容 */
  slots?: {
    header?: React.ReactNode;
    body?: React.ReactNode;
  };
  /** 列定义 (便捷属性) */
  columns?: Array<{ key: string; header: string }>;
  /** 数据 (便捷属性) */
  data?: Array<Record<string, unknown>>;
}

export const SlottedTable: React.FC<SlottedTableProps> = ({
  slots,
  columns,
  data,
  children,
  ...props
}) => {
  // 从 slots.header 渲染表头
  const renderHeader = () => {
    if (slots?.header) {
      // slots.header 是未包装的子节点数组，需要转换为 TableRow + TableHead 结构
      const headerItems = React.Children.toArray(slots.header);
      return (
        <TableHeader>
          <TableRow>
            {headerItems.map((item, index) => (
              <TableHead key={index}>{item}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
      );
    }

    // 如果有 columns prop，使用它生成表头
    if (columns && columns.length > 0) {
      return (
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
      );
    }

    return null;
  };

  // 从 slots.body 或 data 渲染表体
  const renderBody = () => {
    if (slots?.body) {
      const bodyItems = React.Children.toArray(slots.body);
      return <TableBody>{bodyItems}</TableBody>;
    }

    // 如果有 data prop，使用它生成表体
    if (data && data.length > 0 && columns) {
      return (
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((col) => (
                <TableCell key={col.key}>{String(row[col.key] ?? '')}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      );
    }

    // 如果有 children，作为表体渲染
    if (children) {
      const bodyItems = React.Children.toArray(children);
      return <TableBody>{bodyItems}</TableBody>;
    }

    return <TableBody />;
  };

  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <Table {...props}>
        {renderHeader()}
        {renderBody()}
      </Table>
    </div>
  );
};

export default SlottedTable;
