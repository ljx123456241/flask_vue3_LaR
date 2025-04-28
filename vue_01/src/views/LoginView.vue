<template>
  <div>
    <el-card>
      <h1>登录</h1>
      <el-form :model="form" @submit.prevent="handleLogin" :rules="rules" ref="loginForm">
        <el-form-item label="用户名:" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密 码:" prop="password">
          <el-input v-model="form.password" placeholder="请输入密码" type="password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">登录</el-button>
        </el-form-item>
      </el-form>
      <p>
        还没有账号？<router-link to="/register">注册</router-link>
      </p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';

const form = ref({
  username: '',
  password: ''
});
const router = useRouter();
const store = useStore();
const loginForm = ref<FormInstance | null>(null);

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3到20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ]
};

const handleLogin = async () => {
  const formRef = loginForm.value;
  if (!formRef) return;
  
  formRef.validate(async (valid) => {
    if (valid) {
      try {
        const response = await axios.post<{ message: string }>('http://localhost:5000/login', {
          username: form.value.username,
          password: form.value.password
        });
        if (response.data.message === 'success') {
          // 保存用户信息到store
          store.dispatch('login', { 
            username: form.value.username,
            loginTime: new Date().toLocaleString()
          });
          
          ElMessage.success('登录成功');
          router.push('/dashboard');
          
          // 可选：设置自动退出登录的定时器
          // 例如：24小时后自动退出登录
          setTimeout(() => {
            if (store.getters.isAuthenticated) {
              store.dispatch('logout');
              ElMessage.info('您的登录已过期，请重新登录');
              router.push('/');
            }
          }, 24 * 60 * 60 * 1000); // 24小时
        } else if (response.data.message ==='fail'){
          ElMessage.error('账号或密码错误');
        }
      } catch (error) {
        ElMessage.error('登录请求出错');
        console.error('登录请求出错:', error);
      }
    }
  });
};
</script>

<style scoped>
/* 可以在这里添加登录页面的样式 */
.el-card {
  max-width: 500px;
  margin: 50px auto;
}
</style>