<template>
  <div>
    <div class="h-48 w-full bg-white rounded-b">
      <img class="h-48 p-2 rounded-xl" :src="imgSrc" />
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