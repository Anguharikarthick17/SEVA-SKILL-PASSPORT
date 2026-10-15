import { cn } from '@/lib/utils';

interface SkillBarProps {
  name: string;
  score: number;
  category?: string;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function SkillBar({ name, score, category, className, showLabel = true, size = 'md' }: SkillBarProps) {
  const barHeight = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className={cn('space-y-1.5', className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn('font-bold text-espresso-900', textSize)}>{name}</span>
            {category && (
              <span className="text-[10px] text-milan-600 bg-milan-50 border border-milan-600/20 px-2 py-0.5 rounded-full font-semibold">
                {category}
              </span>
            )}
          </div>
          <span className={cn('font-black text-milan-600 font-mono', textSize)}>{score}%</span>
        </div>
      )}
      <div className={cn('w-full bg-[#FFFDF7] border border-burgundy-900/20 rounded-full overflow-hidden p-[1px]', barHeight)}>
        <div
          className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-burgundy-700 to-burgundy-900 shadow-sm"
          style={{ width: `${score}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${name}: ${score}%`}
        />
      </div>
    </div>
  );
}
