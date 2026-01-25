'use client';

import { useEffect, useState } from 'react';
import { StitchRenderer } from '@/lib/renderer';
import type { UINode } from '@/lib/renderer';

/**
 * 渲染页面 - 用于 iframe 嵌入
 *
 * 使用方式：
 * 1. 通过 URL 参数：/render?schema=base64编码的JSON
 * 2. 通过 postMessage：parent.postMessage({ type: 'render', schema: {...} }, '*')
 */
export default function RenderPage() {
  const [schema, setSchema] = useState<UINode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. 尝试从 URL 参数读取
    const params = new URLSearchParams(window.location.search);
    const schemaParam = params.get('schema');

    if (schemaParam) {
      try {
        const decoded = atob(schemaParam);
        const parsed = JSON.parse(decoded);
        setSchema(parsed);
        return;
      } catch (e) {
        setError('无法解析 schema 参数');
      }
    }

    // 2. 监听 postMessage
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'render' && event.data?.schema) {
        try {
          setSchema(event.data.schema);
          setError(null);
        } catch (e) {
          setError('无法解析 schema');
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // 通知父窗口已准备好
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'render-ready' }, '*');
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="p-4 text-gray-400 text-sm">
        等待接收 schema...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <StitchRenderer schema={schema} config={{ debug: true }} />
    </div>
  );
}
