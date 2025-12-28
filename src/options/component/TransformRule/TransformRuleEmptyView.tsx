import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { useTransformRuleList } from '@/options/hooks/useTransformRuleList';

export const TransformRuleEmptyView = () => {
  const { addRule } = useTransformRuleList();

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Wand2 />
        </EmptyMedia>
        <EmptyTitle>No URL Transform Rules</EmptyTitle>
        <EmptyDescription>
          Create URL transform rules to automatically convert URLs based on specific domains or patterns
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={addRule}>Create Rule</Button>
      </EmptyContent>
    </Empty>
  );
};
