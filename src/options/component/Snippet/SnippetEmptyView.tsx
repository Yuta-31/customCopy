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
  const { createEmptySnippet, importSnippets } = useSnippetList();

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
        <div className="flex gap-2">
          <Button onClick={createEmptySnippet}>Create Snippet</Button>
          <Button variant="outline" onClick={importSnippets}>Import Snippet</Button>
        </div>
      </EmptyContent>
    </Empty>
  )
}