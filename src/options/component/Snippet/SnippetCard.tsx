import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useSnippetList } from '@/options/hooks/useSnippetList';
import { useCommands } from '@/options/hooks/useCommands';
import { storage } from '@/lib/storage';
import type { CustomCopySnippetContextMenu, URLTransformRule } from '@/types';

const renderPreviewWithHighlight = (text: string) => {
  if (!text) return <span className="text-muted-foreground italic">Preview will be displayed here.</span>;
  
  const variables = [
    { pattern: '${title}', replacement: 'Page title will be inserted here.' },
    { pattern: '${url}', replacement: 'Page URL will be inserted here.' },
    { pattern: '${selectionText}', replacement: 'Selected text will be inserted here.' },
    { pattern: '${section}', replacement: 'Section heading will be inserted here.' },
  ];

  const highlightColor = 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100';
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
  const { getShortcutForSnippet } = useCommands();
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
    
    // Watch for changes to transformRules
    const unwatch = storage.watch<URLTransformRule[]>('transformRules', (updatedRules) => {
      if (updatedRules && Array.isArray(updatedRules)) {
        setRules(updatedRules);
      }
    });
    
    return () => {
      unwatch();
    };
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
      key={snippet.id || idx}
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
          className="mt-4 p-3 bg-muted/50 rounded-lg border">
          <div className="text-muted-foreground text-xs font-semibold mb-2">Preview</div>
          <div className="whitespace-pre-wrap text-foreground leading-relaxed">
            {renderPreviewWithHighlight(snippet.clipboardText)}
          </div>
        </section>

        <Accordion type="single" collapsible className="pt-1">
          <AccordionItem value="options">
            <AccordionTrigger className="text-xs text-foreground">
              Options
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex flex-col">
                  <div className="text-sm">Keyboard Shortcut</div>
                  <div className="text-xs text-muted-foreground">Assign keyboard shortcut</div>
                </div>
                <select
                  value={snippet.shortcutNumber || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                    setSnippet(idx, 'shortcutNumber', value);
                  }}
                  className="px-3 py-1.5 border rounded-md text-sm bg-background"
                >
                  <option value="">None</option>
                  {[1, 2, 3, 4].map((num) => {
                    const actualShortcut = getShortcutForSnippet(num);
                    const displayText = actualShortcut || 'Not set';
                    return (
                      <option key={num} value={num}>
                        {displayText}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              {rules.length > 0 && (
                <div className="flex flex-col gap-2 pt-2 border-t">
                  <div className="text-xs text-muted-foreground font-medium">URL Transform Rules</div>
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
                          <div className="text-xs text-muted-foreground">Domain: {rule.domain}</div>
                        )}
                        <div className="text-xs text-muted-foreground/70 font-mono">
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
