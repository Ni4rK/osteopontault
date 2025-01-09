export type Toast = {
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  timeout?: number;
}
