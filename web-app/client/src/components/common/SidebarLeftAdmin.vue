<template>
  <nav :class="{'left_0': statusSidebar }">
    <div class="sidebar-sticky">
      <ul class="nav flex-column" v-if="!user"></ul>
      <functional-admin-academy v-else-if="user.role && user.role === 1"></functional-admin-academy>
      <functional-student v-else-if="user.role && user.role === 4"></functional-student>
    </div>
  </nav>
</template>

<script>
import { mapState } from "vuex";
import FunctionalAdminAcademy from "../admin-academy/FunctionalAdminAcademy";
import FunctionalStudent from "../student/FunctionalStudent";
export default {
  name: "sidebar-left",
  components: {
    FunctionalAdminAcademy,
    FunctionalStudent
  },
  computed: {
    ...mapState(["statusSidebar"]),
    ...mapState("account", ["user"])
  }
};
</script>
<style scoped>
</style>
