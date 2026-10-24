import type {
  Guid,
  Identity,
  MessagingContext,
  NetworkContext,
  Optional,
  RequestContext,
  TracingContext,
} from '@xeno-js/core'
import { Guards, GUEST, GuidHelper, SanitizeHelper } from '@xeno-js/core'
import { defineStore } from 'pinia'
import { ref } from 'vue'

import { ServicesUtils } from '../utils/service.utils'

export const useContextStore = defineStore('context', () => {
  const identity = ref<Optional<Identity>>(undefined)
  const sessionCorrelationId = ref<Guid>(GuidHelper.generate())
  const activeRequestContext = ref<Optional<RequestContext>>(undefined)

  const windowMs = ref<number>(3000)

  const cachedRequestId = ref<Guid>(GuidHelper.generate())
  const lastRequestIdTimestamp = ref<number>(Date.now())

  function setConfig(options: { requestIdWindowMs?: number }) {
    if (Guards.isDefined(options.requestIdWindowMs)) {
      windowMs.value = options.requestIdWindowMs
    }
  }

  function getContext(): RequestContext {
    if (Guards.isDefined(activeRequestContext.value)) {
      return activeRequestContext.value
    }

    const context = {
      identity: getIdentity(),
      network: getNetworkContext(),
      tracing: getTracingContext(),
      messaging: getMessagingContext(),
    }
    activeRequestContext.value = context
    return context
  }

  function initRequest(): void {
    clearActiveRequest()

    const now = Date.now()
    if (now - lastRequestIdTimestamp.value > windowMs.value) {
      cachedRequestId.value = GuidHelper.generate()
      lastRequestIdTimestamp.value = now
    }

    activeRequestContext.value = getContext()
  }

  function clearActiveRequest(): void {
    activeRequestContext.value = undefined
  }

  function getIdentity(): Identity {
    return identity.value ?? (GUEST as unknown as Identity)
  }

  function getNetworkContext(): NetworkContext {
    const { configurationService } = ServicesUtils.useApp()
    return {
      requestId: cachedRequestId.value,
      userAgent: Guards.isDefined(navigator)
        ? SanitizeHelper.stripControlChars(navigator.userAgent, 256)
        : 'unknown',
      formatIndicator: 'application/json',
      path: Guards.isDefined(window) ? SanitizeHelper.sanitizePath(window.location.pathname) : '/',
      csrf: configurationService.get('CSRF'),
      cookies: Guards.isDefined(document) ? document.cookie : undefined,
      origin: Guards.isDefined(window) ? window.location.origin : 'unknown',
    }
  }

  function getTracingContext(): TracingContext {
    return {
      correlationId: sessionCorrelationId.value,
      startTime: Date.now(),
      spanId: GuidHelper.generate(),
      parentSpanId: undefined,
      referer: Guards.isDefined(document)
        ? SanitizeHelper.sanitizePath(document.referrer, 512)
        : undefined,
    }
  }

  function getMessagingContext(): Optional<MessagingContext> {
    return undefined
  }

  return {
    identity,
    getContext,
    getIdentity,
    getNetworkContext,
    getTracingContext,
    getMessagingContext,
    initRequest,
    clearActiveRequest,
    setConfig,
  }
})
