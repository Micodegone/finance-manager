import request from '@/utils/http'

export const loginAPI = ({account , password}) =>{
  return request({
    url: '/auth/login',
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

//用户反馈信息
export const feedbackAddAPI = (formData)=>{
  return request({
    url: '/feedback',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data' // 必须明确指定
    }
  })
}
