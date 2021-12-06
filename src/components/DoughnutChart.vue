<template>
  <div>
    <canvas :id="id"></canvas>
  </div>
</template>

<script>
import Chart from "chart.js/auto";

export default {
  name: "Chart",
  data() {
    return {
      id: "",
      chartData: {
        type: "doughnut",
        data: {
          labels: [],
          datasets: [
            {
              label: "",
              data: [],
              backgroundColor: [
                "rgb(255, 99, 132)",
                "rgb(54, 162, 235)",
                "rgb(255, 205, 86)",
              ],
              hoverOffset: 4,
            },
          ],
        },
      },
    };
  },
  props: {
    givenData: {
      type: Object,
      required: true,
    },
  },
  beforeMount() {
    this.id = Math.random().toString(16).slice(2);
    this.chartData.data.labels = this.givenData.labels;
    this.chartData.data.datasets[0].label = this.givenData.label;
    this.chartData.data.datasets[0].data = this.givenData.data;
  },
  mounted() {
    const ctx = document.getElementById(this.id);
    new Chart(ctx, this.chartData);
  },
};
</script>