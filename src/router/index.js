import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import treeChart from "../components/TreeChart.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/treeChart",
      name: "treeChart",
      component: treeChart,
    },
    {
      path: "/about",
      name: "about",
      component: HomeView
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      //component: () => import("../views/AboutView.vue"),
    },
  ],
});

export default router;
