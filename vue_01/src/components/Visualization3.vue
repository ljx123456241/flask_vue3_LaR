<template>
  <el-card>
    <template #header>
      <div class="header">
        <h2>日票房趋势分析</h2>
        <el-button type="primary" size="small" @click="fetchData">刷新数据</el-button>
      </div>
    </template>
    
    <div class="content">
      <div v-if="loading" class="loading">
        <el-skeleton animated :rows="6" />
      </div>
      <div v-else>
        <div class="chart-filters">
          <el-radio-group v-model="chartType" @change="switchChartType">
            <el-radio-button label="line">折线图</el-radio-button>
            <el-radio-button label="area">面积图</el-radio-button>
            <el-radio-button label="stack">堆叠图</el-radio-button>
          </el-radio-group>
          
          <div class="date-range">
            <span>日期范围：</span>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="handleDateChange"
            />
          </div>
        </div>
        
        <div class="chart-container">
          <div ref="chartRef" class="chart"></div>
        </div>
        
        <el-divider />
        
        <div class="data-table">
          <h3>日票房详细数据</h3>
          <el-table :data="tableData" stripe style="width: 100%">
            <el-table-column prop="date" label="日期" width="120" sortable />
            <el-table-column prop="weekday" label="星期" width="80" />
            <el-table-column prop="boxOffice" label="总票房" sortable />
            <el-table-column prop="movieCount" label="上映电影数" width="120" />
            <el-table-column prop="topMovie" label="当日冠军" />
            <el-table-column prop="topMovieBoxOffice" label="冠军票房" sortable />
          </el-table>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import axios from 'axios';
import * as echarts from 'echarts';

// 状态变量
const loading = ref(true);
const chartRef = ref<HTMLElement | null>(null);
const tableData = ref<any[]>([]);
const chartType = ref('line');
const dateRange = ref<[Date, Date] | null>(null);

let chart: echarts.ECharts | null = null;

// 格式化日期
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 获取过去14天的日期范围
const getDefaultDateRange = (): [Date, Date] => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 13); // 14天的范围（包括今天）
  return [start, end];
};

// 日期范围变化处理
const handleDateChange = () => {
  if (dateRange.value) {
    fetchData();
  }
};

// 切换图表类型
const switchChartType = () => {
  if (chart) {
    updateChart(tableData.value);
  }
};

// 获取数据
const fetchData = async () => {
  loading.value = true;
  try {
    // 设置默认日期范围（如果未设置）
    if (!dateRange.value) {
      dateRange.value = getDefaultDateRange();
    }
    
    const response = await axios.get('http://localhost:5000/api/movie-boxoffice/data?type=daily');
    if (response.data.message === 'success') {
      const data = response.data.data;
      
      // 处理数据并按日期排序
      processAndSortData(data);
    }
  } catch (error) {
    console.error('获取数据失败:', error);
    // 模拟数据
    mockData();
  } finally {
    loading.value = false;
  }
};

// 处理和排序数据
const processAndSortData = (data: any[]) => {
  // 过滤日期范围内的数据（如果有日期范围）
  let filteredData = data;
  if (dateRange.value) {
    const startDate = formatDate(dateRange.value[0]);
    const endDate = formatDate(dateRange.value[1]);
    
    filteredData = data.filter(item => {
      return item.date >= startDate && item.date <= endDate;
    });
  }
  
  // 按日期排序
  filteredData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // 获取每天的票房冠军
  const processedData = filteredData.map(item => {
    // 假设API返回的每日数据中包含了电影列表
    const movies = item.movies || [];
    
    // 找出当日票房最高的电影
    let topMovie = { name: '无数据', box_office: '0' };
    if (movies.length > 0) {
      topMovie = movies.sort((a: any, b: any) => 
        parseFloat(b.box_office) - parseFloat(a.box_office)
      )[0];
    }
    
    // 获取星期几
    const date = new Date(item.date);
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[date.getDay()];
    
    return {
      date: item.date,
      weekday: weekday,
      boxOffice: item.total_box_office + '万',
      movieCount: movies.length,
      topMovie: topMovie.name,
      topMovieBoxOffice: topMovie.box_office + '万'
    };
  });
  
  tableData.value = processedData;
  
  // 更新图表
  updateChart(processedData);
};

