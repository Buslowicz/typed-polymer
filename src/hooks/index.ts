import * as expressionBinding from "./expressionBinding";

export interface TemplateHook {
  pattern: string;
  callback: (match: string, p: string, i?: number) => string;
}

export var templateHooks: TemplateHook[] = [
  expressionBinding
];
