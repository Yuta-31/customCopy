import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { useSnippetList } from '@/options/hooks/useSnippetList';
import { storage } from '@/lib/storage';
import type { CustomCopySnippetContextMenu, URLTransformRule } from '@/types';

const renderPreviewWithHighlight = (text: string) => {
  if (!text) return <span className="text-gray-400 italic">Preview will be displayed here.</span>;
  
  const variables = [
    { pattern: '${title}', replacement: 'Page title will be inserted here.' },
    { pattern: '${url}', replacement: 'Page URL will be inserted here.' },
    { pattern: '${selectionText}', replacement: 'Selected text will be inserted here.' },
  ];

  const highlightColor = 'bg-amber-100 text-amber-900';
  const parts: React.ReactNode[] = [];
  let remainingText = text;
  let key = 0;

  while (remainingText.length > 0) {
    let foundMatch = false;

    for (const variable of variables) {
      const index = remainingText.indexOf(variable.pattern);
      if (index === 0) {
        parts.push(
          <span key={key++} className={`${highlightColor} px-1.5 py-0.5 rounded text-sm font-medium inline-block`}>
            {variable.replacement}
          </span>
        );
        remainingText = remainingText.slice(variable.pattern.length);
        foundMatch = true;
        break;
      }
    }

    if (!foundMatch) {
      const nextVarIndex = Math.min(
        ...variables.map(v => {
          const idx = remainingText.indexOf(v.pattern);
          return idx === -1 ? Infinity : idx;
        })
      );

      if (nextVarIndex === Infinity) {
        parts.push(<span key={key++}>{remainingText}</span>);
        remainingText = '';
      } else {
        parts.push(<span key={key++}>{remainingText.slice(0, nextVarIndex)}</span>);
        remainingText = remainingText.slice(nextVarIndex);
      }
    }
  }

  return <>{parts}</>;
};

export const SnippetCard = ({
  idx,
  snippet
}: {
  idx: number;
  snippet: CustomCopySnippetContextMenu;
}) => {
  const { setSnippet, deleteSnippet } = useSnippetList();
  const [rules, setRules] = useState<URLTransformRule[]>([]);
  const [isDeleteHovered, setIsDeleteHovered] = useState(false);

  useEffect(() => {
    const loadRules = async () => {
      const storedRules = await storage.get<URLTransformRule[]>('transformRules');
      if (storedRules && Array.isArray(storedRules)) {
        setRules(storedRules);
      }
    };
    loadRules();
  }, []);

  const toggleRule = (ruleId: string) => {
    const currentRules = snippet.enabledRuleIds || [];
    const newRules = currentRules.includes(ruleId)
      ? currentRules.filter(id => id !== ruleId)
      : [...currentRules, ruleId];
    setSnippet(idx, 'enabledRuleIds', newRules);
  };

  return (
    <Card 
      key={idx}
      className={isDeleteHovered ? 'animate-shake' : ''}
      >
      <CardHeader className="w-full">
        <CardTitle className="w-full">
          <input
            className="w-full"
            placeholder="title"
            value={snippet.title}
            onChange={(e) => {
              setSnippet(idx, 'title', e.target.value);
            }}
          />
        </CardTitle>
        <CardAction className="cursor-pointer">
          <div
            onMouseEnter={() => setIsDeleteHovered(true)}
            onMouseLeave={() => setIsDeleteHovered(false)}
            onClick={() => {
              deleteSnippet(idx);
            }}>
            <X />
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="snippet"
          value={snippet.clipboardText}
          onChange={(e) => {
            setSnippet(idx, 'clipboardText', e.target.value);
          }}
        />
      
        <section
          id="preview"
          className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-stone-500 text-xs font-semibold mb-2">Preview</div>
          <div className="whitespace-pre-wrap text-stone-700 leading-relaxed">
            {renderPreviewWithHighlight(snippet.clipboardText)}
          </div>
        </section>

        <Accordion type="single" collapsible className="pt-1">
          <AccordionItem value="options">
            <AccordionTrigger className="text-xs text-stone-600">
              Options
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>delete query</div>
                <Switch checked={snippet.deleteQuery} onCheckedChange={(checked) => {
                  setSnippet(idx, 'deleteQuery', checked);
                }} />
              </div>
              
              {rules.length > 0 && (
                <div className="flex flex-col gap-2 pt-2 border-t">
                  <div className="text-xs text-stone-500 font-medium">URL Transform Rules</div>
                  {rules.map((rule) => (
                    <div key={rule.id} className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id={`rule-${rule.id}`}
                        checked={(snippet.enabledRuleIds || []).includes(rule.id)}
                        onChange={() => toggleRule(rule.id)}
                        className="mt-1"
                      />
                      <label htmlFor={`rule-${rule.id}`} className="flex-1 cursor-pointer">
                        <div className="text-sm font-medium">{rule.title || 'Untitled Rule'}</div>
                        {rule.domain && (
                          <div className="text-xs text-stone-500">Domain: {rule.domain}</div>
                        )}
                        <div className="text-xs text-stone-400 font-mono">
                          {rule.pattern} → {rule.replacement}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
