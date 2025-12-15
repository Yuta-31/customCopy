import '@/styles/options_contextMenu.scss';
import { Button } from '@/components/ui/button';
import { useSnippetList } from '@/options/hooks/useSnippetList';
import { SnippetCard } from './SnippetCard';
import { SnippetEmptyView } from './SnippetEmptyView';
import { SnippetListHeader } from './SnippetListHeader';


export const SnippetList = () => {
  const { snippets, createEmptySnippet } = useSnippetList();

  return (
    <div className="frame">
      <div className="w-[600px] flex flex-col gap-2">
        <SnippetListHeader />
        {snippets.length > 0 ?
          snippets.map((snippet, idx) => (
            <div key={idx}>
              <SnippetCard
                idx={idx}
                snippet={snippet}
              />
            </div>
          )) : <SnippetEmptyView />}
        {snippets.length > 0 && 
        (<Button onClick={createEmptySnippet}>
          ADD NEW SNIPPET
        </Button>)}
        
      </div>
      <div className="infos">
        <h3>変数一覧</h3>
        <div className="info_text">
          特定の文字列にはページのタイトルなどが挿入されます。
        </div>
        <table className="vars">
          <tr>
            <td>{'${title}'}:</td>
            <td>ページのタイトル</td>
          </tr>
          <tr>
            <td>{'${url}'}:</td>
            <td>ページの URL</td>
          </tr>
          <tr>
            <td>{'${selectionText}'}:</td>
            <td>選択したテキスト</td>
          </tr>
        </table>
      </div>
    </div>
  );
};
