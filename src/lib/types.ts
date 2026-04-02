export interface PendingChange {
  file: string;
  oldCode: string;
  newCode: string;
  description: string;
  changeType?: 'text' | 'css-var' | 'component';
}
