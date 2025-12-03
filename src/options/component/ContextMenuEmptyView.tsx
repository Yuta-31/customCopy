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

interface ContextMenuEmptyViewProps {
  onNewSnippetClick: () => void
  onImportSnippetClick: () => void
}

export const ContextMenuEmptyView = ({
  onNewSnippetClick,
  onImportSnippetClick
}: ContextMenuEmptyViewProps) => {
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
          <Button onClick={onNewSnippetClick}>Create Snippet</Button>
          <Button variant="outline" onClick={onImportSnippetClick}>Import Snippet</Button>
        </div>
      </EmptyContent>
    </Empty>
  )
}
