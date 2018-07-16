import { request, asyncPayload } from '@utils'
import { API } from "@constants"


const { MOCKIP, USERIP } = API
const MODE = MOCKIP

// mock数据
if (MODE === MOCKIP) {
  require('./socketServer')
}

// 最新成交列表
export async function getLatestRecord(payload) {
  return request(`${MODE}/tc`, {
    method: 'post',
    body: payload,
    needLoop: true,
    needWatch: false
  })
}

// 委托列表
export async function getEnsureRecord(payload) {
  return request(`${MODE}/tc`, {
    method: 'post',
    body: payload,
    needLoop: true,
    needWatch: false
  })
}

// 下限价单
export async function postLimitOrder(payload) {
  return await request(`${MODE}/tc`, {
    method: 'post',
    body: payload
  })
}


// 下市价单
export async function postMarketOrder(payload) {
  return await request(`${MODE}/tc`, {
    method: 'post',
    body: payload
  })
}


