<template>
  <div class="visualization-view">
    <h2 class="page-title">数据可视化 {{ visualizationId }}</h2>
    
    <component :is="currentVisualization" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import Visualization1 from '@/components/Visualization1.vue';
import Visualization2 from '@/components/Visualization2.vue';
import Visualization3 from '@/components/Visualization3.vue';

const route = useRoute();

// 获取可视化ID
const visualizationId = computed(() => {
  const id = route.params.id as string;
  return id || '1';
});

// 当前显示的可视化组件
const currentVisualization = computed(() => {
  switch (visualizationId.value) {
    case '1':
      return Visualization1;
    case '2':
      return Visualization2;
    case '3':
      return Visualization3;
    default:
      return Visualization1;
  }
});
</script>

<style scoped>
.visualization-view {
  padding: 10px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}
</style> 