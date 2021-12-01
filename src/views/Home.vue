<script>
import LoginButton from "@/components/LoginButton.vue";
import { useToast } from "vue-toastification";

export default {
  setup(){
    const toast = useToast();
    return { toast };
  },

  components: {
    LoginButton
  },

  data() {
    return {
      
    };
  },

  methods: {
    showErrorToast(message){
      console.log(message);
      this.toast.error(message);
    }
  },

  mounted() {
    if (
        this.$route.query.error !== undefined &&
        this.$route.query.error.length > 0
      ) {
        this.showErrorToast(this.$route.query.error);
      }
  },
};
</script>

<template>
<header class="bg-white shadow" v-if="$route.meta.title">
  <div class="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-12">
        <div class="float-left">
          <h1 class="text-3xl font-bold text-gray-900">{{ $route.meta.title }} </h1>
        </div>
      </div>
      </div>
    </header>
    <main>
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
    </main>
</template>
