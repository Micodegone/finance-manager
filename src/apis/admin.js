import request from '@/utils/http'

export const AdminAPI = ({account , password}) =>{
  return request({
    url: '/login',
    method: 'POST',
    data:{
      account,
      password
    },
    headers: {
      'Content-Type': 'multipart/form-data' // 必须明确指定
    }
  })
}

//获取用户反馈信息
export const feedbackAPI = ()=>{
  return request({
    url: '/feedback',
    method: 'GET',
  })
}

