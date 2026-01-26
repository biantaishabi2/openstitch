/**
 * 插槽分发器测试
 *
 * 测试 Grid、Columns、Split 等布局组件的 slots 分发逻辑
 */

import { describe, it, expect } from 'vitest';
import { distributeToSlots, getSlotRule } from '../slot-distributor';
import type { ASTNode } from '../../logic/ast';

describe('Slot Distributor - Layout Components', () => {
  // 辅助函数：创建测试用的 ASTNode
  const createCard = (id: string): ASTNode => ({
    type: 'Card',
    id,
    props: {},
    children: [],
  });

  describe('Grid 网格布局', () => {
    it('应该有 Grid 的插槽规则', () => {
      const rule = getSlotRule('Grid');
      expect(rule).toBeDefined();
      expect(rule?.slots).toEqual([]);
      expect(rule?.render).toEqual({});
    });

    it('应该将子节点分发到数字插槽 (1, 2, 3, 4)', () => {
      const children: ASTNode[] = [
        createCard('grid1'),
        createCard('grid2'),
        createCard('grid3'),
        createCard('grid4'),
      ];

      const result = distributeToSlots('Grid', children);

      expect(result).toBeDefined();
      expect(result!['1']).toHaveLength(1);
      expect(result!['1'][0].id).toBe('grid1');
      expect(result!['2']).toHaveLength(1);
      expect(result!['2'][0].id).toBe('grid2');
      expect(result!['3']).toHaveLength(1);
      expect(result!['3'][0].id).toBe('grid3');
      expect(result!['4']).toHaveLength(1);
      expect(result!['4'][0].id).toBe('grid4');
    });

    it('应该支持任意数量的子节点', () => {
      const children: ASTNode[] = [
        createCard('item1'),
        createCard('item2'),
        createCard('item3'),
        createCard('item4'),
        createCard('item5'),
        createCard('item6'),
      ];

      const result = distributeToSlots('Grid', children);

      expect(result).toBeDefined();
      expect(Object.keys(result!)).toHaveLength(6);
      expect(result!['1'][0].id).toBe('item1');
      expect(result!['6'][0].id).toBe('item6');
    });
  });

  describe('Columns 多栏布局', () => {
    it('应该有 Columns 的插槽规则', () => {
      const rule = getSlotRule('Columns');
      expect(rule).toBeDefined();
      expect(rule?.slots).toEqual([]);
      expect(rule?.render).toEqual({});
    });

    it('应该将子节点分发到数字插槽 (1, 2, 3)', () => {
      const children: ASTNode[] = [
        createCard('col1'),
        createCard('col2'),
        createCard('col3'),
      ];

      const result = distributeToSlots('Columns', children);

      expect(result).toBeDefined();
      expect(result!['1']).toHaveLength(1);
      expect(result!['1'][0].id).toBe('col1');
      expect(result!['2']).toHaveLength(1);
      expect(result!['2'][0].id).toBe('col2');
      expect(result!['3']).toHaveLength(1);
      expect(result!['3'][0].id).toBe('col3');
    });
  });

  describe('Split 分割布局', () => {
    it('应该有 Split 的插槽规则', () => {
      const rule = getSlotRule('Split');
      expect(rule).toBeDefined();
      expect(rule?.slots).toEqual(['left', 'right', 'top', 'bottom']);
      expect(rule?.render).toEqual({
        left: null,
        right: null,
        top: null,
        bottom: null,
      });
    });

    it('应该将子节点分发到 left/right 插槽（水平分割）', () => {
      const children: ASTNode[] = [
        createCard('left_card'),
        createCard('right_card'),
      ];

      const result = distributeToSlots('Split', children, { vertical: false });

      expect(result).toBeDefined();
      expect(result!.left).toHaveLength(1);
      expect(result!.left[0].id).toBe('left_card');
      expect(result!.right).toHaveLength(1);
      expect(result!.right[0].id).toBe('right_card');
      expect(result!.top).toHaveLength(0);
      expect(result!.bottom).toHaveLength(0);
    });

    it('应该将子节点分发到 top/bottom 插槽（垂直分割）', () => {
      const children: ASTNode[] = [
        createCard('top_card'),
        createCard('bottom_card'),
      ];

      const result = distributeToSlots('Split', children, { vertical: true });

      expect(result).toBeDefined();
      expect(result!.top).toHaveLength(1);
      expect(result!.top[0].id).toBe('top_card');
      expect(result!.bottom).toHaveLength(1);
      expect(result!.bottom[0].id).toBe('bottom_card');
      expect(result!.left).toHaveLength(0);
      expect(result!.right).toHaveLength(0);
    });

    it('应该默认使用 left/right 插槽（无 vertical prop）', () => {
      const children: ASTNode[] = [
        createCard('first'),
        createCard('second'),
      ];

      const result = distributeToSlots('Split', children);

      expect(result).toBeDefined();
      expect(result!.left).toHaveLength(1);
      expect(result!.right).toHaveLength(1);
    });

    it('应该支持 vertical 字符串值 "true"', () => {
      const children: ASTNode[] = [
        createCard('top'),
        createCard('bottom'),
      ];

      const result = distributeToSlots('Split', children, { vertical: 'true' });

      expect(result).toBeDefined();
      expect(result!.top).toHaveLength(1);
      expect(result!.bottom).toHaveLength(1);
    });
  });

  describe('Rows 行布局', () => {
    it('应该有 Rows 的插槽规则', () => {
      const rule = getSlotRule('Rows');
      expect(rule).toBeDefined();
      expect(rule?.slots).toEqual([]);
      expect(rule?.render).toEqual({});
    });

    it('应该将子节点分发到数字插槽 (1, 2, 3)', () => {
      const children: ASTNode[] = [
        createCard('row1'),
        createCard('row2'),
        createCard('row3'),
      ];

      const result = distributeToSlots('Rows', children);

      expect(result).toBeDefined();
      expect(result!['1']).toHaveLength(1);
      expect(result!['1'][0].id).toBe('row1');
      expect(result!['2']).toHaveLength(1);
      expect(result!['2'][0].id).toBe('row2');
      expect(result!['3']).toHaveLength(1);
      expect(result!['3'][0].id).toBe('row3');
    });

    it('应该支持任意数量的行', () => {
      const children: ASTNode[] = [
        createCard('item1'),
        createCard('item2'),
        createCard('item3'),
        createCard('item4'),
        createCard('item5'),
      ];

      const result = distributeToSlots('Rows', children);

      expect(result).toBeDefined();
      expect(Object.keys(result!)).toHaveLength(5);
      expect(result!['1'][0].id).toBe('item1');
      expect(result!['5'][0].id).toBe('item5');
    });
  });

  describe('边界情况', () => {
    it('应该处理空子节点数组', () => {
      const result = distributeToSlots('Grid', []);
      expect(result).toBeDefined();
      expect(Object.keys(result!)).toHaveLength(0);
    });

    it('应该处理单个子节点的 Split', () => {
      const children: ASTNode[] = [createCard('only_one')];
      const result = distributeToSlots('Split', children);

      expect(result).toBeDefined();
      expect(result!.left).toHaveLength(1);
      expect(result!.left[0].id).toBe('only_one');
      expect(result!.right).toHaveLength(0);
    });

    it('应该处理超过 2 个子节点的 Split（多余节点分配到第二个插槽）', () => {
      const children: ASTNode[] = [
        createCard('first'),
        createCard('second'),
        createCard('third'),
      ];
      const result = distributeToSlots('Split', children);

      expect(result).toBeDefined();
      expect(result!.left).toHaveLength(1);
      expect(result!.left[0].id).toBe('first');
      // 第2、3个节点都会被分配到 right（因为 index > 0）
      expect(result!.right).toHaveLength(2);
      expect(result!.right[0].id).toBe('second');
      expect(result!.right[1].id).toBe('third');
    });

    it('应该对未知组件返回 null', () => {
      const result = distributeToSlots('UnknownComponent', [createCard('test')]);
      expect(result).toBeNull();
    });
  });

  describe('与现有复合组件兼容性', () => {
    it('Card 应该仍然正常工作', () => {
      const children: ASTNode[] = [
        { type: 'Heading', id: 'h1', props: {}, children: [] },
        { type: 'Text', id: 't1', props: {}, children: [] },
        { type: 'Button', id: 'b1', props: {}, children: [] },
      ];

      const result = distributeToSlots('Card', children);

      expect(result).toBeDefined();
      expect(result!.header).toHaveLength(1);
      expect(result!.content).toHaveLength(1);
      expect(result!.footer).toHaveLength(1);
    });

    it('Alert 应该仍然正常工作', () => {
      const children: ASTNode[] = [
        { type: 'Heading', id: 'title', props: {}, children: [] },
        { type: 'Text', id: 'desc', props: {}, children: [] },
      ];

      const result = distributeToSlots('Alert', children);

      expect(result).toBeDefined();
      expect(result!.title).toHaveLength(1);
      expect(result!.description).toHaveLength(1);
    });
  });
});
