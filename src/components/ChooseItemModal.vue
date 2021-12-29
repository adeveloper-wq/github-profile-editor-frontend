<template>
  <div class="modal-overlay" @click="$emit('close-modal')">
    <div class="bg-white h-80 w-5/6 sm:w-3/6 mt-10 py-5 px-5 rounded-md" @click.stop>
      <button
      @click="$emit('private-public-repos-chart')"
        class="
          px-5
          py-3
          w-full
          font-medium
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
      >
        Private/Public repos ratio
      </button>
      <button
      @click="$emit('social-media-links')"
        class="
          mt-2
          px-5
          py-3
          w-full
          font-medium
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
      >
        Social media links
      </button>
      <button
        @click="$emit('close-modal')"
        class="
          flex flex-row
          justify-center
          mt-5
          px-5
          py-3
          w-full
          font-medium
          text-white
          transition
          duration-150
          ease-in-out
          bg-red-600
          border border-transparent
          rounded-md
          hover:bg-red-500
          focus:outline-none
        "
      >
        <CloseIcon class="mr-1" />Cancel
      </button>
    </div>
  </div>
</template>

<script>
import CloseIcon from "@/components/CloseIcon.vue";
export default {
  components: {
    CloseIcon,
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  background-color: #000000da;
}
</style>
