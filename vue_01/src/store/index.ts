import { createStore } from 'vuex'

// 定义存储在localStorage中的键名
const USER_KEY = 'current_user'
const TOKEN_KEY = 'auth_token'

// 从localStorage读取用户信息，如果有的话
const getSavedUser = () => {
  const savedUser = localStorage.getItem(USER_KEY)
  return savedUser ? JSON.parse(savedUser) : null
}

// 检查是否已登录
const isAuthenticated = !!localStorage.getItem(USER_KEY)

export default createStore({
  state: {
    user: getSavedUser(),
    isAuthenticated: isAuthenticated,
    // 可以添加token等其他认证信息
  },
  getters: {
    currentUser: state => state.user,
    isAuthenticated: state => state.isAuthenticated,
    username: state => state.user ? state.user.username : ''
  },
  mutations: {
    // 登录成功后设置用户信息
    setUser(state, user) {
      state.user = user
      state.isAuthenticated = true
      // 保存到localStorage中实现持久化
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    },
    // 退出登录
    logout(state) {
      state.user = null
      state.isAuthenticated = false
      // 清除localStorage
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(TOKEN_KEY)
    }
  },
  actions: {
    // 登录动作
    login({ commit }, user) {
      commit('setUser', user)
    },
    // 登出动作
    logout({ commit }) {
      commit('logout')
    }
  }
})
