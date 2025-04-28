<template>
  <div class="dashboard-home">
    <div class="welcome-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <h2>欢迎使用数据可视化平台</h2>
          </div>
        </template>
        <div class="welcome-content">
          <el-row :gutter="20">
            <el-col :span="16">
              <div class="welcome-text">
                <p>欢迎您，{{ username }}！您可以通过左侧菜单访问各种功能。</p>
                <p>本平台提供了多种数据可视化工具，帮助您更好地理解和分析数据。</p>
                <el-button type="primary" @click="goToVisualization">开始探索可视化</el-button>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="welcome-image">
<!--                <img src="@/assets/dashboard.png" alt="Dashboard" />-->
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>

    <div class="quick-access">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" v-for="(item, index) in quickLinks" :key="index">
          <el-card class="quick-link-card" shadow="hover" @click="router.push(item.route)">
            <div class="quick-link-item">
              <el-icon :size="36" class="quick-link-icon">
                <component :is="item.icon"></component>
              </el-icon>
              <div class="quick-link-info">
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="recent-data">
      <el-card>
        <template #header>
          <div class="card-header">
            <h3>近期数据统计</h3>
          </div>
        </template>
        <div class="chart-container">
          <div ref="barChartRef" class="chart"></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import * as echarts from 'echarts';
import { 
  PieChart, 
  DataLine, 
  Reading, 
  TrendCharts, 
  Management, 
  User 
} from '@element-plus/icons-vue';

const router = useRouter();
const store = useStore();
const barChartRef = ref<HTMLElement | null>(null);
let barChart: echarts.ECharts | null = null;

// 获取用户名
const username = computed(() => store.getters.username);

// 快速链接数据
const quickLinks = [
  {
    title: '可视化图表1',
    description: '查看历史票房数据分析',
    icon: 'PieChart',
    route: '/visualization/1'
  },
  {
    title: '可视化图表2',
    description: '年度票房数据对比',
    icon: 'DataLine',
    route: '/visualization/2'
  },
  {
    title: '可视化图表3',
    description: '日票房数据趋势分析',
    icon: 'TrendCharts',
    route: '/visualization/3'
  }
];

// 跳转到可视化
const goToVisualization = () => {
  router.push('/visualization/1');
};

// 初始化图表
const initBarChart = () => {
  if (barChartRef.value) {
    barChart = echarts.init(barChartRef.value);
    
    const option = {
      title: {
        text: '近7日数据概览',
        left: 'center',
        textStyle: {
          fontSize: 16
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['访问量', '新增用户', '活跃度'],
        bottom: 0
      },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '访问量',
          type: 'bar',
          data: [120, 132, 101, 134, 90, 230, 210]
        },
        {
          name: '新增用户',
          type: 'bar',
          data: [20, 32, 21, 34, 29, 30, 40]
        },
        {
          name: '活跃度',
          type: 'line',
          data: [150, 232, 201, 154, 190, 330, 410]
        }
      ]
    };
    
    barChart.setOption(option);
  }
};

// 响应窗口大小变化
const handleResize = () => {
  barChart?.resize();
};

onMounted(() => {
  initBarChart();
  window.addEventListener('resize', handleResize);
});

// 组件卸载时移除事件监听
const onUnmounted = () => {
  window.removeEventListener('resize', handleResize);
  barChart?.dispose();
};
</script>

<style scoped>
.dashboard-home {
  margin-bottom: 20px;
}

.welcome-section {
  margin-bottom: 20px;
}

.welcome-content {
  display: flex;
  align-items: center;
}

.welcome-text {
  font-size: 16px;
  line-height: 1.6;
}

.welcome-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.welcome-image img {
  max-width: 100%;
  height: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-access {
  margin-bottom: 20px;
}

.quick-link-card {
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
}

.quick-link-card:hover {
  transform: translateY(-5px);
}

.quick-link-item {
  display: flex;
  align-items: center;
  padding: 10px;
}

.quick-link-icon {
  margin-right: 15px;
  color: #409EFF;
}

.quick-link-info h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.quick-link-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.chart-container {
  margin-top: 20px;
}

.chart {
  width: 100%;
  height: 400px;
}
</style> 