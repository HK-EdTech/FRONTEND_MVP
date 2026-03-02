import { Calendar, EllipsisVertical, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/components/ui/utils';

interface HomeworkSummaryCardProps {
  title: string;
  assignedText: string;
  dueText: string;
  className?: string;
  onClick?: () => void;
  menuLabel?: string;
  onMenuClick?: () => void;
}

export function HomeworkSummaryCard({
  title,
  assignedText,
  dueText,
  className,
  onClick,
  menuLabel,
  onMenuClick,
}: HomeworkSummaryCardProps) {
  const cardClassName = cn(
    'bg-white border border-white/10 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300',
    className
  );

  return (
    <div className={cn(cardClassName, onClick ? 'cursor-pointer' : undefined)} onClick={onClick}>
      <div className="w-full h-28 rounded-lg bg-gray-200/60 mb-3" />
      <div className="flex items-center justify-between">
        <h3 className="text-gray-800 font-bold">{title}</h3>
        {menuLabel && onMenuClick && (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 cursor-pointer"
                  onClick={(event) => event.stopPropagation()}
                >
                  <EllipsisVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(event) => {
                    event.stopPropagation();
                    onMenuClick();
                  }}
                  className='cursor-pointer'
                >
                  {menuLabel}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-600 mt-1 flex items-start gap-1">
        <Users className="w-4 h-4 text-purple-500" />
        {assignedText}
      </p>
      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
        <Calendar className="w-4 h-4 text-teal-500" />
        {dueText}
      </p>
    </div>
  );
}
