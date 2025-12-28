import { FolderX } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { useSnippetList } from '@/options/hooks/useSnippetList';

export const SnippetEmptyView = () => {
  const { createEmptySnippet } = useSnippetList();

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderX />
        </EmptyMedia>
        <EmptyTitle>No Snippet Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any snippets yet. Get started by creating
          your first snippet.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={createEmptySnippet}>Create Snippet</Button>
      </EmptyContent>
    </Empty>
  )
}