import { TransformRuleCard } from './TransformRuleCard';
import { TransformRuleEmptyView } from './TransformRuleEmptyView';
import { TransformRuleListHeader } from './TransformRuleListHeader';
import { useTransformRuleList } from '@/options/hooks/useTransformRuleList';

export const TransformRuleList = () => {
  const { rules } = useTransformRuleList();

  return (
    <div className="w-full h-full flex flex-col gap-2 p-4 bg-stone-50">
      <TransformRuleListHeader />
      {rules.length === 0 ? (
        <TransformRuleEmptyView />
      ) : (
        rules.map((rule, idx) => (
          <TransformRuleCard key={rule.id} idx={idx} rule={rule} />
        ))
      )}
    </div>
  );
};
