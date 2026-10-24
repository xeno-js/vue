import type {
  Identity,
  IRequestContext,
  IServiceScope,
  NetworkContext,
  Optional,
  RequestContext,
  TracingContext,
  XenoRegistry,
} from '@xeno-js/core'

import type { IRequestManager } from '@/domain'

import { useContextStore } from './context.store'

export class VueRequestContext<TRegistry extends XenoRegistry>
  implements IRequestContext<RequestContext, TRegistry>, IRequestManager
{
  constructor(private readonly _scopeGetter: () => IServiceScope<TRegistry>) {}

  public async runAsync<T>(_context: RequestContext, fn: () => Promise<T>): Promise<T> {
    return await fn()
  }

  public getScope(): Optional<IServiceScope<TRegistry>> {
    return this._scopeGetter()
  }

  public getContext(): RequestContext {
    const authStore = useContextStore()
    return authStore.getContext()
  }

  public getIdentity(): Optional<Identity> {
    const authStore = useContextStore()
    return authStore.identity
  }

  public getNetworkContext(): Optional<NetworkContext> {
    const authStore = useContextStore()
    return authStore.getNetworkContext()
  }

  public updateIdentity(identity: Identity): void {
    const authStore = useContextStore()
    authStore.identity = identity
  }

  public initRequest(): void {
    const authStore = useContextStore()
    authStore.initRequest()
  }

  public stopRequest(): void {
    const authStore = useContextStore()
    authStore.clearActiveRequest()
  }

  public getTracingContext(): Optional<TracingContext> {
    const authStore = useContextStore()
    return authStore.getTracingContext()
  }
}
