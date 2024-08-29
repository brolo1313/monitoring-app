export function isFunction(value: any): boolean {
  return typeof value === 'function';
}


export function isElectronMode(): boolean {
  if (window.electron) {
    return true;
  }

  return false;
}