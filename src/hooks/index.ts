import * as expressionBinding from "./expressionBinding";

export interface TemplateHook {
  pattern: string;
  callback: (match: string, p: string, i?: number) => string;
}

var templateHooks: TemplateHook[] = [
  expressionBinding
];

export default templateHooks;