// 更新图表
const updateChart = (data: any[]) => {
  if (!chartRef.value) return;
  
  // 准备数据
  const dates = data.map(item => item.date);
  const boxOffice = data.map(item => parseFloat(item.boxOffice));
  
  // 计算移动平均线数据
  const mavgPeriod = 3; // 3天移动平均
  const mavgData = [];
  
  for (let i = 0; i < boxOffice.length; i++) {
    if (i < mavgPeriod - 1) {
      mavgData.push(null); // 前几天没有足够数据计算移动平均
    } else {
      let sum = 0;
      for (let j = 0; j < mavgPeriod; j++) {
        sum += boxOffice[i - j];
      }
      mavgData.push(sum / mavgPeriod);
    }
  }
  
  // 初始化ECharts实例
  if (!chart) {
    chart = echarts.init(chartRef.value);
  }
  
  // 设置图表选项
  let seriesConfig;
  
  switch (chartType.value) {
    case 'area':
      seriesConfig = [
        {
          name: '日票房',
          type: 'line',
          data: boxOffice,
          areaStyle: {
            opacity: 0.5,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.8, color: 'rgba(135, 211, 255, 0.1)' }
            ])
          },
          smooth: true,
          symbolSize: 6
        },
        {
          name: '3日均线',
          type: 'line',
          data: mavgData,
          lineStyle: {
            width: 2,
            type: 'dashed'
          },
          symbol: 'none'
        }
      ];
      break;
    
    case 'stack':
      // 生成随机的电影数据（实际应用中应该从API获取）
      const movies = ['电影A', '电影B', '电影C', '电影D', '电影E'];
      const movieSeries = movies.map((movie, index) => {
        // 生成该电影的每日票房数据
        const movieData = boxOffice.map(total => {
          // 假设每部电影占总票房的一定比例
          const percentage = Math.random() * 0.3 + 0.05; // 5% - 35%
          return total * percentage;
        });
        
        return {
          name: movie,
          type: 'bar',
          stack: '总量',
          emphasis: {
            focus: 'series'
          },
          data: movieData
        };
      });
      
      seriesConfig = movieSeries;
      break;
    
    default: // 'line'
      seriesConfig = [
        {
          name: '日票房',
          type: 'line',
          data: boxOffice,
          markPoint: {
            data: [
              { type: 'max', name: '最大值' },
              { type: 'min', name: '最小值' }
            ]
          },
          markLine: {
            data: [{ type: 'average', name: '平均值' }]
          },
          smooth: true
        },
        {
          name: '3日均线',
          type: 'line',
          data: mavgData,
          lineStyle: {
            width: 2,
            type: 'dashed'
          },
          symbol: 'none'
        }
      ];
  }
  
  const option = {
    title: {
      text: '日票房走势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: chartType.value === 'stack' 
        ? ['电影A', '电影B', '电影C', '电影D', '电影E'] 
        : ['日票房', '3日均线'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: chartType.value === 'stack',
      data: dates,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '票房（万元）'
    },
    series: seriesConfig
  };
  
  // 渲染图表
  chart.setOption(option, true);
};

// 模拟数据（当API请求失败时使用）
const mockData = () => {
  // 获取过去两周的日期
  const currentDate = new Date();
  const dates = [];
  const boxOffice = [];
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  
  // 生成模拟数据
  for (let i = 13; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    
    const formattedDate = formatDate(date);
    const weekday = weekdays[date.getDay()];
    
    // 周末票房较高
    let dailyBoxOffice;
    if (weekday === '周五' || weekday === '周六' || weekday === '周日') {
      dailyBoxOffice = Math.floor(Math.random() * 5000 + 8000); // 8000-13000万
    } else {
      dailyBoxOffice = Math.floor(Math.random() * 3000 + 3000); // 3000-6000万
    }
    
    dates.push(formattedDate);
    boxOffice.push(dailyBoxOffice);
  }
  
  // 生成模拟表格数据
  const mockTableData = dates.map((date, index) => {
    const dateObj = new Date(date);
    const weekday = weekdays[dateObj.getDay()];
    
    // 随机生成当日票房冠军
    const topMovies = ['流浪地球', '战狼2', '你好，李焕英', '长津湖', '复仇者联盟4'];
    const randomMovie = topMovies[Math.floor(Math.random() * topMovies.length)];
    const topMovieBoxOffice = Math.floor(boxOffice[index] * (Math.random() * 0.3 + 0.2)); // 占总票房20%-50%
    
    return {
      date: date,
      weekday: weekday,
      boxOffice: boxOffice[index] + '万',
      movieCount: Math.floor(Math.random() * 10) + 10, // 10-20部电影
      topMovie: randomMovie,
      topMovieBoxOffice: topMovieBoxOffice + '万'
    };
  });
  
  tableData.value = mockTableData;
  
  // 更新图表
  updateChart(mockTableData);
};

// 处理窗口大小变化
const handleResize = () => {
  chart?.resize();
};

onMounted(() => {
  dateRange.value = getDefaultDateRange();
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
  min-height: 600px;
}

.loading {
  padding: 40px 20px;
}

.chart-filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 10px;
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