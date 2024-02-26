import { createRouter, createWebHistory } from "vue-router";
import treeChart from "../components/TreeChart.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/treeChart",
      name: "treeChart",
      component: treeChart,
    },
  ],
});

export default router;
