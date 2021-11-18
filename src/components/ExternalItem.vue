<template>
  <div class="mx-2">
<div class=" h-48 w-full bg-white inline-flex rounded-b-xl">
    <img class="p-2 rounded-xl"
      :src="imgSrc"
    />
  </div>
  </div>
</template>
<script>
export default {
  props: {
    imgSrc: {
      type: String,
      required: true,
    },
  },
};
</script>