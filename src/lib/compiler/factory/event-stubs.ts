/**
 * 事件桩函数
 *
 * 为交互组件注入默认的事件处理函数，使 UI 可交互
 */

import type { EventStubConfig } from './types';

/**
 * 事件桩函数配置
 *
 * 每个组件类型可以有多个事件，每个事件是一个工厂函数
 * 工厂函数接收节点 ID，返回实际的事件处理函数
 */
export const EVENT_STUBS: Record<string, EventStubConfig> = {
  Button: {
    onClick: (id: string) => () => {
      console.log(`[Stitch] Button clicked: ${id}`);
    },
  },

  Input: {
    onChange: (id: string) => (e: { target: { value: string } }) => {
      console.log(`[Stitch] Input changed: ${id}`, e.target.value);
    },
    onFocus: (id: string) => () => {
      console.log(`[Stitch] Input focused: ${id}`);
    },
    onBlur: (id: string) => () => {
      console.log(`[Stitch] Input blurred: ${id}`);
    },
  },

  Checkbox: {
    onCheckedChange: (id: string) => (checked: boolean) => {
      console.log(`[Stitch] Checkbox changed: ${id}`, checked);
    },
  },

  Switch: {
    onCheckedChange: (id: string) => (checked: boolean) => {
      console.log(`[Stitch] Switch changed: ${id}`, checked);
    },
  },

  RadioGroup: {
    onValueChange: (id: string) => (value: string) => {
      console.log(`[Stitch] RadioGroup changed: ${id}`, value);
    },
  },

  Select: {
    onValueChange: (id: string) => (value: string) => {
      console.log(`[Stitch] Select changed: ${id}`, value);
    },
  },

  Tabs: {
    onValueChange: (id: string) => (value: string) => {
      console.log(`[Stitch] Tab changed: ${id}`, value);
    },
  },

  Dialog: {
    onOpenChange: (id: string) => (open: boolean) => {
      console.log(`[Stitch] Dialog ${id}:`, open ? 'opened' : 'closed');
    },
  },

  Slider: {
    onValueChange: (id: string) => (value: number[]) => {
      console.log(`[Stitch] Slider changed: ${id}`, value);
    },
  },

  Accordion: {
    onValueChange: (id: string) => (value: string | string[]) => {
      console.log(`[Stitch] Accordion changed: ${id}`, value);
    },
  },
};

/**
 * 获取组件的事件桩函数配置
 */
export function getEventStubs(componentType: string): EventStubConfig | undefined {
  return EVENT_STUBS[componentType];
}

/**
 * 为节点注入事件桩函数
 *
 * @param componentType 组件类型
 * @param nodeId 节点 ID
 * @param existingProps 现有 props
 * @returns 注入事件后的 props
 */
export function injectEventStubs(
  componentType: string,
  nodeId: string,
  existingProps: Record<string, unknown> = {}
): Record<string, unknown> {
  const stubs = EVENT_STUBS[componentType];

  if (!stubs) {
    return existingProps;
  }

  const injectedProps: Record<string, unknown> = { ...existingProps };

  for (const [eventName, stubFactory] of Object.entries(stubs)) {
    // 只在没有现有处理器时注入
    if (!injectedProps[eventName]) {
      injectedProps[eventName] = stubFactory(nodeId);
    }
  }

  return injectedProps;
}

/**
 * 判断组件是否需要事件桩
 */
export function needsEventStubs(componentType: string): boolean {
  return componentType in EVENT_STUBS;
}

/**
 * 获取所有支持事件桩的组件类型
 */
export function getEventStubComponents(): string[] {
  return Object.keys(EVENT_STUBS);
}
