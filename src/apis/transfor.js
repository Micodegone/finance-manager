import request from '@/utils/http'

export const transforAPI = () =>{
  return request({
    url: '/transfor',
    method: 'GET',
  })
}
