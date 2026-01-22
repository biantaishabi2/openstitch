import * as React from 'react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

// 获取所有Lucide图标名称
type IconName = keyof typeof LucideIcons;

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  name: IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 'md', className, ...props }, ref) => {
    const LucideIcon = LucideIcons[name] as React.ComponentType<
      React.SVGAttributes<SVGSVGElement> & { ref?: React.Ref<SVGSVGElement> }
    >;

    if (!LucideIcon) {
      console.warn(`Icon "${name}" not found in lucide-react`);
      return null;
    }

    return (
      <LucideIcon
        ref={ref}
        className={cn(sizeMap[size], className)}
        {...props}
      />
    );
  }
);
Icon.displayName = 'Icon';

// 常用图标重导出
export const HomeIcon = LucideIcons.Home;
export const SettingsIcon = LucideIcons.Settings;
export const UserIcon = LucideIcons.User;
export const SearchIcon = LucideIcons.Search;
export const MenuIcon = LucideIcons.Menu;
export const CloseIcon = LucideIcons.X;
export const PlusIcon = LucideIcons.Plus;
export const MinusIcon = LucideIcons.Minus;
export const CheckIcon = LucideIcons.Check;
export const ChevronRightIcon = LucideIcons.ChevronRight;
export const ChevronLeftIcon = LucideIcons.ChevronLeft;
export const ChevronDownIcon = LucideIcons.ChevronDown;
export const ChevronUpIcon = LucideIcons.ChevronUp;
export const ArrowRightIcon = LucideIcons.ArrowRight;
export const ArrowLeftIcon = LucideIcons.ArrowLeft;
export const ExternalLinkIcon = LucideIcons.ExternalLink;
export const CopyIcon = LucideIcons.Copy;
export const TrashIcon = LucideIcons.Trash;
export const EditIcon = LucideIcons.Edit;
export const EyeIcon = LucideIcons.Eye;
export const EyeOffIcon = LucideIcons.EyeOff;
export const DownloadIcon = LucideIcons.Download;
export const UploadIcon = LucideIcons.Upload;
export const FileIcon = LucideIcons.File;
export const FolderIcon = LucideIcons.Folder;
export const ImageIcon = LucideIcons.Image;
export const VideoIcon = LucideIcons.Video;
export const MusicIcon = LucideIcons.Music;
export const MailIcon = LucideIcons.Mail;
export const PhoneIcon = LucideIcons.Phone;
export const CalendarIcon = LucideIcons.Calendar;
export const ClockIcon = LucideIcons.Clock;
export const MapPinIcon = LucideIcons.MapPin;
export const StarIcon = LucideIcons.Star;
export const HeartIcon = LucideIcons.Heart;
export const BellIcon = LucideIcons.Bell;
export const InfoIcon = LucideIcons.Info;
export const AlertCircleIcon = LucideIcons.AlertCircle;
export const AlertTriangleIcon = LucideIcons.AlertTriangle;
export const CheckCircleIcon = LucideIcons.CheckCircle;
export const XCircleIcon = LucideIcons.XCircle;
export const HelpCircleIcon = LucideIcons.HelpCircle;
export const LoaderIcon = LucideIcons.Loader2;
export const RefreshIcon = LucideIcons.RefreshCw;
export const MoreHorizontalIcon = LucideIcons.MoreHorizontal;
export const MoreVerticalIcon = LucideIcons.MoreVertical;
export const GridIcon = LucideIcons.Grid;
export const ListIcon = LucideIcons.List;
export const LayoutGridIcon = LucideIcons.LayoutGrid;
export const CodeIcon = LucideIcons.Code;
export const TerminalIcon = LucideIcons.Terminal;
export const DatabaseIcon = LucideIcons.Database;
export const ServerIcon = LucideIcons.Server;
export const CloudIcon = LucideIcons.Cloud;
export const CpuIcon = LucideIcons.Cpu;
export const ZapIcon = LucideIcons.Zap;
export const ActivityIcon = LucideIcons.Activity;
export const TrendingUpIcon = LucideIcons.TrendingUp;
export const TrendingDownIcon = LucideIcons.TrendingDown;
export const BarChartIcon = LucideIcons.BarChart;
export const PieChartIcon = LucideIcons.PieChart;
export const LineChartIcon = LucideIcons.LineChart;

// 导出Icon组件和整个LucideIcons
export { Icon, LucideIcons };
