import { useContext } from 'react';
import { TransformRuleListContext } from '@/options/component/TransformRule/TransformRuleListContext';
import { generateRuleId } from '@/types';
import type { URLTransformRule } from '@/types';

export const useTransformRuleList = () => {
  const context = useContext(TransformRuleListContext);
  if (!context) {
    throw new Error('useTransformRuleList must be used within a TransformRuleListProvider');
  }

  const { rules, setRules, exportRules, importRules } = context;

  const addRule = () => {
    const newRule: URLTransformRule = {
      id: generateRuleId(),
      title: '',
      domain: '',
      pattern: '',
      replacement: '',
    };
    setRules([...rules, newRule]);
  };

  const setRule = <K extends keyof URLTransformRule>(
    idx: number,
    key: K,
    value: URLTransformRule[K]
  ) => {
    const newRules = [...rules];
    newRules[idx] = { ...newRules[idx], [key]: value };
    setRules(newRules);
  };

  const deleteRule = (idx: number) => {
    const newRules = rules.filter((_, i) => i !== idx);
    setRules(newRules);
  };

  return { rules, addRule, setRule, deleteRule, exportRules, importRules };
};
