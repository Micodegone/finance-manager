export const getFullImageUrl = (relativePath) => {
  // 开发环境添加本地服务前缀
  if (import.meta.env.MODE === 'development') {
    return `http://localhost:8080${relativePath}`;
  }
  return relativePath;
};
