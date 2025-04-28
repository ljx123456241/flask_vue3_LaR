<template>
  <div class="dashboard">
    <el-container>
      <el-aside width="220px">
        <el-menu
          :default-active="activeMenu"
          class="menu"
          router
          background-color="#001529"
          text-color="#fff"
          active-text-color="#409EFF">
          <el-menu-item index="/dashboard">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-sub-menu index="2">
            <template #title>
              <el-icon><PieChart /></el-icon>
              <span>数据可视化</span>
            </template>
            <el-menu-item index="/visualization/1">可视化 1</el-menu-item>
            <el-menu-item index="/visualization/2">可视化 2</el-menu-item>
            <el-menu-item index="/visualization/3">可视化 3</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="3">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/profile">个人信息</el-menu-item>
            <el-menu-item index="/settings">系统设置</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <div class="header-left">
            <div class="logo">数据可视化平台</div>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link">
                欢迎, {{ username }}
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
        <el-footer>
          <div class="footer">© 2023 数据可视化平台</div>
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { HomeFilled, PieChart, Setting, ArrowDown } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const store = useStore();

// 当前激活菜单
const activeMenu = computed(() => route.path);

// 获取用户名
const username = computed(() => store.getters.username);

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  if (command === 'logout') {
    store.dispatch('logout');
    router.push('/');
  } else if (command === 'profile') {
    router.push('/profile');
  }
};

onMounted(() => {
  // 检查是否已登录
  if (!store.getters.isAuthenticated) {
    router.push('/');
  }
});
</script>

<style scoped>
.dashboard {
  height: 100vh;
  width: 100%;
}

.menu {
  height: 100%;
  border-right: none;
}

.el-header {
  background-color: #fff;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 20px;
  height: 60px;
  line-height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  font-size: 18px;
  font-weight: bold;
  margin-right: 20px;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
  display: flex;
  align-items: center;
}

.el-aside {
  background-color: #001529;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
  height: calc(100vh - 120px);
  overflow-y: auto;
}

.el-footer {
  background-color: #f0f2f5;
  padding: 0;
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #666;
}

.footer {
  font-size: 14px;
}
</style> 