import { defineStore } from "pinia";
import { ref } from "vue";
import { budgetAPI ,addBudgetAPI} from "@/apis/budget";

export const useBudgetStore = defineStore('budget',()=>{
  //定义空数组存储data数据
  const budgetInfo = ref([])

  const getBudgetInfo = async() =>{
    try{
      const res = await budgetAPI()
      console.log(res)

      if(res?.code === 200){
        budgetInfo.value = res.data
        console.log(budgetInfo.value)
      }else{
        throw new Error('接口返回数据结构异常')
      }
    }catch(error){
      console.error(error)
      throw error
    }
  }
  //新增收入数据
  const addData = async (newBudget) => {
    try {
      const res = await addBudgetAPI(newBudget)

      //严格验证响应结构
      if (res?.code !== 200) {
        throw new Error(res.message || '接口数据异常')
      }

      //使用服务端返回的真实数据
      budgetInfo.value = [
        res.data,
        ...budgetInfo.value
      ]

      return res.data
    } catch (error) {
      console.error('添加失败:', error)
      await getBudgetInfo()
      throw error
    }
  }
  return {
    budgetInfo,
    getBudgetInfo,
    addData
  }
})
