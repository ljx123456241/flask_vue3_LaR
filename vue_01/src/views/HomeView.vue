<template>
  <div class="home-container">
    <h1>数据可视化主页</h1>
    <div class="visualization-list">
      <Visualization1 />
      <Visualization2 />
      <Visualization3 />
    </div>
  </div>
</template>

<script setup lang="ts">
import Visualization1 from '../components/Visualization1.vue';
import Visualization2 from '../components/Visualization2.vue';
import Visualization3 from '../components/Visualization3.vue';
</script>

<style scoped>
.home-container {
  text-align: center;
  padding: 20px;
}
.visualization-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  margin-top: 20px;
}
</style>