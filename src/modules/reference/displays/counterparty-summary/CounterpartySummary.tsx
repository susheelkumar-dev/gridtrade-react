import { createSummaryDisplay, registerRenderer } from '@extreact/framework';
import { counterpartySummary } from '../../counterparty.schema';

/** Indian digit grouping (12,34,567), as GT.util.Format.indian did. */
export function indian(n: unknown): string {
  if (n === null || n === undefined || n === '' || Number.isNaN(Number(n))) return '';
  const neg = Number(n) < 0;
  const whole = Math.round(Math.abs(Number(n))).toString();
  const last3 = whole.slice(-3);
  const rest = whole.slice(0, -3);
  const grouped = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3 : last3;
  return (neg ? '-' : '') + grouped;
}
registerRenderer('indian', (v) => indian(v));

export default createSummaryDisplay(counterpartySummary);
