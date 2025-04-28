<template>
  <el-card>
    <template #header>
      <div class="header">
        <h2>历史票房数据分析</h2>
        <el-button type="primary" size="small" @click="fetchData">刷新数据</el-button>
      </div>
    </template>
    
    <div class="content">
      <div v-if="loading" class="loading">
        <el-skeleton animated :rows="6" />
      </div>
      <div v-else>
        <div class="chart-container">
          <div ref="chartRef" class="chart"></div>
        </div>
        
        <el-divider />
        
        <div class="data-table">
          <h3>历史票房排行榜</h3>
          <el-table :data="tableData" stripe style="width: 100%">
            <el-table-column prop="rank" label="排名" width="80" />
            <el-table-column prop="name" label="电影名称" />
            <el-table-column prop="boxOffice" label="总票房" sortable />
            <el-table-column prop="releaseDate" label="上映日期" width="120" />
          </el-table>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import * as echarts from 'echarts';

// 状态变量
const loading = ref(true);
const chartRef = ref<HTMLElement | null>(null);
const tableData = ref<any[]>([]);
let chart: echarts.ECharts | null = null;

// 获取数据
const fetchData = async () => {
  loading.value = true;
  try {
    const response = await axios.get('http://localhost:5000/api/movie-boxoffice/data?type=history');
    if (response.data.message === 'success') {
      const data = response.data.data;
      
      // 处理表格数据
      tableData.value = data.slice(0, 10).map((item: any, index: number) => ({
        rank: index + 1,
        name: item.movie_name,
        boxOffice: item.box_office + '万',
        releaseDate: item.release_date || '未知'
      }));
      
      // 初始化图表
      initChart(data);
    }
  } catch (error) {
    console.error('获取数据失败:', error);
    // 模拟数据
    mockData();
  } finally {
    loading.value = false;
  }
};

// 初始化图表
const initChart = (data: any[]) => {
  if (!chartRef.value) return;
  
  // 提取前10名电影数据
  const top10 = data.slice(0, 10);
  const movieNames = top10.map((item: any) => item.movie_name);
  const boxOffice = top10.map((item: any) => parseFloat(item.box_office));
  
  // 初始化ECharts实例
  if (!chart) {
    chart = echarts.init(chartRef.value);
  }
  
  // 设置图表选项
  const option = {
    title: {
      text: '历史票房TOP10电影',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c} 万元'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '票房（万元）'
    },
    yAxis: {
      type: 'category',
      data: movieNames.reverse(),
      axisLabel: {
        width: 120,
        overflow: 'truncate'
      }
    },
    series: [
      {
        name: '票房',
        type: 'bar',
        data: boxOffice.reverse(),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }
    ]
  };
  
  // 渲染图表
  chart.setOption(option);
};

// 模拟数据（当API请求失败时使用）
const mockData = () => {
  // 模拟表格数据
  tableData.value = [
    { rank: 1, name: '战狼2', boxOffice: '56.84亿', releaseDate: '2017-07-27' },
    { rank: 2, name: '你好，李焕英', boxOffice: '54.13亿', releaseDate: '2021-02-12' },
    { rank: 3, name: '长津湖', boxOffice: '53.48亿', releaseDate: '2021-09-30' },
    { rank: 4, name: '流浪地球', boxOffice: '46.86亿', releaseDate: '2019-02-05' },
    { rank: 5, name: '复仇者联盟4：终局之战', boxOffice: '42.5亿', releaseDate: '2019-04-24' },
    { rank: 6, name: '红海行动', boxOffice: '36.5亿', releaseDate: '2018-02-16' },
    { rank: 7, name: '唐人街探案3', boxOffice: '36.3亿', releaseDate: '2021-02-12' },
    { rank: 8, name: '我和我的家乡', boxOffice: '28.3亿', releaseDate: '2020-10-01' },
    { rank: 9, name: '长城', boxOffice: '25.2亿', releaseDate: '2016-12-16' },
    { rank: 10, name: '复仇者联盟3：无限战争', boxOffice: '23.9亿', releaseDate: '2018-05-11' }
  ];
  
  // 模拟图表数据
  const mockChartData = tableData.value.map(item => ({
    movie_name: item.name,
    box_office: item.boxOffice.replace('亿', '') * 10000
  })).reverse();
  
  initChart(mockChartData);
};

// 处理窗口大小变化
const handleResize = () => {
  chart?.resize();
};

onMounted(() => {
  fetchData();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chart?.dispose();
});
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content {
  min-height: 400px;
}

.loading {
  padding: 40px 20px;
}

.chart-container {
  margin-top: 20px;
  margin-bottom: 20px;
}

.chart {
  width: 100%;
  height: 400px;
}

.data-table {
  margin-top: 20px;
}
</style>