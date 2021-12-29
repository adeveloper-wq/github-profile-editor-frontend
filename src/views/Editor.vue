<script>
import { ref } from "vue";
import showdown from "showdown";
import ExternalItem from "@/components/ExternalItem.vue";
import draggable from "vuedraggable";
import { Octokit } from "https://cdn.skypack.dev/@octokit/core";
import Chart from "@/components/DoughnutChart.vue";
import ChooseItemModel from "@/components/ChooseItemModal.vue";
import SocialMediaLinks from "@/components/SocialMediaLinks.vue";
import axios from "axios";

const items = [
  /*   {
    type: "IMAGE",
    src: "https://images.twinkl.co.uk/tw1n/image/private/t_630/u/ux/graph-wiki_ver_1.png",
  }, */
  {
    type: "TEXT",
    text: "",
  },
  /*   {
    type: "IMAGE",
    src: "https://vizzlo.com/uploads/what-is-venn-1.jpg",
  },
  {
    type: "IMAGE",
    src: "https://cdn.hswstatic.com/gif/venn-diagram.jpg",
  },
  {
    type: "IMAGE",
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGr9dhCIv64pNAP96E7Hf6y0KrlxBZchYjJA&usqp=CAU",
  },
  {
    type: "IMAGE",
    src: "https://s3.amazonaws.com/thumbnails.venngage.com/template/ab4f6b2c-bd19-4a24-9648-47db694f4c20.png",
  }, */
  /*   {
    type: "TEXT",
    text: "",
  }, */
];

