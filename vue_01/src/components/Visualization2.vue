<template>
  <el-card>
    <template #header>
      <div class="header">
        <h2>年度票房数据对比</h2>
        <div class="header-controls">
          <el-select v-model="selectedYear" placeholder="选择年份" @change="handleYearChange">
            <el-option
              v-for="year in availableYears"
              :key="year"
              :label="year + '年'"
              :value="year"
            />
          </el-select>
          <el-button type="primary" size="small" @click="fetchData">刷新数据</el-button>
        </div>
      </div>
    </template>
    
    <div class="content">
      <div v-if="loading" class="loading">
        <el-skeleton animated :rows="6" />
      </div>
      <div v-else>
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="环形图" name="pie">
            <div class="chart-container">
              <div ref="pieChartRef" class="chart"></div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="柱状图" name="bar">
            <div class="chart-container">
              <div ref="barChartRef" class="chart"></div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="排行榜" name="table">
            <div class="data-table">
              <el-table :data="tableData" stripe style="width: 100%">
                <el-table-column prop="rank" label="排名" width="80" />
                <el-table-column prop="name" label="电影名称" />
                <el-table-column prop="boxOffice" label="票房" sortable />
                <el-table-column prop="percentage" label="占比">
                  <template #default="scope">
                    <el-progress :percentage="scope.row.percentage" :color="getProgressColor(scope.row.percentage)" />
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import axios from 'axios';
import * as echarts from 'echarts';

// 状态变量
const loading = ref(true);
const pieChartRef = ref<HTMLElement | null>(null);
const barChartRef = ref<HTMLElement | null>(null);
const tableData = ref<any[]>([]);
const activeTab = ref('pie');
const selectedYear = ref(new Date().getFullYear());
const availableYears = reactive([2025, 2024, 2023, 2022, 2021]);

let pieChart: echarts.ECharts | null = null;
let barChart: echarts.ECharts | null = null;

// 获取颜色
const getProgressColor = (percentage: number) => {
  if (percentage < 20) return '#909399';
  if (percentage < 40) return '#e6a23c';
  if (percentage < 60) return '#1989fa';
  if (percentage < 80) return '#67c23a';
  return '#f56c6c';
};

// 处理年份变化
const handleYearChange = () => {
  fetchData();
};

// 处理标签页切换
const handleTabChange = (tabName: string) => {
  if (tabName === 'pie') {
    setTimeout(() => pieChart?.resize(), 200);
  } else if (tabName === 'bar') {
    setTimeout(() => barChart?.resize(), 200);
  }
};

// 获取数据
const fetchData = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`http://localhost:5000/api/movie-boxoffice/data?type=yearly&year=${selectedYear.value}`);
    if (response.data.message === 'success') {
      const data = response.data.data;
      
      // 处理表格数据
      const movies = data.slice(0, 10);
      const totalBoxOffice = movies.reduce((sum: number, item: any) => sum + parseFloat(item.box_office), 0);
      
      tableData.value = movies.map((item: any, index: number) => {
        const boxOffice = parseFloat(item.box_office);
        const percentage = Math.round((boxOffice / totalBoxOffice) * 100);
        
        return {
          rank: index + 1,
          name: item.movie_name,
          boxOffice: boxOffice + '万',
          percentage: percentage
        };
      });
      
      // 初始化图表
      initPieChart(movies, totalBoxOffice);
      initBarChart(movies);
    }
  } catch (error) {
    console.error('获取数据失败:', error);
    // 模拟数据
    mockData();
  } finally {
    loading.value = false;
  }
};

// 初始化饼图
const initPieChart = (data: any[], total: number) => {
  if (!pieChartRef.value) return;
  
  // 准备数据
  const chartData = data.map((item: any) => {
    const value = parseFloat(item.box_office);
    return {
      name: item.movie_name,
      value: value
    };
  });
  
  // 初始化ECharts实例
  if (!pieChart) {
    pieChart = echarts.init(pieChartRef.value);
  }
  
  // 设置图表选项
  const option = {
    title: {
      text: `${selectedYear.value}年度票房分布`,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}万元 ({d}%)'
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 20,
      bottom: 20,
      data: data.map((item: any) => item.movie_name)
    },
    series: [
      {
        name: '票房数据',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData
      }
    ]
  };
  
  // 渲染图表
  pieChart.setOption(option);
};

// 初始化柱状图
const initBarChart = (data: any[]) => {
  if (!barChartRef.value) return;
  
  // 准备数据
  const movieNames = data.map((item: any) => item.movie_name);
  const boxOffice = data.map((item: any) => parseFloat(item.box_office));
  
  // 初始化ECharts实例
  if (!barChart) {
    barChart = echarts.init(barChartRef.value);
  }
  
  // 设置图表选项
  const option = {
    title: {
      text: `${selectedYear.value}年度票房TOP10`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c}万元'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: movieNames,
      axisLabel: {
        interval: 0,
        rotate: 30,
        textStyle: {
          fontSize: 12
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '票房（万元）'
    },
    series: [
      {
        name: '票房',
        type: 'bar',
        data: boxOffice,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#2378f7' },
              { offset: 0.7, color: '#2378f7' },
              { offset: 1, color: '#83bff6' }
            ])
          }
        }
      }
    ]
  };
  
  // 渲染图表
  barChart.setOption(option);
};

// 模拟数据（当API请求失败时使用）
const mockData = () => {
  // 模拟表格数据
  const mockMovies = [
    { movie_name: '长津湖', box_office: '53.48' },
    { movie_name: '你好，李焕英', box_office: '54.13' },
    { movie_name: '唐人街探案3', box_office: '36.3' },
    { movie_name: '我和我的家乡', box_office: '28.3' },
    { movie_name: '速度与激情9', box_office: '13.9' },
    { movie_name: '哥斯拉大战金刚', box_office: '12.3' },
    { movie_name: '长津湖之水门桥', box_office: '9.86' },
    { movie_name: '速度与激情10', box_office: '8.92' },
    { movie_name: '复仇者联盟：终局之战', box_office: '42.5' },
    { movie_name: '流浪地球', box_office: '46.86' }
  ];
  
  const totalBoxOffice = mockMovies.reduce((sum, item) => sum + parseFloat(item.box_office), 0);
  
  tableData.value = mockMovies.map((item, index) => {
    const boxOffice = parseFloat(item.box_office);
    const percentage = Math.round((boxOffice / totalBoxOffice) * 100);
    
    return {
      rank: index + 1,
      name: item.movie_name,
      boxOffice: boxOffice + '亿',
      percentage: percentage
    };
  });
  
  // 初始化图表
  initPieChart(mockMovies, totalBoxOffice);
  initBarChart(mockMovies);
};

// 处理窗口大小变化
const handleResize = () => {
  if (activeTab.value === 'pie') {
    pieChart?.resize();
  } else if (activeTab.value === 'bar') {
    barChart?.resize();
  }
};

onMounted(() => {
  fetchData();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  pieChart?.dispose();
  barChart?.dispose();
});
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-controls {
  display: flex;
  gap: 10px;
}

.content {
  min-height: 500px;
}

.loading {
  padding: 40px 20px;
}

.chart-container {
  margin: 20px 0;
}

.chart {
  width: 100%;
  height: 400px;
}

.data-table {
  margin-top: 20px;
}
</style>