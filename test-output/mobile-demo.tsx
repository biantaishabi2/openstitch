/**
 * 移动端组件演示页面
 * 用于验证 MobileShell, BottomTabs, ActionSheet 的样式
 */

import * as React from 'react';
import { Home, Search, Bell, User, MoreHorizontal, Share, Edit, Trash } from 'lucide-react';

import { MobileShell, MobileContent, MobileHeader } from '@/components/ui/mobile-shell';
import { BottomTabs, BottomTabsList, BottomTabsTrigger, BottomTabsContent } from '@/components/ui/bottom-tabs';
import {
  ActionSheet,
  ActionSheetTrigger,
  ActionSheetContent,
  ActionSheetHeader,
  ActionSheetTitle,
  ActionSheetDescription,
  ActionSheetGroup,
  ActionSheetItem,
  ActionSheetCancel,
} from '@/components/ui/action-sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MobileDemo() {
  return (
    <MobileShell hasBottomNav>
      <BottomTabs defaultValue="home">
        {/* 首页 Tab */}
        <BottomTabsContent value="home">
          <MobileHeader title="首页" />
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>欢迎使用</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">这是移动端组件演示页面</p>
              </CardContent>
            </Card>

            {/* ActionSheet 演示 */}
            <ActionSheet>
              <ActionSheetTrigger asChild>
                <Button className="w-full">
                  <MoreHorizontal className="mr-2 h-4 w-4" />
                  打开操作菜单
                </Button>
              </ActionSheetTrigger>
              <ActionSheetContent>
                <ActionSheetHeader>
                  <ActionSheetTitle>选择操作</ActionSheetTitle>
                  <ActionSheetDescription>请选择要执行的操作</ActionSheetDescription>
                </ActionSheetHeader>
                <ActionSheetGroup>
                  <ActionSheetItem>
                    <Share className="mr-2 h-4 w-4" />
                    分享
                  </ActionSheetItem>
                  <ActionSheetItem>
                    <Edit className="mr-2 h-4 w-4" />
                    编辑
                  </ActionSheetItem>
                  <ActionSheetItem destructive>
                    <Trash className="mr-2 h-4 w-4" />
                    删除
                  </ActionSheetItem>
                </ActionSheetGroup>
                <ActionSheetCancel />
              </ActionSheetContent>
            </ActionSheet>

            {/* 占位内容 */}
            {Array.from({ length: 10 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <p>内容卡片 {i + 1}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </BottomTabsContent>

        {/* 搜索 Tab */}
        <BottomTabsContent value="search">
          <MobileHeader title="搜索" />
          <div className="p-4">
            <p>搜索页面内容</p>
          </div>
        </BottomTabsContent>

        {/* 通知 Tab */}
        <BottomTabsContent value="notifications">
          <MobileHeader title="通知" />
          <div className="p-4">
            <p>通知页面内容</p>
          </div>
        </BottomTabsContent>

        {/* 我的 Tab */}
        <BottomTabsContent value="profile">
          <MobileHeader title="我的" />
          <div className="p-4">
            <p>个人中心内容</p>
          </div>
        </BottomTabsContent>

        {/* 底部导航栏 */}
        <BottomTabsList>
          <BottomTabsTrigger value="home" icon={<Home />} label="首页" />
          <BottomTabsTrigger value="search" icon={<Search />} label="搜索" />
          <BottomTabsTrigger value="notifications" icon={<Bell />} label="通知" />
          <BottomTabsTrigger value="profile" icon={<User />} label="我的" />
        </BottomTabsList>
      </BottomTabs>
    </MobileShell>
  );
}
