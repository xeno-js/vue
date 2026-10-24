import type {
  ContextPlugin,
  IAppBuilder,
  IConfigurationService,
  IServiceScope,
  IXenoApplication,
  XenoRegistry,
} from '@xeno-js/core'
import { ContextModule, definePlugin, Guards, TOKENS } from '@xeno-js/core'

import { Mediator } from '@/application/mediator.js'

import { useContextStore } from './service/context.store.js'
import { VueRequestContext } from './service/vue-request.context.ts.js'

/**
 * @description Plugin for integrating Redis caching into an application. This plugin provides a convenient way to set up Redis caching with the specified configuration options. It leverages the RedisCacheFactory to create instances of RedisCache based on the provided configuration. The plugin also registers the RedisCacheFactory as a service in the application's dependency injection container.
 *
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-js
 */
export const withPiniaContext = <TRegistry extends XenoRegistry = XenoRegistry>(options?: {
  requestIdWindowMs?: number
}): ContextPlugin<TRegistry> => {
  return definePlugin(
    'context',
    (
      builder: IAppBuilder<TRegistry, IXenoApplication<TRegistry>>,
      _config: IConfigurationService,
    ) => {
      let frontendScope: IServiceScope<TRegistry>
      builder.addServices((opts) => (frontendScope = opts.createScope()), 0)
      const requestContext = new VueRequestContext<TRegistry>(() => frontendScope)

      if (Guards.isDefined(options)) {
        const contextStore = useContextStore()
        contextStore.setConfig(options)
      }

      builder.addServices(
        (opts) =>
          opts.addSingleton(
            TOKENS.MEDIATOR,
            (c) => new Mediator(c.resolve(TOKENS.SERVICE_SCOPE_ACCESSOR), requestContext),
          ),
        1,
      )
      builder.addModule(
        'ContextModule',
        async () => {
          return new ContextModule<TRegistry>()
        },
        requestContext,
        0,
      )
    },
  )
}
