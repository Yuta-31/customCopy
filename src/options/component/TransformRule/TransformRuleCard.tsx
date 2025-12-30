import { X } from 'lucide-react';
import { useState } from 'react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransformRuleList } from '@/options/hooks/useTransformRuleList';
import type { URLTransformRule } from '@/types';

const previewTransform = (url: string, pattern: string, replacement: string, domain?: string): { success: boolean; result: string; error?: string } => {
  if (!url) {
    return { success: false, result: '', error: 'No URL provided' };
  }

  if (!pattern) {
    return { success: false, result: url, error: 'No pattern defined' };
  }

  // Check domain if specified
  if (domain) {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname !== domain) {
        return { success: false, result: url, error: `Domain mismatch (expected: ${domain})` };
      }
    } catch {
      return { success: false, result: url, error: 'Invalid URL' };
    }
  }

  try {
    const regex = new RegExp(pattern);
    if (regex.test(url)) {
      const transformed = url.replace(regex, replacement);
      return { success: true, result: transformed };
    } else {
      return { success: false, result: url, error: 'Pattern does not match URL' };
    }
  } catch (e) {
    return { success: false, result: url, error: `Invalid regex: ${e instanceof Error ? e.message : 'Unknown error'}` };
  }
};

export const TransformRuleCard = ({
  idx,
  rule
}: {
  idx: number;
  rule: URLTransformRule;
}) => {
  const { setRule, deleteRule } = useTransformRuleList();
  const [testUrl, setTestUrl] = useState('');
  const [isDeleteHovered, setIsDeleteHovered] = useState(false);
  
  const preview = previewTransform(testUrl, rule.pattern, rule.replacement, rule.domain);
  
  return (
    <Card 
      key={rule.id ?? idx}
      className={isDeleteHovered ? 'animate-shake' : ''}
    >
      <CardHeader className="w-full">
        <CardTitle className="w-full">
          <input
            className="w-full"
            placeholder="Rule name"
            value={rule.title}
            onChange={(e) => {
              setRule(idx, 'title', e.target.value);
            }}
          />
        </CardTitle>
        <CardAction className="cursor-pointer">
          <div
            onMouseEnter={() => setIsDeleteHovered(true)}
            onMouseLeave={() => setIsDeleteHovered(false)}
            onClick={() => {
              deleteRule(idx);
            }}>
            <X />
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Domain (optional)</label>
          <input
            className="w-full px-2 py-1 text-sm border rounded"
            placeholder="e.g., support.microsoft.com"
            value={rule.domain || ''}
            onChange={(e) => {
              setRule(idx, 'domain', e.target.value);
            }}
          />
          <div className="text-xs text-muted-foreground/70">
            Specify a domain to apply this rule only to that domain (leave blank to apply to all URLs)
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Pattern (Regular Expression)</label>
          <input
            className="w-full px-2 py-1 text-sm border rounded font-mono"
            placeholder="e.g., ^(https://support\.microsoft\.com/[^/]+/[^/]+/).+?([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"
            value={rule.pattern}
            onChange={(e) => {
              setRule(idx, 'pattern', e.target.value);
            }}
          />
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Replacement (Replacement String)</label>
          <input
            className="w-full px-2 py-1 text-sm border rounded font-mono"
            placeholder="e.g., $1$2"
            value={rule.replacement}
            onChange={(e) => {
              setRule(idx, 'replacement', e.target.value);
            }}
          />
          <div className="text-xs text-muted-foreground/70">
            Use $1, $2, etc. to reference capture groups
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <label className="text-xs text-muted-foreground font-semibold">Preview</label>
          <input
            className="w-full px-2 py-1 text-sm border rounded"
            placeholder="Enter a test URL to see the transformation"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
          />
          
          {testUrl && (
            <div className="p-3 bg-muted/50 rounded-lg border">
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground font-medium shrink-0">Input:</span>
                  <span className="text-xs text-foreground font-mono break-all">{testUrl}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground font-medium shrink-0">Output:</span>
                  <span className={`text-xs font-mono break-all ${preview.success ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                    {preview.result}
                  </span>
                </div>
                {preview.error && (
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-destructive font-medium shrink-0">Error:</span>
                    <span className="text-xs text-destructive">{preview.error}</span>
                  </div>
                )}
                {preview.success && preview.result !== testUrl && (
                  <div className="mt-1 px-2 py-1 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded">
                    <span className="text-xs text-green-700 dark:text-green-400 font-medium">✓ Transformation applied successfully</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
