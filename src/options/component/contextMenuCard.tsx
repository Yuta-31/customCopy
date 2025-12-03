import { X } from 'lucide-react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { CustomCopyContextMenu } from '@/types';

export const ContextMenuCard = ({
  idx,
  contextMenu,
  setContextMenuItem,
  deleteContextMenu
}: {
  idx: number;
  contextMenu: CustomCopyContextMenu;
  setContextMenuItem: (
    idx: number,
    key: keyof CustomCopyContextMenu,
    value: string | string[]
  ) => void;
  deleteContextMenu: (idx: number) => void;
}) => {
  return (
    <Card 
      key={idx}
      className="[&:has(.delete_button:hover)]:animate-shake transition-transform"
      >
      <CardHeader className="w-full">
        <CardTitle className="w-full">
          <input
            className="w-full"
            placeholder="title"
            value={contextMenu.title}
            onChange={(e) => {
              setContextMenuItem(idx, 'title', e.target.value);
            }}
          />
        </CardTitle>
        <CardAction className="cursor-pointer">
          <div
            className="delete_button"
            onClick={() => {
              deleteContextMenu(idx);
            }}>
            <X />
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="snippet"
          value={contextMenu.clipboardText}
          onChange={(e) => {
            setContextMenuItem(idx, 'clipboardText', e.target.value);
          }}
        />
      
        <section
          id="preview"
          className="mt-3"
          style={{ color: contextMenu.clipboardText === '' ? 'grey' : '' }}>
          <div className="text-stone-500 text-xs w-full border-b pb-1 mb-2">Preview</div>
          {contextMenu.clipboardText
            .replace('${title}', 'ココにページのタイトルが入ります。')
            .replace('${url}', 'ココにページの URL が入ります。')
            .replace('${selectionText}', 'ココに選択したテキストが入ります。') ||
            'プレビューが表示されます。'}
        </section>

        <Accordion type="single" collapsible className="pt-1">
          <AccordionItem value="options">
            <AccordionTrigger className="text-xs text-stone-600">
              Options
            </AccordionTrigger>
            <AccordionContent>
              <div className="rounded-md bg-stone-100 border border-stone-200 px-3 py-2 font-mono text-xs text-stone-800 whitespace-pre-wrap">
                test
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
