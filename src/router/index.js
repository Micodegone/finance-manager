import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout/index.vue'
import Login from '@/views/Login/index.vue'
import DashBoard from '@/views/Layout/components/dashBoard.vue'
import FinacePlan from '@/views/Layout/components/finacePlan.vue'
import KnowledgeBase from '@/views/Layout/components/compliance/knowledgeBase.vue'
import MyIncome from '@/views/Layout/components/record/myIncome.vue'
import MyExpense from '@/views/Layout/components/record/myExpense.vue'
import TransforRecord from '@/views/Layout/components/record/transforRecord.vue'
import MyFiscal from '@/views/Layout/components/compliance/myFiscal.vue'
import MyRbm from '@/views/Layout/components/compliance/myRbm.vue'
import AnalystReports from '@/views/Layout/components/conclusions/analystReports.vue'
import GoPlanning from '@/views/Layout/components/conclusions/goPlanning.vue'
import { useUserStore } from '@/stores/userStore'
import Admin from '@/views/Login/admin.vue'
import Manager from '@/views/Login/manager.vue'
import { useAdminStore } from '@/stores/adminStore'
import NotFound from '@/views/Layout/components/notFound.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/auth/login',
      meta: { requiresAuth: true }, // 添加路由元信息
      component: Layout,
      children: [
        {
          path: '/dashboard',
          component: DashBoard
        },
        {
          path: '/financeplan',
          component: FinacePlan
        },
        {
          path: '/knowledge',
          component: KnowledgeBase,
        },
        {
          path: '/Income',
          component: MyIncome
        },
        {
          path: '/Expense',
          component: MyExpense
        },
        {
          path: '/Transfor',
          component: TransforRecord
        },
        {
          path: '/myFiscal',
          component: MyFiscal
        },
        {
          path: '/reimbursement',
          component: MyRbm
        },
        {
          path: '/myReports',
          component: AnalystReports
        },
        {
          path: '/myPlan',
          component: GoPlanning
        }
      ]
    },
    {
      path: '/auth/login',
      component: Login,
    },
    {
      path: '/manager',
      meta: { requiresAuth: true }, // 添加认证标识
      component: Manager
    },
    {
      path: '/login',
      component: Admin
    },
    // 添加404页面路由
    {
      path: '/:pathMatch(.*)*',
      component: NotFound,
    }

  ],
})
//添加路由守卫
router.beforeEach(async (to) => {

  const userStore = useUserStore()
  const adminStore = useAdminStore()
  // 初始化用户状态
  if (!userStore.userInfo) userStore.initUser()

  // 白名单配置
  const whiteList = ['/auth/login', '/login']
  if (whiteList.includes(to.path)) {
    // 已登录用户访问登录页时重定向
    if (to.path === '/auth/login' && userStore.userInfo) {
      return '/dashboard'
    }
    return true
  }
  // 需要认证的路由处理
  if (to.meta.requiresAuth) {
    //路由
    if (to.path.startsWith('/')) {
      // 管理员路由
      if (to.path.startsWith('/manager')) {
        console.log("管理员登录", adminStore.adminInfo)
        return adminStore.adminInfo ? true : '/login'
      }
      return userStore.userInfo ? true : '/auth/login'
    }
  }

})

export default router