export default {
  name: "transition-example-2",
  display: "Transitions",
  order: 7,
  components: {
    ExternalItem,
    draggable,
    Chart,
    ChooseItemModel,
    SocialMediaLinks
  },

  data() {
    return {
      showChooseItemModel: false,
      markdown: "",
      convertedMarkdown: "",
      convertedMarkdownForGit: "",
      list: items.map((object, index) => {
        return { object, expanded: true, order: index + 1 };
      }),
      drag: false,
      collapsed: false,
      user: {},
      octokit: new Octokit({
        auth: this.$route.query.access_token,
      }),
    };
  },

  methods: {
    async convertMarkdown(forGit, email) {
      const converter = new showdown.Converter();
      if (forGit) {
        this.convertedMarkdownForGit = "";
      } else {
        this.convertedMarkdown = "";
      }
      for (const item of this.list) {
        if (item.object.type === "TEXT") {
          if (forGit) {
            this.convertedMarkdownForGit =
              this.convertedMarkdownForGit +
              converter.makeHtml(item.object.text);
          } else {
            this.convertedMarkdown =
              this.convertedMarkdown + converter.makeHtml(item.object.text);
          }
        }
        if (item.object.type === "DOUGHNUT_CHART") {
          if (item.object.base64 === undefined) {
            let requestData = {
              type: "doughnut",
              data: {
                labels: item.object.data.labels,
                datasets: [
                  {
                    label: item.object.data.label,
                    data: item.object.data.data,
                    backgroundColor: [
                      "rgb(255, 99, 132)",
                      "rgb(54, 162, 235)",
                      "rgb(255, 205, 86)",
                    ],
                    hoverOffset: 4,
                  },
                ],
              },
            };
            await axios
              .get("http://localhost:8080/image", {
                params: {
                  data: requestData,
                },
              })
              .then((res) => {
                this.list[
                  this.list.findIndex((obj) => obj === item)
                ].object.base64 = res.data;
                const name_suffix = Date.now();
                this.list[
                  this.list.findIndex((obj) => obj === item)
                ].object.name = item.object.data.label + "_" + name_suffix;
                this.list[
                  this.list.findIndex((obj) => obj === item)
                ].object.imageUrlGithub =
                  this.user.html_url +
                  "/" +
                  this.user.login +
                  "/blob/main/img/" +
                  item.object.data.label +
                  "_" +
                  name_suffix +
                  ".png";
              });
            if (forGit) {
              this.convertedMarkdown =
                this.convertedMarkdown +
                converter.makeHtml(
                  `![${item.object.data.label}](${item.object.imageUrlGithub})`
                );
            } else {
              this.convertedMarkdownForGit =
                this.convertedMarkdownForGit +
                converter.makeHtml(
                  `![${item.object.data.label}](${item.object.base64})`
                );
            }
          } else {
            if (forGit) {
              this.convertedMarkdownForGit =
                this.convertedMarkdownForGit +
                converter.makeHtml(
                  `![${item.object.data.label}](${item.object.imageUrlGithub})`
                );
            } else {
              this.convertedMarkdown =
                this.convertedMarkdown +
                converter.makeHtml(
                  `![${item.object.data.label}](${item.object.base64})`
                );
            }
          }
          if (forGit) {
            await this.octokit
              .request("PUT /repos/{owner}/{repo}/contents/{path}", {
                owner: this.user.login,
                repo: this.user.login,
                path: `img/${item.object.name}.png`,
                message: `Upload image img/${item.object.name}.png`,
                content: item.object.base64.split(",")[1],
                committer: {
                  name: this.user.login,
                  email: email,
                },
              })
              .then((response) => {
                console.log(response);
              })
              .catch((err) => {
                console.log(err);
              });
          }
        }
      }
    },
    async sendToGit() {
      const emails = await this.octokit.request("/user/emails");
      const email = emails.data.filter((email) => email.primary === true)[0]
        .email;
      await this.convertMarkdown(true, email);
      let name = this.user.login;
      let createNew = false;
      await this.octokit
        .request("GET /repos/{owner}/{repo}", {
          owner: name,
          repo: name,
        })
        .then((response) => {
          console.log(response);
        })
        .catch((err) => {
          console.log(err);
          createNew = true;
        });

      if (createNew) {
        await this.octokit
          .request("POST /user/repos", {
            name: name,
          })
          .then((response) => {
            console.log(response);
          })
          .catch((err) => {
            console.log(err);
          });
      }

      let readMeExists = false;
      let sha = "";

      await this.octokit
        .request("GET /repos/{owner}/{repo}/contents/{path}", {
          owner: name,
          repo: name,
          path: "README.md",
        })
        .then((response) => {
          readMeExists = true;
          sha = response.data.sha;
          console.log(response);
        })
        .catch((err) => {
          console.log(err);
          readMeExists = false;
        });

      console.log(this.convertedMarkdownForGit);

      if (readMeExists) {
        await this.octokit
          .request("PUT /repos/{owner}/{repo}/contents/{path}", {
            owner: name,
            repo: name,
            path: "README.md",
            message: "Update Github profile",
            content: btoa(this.convertedMarkdownForGit),
            sha: sha,
            committer: {
              name: name,
              email: email,
            },
          })
          .then((response) => {
            console.log(response);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        await this.octokit
          .request("PUT /repos/{owner}/{repo}/contents/{path}", {
            owner: name,
            repo: name,
            path: "README.md",
            message: "Update Github profile",
            content: btoa(this.convertedMarkdownForGit),
            committer: {
              name: name,
              email: email,
            },
          })
          .then((response) => {
            console.log(response);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },

    addText() {
      this.list.push({
        object: {
          type: "TEXT",
          text: "",
        },
        expanded: true,
        order: this.list.length,
      });
    },
    addSocialMediaLinks() {
      this.list.push({
         object: {
          type: "SOCIAL_MEDIA",
          data: {
            twitterUsername: undefined,
            instagramUsername: undefined,
            linkedInUsername: undefined,
            youtubeUsername: undefined
          },
        },
        expanded: true,
        order: this.list.length,
      });
    },
    addPrivatePubliceReposChart() {
      this.list.push({
        object: {
          type: "DOUGHNUT_CHART",
          data: {
            label: "Private_Public_Repos",
            data: [this.user.owned_private_repos, this.user.public_repos],
            labels: ["Private Repos", "Public Repos"],
          },
          base64: undefined,
          name: undefined,
          imageUrlGithub: undefined,
        },
        expanded: true,
        order: this.list.length,
      });
    },
    deleteObject(object) {
      this.list = this.list.filter((item) => item !== object);
      this.convertMarkdown(false);
    },
    toggleCollapseExpand() {
      for (const item of this.list) {
        this.list[this.list.indexOf(item)].expanded = this.collapsed;
      }
      this.collapsed = !this.collapsed;
    },
    async getUser() {
      const { data } = await this.octokit.request("/user");
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
  <ChooseItemModel
    v-show="showChooseItemModel"
    @close-modal="showChooseItemModel = false"
    @private-public-repos-chart="
      addPrivatePubliceReposChart();
      showChooseItemModel = false;
    "
    @social-media-links="
      addSocialMediaLinks();
      showChooseItemModel = false;
    "
  />
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
              @change="convertMarkdown(false)"
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
                      v-if="element.object.type === 'IMAGE'"
                      v-bind:class="{ hidden: !element.expanded }"
                      :imgSrc="element.object.src"
                    />
                    <div
                      v-if="element.object.type === 'TEXT'"
                      v-bind:class="{ hidden: !element.expanded }"
                      class="mx-2"
                    >
                      <textarea
                        placeholder="Write Markdown"
                        v-model="element.object.text"
                        v-on:input="convertMarkdown(false)"
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
                    <div
                      v-bind:class="{ hidden: !element.expanded }"
                      class="bg-white p-2 rounded-b"
                      v-if="element.object.type === 'DOUGHNUT_CHART'"
                    >
                      <Chart :givenData="element.object.data" />
                    </div>
                    <div
                      v-bind:class="{ hidden: !element.expanded }"
                      v-if="element.object.type === 'SOCIAL_MEDIA'"
                      class="h-56"
                    >
                      <SocialMediaLinks/>
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
                v-on:click="showChooseItemModel = true"
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
        <button
          v-on:click="sendToGit"
          class="
            mt-10
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
          ➡️ Send to Github ➡️
        </button>
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