import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/components/ui/utils';

interface PersonInfoCardProps {
  name: string;
  subtitle: string;
  avatarUrl?: string | null;
  fallback: string;
  className?: string;
}

export function PersonInfoCard({
  name,
  subtitle,
  avatarUrl,
  fallback,
  className,
}: PersonInfoCardProps) {
  return (
    <div
      className={cn(
        'w-full min-w-[220px] bg-white border border-white/10 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="size-10">
          <AvatarImage src={avatarUrl || ''} alt={name} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-gray-800 font-bold">{name}</p>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
