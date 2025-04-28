<template>
  <div class="app-container">
    <!-- 主要内容区域 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const store = useStore();
const router = useRouter();

// 从store中获取认证状态和用户名
const isAuthenticated = computed(() => store.getters.isAuthenticated);
const username = computed(() => store.getters.username);

// 处理退出登录
const handleLogout = () => {
  store.dispatch('logout');
  ElMessage.success('已成功退出登录');
  router.push('/');
};
</script>

<style>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 重置一些基础样式 */
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}
</style>