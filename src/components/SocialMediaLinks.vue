<template>
  <div class="mx-2 mb-2 grid gap-2 grid-cols-1 grid-rows-4">
    <div
      class="
        bg-indigo-600
        w-full
        rounded-md
        flex flex-row
        items-center
        px-2
        pt-2
        pb-1
      "
    >
      <span class="text-white mr-2 font-bold">Twitter</span>
      <input
        placeholder="https://twitter.com/username"
        v-model="twitterUrl"
        class="
          mb-1
          w-full
          h-8
          px-2
          text-base text-gray-700
          placeholder-gray-600
          border
          rounded
          focus:shadow-outline
        "
      />
    </div>
    <div
      class="
        bg-indigo-600
        w-full
        rounded-md
        flex flex-row
        items-center
        px-2
        pt-2
        pb-1
      "
    >
      <span class="text-white mr-2 font-bold">Instagram</span>
      <input
        placeholder="https://www.instagram.com/username"
        v-model="instagramUrl"
        class="
          mb-1
          w-full
          h-8
          px-2
          text-base text-gray-700
          placeholder-gray-600
          border
          rounded
          focus:shadow-outline
        "
      />
    </div>
    <div
      class="
        bg-indigo-600
        w-full
        rounded-md
        flex flex-row
        items-center
        px-2
        pt-2
        pb-1
      "
    >
      <span class="text-white mr-2 font-bold">LinkedIn</span>
      <input
        placeholder="https://www.linkedin.com/in/username/"
        v-model="linkedInUrl"
        class="
          mb-1
          w-full
          h-8
          px-2
          text-base text-gray-700
          placeholder-gray-600
          border
          rounded
          focus:shadow-outline
        "
      />
    </div>
    <div
      class="
        bg-indigo-600
        w-full
        rounded-md
        flex flex-row
        items-center
        px-2
        pt-2
        pb-1
      "
    >
      <span class="text-white mr-2 font-bold">Youtube</span>
      <input
        placeholder="https://www.youtube.com/channel/channel_id"
        v-model="youtubeUrl"
        class="
          mb-1
          w-full
          h-8
          px-2
          text-base text-gray-700
          placeholder-gray-600
          border
          rounded
          focus:shadow-outline
        "
      />
    </div>
  </div>
</template>

<script>
export default {
    name: "Social Media Links",
    data() {
      return {
        instagramUrl: '',
        twitterUrl: '',
        youtubeUrl: '',
        linkedInUrl: ''
      }
    }, 
    watch: {
        instagramUrl: function(val) {
            this.$emit('instagram-url', val);
        },
        twitterUrl: function(val) {
            this.$emit('twitter-url', val);
        },
        youtubeUrl: function(val) {
            this.$emit('youtube-url', val);
        },
        linkedInUrl: function(val) {
            this.$emit('linkedin-url', val);
        },
    }
};
</script>