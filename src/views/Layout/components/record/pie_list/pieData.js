import * as echarts from 'echarts'
import { ref } from 'vue'

export const totalPieChart = (info,pieChart) => {

  // 图表实例
  let pieChartInstance = ref(null)

  // 初始化饼图
  const initPieChart = () => {
    pieChartInstance.value = echarts.init(pieChart.value)
    updatePieChart()
  }
  // 响应式调整图表
  const handleResize = () => {
    pieChartInstance.value?.resize()
  }

  const updatePieChart = () => {
    // 聚合数据（金额 + 次数）
    const categoryData = info.value.reduce((acc, item) => {
      const key = item.category;

      // 金额统计
      if (!acc.amounts) acc.amounts = {};
      acc.amounts[key] = (acc.amounts[key] || 0) + Number(item.amount);

      // 次数统计
      if (!acc.counts) acc.counts = {};
      acc.counts[key] = (acc.counts[key] || 0) + 1;

      return acc;
    }, { amounts: {}, counts: {} });

    // 计算总金额用于百分比计算
    const totalAmount = Object.values(categoryData.amounts).reduce((sum, val) => sum + val, 0);

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          const percent = ((params.value / totalAmount) * 100).toFixed(2);
          return `
          <div style="padding: 5px 10px;">
            <div>类别：${params.name}</div>
            <div>金额：¥${params.value.toFixed(2)}</div>
            <div>占比：${percent}%</div>
            <div>次数：${params.data.count}次</div>
          </div>
        `;
        }
      },
      legend: {
        orient: 'horizontal',
        top: 10,
        type: 'scroll',
        textStyle: {
          color: '#606266'
        }
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b|{b}}：¥{c}',
          rich: {
            b: {
              fontSize: 14,
              lineHeight: 20
            }
          }
        },
        data: Object.entries(categoryData.amounts).map(([name, amount]) => ({
          name,
          value: Number(amount.toFixed(2)), // 保留两位小数
          count: categoryData.counts[name] // 注入次数数据
        }))
      }]
    }

    pieChartInstance.value.setOption(option)
  }
  const destroyChart = () => {
    if (pieChartInstance.value) {
      // 销毁实例
      pieChartInstance.value.dispose()
      pieChartInstance.value = null
    }
  }
  return {
    initPieChart,
    updatePieChart,
    handleResize,
    destroyChart,
    pieChartInstance
  }
}
