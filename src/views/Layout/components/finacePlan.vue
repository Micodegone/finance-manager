<!--
  财务规划页面
  具体功能：
  1.进行本月收入添加，可以具体到哪一天
  2.进行本月支出添加，可以具体到哪一天
  3.进行本月预算规划
-->

<template>
  <div class="financial-planning">
    <!-- 控制栏 -->
    <div class="card-header">
      <el-button type="primary">本月账单</el-button>
    </div>

    <!-- 三行卡片布局 -->
    <div class="card-container">
      <!-- 收入卡片 -->
      <FinanceIncome />
      <!-- 支出卡片 -->
      <FinanceExpense />
      <!-- 预算卡片 -->
      <FinanceBudget />

    </div>
  </div>
</template>

<script setup>

import FinanceIncome from './finance/FinanceIncome.vue'
import FinanceExpense from './finance/FinanceExpense.vue'
import FinanceBudget from './finance/FinanceBudget.vue';
</script>


<style>
.financial-planning {
  padding: 20px;
  min-height: 100vh;
}

/* 卡片容器 */
.card-container {
  display: grid;
  gap: 24px;
  max-width: calc(100% - 40px);
  /* 左右各留20px */
  margin: 0 auto;
}

/* 卡片主体 */
.financial-card {
  width: 100%;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid var(--el-border-color);
  box-shadow: var(--el-box-shadow-light);
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
}

.card-icon {
  font-size: 20px;
  color: var(--el-color-primary);
}

.card-title {
  font-size: 18px;
  font-weight: 500;
  margin-right: auto;
}

.barchart {
  font-size: 15px;
  width: 100%;
  height: 100%;
  min-height: 300px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card-header {
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px;
  }

  .card-title {
    font-size: 16px;
  }

  .el-tag {
    margin-left: auto;
  }
}

@media (min-width: 1920px) {
  .card-container {
    max-width: 1880px;
    /* 1920 - 40px */
  }
}
</style>
