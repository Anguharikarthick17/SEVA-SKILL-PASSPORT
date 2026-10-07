import { cn, getScoreBarColor } from '@/lib/utils';

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
            <span className={cn('font-medium text-slate-700', textSize)}>{name}</span>
            {category && (
              <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-normal">
                {category}
              </span>
            )}
          </div>
          <span className={cn('font-semibold text-navy-800', textSize)}>{score}%</span>
        </div>
      )}
      <div className={cn('w-full bg-slate-100 rounded-full overflow-hidden', barHeight)}>
        <div
          className={cn('h-full rounded-full transition-all duration-700', getScoreBarColor(score))}
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
