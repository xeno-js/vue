<div align="center">
  <img src="logo/logo.png" alt="Xeno Vue Logo" width="140" />

  <h1>Xeno Vue</h1>

  <p><strong>Your UI framework handles the UI. Xeno handles the application.</strong></p>

  <p>
    Application architecture for Vue with explicit dependency injection,
    CQRS, composable pipelines, and clear boundaries between presentation,
    application behavior, and infrastructure.
  </p>

  <p>
    <a href="https://www.npmjs.com/package/@xeno-js/vue">
      <img src="https://img.shields.io/npm/v/@xeno-js/vue?style=flat-square" alt="npm version" />
    </a>
    <a href="https://github.com/xeno-js/xeno-fe">
      <img src="https://img.shields.io/github/stars/xeno-js/xeno-fe?style=flat-square" alt="GitHub stars" />
    </a>
    <a href="https://img.shields.io/npm/l/@xeno-js/vue?style=flat-square">
      <img src="https://img.shields.io/npm/l/@xeno-js/vue?style=flat-square" alt="License: MIT" />
    </a>
    <a href="https://buymeacoffee.com/xenojs">
      <img src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-FFdd00?style=flat-square&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
    </a>
  </p>
</div>

---

`@xeno-js/vue` provides frontend integration for Vue.js and Pinia within the
Xeno.JS ecosystem. It handles client-side request contexts, tracing, and service
injection into Vue components.

## Installation

```bash
npm install @xeno-js/vue pinia

```

The package requires `@xeno-js/core` and Vue 3 as dependencies.

---

## 1. Pinia Context Plugin Configuration

**Problem.** Vue-based frontend applications need to synchronize user session
state, network contexts, and request correlation IDs with UI components and
backend services.

**Principle.** Request context state and shared service access must be managed
explicitly via reactive stores and injected into the Vue application lifecycle.

**Mechanism.** The `withPiniaContext` function defines a context plugin that
creates a frontend service scope, initializes the Pinia-based
`VueRequestContext` (`useContextStore`), and registers the `Mediator` and
`ContextModule` in the container.

**Implementation:**

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { XenoAppBuilder } from '@xeno-js/core'
import { withPiniaContext, ServicesUtils } from '@xeno-js/vue'

const pinia = createPinia()
const vueApp = createApp(App)
vueApp.use(pinia)

const xenoApp = await new XenoAppBuilder()
  .addContext(withPiniaContext({ requestIdWindowMs: 3000 }))
  .build()

ServicesUtils.provide(vueApp, xenoApp)
vueApp.mount('#app')
```

**Behavior:** During startup, the plugin configures the Pinia store and maps
Xeno services via the global `XENO_SERVICES_KEY` key, making them accessible
within the Vue component hierarchy.

**Boundary:** This package exclusively handles integration with Vue and Pinia,
context state storage, and frontend service injection. It does not handle
server-side network transport or database persistence.

---

## 2. Service Injection into Components (`ServicesUtils`)

**Problem.** Deeply nested Vue components need access to DI container services
and command/query handlers without resorting to circular imports or tight
coupling.

**Principle.** Access to shared services in UI components must occur via typed
and secure injection utilities.

**Mechanism:** `ServicesUtils` provides the `provide` methods (to register
services in the Vue application instance) and `useApp` (to retrieve them inside
components via Vue's `inject` mechanism).

**Implementation:**

```ts
import { defineComponent } from 'vue'
import { ServicesUtils } from '@xeno-js/vue'

export default defineComponent({
  setup() {
    const services = ServicesUtils.useApp()
    // Using services or the mediator
    return {}
  },
})
```

**Behavior:** If services have not been previously provided via
`ServicesUtils.provide`, calling `useApp` throws a descriptive runtime error.

**Boundary:** `ServicesUtils` is limited to facilitating the dependency
injection bridge between the Xeno runtime and the Vue component tree.

---

## License

Released under the MIT License.
