<template>
    <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div class="w-full max-w-md mx-auto bg-white bg-opacity-90 rounded-2xl shadow-2xl p-8 animate-fade-in">
        <template v-if="logins==true">
            <h1 class="text-3xl font-extrabold text-center mb-6 text-blue-500 drop-shadow">登录</h1>
            <input v-model="loginUsername" type="text" placeholder="请输入用户名" class="border border-blue-300 p-3 rounded-lg mb-4 w-full text-black focus:ring-2 focus:ring-blue-400 transition-all" />
            <input v-model="loginPassword" type="password" placeholder="请输入密码" class="border border-blue-300 p-3 rounded-lg mb-4 w-full text-black focus:ring-2 focus:ring-blue-400 transition-all" />
            <button class="bg-gradient-to-r from-blue-400 to-purple-500 text-white p-3 rounded-full w-full font-bold shadow-lg hover:scale-105 hover:from-blue-500 hover:to-purple-600 transition-all duration-200" @click="login(loginUsername, loginPassword)">登录</button>
            <p class="text-center text-gray-500 mt-4">没有账号？<button @click="setBlockTracking()" class="text-blue-500 hover:text-blue-700">注册</button></p>
        </template>
        <template v-if="logins==false">
            <h1 class="text-3xl font-extrabold text-center mb-6 text-purple-500 drop-shadow">注册</h1>
            <input v-model="registerUsername" type="text" placeholder="请输入用户名" class="border border-purple-300 p-3 rounded-lg mb-4 w-full text-black focus:ring-2 focus:ring-purple-400 transition-all" />
            <input v-model="registerPassword" type="password" placeholder="请输入密码" class="border border-purple-300 p-3 rounded-lg mb-4 w-full text-black focus:ring-2 focus:ring-purple-400 transition-all" />
            <input v-model="registerEmail" ref="email_v" type="email" placeholder="请输入邮箱" class="border border-purple-300 p-3 rounded-lg mb-4 w-full text-black focus:ring-2 focus:ring-purple-400 transition-all" />
            <div class="flex gap-2 mb-4">
              <input v-model="registerCode" type="text" placeholder="请输入验证码" class="border border-purple-300 p-3 rounded-lg text-black focus:ring-2 focus:ring-purple-400 transition-all" />
              <button @click="sendVerificationCode" class="bg-gradient-to-r from-purple-400 to-pink-400 text-white p-3 rounded-full font-bold shadow-lg hover:scale-105 hover:from-purple-500 hover:to-pink-500 transition-all duration-200">发送验证码</button>
            </div>
            <div class="flex justify-between mb-4">
                <input type="checkbox" id="agree" class="mr-2" /><label for="agree" class="text-gray-600">我已阅读并同意<a href="#" class="text-purple-500 underline">用户协议</a></label>
            </div>
            <button class="bg-gradient-to-r from-purple-400 to-pink-400 text-white p-3 rounded-full w-full font-bold shadow-lg hover:scale-105 hover:from-purple-500 hover:to-pink-500 transition-all duration-200" @click="register">注册</button>
            <!-- 点击按钮切换登录 -->
            <p class="text-center text-gray-500 mt-4">已有账号？<button @click="setBlockTracking()" class="text-purple-500 hover:text-pink-500 underline">登录</button></p>
        </template>
    </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import axios from 'axios';
const logins = ref(true);
const loginUsername = ref('');
const loginPassword = ref('');
const registerUsername = ref('');
const registerPassword = ref('');
const registerEmail = ref('');
const registerCode = ref('');
const email_v = ref('');
const setBlockTracking = () => {
    logins.value = !logins.value;
    console.log('切换登录状态:', logins.value);
};
function login(username, password) {
    axios.post('/login', { username, password })
        .then(response => {
            if(response.data.code === 200 && response.data.token) {
                // 保存token、用户名
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('username', username);
                // 优先用 /login 返回的 user_id
                if(response.data.user_id){
                  localStorage.setItem('user_id', response.data.user_id);
                } else {
                  // 兼容后端 /token 只返回 username 的情况
                  axios.get('/token', {
                    headers: {
                      'Authorization': 'Bearer ' + response.data.token
                    }
                  }).then(res => {
                    if(res.data.code === 200) {
                      if(res.data.user && res.data.user.username){
                        localStorage.setItem('user_id', res.data.user.username);
                      }
                      if (window && window.parent) {
                        window.parent.document.body.style.overflow = '';
                      }
                      window.location.reload();
                    } else {
                      alert('Token无效，请重新登录');
                    }
                  });
                  return;
                }
                // 登录成功后关闭弹窗并刷新页面
                if (window && window.parent) {
                  window.parent.document.body.style.overflow = '';
                }
                window.location.reload();
            } else {
                alert('登录失败：' + (response.data.message || '未知错误'));
            }
        })
        .catch(error => {
            console.error('登录失败:', error);
            alert('登录失败！');
        });
    console.log('登录信息:', { username, password });
}
function sendVerificationCode() {
  if (!registerEmail.value) {
    alert('请输入邮箱');
    return;
  }
  axios.get('/getemail?email=' + registerEmail.value)
    .then(res => {
      if (res.data.code === 200) {
        alert('验证码已发送，请查收邮箱');
        // 保存验证码发送时间到 localStorage
        localStorage.setItem('register_code_time', Date.now().toString());
      } else {
        alert('验证码发送失败：' + (res.data.message || '未知错误'));
      }
    })
    .catch(error => {
      alert('验证码发送失败！');
    });
}
function register() {
  if (!registerUsername.value || !registerPassword.value || !registerEmail.value || !registerCode.value) {
    alert('请填写完整信息');
    return;
  }
  // 校验验证码是否过期（5分钟有效）
  const codeTime = Number(localStorage.getItem('register_code_time') || '0');
  if (!codeTime || Date.now() - codeTime > 5 * 60 * 1000) {
    alert('验证码已过期，请重新获取');
    return;
  }
  axios.post('/register', {
    username: registerUsername.value,
    password: registerPassword.value,
    email: registerEmail.value,
    code: registerCode.value
  }).then(res => {
    if (res.data.code === 201) {
      alert('注册成功，请登录');
      setBlockTracking();
      // 注册成功后清除验证码时间
      localStorage.removeItem('register_code_time');
    } else {
      alert('注册失败：' + (res.data.message || '未知错误'));
    }
  }).catch(error => {
    alert('注册失败！');
  });
}
// 页面刷新时清除验证码时间，防止刷新后继续用旧验证码
window.addEventListener('load', () => {
  localStorage.removeItem('register_code_time');
});
defineExpose({
    login,
    setBlockTracking
});
</script>