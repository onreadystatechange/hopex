import { joinModel, getRes, resOk, formatNumber, _ } from '@utils'
import modelExtend from '@models/modelExtend'
import { ws } from '@components'
import {
  getLatestRecord, getEnsureRecord, postLimitOrder, postMarketOrder,
  getKline
} from "@services/trade"

export default joinModel(modelExtend, {
  namespace: 'home',
  state: {
    // 合约名称
    market: 'BTCUSD永续',// 合约
    // 最新成交
    latest_pageIndex: '1',
    latest_pageSize: '19',
    latest_pageTotal: null,
    latest_records: [],
    // 委托列表
    ensure_records: {},
    // K线图
    kline_records: [],
    // 加格指标
    maxPrice: null,
    minPrice: null,
    indexPrice: null,
    latestPrice: null,
    equitablePrice: null
  },
  subscriptions: {
    setup({ dispatch, history }) {
      dispatch({
        type: 'startInit'
      })
    },
  },

  effects: {
    * startInit({ payload = {} }, { call, put }) {
      // yield put({
      //   type: 'getImportParams'
      // })
    },

    // 重要参数
    * getImportParams({ payload = {} }, { call, put }) {

    },
    // 最新成交列表
    * getLatestRecord({ payload = {} }, { call, put }) {
      const { mode = 'ws' } = payload
      if (mode === 'ws') {

      } else {
        const payload = yield put({
          type: 'createRequestParams',
          payload: {
            "head": {
              "method": "market.deals",
              "serialNumber": "57",
            },
            "param": {
              "pageSize": "100",
              "lastId": "1"
            }
          }
        })
        const res = getRes(yield call(getLatestRecord, payload))
        if (resOk(res)) {
          yield put({
            type: 'changeState',
            payload: {
              latest_records: res.data.records,
              latestPrice: _.get(res.data.records[0], 'price')
            }
          })
          return res
        }
      }
    },
    // 委托列表
    * getEnsureRecord({ payload = {} }, { call, put }) {
      const { mode = 'ws' } = payload
      if (mode === 'ws') {
        // ws.onConnect = function () {
        //   ws.sendJson({
        //     "head": {
        //       "method": "server.ping",
        //       "msgType": "wsrequest",
        //       "packType": "1",
        //       "lang": "cn",
        //       "version": "1.0.0",
        //       "timestamps": "1439261904",
        //       "serialNumber": "1439261904",
        //       "userId": "56",
        //       "userToken": "56"
        //     },
        //     "param": {}
        //   })
        //   ws.onMessage = function (e) {
        //     const msg = e.data
        //     console.log(msg)
        //   }
        // }
      } else {
        const payload = yield put({
          type: 'createRequestParams',
          payload: {
            "head": {
              "method": "market.active_delegate",
              "serialNumber": "56",
            },
            "param": {
              "pageSize": "100", //不能大于101
              "interval": "0" //固定值
            }
          }
        })
        const res = getRes(yield call(getEnsureRecord, payload))
        if (resOk(res)) {
          const result = {
            bids: _.orderBy(formatNumber(_.get(res.data, 'bids'), ['price', 'amount']), ['price'], ['desc']),
            asks: _.orderBy(formatNumber(_.get(res.data, 'asks'), ['price', 'amount']), ['price'], ['desc'])
          }
          const [bidsLast, asksFirst] = [result.bids[result.bids.length - 1], result.asks[0]]
          yield put({
            type: 'changeState',
            payload: {
              ensure_records: result,
              equitablePrice: (_.get(bidsLast, 'price') * _.get(asksFirst, 'amount')
                + _.get(asksFirst, 'price') * _.get(bidsLast, 'amount')) / _.get(asksFirst, 'amount') + _.get(bidsLast, 'amount')
            }
          })
          return res
        }
      }
    },
    //K线图
    * getKline({ payload = {} }, { call, put }) {
      const { mode = 'ws' } = payload
      if (mode === 'ws') {

      } else {
        const payload = yield put({
          type: 'createRequestParams',
          payload: {
            "head": {
              "method": "market.kline",
              "serialNumber": "57",
            },
            "param": {
              "market": "BTCBCH",
              "startTime": "1514739660",
              "endTime": "1541005260",
              "interval": "86400"
            }
          }
        })
        const res = getRes(yield call(getKline, payload))
        if (resOk(res)) {
          return res.data.records
        }
      }
    },

    // 下单（限价/市价）
    * postSideOrder({ payload = {} }, { call, put }) {
      const { side, method, price, amount } = payload
      const url = method === 'order.put_limit' ? postLimitOrder : postMarketOrder
      const res = getRes(yield call(url,
        {
          "head": {
            "method": method,
            "msgType": "request",
            "packType": "1",
            "lang": "cn",
            "version": "1.0.0",
            "timestamps": `${Date.now()}`,
            "serialNumber": "56",
            "userId": "56",
            "userToken": "56"
          },
          "param": {
            "market": "BTCUSD永续",//合约
            "side": side,//1:sell 2:buy
            "amount": amount,//买卖数量
            "price": price,//价格
            "takerFee": "0.01",
            "makerFee": "0.01",
            "source": "我是限价单测试"//备注
          }
        }
      ))
      // if (resOk(res)) {
      //   yield put({
      //     type: 'changeState',
      //     payload: { ensure_records: res }
      //   })
      //   return res
      // }
    },
  },

  reducers: {},
})
