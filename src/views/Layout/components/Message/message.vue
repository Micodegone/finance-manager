<template>
  <div class="pop-message" :style="style[type]" v-show="visible">
    <i class="icon" :class="[style[type].icon]"></i>
    <span class="text">{{ str }}</span>
  </div>
</template>
<script>
import { onMounted, ref } from "vue";
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "popmessage",
  //	这个是传值方法，通过父级组件传入提示状态以及提示文本
  //	可以根据不同业务自定义更多的状态
  props: {
    type: {
      type: String,
      //	success 成功
      //	warn 警告
      //	error 错误
      default: "success",
    },
    str: {
      type: String,
      default: "登陆成功",
    },
  },
  setup() {
	    //	定义一个对象，包含三种情况的样式，对象key就是类型字符串
	    //	icon图标这一部分省略了，有需要的可以自己加入
    const style = {
      warn: {
        // icon: "icon-warning",
        color: "#E6A23C",
        backgroundColor: "rgb(253, 246, 236)",
        borderColor: "rgb(250, 236, 216)",
      },
      error: {
        // icon: "icon-shanchu",
        color: "#F56C6C",
        backgroundColor: "rgb(254, 240, 240)",
        borderColor: "rgb(253, 226, 226)",
      },
      success: {
        // icon: "icon-queren2",
        color: "#67C23A",
        backgroundColor: "rgb(240, 249, 235)",
        borderColor: "rgb(225, 243, 216)",
      },
    };
    const visible = ref(false);
    onMounted(() => {
      visible.value = true;
    });
    return { style, visible };
  },
};
</script>

<style scoped lang="less">
//	css样式部分可以根据需求自定义
.pop-message {
  position: absolute;
  z-index: 9999;
  left: 50%;
  margin-left: -150px;
  top: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 50px;
  border: 1px solid #e4e4e4;
  background: #f5f5f5;
  color: #999;
  border-radius: 4px;
  //	以下是过渡动画，如不需要可删去亦可改进
  animation: move 0.38s linear forwards;
  @keyframes move {
    0% {
      transform: translate3d(0, -75px, 0);
      opacity: 0.16;
    }

    50% {
      opacity: 0.68;
    }

    100% {
      transform: none;
      opacity: 1;
    }
  }
}
</style>
