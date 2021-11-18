<script setup>
import LoginButton from "@/components/LoginButton.vue";
</script>

<template>
  <div class="bg-gray-50">
    <div
      class="
        max-w-screen-xl
        px-4
        py-12
        mx-auto
        sm:px-6
        lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between
      "
    >
      <h2
        class="
          text-3xl
          font-extrabold
          leading-9
          tracking-tight
          text-gray-900
          sm:text-4xl sm:leading-10
        "
      >
        Pimp your Github profile!
        <br />
        <span class="text-indigo-600"
          >Markdown-Editor, special profile statistics, ...</span
        >
      </h2>
      <div class="flex mt-8 lg:flex-shrink-0 lg:mt-0">
        <div class="inline-flex rounded-md shadow"></div>
        <LoginButton />
      </div>
    </div>
  </div>
</template>
