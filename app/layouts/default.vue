<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="container app-header__content">
        <NuxtLink class="app-brand" to="/" aria-label="Flow Services - início">
          <span class="app-brand__mark" aria-hidden="true">F</span>
          <span>
            <strong>Flow Services</strong>
            <small>Registro de cultos</small>
          </span>
        </NuxtLink>
      </div>
    </header>

    <main class="app-main">
      <slot />
    </main>

    <footer class="app-footer">
      <div class="container">Flow Services · Igreja</div>
    </footer>
  </div>
</template>
