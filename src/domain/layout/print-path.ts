export function isPortfolioPrintPath(pathname: string) {
  return pathname.startsWith('/portfolio') && pathname.endsWith('/print');
}
