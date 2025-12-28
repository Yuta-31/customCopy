import { Plus } from 'lucide-react';
import { useTransformRuleList } from '@/options/hooks/useTransformRuleList';
import HoverExpandButton from '../HoverExpandButton';

export const TransformRuleListHeader = () => {
  const { addRule } = useTransformRuleList();

  return (
    <div className="flex items-center justify-between pb-2 border-b">
      <h1 className="text-2xl font-bold">URL Transform Rules</h1>
      <HoverExpandButton icon={<Plus />} text="Add Rule" variant="default" onClick={addRule} />
    </div>
  );
};
