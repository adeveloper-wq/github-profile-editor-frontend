<script setup>
</script>

<template>
  <div>
    <header class="bg-white shadow" v-if="$route.meta.title">
      <div class="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <h1 class="flow-root text-3xl font-bold leading-tight text-gray-900">
          <span class="float-left">{{ $route.meta.title }} </span>
          <router-link
            v-if="$route.meta.title == 'Editor'"
            to="/"
            class="
              float-right
              align-middle
              px-5
              py-3
              text-base
              font-medium
              leading-6
              text-white
              transition
              duration-150
              ease-in-out
              bg-indigo-600
              border border-transparent
              rounded-md
              hover:bg-indigo-500
              focus:outline-none
            "
            >Cancel</router-link
          >
        </h1>
      </div>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>
