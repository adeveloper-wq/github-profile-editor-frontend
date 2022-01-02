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
    SocialMediaLinks,
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
    async sendFileToGithub(name, base64, email) {
      await this.octokit
        .request("PUT /repos/{owner}/{repo}/contents/{path}", {
          owner: this.user.login,
          repo: this.user.login,
          path: `img/${name}.png`,
          message: `Upload image img/${name}.png`,
          content: base64.split(",")[1],
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
    },
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
            await this.sendFileToGithub(
              item.object.name,
              item.object.base64,
              email
            );
          }
        }
        /*         if (item.object.type === "SOCIAL_MEDIA") {
          if (item.object.data.instagramUrl !== undefined) {
            const instagramIconBase64 = "data:image/png;base64,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";
            if (forGit) {
              this.convertedMarkdownForGit =
                this.convertedMarkdownForGit +
                `
                [<img src="${instagramIconBase64}" alt="Instagram-Image" />](${item.object.data.instagramUrl})
            `;
            } else {
              this.convertedMarkdown =
                this.convertedMarkdown +
                `
              <a target="_blank" rel="noopener noreferrer" href="${item.object.data.instagramUrl}">
                <img src="${instagramIconBase64}" alt="Instagram-Image" />
              </a>
            `;
            }
          }
          if (item.object.data.twitterUrl !== undefined) {
            const twitterIconBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAACLlBMVEUAAAAAv/8zmf8qqv8kkf8cm/AaofEXovMhpvMfn/Qeo/QcoPUbo/UcovAbnvEaofEao/Efn/IdoPEcovIcoPIbn/IdoPMdofMcoPAcofAdovEcoPIeoPIdoPIdofIcofIcovMcoPAcofAen/EdoPEcofEcoPEeoPIdofIdofEdoPIcoPIcofIcoPIcofIcofIdofIdofIcofIdofIdoPIdofIdofIcoPIcoPIcoPEdofEdoPEdoPIdoPIcofIcofIdoPEdofIcoPIcoPIdofIdoPIdoPIdofIcofEcoPEcofEdoPEdoPEdoPH////+///9/v/7/v/7/f/5/P/3/P/2+/71+/70+/7z+v7x+f7w+f7v+P7u+P7t+P7s9/7q9v7n9f7l9P7d8f3c8P3a8P3V7v3U7f3T7fzQ6/zP6/zO6/zM6vzK6fzG5/zF5/zE5vzC5vu95Pu24fu14Puz3/uw3vqt3fqr3Pqo2/qn2/qm2vql2fqh2Pqf1/me1vmZ1fmV0/mU0vmT0vmS0vmR0fmP0fmO0PmKzviIzviBy/h+yvh+yfh9yfh3x/d3xvdvw/duw/dmv/ZgvfZfvfZdvPZcu/Zbu/ZYuvVXufVTt/VSt/VQtvVOtfVNtfVLtPVGsvRFsvRCsPRBsPRAr/Q+r/Q9rvQ5rfQ3rPM1q/M0q/MvqPMsp/MppvMopfMnpfMmpfMlpPIkpPIjpPIio/Iho/IhovIgovIfovIeofIdofJJfzTCAAAATnRSTlMABAUGBxITFhcYGRscJCUmJyhOUFFTVldZWmBkZmdoamtsbW5vc3R3eICMjY6PkJG2t7nHyMnKy83Oz9DY29zd6+3u8fLz9PX4+fr7/P5cmvNJAAACRklEQVR4AY3BhV8TcRwG4NepkxADRSwM7BjDqYQ4BWE3ge2LgYHdXdjdrbO7ExVbEXj/Oz8s7ne3u8XzwCJziNvjnVdXN8/rcQ/ORArOMaU0KSl0IrHeRX5aaK5s2HOM9dGWf1IP2OhXwYRm9YVFno9J1AxEnKH1TCowAiYFTKkQBnkBphQYAF1ONdPg64+o7hVMS7kDEROZpvEIy9aYJl8WuhQxkbbXzz7TaAoAOP2M+UOjX+eaRGTbE7L16h+GaU4AY6g7fYfK9x0StuDkvsWXGDUKQCl16xbdpu6I6A60PmXETCAryJi/DdJwto0RLQskpnHzqneMCGZgCJWlIrL1OcNuibL6OWPy4aayV0SkoflRO8kroryhzgUPlXsSsebwjQcXRPlJXTHmUtf2+6TYWU7Fiyrqfqw8tFZsbKBSiVoqG8XWfirzUUvlmtgKUZmPKir/domdFiqVmEODbwfFag8NvPDQoPP+xSaJ95gGxXDT6LBY7KSRC4Np9Gm9xFnylkaDkBGk0ccdYhaiUTADKKFJ58Pzy0Q5RpPpAApp9mq7KCc6aDISgFOj8iG0W5TGmzTTnADgYkTH7U0Lxaj5PeNMRpdsjVFfr2+RmBVHXzJeTSbCJlD5cvfyqUPHz4RetNNqHCIc5UxLmQNROdVMg68fdAMDTCmQC4PhTCU4DCZD65lUoABxBtQwiepcWPQpZ0JlObDRbWwNbfkndYe9rKkaLbQpmUjMOXpGkAbB6aN6IoVe+a5ps6tqa6tmT3Pl90K8/zdbSyOGg+7wAAAAAElFTkSuQmCC";
            if (forGit) {
              this.convertedMarkdownForGit =
                this.convertedMarkdownForGit +
                `
              <a target="_blank" rel="noopener noreferrer" href="${item.object.data.twitterUrl}">
                <img src="${twitterIconBase64}" alt="Twitter-Image" />
              </a>
            `;
            } else {
              this.convertedMarkdown =
                this.convertedMarkdown +
                `
              <a target="_blank" rel="noopener noreferrer" href="${item.object.data.twitterUrl}">
                <img src="${twitterIconBase64}" alt="Twitter-Image" />
              </a>
            `;
            }
          }
          if (item.object.data.youtubeUrl !== undefined) {
            const youtubeIconBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAADWUlEQVRogd2aTUsbQRjHA1Yj6qlirFgVJK096wfw5aoWRajoqYcSS23soYVWvQTP2uhXUM+Cl0oUz7bWJgEvBZOTqEiMmL5gbUuePg8zC+uSmc1uJrubDvwu2Wdm/v9k5+WZic+noIDPdw+ZRFaQGHKEXCK/OZf8sxiPmaA6KvouRXQjMoN8RsAm+0iY2nJS+H1kGflZgnAjP5Ao0lpO4dXIK+S7QuFG6EuJIH7V4ruQZBmFG0kgD1WJHyvzty7iGzJaqvinyB8XxGv8RZ7bFT/lonAjYavix7h7t4Xrf4mRYsUHkZwHRBuhcfjITHwNODvbWCWOVMsMvPOASDPeiMS3AlsRrTXY0AAQCAB0dgIEgwA9PXIohmKpDtW19yq1FDKwLK3Y0QGwsACwsQGQSABks6CsUFvJJGub+qC+5CaWjOJpYybe2/T2AuRy6gSbFeqrr09mgN6URr2BGWGw3w9wduaceK1Qn7W1MhPTegPiLfHgoPPitTI8LDPwSRPfguSFgfPz7hmYm5MZIM3NZGBSOmDW1twzsLpqNpjHycCKNGhnx1qnh4cAm5tqDGxvmxmIkoGYNIimNytld5fV6++3XtdY4nEzAx/IQFoalE7bM0BUVQGEQgDn5/YMpFJmBo7IQFYadHJi34BGfT1AJAJwfW2treNjMwMZMnAjDbq4KN2ARlsbG5j5fHFtZTJmBn79FwYq/hVKVfoglk+jtPO0Y2BgoPRp9OCgqGm04heyCWnQ+roaMXaK+VbiCRloBq9u5mZnZeLZZo7vSPeFgUND7hmgvsUG9vT5QFgY6FZCc3rK+hYbeGFMKcUJPaV3TqaUV1csjRWLv51SchNR6YBpb7+d1NMqqapQW9SmltTTii0fvIvqjlVolW1qYkclRHe3+EiFnmlxVKeuzlpfDDq1Lnw9hQ/e2mjQaV4XFM8N0C1M3AMiRXwB2dEiN+Hlw90uqXidiVHw3vH646LE60yEPCCcoBX3mSXxOhNeuGKasiVeZ2IE2NTltPic5ddGYuIBODs70WwTVCJeZ+IOsIvucv4a2kV3jVLxBiN0lvoe7KzaYqitJXDyDyDANoAvkY8gyyfEUJ09ZBq565hwgZkAMg5sQ7iFfAV22nHDyfLPtngMxQZU9P0PfldJ4oGDHDsAAAAASUVORK5CYII=";
            if (forGit) {
              this.convertedMarkdownForGit =
                this.convertedMarkdownForGit +
                `
              <a target="_blank" rel="noopener noreferrer" href="${item.object.data.youtubeUrl}">
                <img src="${youtubeIconBase64}" alt="Youtube-Image" />
              </a>
            `;
            } else {
              this.convertedMarkdown =
                this.convertedMarkdown +
                `
              <a target="_blank" rel="noopener noreferrer" href="${item.object.data.youtubeUrl}">
                <img src="${youtubeIconBase64}" alt="Youtube-Image" />
              </a>
            `;
            }
          }
          if (item.object.data.linkedInUrl !== undefined) {
            const linkedInIconBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEMklEQVRogdVaW09TQRBeFby8GTXiNTHe/QE++OCD0cQ3lZiI+mSiAW9ojMA5BY0mGo0XrEZjCBpN9AFjDIrdU0BBQjQIFfACCEhtREVRlKS0RETtOrOlTS9n62ntOS2TTGh6dqffd2Z2dnYWQuIhOXQGkZStoBeIRCtBu4is9BOZDnsVPuN3/BmMkekWPiehIpdOBSD7QJ8BQBaTStQGms1tGSZ51jkA+jy8ycGYgYcpdQMRM8m3zNYPeGZjKoDeDz/kih/wUI/AS5GUoyTbOiG+4HPLl8APvNANeDiR5/B3cXzAS8pGXd+6WAeIZEn/T/B0G+ivBID36W/QnbGBz6NZCQQeElKQqaJ78xA2XvZ+IyuLnrLCxw5mfuJgq6/UG+8Jk7JBG3i5YiEwdgYaOFFjZx4PC5KLde+M9oKLmO4vjQz+yO3xJCTbrLnaEAbeJ+k3mwz2BG3m6VwcOlQOnVRse6+OHuTWy08JWBM0Rx087oK4I4ZMuN74QUigtPWz8QQwlPLLZ6rEPpQHKhM2lzwXEsi625IAD3AShSHgoZgS1DZjTAq729YbBr7K/o2Ny7cmhgCPlMACkFeV4gljTVb+tivf9HHg+y1tLCVh4H1eUPYEEoi9JE6cNowsXlgQMvUkAaBow8hDTGVphJ+kIgycfPQByyxtUdW041VBY9ffaFQdt+BMDX+O6wn3lZIXPayzz80+Dwyx1l4XewChmWttZ3NPVkdLJIN4j3jiQcvO1Qqz0IrLdUFj67r7VcdhJkOytY7vQlsog8O/2Z6yVu0E8BDEz6k6E0Av2L8NRgQfKNvvvNIaRlZYwMpbvQn0uoY0g0dxDv3ioavBA12Ygb7rTSAWwVStwQt9uAZ+GkXgD1SFzT1O9rCrjzn6I4cUbf+iJYSGDCPQ8dXNlhbW+sdiRtp1r0U4/qPzh0YCBoXQ8ktPVO3jzq4m6K3xBeUaQkimdr0JtH91Ce0XVHYK7U879lDDIjYgjZa97hXax0ORSP69sWEaNWAjwzOFyP7aazah/XmnHv3LA2bCG606Eyiq7xbaX1VcHzuBPLqJ8IIoQjGXvAR8xZz3LGwbhQSeBh7ms0chgd3BR0qVA33yEgg9Unq9YB5FBM5qbqskIYEB8fWUTKWkJyApB9XBo2DbDtt3yUpAUpoitxa5F4Kbu0lDADtyeFOkSfBmZKS9nlpgZfNP16jqxEPB1eKsE9Wq4yIVZZMOVwjtB/SeAItlnTbwfk/QTHEONlJhx5WUHdGB93siCa6Y8KbovwRvRjB1GQ2er8Now0YkuZZFodlJX/CQbTCZxFWO1KTwi249veG76MabIt2E91KVc6LaKcaF6uY9f0P/AYQXgMpeeGP1sTWHcQ6UxNgmP1AxxTjganKwcjrBRisWhJJSDsA6eLcDWza8bYOdD/gOn3mLxgw+Jw7yF4L4/rdOpIhPAAAAAElFTkSuQmCC";
            if (forGit) {
              this.convertedMarkdownForGit =
                this.convertedMarkdownForGit +
                `
              <a target="_blank" rel="noopener noreferrer" href="${item.object.data.linkedInUrl}">
                <img src="${linkedInIconBase64}" alt="LinkedIn-Image" />
              </a>
            `;
            } else {
              this.convertedMarkdown =
                this.convertedMarkdown +
                `
              <a target="_blank" rel="noopener noreferrer" href="${item.object.data.linkedInUrl}">
                <img src="${linkedInIconBase64}" alt="LinkedIn-Image" />
              </a>
            `;
            }
          } */
        /* if (item.object.type === "SOCIAL_MEDIA") {
          if (item.object.data.instagramUrl !== undefined) {
            if (forGit) {
              this.convertedMarkdownForGit =
                this.convertedMarkdownForGit +
                `
              <a target="_blank" rel="noopener noreferrer" href="${item.object.data.instagramUrl}">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"
                  />
                </svg>
              </a>
            `;
            } else {
              this.convertedMarkdown =
                this.convertedMarkdown +
                `
              <a target="_blank" rel="noopener noreferrer" href="${item.object.data.instagramUrl}">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"
                  />
                </svg>
              </a>
            `;
            }
          }
          if (item.object.data.twitterUrl !== undefined) {
            if (forGit) {
              this.convertedMarkdownForGit =
                this.convertedMarkdownForGit +
                `
              <a target="_blank" rel="noopener noreferrer" href="${item.object.data.twitterUrl}">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
                  />
                </svg>
              </a>
            `;
            } else {
              this.convertedMarkdown =
                this.convertedMarkdown +
                `
              <a target="_blank" rel="noopener noreferrer" href="${item.object.data.twitterUrl}">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
                  />
                </svg>
              </a>
            `;
            }
          }
          if (item.object.data.youtubeUrl !== undefined) {
            if (forGit) {
              this.convertedMarkdownForGit =
                this.convertedMarkdownForGit +
                `
              <a target="_blank" rel="noopener noreferrer" href="${item.object.data.youtubeUrl}">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                  />
                </svg>
              </a>
            `;
            } else {
              this.convertedMarkdown =
                this.convertedMarkdown +
                `
              <a target="_blank" rel="noopener noreferrer" href="${item.object.data.youtubeUrl}">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                  />
                </svg>
              </a>
            `;
            }
          }
          if (item.object.data.linkedInUrl !== undefined) {
            if (forGit) {
              this.convertedMarkdownForGit =
                this.convertedMarkdownForGit +
                `
              <a target="_blank" rel="noopener noreferrer" href="${item.object.data.linkedInUrl}">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                  />
                </svg>
              </a>
            `;
            } else {
              this.convertedMarkdown =
                this.convertedMarkdown +
                `
              <a target="_blank" rel="noopener noreferrer" href="${item.object.data.linkedInUrl}">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                  />
                </svg>
              </a>
            `;
            }
          } */
        if (item.object.type === "SOCIAL_MEDIA") {
          let links = [];
          if (item.object.data.instagramUrl !== undefined) {
            const instagramIconBase64 =
              "data:image/png;base64,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";
            if (forGit) {
              const name = "instagram_icon";
              const path = this.user.html_url + "/" + this.user.login + "/blob/main/img/" + name + ".png";
              this.sendFileToGithub(name, instagramIconBase64, email);
              links.push({path: path, url: item.object.data.instagramUrl, service: 'Instagram'});
              /* this.convertedMarkdownForGit =
                this.convertedMarkdownForGit +
                `[<img src="${path}" alt="Instagram-Icon" />](${item.object.data.instagramUrl})`; */
            } else {
              this.convertedMarkdown =
                this.convertedMarkdown +
                `
<a target="_blank" rel="noopener noreferrer" href="${item.object.data.instagramUrl}">
                <img src="${instagramIconBase64}" alt="Instagram-Image" />
              </a>
            `;
            }
          }
          if (item.object.data.twitterUrl !== undefined) {
            const twitterIconBase64 =
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAACLlBMVEUAAAAAv/8zmf8qqv8kkf8cm/AaofEXovMhpvMfn/Qeo/QcoPUbo/UcovAbnvEaofEao/Efn/IdoPEcovIcoPIbn/IdoPMdofMcoPAcofAdovEcoPIeoPIdoPIdofIcofIcovMcoPAcofAen/EdoPEcofEcoPEeoPIdofIdofEdoPIcoPIcofIcoPIcofIcofIdofIdofIcofIdofIdoPIdofIdofIcoPIcoPIcoPEdofEdoPEdoPIdoPIcofIcofIdoPEdofIcoPIcoPIdofIdoPIdoPIdofIcofEcoPEcofEdoPEdoPEdoPH////+///9/v/7/v/7/f/5/P/3/P/2+/71+/70+/7z+v7x+f7w+f7v+P7u+P7t+P7s9/7q9v7n9f7l9P7d8f3c8P3a8P3V7v3U7f3T7fzQ6/zP6/zO6/zM6vzK6fzG5/zF5/zE5vzC5vu95Pu24fu14Puz3/uw3vqt3fqr3Pqo2/qn2/qm2vql2fqh2Pqf1/me1vmZ1fmV0/mU0vmT0vmS0vmR0fmP0fmO0PmKzviIzviBy/h+yvh+yfh9yfh3x/d3xvdvw/duw/dmv/ZgvfZfvfZdvPZcu/Zbu/ZYuvVXufVTt/VSt/VQtvVOtfVNtfVLtPVGsvRFsvRCsPRBsPRAr/Q+r/Q9rvQ5rfQ3rPM1q/M0q/MvqPMsp/MppvMopfMnpfMmpfMlpPIkpPIjpPIio/Iho/IhovIgovIfovIeofIdofJJfzTCAAAATnRSTlMABAUGBxITFhcYGRscJCUmJyhOUFFTVldZWmBkZmdoamtsbW5vc3R3eICMjY6PkJG2t7nHyMnKy83Oz9DY29zd6+3u8fLz9PX4+fr7/P5cmvNJAAACRklEQVR4AY3BhV8TcRwG4NepkxADRSwM7BjDqYQ4BWE3ge2LgYHdXdjdrbO7ExVbEXj/Oz8s7ne3u8XzwCJziNvjnVdXN8/rcQ/ORArOMaU0KSl0IrHeRX5aaK5s2HOM9dGWf1IP2OhXwYRm9YVFno9J1AxEnKH1TCowAiYFTKkQBnkBphQYAF1ONdPg64+o7hVMS7kDEROZpvEIy9aYJl8WuhQxkbbXzz7TaAoAOP2M+UOjX+eaRGTbE7L16h+GaU4AY6g7fYfK9x0StuDkvsWXGDUKQCl16xbdpu6I6A60PmXETCAryJi/DdJwto0RLQskpnHzqneMCGZgCJWlIrL1OcNuibL6OWPy4aayV0SkoflRO8kroryhzgUPlXsSsebwjQcXRPlJXTHmUtf2+6TYWU7Fiyrqfqw8tFZsbKBSiVoqG8XWfirzUUvlmtgKUZmPKir/domdFiqVmEODbwfFag8NvPDQoPP+xSaJ95gGxXDT6LBY7KSRC4Np9Gm9xFnylkaDkBGk0ccdYhaiUTADKKFJ58Pzy0Q5RpPpAApp9mq7KCc6aDISgFOj8iG0W5TGmzTTnADgYkTH7U0Lxaj5PeNMRpdsjVFfr2+RmBVHXzJeTSbCJlD5cvfyqUPHz4RetNNqHCIc5UxLmQNROdVMg68fdAMDTCmQC4PhTCU4DCZD65lUoABxBtQwiepcWPQpZ0JlObDRbWwNbfkndYe9rKkaLbQpmUjMOXpGkAbB6aN6IoVe+a5ps6tqa6tmT3Pl90K8/zdbSyOGg+7wAAAAAElFTkSuQmCC";
            if (forGit) {
              const name = "twitter_icon";
              const path = this.user.html_url + "/" + this.user.login + "/blob/main/img/" + name + ".png";
              this.sendFileToGithub(name, twitterIconBase64, email);
              links.push({path: path, url: item.object.data.twitterUrl, service: 'Twitter'});
/*               this.convertedMarkdownForGit =
                this.convertedMarkdownForGit +
                `[<img src="${path}" alt="Twitter-Icon" />](${item.object.data.twitterUrl})`; */
            } else {
              this.convertedMarkdown =
                this.convertedMarkdown +
                `
              <a target="_blank" rel="noopener noreferrer" href="${item.object.data.twitterUrl}">
                <img src="${twitterIconBase64}" alt="Twitter-Image" />
              </a>
            `;
            }
          }
          if (item.object.data.youtubeUrl !== undefined) {
            const youtubeIconBase64 =
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAADWUlEQVRogd2aTUsbQRjHA1Yj6qlirFgVJK096wfw5aoWRajoqYcSS23soYVWvQTP2uhXUM+Cl0oUz7bWJgEvBZOTqEiMmL5gbUuePg8zC+uSmc1uJrubDvwu2Wdm/v9k5+WZic+noIDPdw+ZRFaQGHKEXCK/OZf8sxiPmaA6KvouRXQjMoN8RsAm+0iY2nJS+H1kGflZgnAjP5Ao0lpO4dXIK+S7QuFG6EuJIH7V4ruQZBmFG0kgD1WJHyvzty7iGzJaqvinyB8XxGv8RZ7bFT/lonAjYavix7h7t4Xrf4mRYsUHkZwHRBuhcfjITHwNODvbWCWOVMsMvPOASDPeiMS3AlsRrTXY0AAQCAB0dgIEgwA9PXIohmKpDtW19yq1FDKwLK3Y0QGwsACwsQGQSABks6CsUFvJJGub+qC+5CaWjOJpYybe2/T2AuRy6gSbFeqrr09mgN6URr2BGWGw3w9wduaceK1Qn7W1MhPTegPiLfHgoPPitTI8LDPwSRPfguSFgfPz7hmYm5MZIM3NZGBSOmDW1twzsLpqNpjHycCKNGhnx1qnh4cAm5tqDGxvmxmIkoGYNIimNytld5fV6++3XtdY4nEzAx/IQFoalE7bM0BUVQGEQgDn5/YMpFJmBo7IQFYadHJi34BGfT1AJAJwfW2treNjMwMZMnAjDbq4KN2ARlsbG5j5fHFtZTJmBn79FwYq/hVKVfoglk+jtPO0Y2BgoPRp9OCgqGm04heyCWnQ+roaMXaK+VbiCRloBq9u5mZnZeLZZo7vSPeFgUND7hmgvsUG9vT5QFgY6FZCc3rK+hYbeGFMKcUJPaV3TqaUV1csjRWLv51SchNR6YBpb7+d1NMqqapQW9SmltTTii0fvIvqjlVolW1qYkclRHe3+EiFnmlxVKeuzlpfDDq1Lnw9hQ/e2mjQaV4XFM8N0C1M3AMiRXwB2dEiN+Hlw90uqXidiVHw3vH646LE60yEPCCcoBX3mSXxOhNeuGKasiVeZ2IE2NTltPic5ddGYuIBODs70WwTVCJeZ+IOsIvucv4a2kV3jVLxBiN0lvoe7KzaYqitJXDyDyDANoAvkY8gyyfEUJ09ZBq565hwgZkAMg5sQ7iFfAV22nHDyfLPtngMxQZU9P0PfldJ4oGDHDsAAAAASUVORK5CYII=";
            if (forGit) {
              const name = "youtube_icon";
              const path = this.user.html_url + "/" + this.user.login + "/blob/main/img/" + name + ".png";
              this.sendFileToGithub(name, youtubeIconBase64, email);
              links.push({path: path, url: item.object.data.youtubeUrl, service: 'Youtube'});
/*               this.convertedMarkdownForGit =
                this.convertedMarkdownForGit +
                `[<img src="${path}" alt="Youtube-Icon" />](${item.object.data.youtubeUrl})`; */
            } else {
              this.convertedMarkdown =
                this.convertedMarkdown +
                `
              <a target="_blank" rel="noopener noreferrer" href="${item.object.data.youtubeUrl}">
                <img src="${youtubeIconBase64}" alt="Youtube-Image" />
              </a>
            `;
            }
          }
          if (item.object.data.linkedInUrl !== undefined) {
            const linkedInIconBase64 =
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEMklEQVRogdVaW09TQRBeFby8GTXiNTHe/QE++OCD0cQ3lZiI+mSiAW9ojMA5BY0mGo0XrEZjCBpN9AFjDIrdU0BBQjQIFfACCEhtREVRlKS0RETtOrOlTS9n62ntOS2TTGh6dqffd2Z2dnYWQuIhOXQGkZStoBeIRCtBu4is9BOZDnsVPuN3/BmMkekWPiehIpdOBSD7QJ8BQBaTStQGms1tGSZ51jkA+jy8ycGYgYcpdQMRM8m3zNYPeGZjKoDeDz/kih/wUI/AS5GUoyTbOiG+4HPLl8APvNANeDiR5/B3cXzAS8pGXd+6WAeIZEn/T/B0G+ivBID36W/QnbGBz6NZCQQeElKQqaJ78xA2XvZ+IyuLnrLCxw5mfuJgq6/UG+8Jk7JBG3i5YiEwdgYaOFFjZx4PC5KLde+M9oKLmO4vjQz+yO3xJCTbrLnaEAbeJ+k3mwz2BG3m6VwcOlQOnVRse6+OHuTWy08JWBM0Rx087oK4I4ZMuN74QUigtPWz8QQwlPLLZ6rEPpQHKhM2lzwXEsi625IAD3AShSHgoZgS1DZjTAq729YbBr7K/o2Ny7cmhgCPlMACkFeV4gljTVb+tivf9HHg+y1tLCVh4H1eUPYEEoi9JE6cNowsXlgQMvUkAaBow8hDTGVphJ+kIgycfPQByyxtUdW041VBY9ffaFQdt+BMDX+O6wn3lZIXPayzz80+Dwyx1l4XewChmWttZ3NPVkdLJIN4j3jiQcvO1Qqz0IrLdUFj67r7VcdhJkOytY7vQlsog8O/2Z6yVu0E8BDEz6k6E0Av2L8NRgQfKNvvvNIaRlZYwMpbvQn0uoY0g0dxDv3ioavBA12Ygb7rTSAWwVStwQt9uAZ+GkXgD1SFzT1O9rCrjzn6I4cUbf+iJYSGDCPQ8dXNlhbW+sdiRtp1r0U4/qPzh0YCBoXQ8ktPVO3jzq4m6K3xBeUaQkimdr0JtH91Ce0XVHYK7U879lDDIjYgjZa97hXax0ORSP69sWEaNWAjwzOFyP7aazah/XmnHv3LA2bCG606Eyiq7xbaX1VcHzuBPLqJ8IIoQjGXvAR8xZz3LGwbhQSeBh7ms0chgd3BR0qVA33yEgg9Unq9YB5FBM5qbqskIYEB8fWUTKWkJyApB9XBo2DbDtt3yUpAUpoitxa5F4Kbu0lDADtyeFOkSfBmZKS9nlpgZfNP16jqxEPB1eKsE9Wq4yIVZZMOVwjtB/SeAItlnTbwfk/QTHEONlJhx5WUHdGB93siCa6Y8KbovwRvRjB1GQ2er8Now0YkuZZFodlJX/CQbTCZxFWO1KTwi249veG76MabIt2E91KVc6LaKcaF6uY9f0P/AYQXgMpeeGP1sTWHcQ6UxNgmP1AxxTjganKwcjrBRisWhJJSDsA6eLcDWza8bYOdD/gOn3mLxgw+Jw7yF4L4/rdOpIhPAAAAAElFTkSuQmCC";
            if (forGit) {
                const name = "linkedin_icon";
              const path = this.user.html_url + "/" + this.user.login + "/blob/main/img/" + name + ".png";
              this.sendFileToGithub(name, linkedInIconBase64, email);
              links.push({path: path, url: item.object.data.linkedInUrl, service: 'LinkedIn'});
/*               this.convertedMarkdownForGit =
                this.convertedMarkdownForGit +
                `[<img src="${path}" alt="LinkedIn-Icon" />](${item.object.data.linkedInUrl})`; */
            } else {
              this.convertedMarkdown =
                this.convertedMarkdown +
                `
              <a target="_blank" rel="noopener noreferrer" href="${item.object.data.linkedInUrl}">
                <img src="${linkedInIconBase64}" alt="LinkedIn-Image" />
              </a>
            `;
            }
          }
          if(forGit){
            if(links.length > 0){
              this.convertedMarkdownForGit = this.convertedMarkdownForGit + '<div>'
              for(let linkItem of links){
               /*  this.convertedMarkdownForGit =
                  this.convertedMarkdownForGit +
                  `[<img src="${linkItem.path}" alt="${linkItem.service}-Icon" />](${linkItem.url})`; */
                  this.convertedMarkdownForGit = this.convertedMarkdownForGit + `<a target="_blank" rel="noopener noreferrer" href="${linkItem.url}"><img src="${linkItem.path}" alt="${linkItem.service}-Image" /></a>&nbsp;&nbsp;`;
              }
              this.convertedMarkdownForGit = this.convertedMarkdownForGit + '</div>'
            }
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
            twitterUrl: undefined,
            instagramUrl: undefined,
            linkedInUrl: undefined,
            youtubeUrl: undefined,
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
                      <SocialMediaLinks
                        @twitter-url="element.object.data.twitterUrl = $event"
                        @instagram-url="
                          element.object.data.instagramUrl = $event
                        "
                        @youtube-url="element.object.data.youtubeUrl = $event"
                        @linkedin-url="element.object.data.linkedInUrl = $event"
                      />
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