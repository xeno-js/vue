import type { IXenoApplication, Nullable, ServicesProxy, XenoRegistry } from '@xeno-js/core'
import { Guards } from '@xeno-js/core'
import { inject } from 'vue'

interface App<TRegistry extends XenoRegistry = XenoRegistry> {
  provide(key: string, value: ServicesProxy<TRegistry>): this
}

let globalServices: Nullable<XenoRegistry> = null

export const ServicesUtils = Object.freeze({
  useApp<TRegistry extends XenoRegistry = XenoRegistry>(): TRegistry {
    if (Guards.isDefined(globalServices)) return globalServices as TRegistry

    const services = inject<TRegistry>('XENO_SERVICES_KEY')
    if (!Guards.isDefined(services))
      throw new Error(
        '[Xeno Error]: XenoServices not found. Did you provide them using app.provide(XENO_SERVICES_KEY, services)?',
      )

    return services
  },
  provide<T extends App<TRegistry>, TRegistry extends XenoRegistry = XenoRegistry>(
    app: T,
    xenoApp: IXenoApplication<TRegistry>,
  ): T {
    const services = xenoApp.getServices()
    globalServices = services
    app.provide('XENO_SERVICES_KEY', services)
    return app
  },
} as const)
