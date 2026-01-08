import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface BidderAvatarProps {
  firstName: string;
  lastName: string;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BidderAvatar({ firstName, lastName, avatar, size = 'md' }: BidderAvatarProps) {
  const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-lg',
  };

  return (
    <Avatar className={cn(sizeClasses[size])}>
      <AvatarImage src={avatar} alt={`${firstName} ${lastName}`} />
      <AvatarFallback className="bg-primary/10 text-green-700 font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
