import { createContext, useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { generateRuleId, isRuleEqual } from '@/types';
import Logger from '@/lib/logger';
import type { URLTransformRule } from '@/types';

const transformRuleLogger = new Logger({ prefix: '[TransformRule]' });

export type TransformRuleListContextType = {
  rules: URLTransformRule[];
  setRules: (rules: URLTransformRule[]) => void;
  exportRules: () => URLTransformRule[];
  importRules: (importedRules: URLTransformRule[]) => Map<string, string>;
};

export const TransformRuleListContext = createContext<TransformRuleListContextType | undefined>(
  undefined
);

export const TransformRuleListProvider = ({ children }: { children: React.ReactNode }) => {
  const [rules, setRules] = useState<URLTransformRule[]>([]);

  useEffect(() => {
    const loadRules = async () => {
      try {
        const storedRules = await storage.get<URLTransformRule[]>('transformRules');
        if (storedRules && Array.isArray(storedRules)) {
          transformRuleLogger.info('Transform rules loaded from storage', { count: storedRules.length });
          setRules(storedRules);
        } else {
          transformRuleLogger.debug('No transform rules found in storage');
        }
      } catch (error) {
        transformRuleLogger.error('Failed to load transform rules from storage', error);
      }
    };
    loadRules();
  }, []);

  useEffect(() => {
    const saveRules = async () => {
      try {
        transformRuleLogger.debug('Saving transform rules to storage', { count: rules.length });
        await storage.set('transformRules', rules);
        transformRuleLogger.info('Transform rules saved successfully');
      } catch (error) {
        transformRuleLogger.error('Failed to save transform rules to storage', error);
      }
    };
    saveRules();
  }, [rules]);

  const exportRules = (): URLTransformRule[] => {
    return rules;
  };

  const importRules = (importedRules: URLTransformRule[]): Map<string, string> => {
    // Map from imported rule id to existing/new rule id
    const idMapping = new Map<string, string>();
    const newRulesToAdd: URLTransformRule[] = [];
    
    for (const importedRule of importedRules) {
      // Find matching rule by content (excluding id)
      const existingRule = rules.find(r => isRuleEqual(r, importedRule));
      
      if (existingRule) {
        // Rule already exists, map to existing id
        idMapping.set(importedRule.id, existingRule.id);
      } else {
        // Rule doesn't exist, generate new id and add to import list
        const newId = generateRuleId();
        idMapping.set(importedRule.id, newId);
        newRulesToAdd.push({
          ...importedRule,
          id: newId,
        });
      }
    }
    
    // Add new rules
    if (newRulesToAdd.length > 0) {
      setRules([...rules, ...newRulesToAdd]);
    }
    
    return idMapping;
  };

  return (
    <TransformRuleListContext.Provider value={{ rules, setRules, exportRules, importRules }}>
      {children}
    </TransformRuleListContext.Provider>
  );
};
