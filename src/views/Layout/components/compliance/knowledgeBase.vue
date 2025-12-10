<template>
  <div class="knowledge-container">
    <iframe
      src="../public/static/finance.html"
      width="100%"
      height="100%"
      style="border: none; overflow: hidden;"
      frameborder="0">
    </iframe>
  </div>
</template>

<script lang="ts" setup>

</script>

<style scoped>
.knowledge-container {
  width: 100%;
  height: 84vh; /* 确保iframe的高度填满整个屏幕 */
  overflow: hidden; /* 防止溢出 */
}
</style>
