<script>
import { ref } from "vue";
import showdown from "showdown";
import ExternalItem from "@/components/ExternalItem.vue";
import draggable from "vuedraggable";
import { Octokit } from "https://cdn.skypack.dev/@octokit/core";
/* import { Octokit } from "@octokit/core"; */

const items = [
  {
    image: true,
    src: "https://images.twinkl.co.uk/tw1n/image/private/t_630/u/ux/graph-wiki_ver_1.png",
  },
  {
    image: false,
    text: "",
  },
  {
    image: true,
    src: "https://vizzlo.com/uploads/what-is-venn-1.jpg",
  },
  {
    image: true,
    src: "https://cdn.hswstatic.com/gif/venn-diagram.jpg",
  },
  {
    image: true,
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGr9dhCIv64pNAP96E7Hf6y0KrlxBZchYjJA&usqp=CAU",
  },
  {
    image: true,
    src: "https://s3.amazonaws.com/thumbnails.venngage.com/template/ab4f6b2c-bd19-4a24-9648-47db694f4c20.png",
  },
  {
    image: false,
    text: "",
  },
];

export default {
  name: "transition-example-2",
  display: "Transitions",
  order: 7,
  components: {
    ExternalItem,
    draggable,
  },

  data() {
    return {
      markdown: "",
      convertedMarkdown: "",
      list: items.map((object, index) => {
        return { object, expanded: true, order: index + 1 };
      }),
      drag: false,
      collapsed: false,
      user: {},
    };
  },

  methods: {
    convertMarkdown() {
      const converter = new showdown.Converter();
      this.convertedMarkdown = "";
      for (const item of this.list) {
        if (!item.object.image) {
          this.convertedMarkdown =
            this.convertedMarkdown + converter.makeHtml(item.object.text);
        }
      }
    },
    addText() {
      this.list.push({
        object: {
          image: false,
          text: "",
        },
        expanded: true,
        order: this.list.length,
      });
    },
    deleteObject(object) {
      this.list = this.list.filter((item) => item !== object);
      this.convertMarkdown();
    },
    toggleCollapseExpand() {
      for (const item of this.list) {
        this.list[this.list.indexOf(item)].expanded = this.collapsed;
      }
      this.collapsed = !this.collapsed;
    },
    async getUser() {
      const octokit = new Octokit({
        auth: this.$route.query.access_token,
      });

      const { data } = await octokit.request("/user");
      this.user = data;
      console.log(data);
    },
  },

  computed: {
    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost",
      };
    },
  },

  beforeCreate() {
    if (
      this.$route.query.access_token === undefined ||
      this.$route.query.access_token.length < 1
    ) {
      this.$router.push("/");
    }
  },

  mounted() {
    this.getUser();
  },
};
</script>

<template>
  <header class="bg-white shadow" v-if="$route.meta.title">
    <div class="px-4 py-2 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="float-left flex items-center flex-row gap-4">
          <h1 class="text-3xl font-bold text-gray-900">
            {{ $route.meta.title }}
          </h1>
          <a
            target="_blank"
            :href="user.html_url"
            class="
              flex flex-row
              gap-4
              px-3
              py-2
              rounded
              bg-indigo-100
              shadow
              transition
              duration-150
              ease-in-out
              hover:bg-indigo-200
              focus:outline-none
            "
          >
            <img
              v-if="user.avatar_url !== undefined"
              class="rounded-full w-12"
              :src="user.avatar_url"
            />
            <div class="flex flex-col">
              <span
                class="text-md font-bold text-gray-900"
                v-if="user.name !== null"
              >
                {{ user.name }}
              </span>
              <span class="text-gray-600">{{ user.login }}</span>
            </div>
          </a>
        </div>
        <router-link
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
          lg:py-16 lg:px-8 lg:block lg:items-center lg:justify-between
        "
      >
        <div class="w-full grid grid-cols-2 gap-4">
          <div>
            <button
              v-on:click="toggleCollapseExpand"
              class="
                mb-5
                px-5
                py-3
                w-full
                flex
                justify-between
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
              <span v-if="!collapsed">Collapse all</span>
              <span v-else>Expand all</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  v-if="!collapsed"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M18 12H6"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </button>
            <draggable
              class="list-group border-l-4 pl-3 border-gray-400"
              tag="transition-group"
              :component-data="{
                tag: 'ul',
                type: 'transition-group',
                name: !drag ? 'flip-list' : null,
              }"
              v-model="list"
              @change="convertMarkdown"
              v-bind="dragOptions"
              @start="drag = true"
              @end="drag = false"
              item-key="order"
            >
              <template #item="{ element }">
                <li class="list-group-item">
                  <div class="mt-2 shadow bg-gray-800 rounded">
                    <div class="w-full flex justify-between px-2 pt-2">
                      <span class="text-gray-100">Test</span>
                      <div>
                        <button
                          v-on:click="element.expanded = !element.expanded"
                          class="
                            mr-1
                            font-medium
                            text-white
                            transition
                            duration-150
                            ease-in-out
                            bg-indigo-200
                            border border-transparent
                            rounded-full
                            hover:bg-indigo-500
                            focus:outline-none
                          "
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              v-if="element.expanded"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M18 12H6"
                            />
                            <path
                              v-else
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                            />
                          </svg>
                        </button>
                        <button
                          v-on:click="deleteObject(element)"
                          class="
                            font-medium
                            text-white
                            transition
                            duration-150
                            ease-in-out
                            bg-red-200
                            border border-transparent
                            rounded-full
                            hover:bg-red-600
                            focus:outline-none
                          "
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <ExternalItem
                      v-if="element.object.image"
                      v-bind:class="{ hidden: !element.expanded }"
                      :imgSrc="element.object.src"
                    />
                    <div
                      v-else
                      v-bind:class="{ hidden: !element.expanded }"
                      class="mx-2"
                    >
                      <textarea
                        placeholder="Write Markdown"
                        v-model="element.object.text"
                        v-on:input="convertMarkdown"
                        rows="10"
                        class="
                          mb-1
                          w-full
                          text-base text-gray-700
                          placeholder-gray-600
                          border
                          rounded
                          focus:shadow-outline
                        "
                      ></textarea>
                    </div>
                  </div>
                </li>
              </template>
            </draggable>
            <div class="w-full grid grid-cols-2 gap-4">
              <button
                v-on:click="addText"
                class="
                  mt-5
                  px-5
                  py-3
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
                Add text
              </button>
              <button
                class="
                  mt-5
                  px-5
                  py-3
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
                Add other
              </button>
            </div>
          </div>
          <div>
            <p class="prose" v-html="convertedMarkdown"></p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style>
.button {
  margin-top: 35px;
}
.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.list-group {
  min-height: 20px;
}
.list-group-item {
  cursor: move;
}
.list-group-item i {
  cursor: pointer;
}
</style>