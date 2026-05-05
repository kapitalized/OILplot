import type { IExternalApiAdapter } from './types';
import { genericAdapter } from './adapters/generic';
import { yahooPricesAdapter } from './adapters/yahoo-prices';
import { eiaPetroleumAdapter } from './adapters/eia-petroleum';
import { eiaRefineryCapacityAdapter } from './adapters/eia-refinery-capacity';
import { eiaRefiningOpsAdapter } from './adapters/eia-refining-ops';

const adapters = new Map<string, IExternalApiAdapter>([
  [genericAdapter.key, genericAdapter],
  [yahooPricesAdapter.key, yahooPricesAdapter],
  [eiaPetroleumAdapter.key, eiaPetroleumAdapter],
  [eiaRefineryCapacityAdapter.key, eiaRefineryCapacityAdapter],
  [eiaRefiningOpsAdapter.key, eiaRefiningOpsAdapter],
]);

/** Register an adapter. Call from adapters/* and import in a central init if needed. */
export function registerAdapter(adapter: IExternalApiAdapter): void {
  adapters.set(adapter.key, adapter);
}

/** Get adapter by key. Returns undefined if not found. */
export function getAdapter(key: string): IExternalApiAdapter | undefined {
  return adapters.get(key);
}

/** List all registered adapter keys. */
export function listAdapterKeys(): string[] {
  return Array.from(adapters.keys());
}
