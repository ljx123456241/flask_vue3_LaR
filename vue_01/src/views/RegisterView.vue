<template>
  <div>
    <el-card>
      <h1>注册</h1>
      <el-form :model="form" @submit.prevent="handleRegister" :rules="rules" ref="registerForm">
        <el-form-item label="用户名:" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密 码:" prop="password">
          <el-input v-model="form.password" placeholder="请输入密码" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" placeholder="请再次输入密码" type="password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">注册</el-button>
        </el-form-item>
      </el-form>
      <p>
        已有账号？<router-link to="/">登录</router-link>
      </p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';

const form = ref({
  username: '',
  password: '',
  confirmPassword: ''
});
const router = useRouter();
const registerForm = ref<FormInstance | null>(null);

// 密码一致性验证器
const validatePass = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== form.value.password) {
    callback(new Error('两次输入密码不一致'));
  } else {
    callback();
  }
};

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3到20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, message: '密码必须包含大小写字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ]
};

const handleRegister = async () => {
  const formRef = registerForm.value;
  if (!formRef) return;

  formRef.validate(async (valid) => {
    if (valid) {
      try {
        const response = await axios.post<{ message: string }>('http://localhost:5000/register', {
          username: form.value.username,
          password: form.value.password
        });
        if (response.data.message === 'success') {
          ElMessage.success('用户创建成功');
          router.push('/');
        } else {
          // 根据后端更详细的错误信息展示不同提示
          if (response.data.message === 'username_exists') {
            ElMessage.error('用户名已存在，请更换用户名');
          } else {
            ElMessage.error('注册失败，请重试');
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          ElMessage.error(`请求出错: ${error.response?.status} - ${error.response?.data?.message}`);
        } else {
          ElMessage.error('发生未知错误');
        }
        console.error('注册请求出错:', error);
      }
    }
  });
};
</script>

<style scoped>
.el-card {
  max-width: 500px;
  margin: 50px auto;
}
</style>