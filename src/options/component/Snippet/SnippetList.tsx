import '@/styles/options_contextMenu.scss';
import { useSnippetList } from '@/options/hooks/useSnippetList';
import { SnippetCard } from './SnippetCard';
import { SnippetEmptyView } from './SnippetEmptyView';
import { SnippetListHeader } from './SnippetListHeader';


export const SnippetList = () => {
  const { snippets } = useSnippetList();

  return (
    <div className="w-full h-full flex gap-4 p-4 bg-stone-50">
      <div className="flex-1 flex flex-col gap-2">
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
      </div>
      <div className="w-[300px] flex-shrink-0">
        <h3 className="text-xl font-bold mb-2">Available Variables</h3>
        <div className="text-sm text-gray-600 mb-4">
          These variables will be replaced with page information.
        </div>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b">
              <td className="py-2 font-mono">{'${title}'}</td>
              <td className="py-2">Page title</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-mono">{'${url}'}</td>
              <td className="py-2">Page URL</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-mono">{'${selectionText}'}</td>
              <td className="py-2">Selected text</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
