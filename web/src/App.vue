<template>
  <dialog ref="dialogRef_updata" class="min-h-screen w-full rounded-3xl">
    <updata @upload-success="refreshImages" />
    <button @click="closeDialog_updata" class="mt-4 bg-gray-300 text-gray-700 p-2 rounded w-full hover:bg-gray-400">关闭</button>
  </dialog>
  
  
  <dialog ref="dialogRef" class="min-h-screen w-full rounded-3xl">
    <login_web />
    <button @click="closeDialog" class="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-700">
      关闭
    </button>
  </dialog>
  <div class="min-h-screen w-full rounded-3xl">
    <!-- 卡片布局 -->
      <header>
        <div class=" col-start-1 col-end-3 bg-slate-500 bg-opacity-50 p-4 shadow-lg rounded-3xl">
          <h1 class="text-2xl font-bold text-center mb-4">图片展示</h1>
          <p class="text-center text-gray-600 mb-6">这里是图片展示的描述信息。</p>
                  <div class="col-start-3 col-end-4 bg-slate-500 bg-opacity-50 p-4 shadow-lg rounded-3xl flex justify-between items-center">
          <div class="login_true" v-if="login_t_f == true">
            <span class="px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold shadow-md mr-2 animate-fade-in">✔ 已登录</span>
            <button @click="openDialog_updata" class="px-4 py-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold shadow-lg hover:scale-105 hover:from-blue-500 hover:to-purple-600 transition-all duration-200">上传图片</button>
            <button @click="logout" class="ml-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-400 to-orange-400 text-white font-bold shadow-lg hover:scale-105 hover:from-red-500 hover:to-orange-500 transition-all duration-200">退出登录</button>
          </div>
          <div v-else-if="login_t_f == false" class="flex justify-between items-center">
            <button @click="openDialog" class="px-4 py-2 rounded-full bg-gradient-to-r from-green-400 to-blue-400 text-white font-bold shadow-lg hover:scale-105 hover:from-green-500 hover:to-blue-600 transition-all duration-200">登录</button>
          </div>
        </div>
        </div>

      </header>
 <div class="columns-1 sm:columns-2 md:columns-3 max-w-7xl mx-auto p-4 gap-4">
          <div v-for="image in imagess" :key="image.url.name" class="mb-4 break-inside-avoid">
            <Images
              :image_url="`/image?n=${image.url.name}`"
              :image_text="image.url.name"
              :image_height="image.url.height"
              :image_width="image.url.width"
              :image_size="image.url.size"
              :image_time="image.url.make_time"
              :image_maker="image.url.maker_name"
              :img_uuid="image.url.img_uuid || image.url.id || image.url.uuid || ''"
            />
          </div>
        </div>
  </div>
</template>
<script setup>
import updata from './components/updata.vue';
import login_web from './components/login.vue';
import Images from './components/image.vue';
import axios from 'axios';
import { ref } from 'vue';
import backgroundImage from '@/assets/m6s8bqjk.png';

const updata_t = ref(false)
const backgroundImageUrl = backgroundImage;
const imagess = ref([]);
const items = ref([{ message: 'Foo' }, { message: 'Bar' }])
const login_t_f = ref(false); // 登录状态

// 退出登录方法
function logout() {
  axios.post('/logout').then(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('Permissions');
    login_t_f.value = false;
    window.location.reload();
  });
}

// 检查token是否有效
function checkToken() {
  const token = localStorage.getItem('token');
  if (!token) {
    login_t_f.value = false;
    return;
  }
  axios.post(
    '/token',
    { token: token },
    {
      headers: {
        'Content-Type': 'application/json',
        'authorization': token
      }
    }
  ).then(response => {
    if (response.data.code === 200) {
      login_t_f.value = true;
    } else {
      login_t_f.value = false;
    }
  }).catch(() => {
    login_t_f.value = false;
  });
}

// 获取图片列表
function refreshImages() {
  imagess.value = [];
  axios.get('/images').then(response => {
    const images = response.data;
    images.forEach(image => {
      imagess.value.push({ url: image });
    });
  }).catch(error => {
    console.error('Error fetching images:', error);
  });
}

// 页面加载时检查token和加载图片
checkToken();
refreshImages();

// 登录/注册后可调用此方法刷新状态
window.checkToken = checkToken;

const dialogRef = ref(null);
const openDialog = () => {
  if (dialogRef.value) {
    dialogRef.value.showModal();
    document.body.style.overflow = 'hidden'; // 禁止滚动
  }
};

// 关闭对话框的方法
const closeDialog = () => {
  if (dialogRef.value) {
    dialogRef.value.close();
    document.body.style.overflow = ''; 
  }
};
const dialogRef_updata = ref(null)
const openDialog_updata = () => {
  // 上传前再次校验token
  checkToken();
  if (!login_t_f.value) {
    openDialog(); // 未登录弹出登录框
    return;
  }
  if (dialogRef_updata.value) {
    dialogRef_updata.value.showModal();
    document.body.style.overflow = 'hidden'; 
  }
};
// 关闭对话框的方法
const closeDialog_updata = () => {
  if (dialogRef_updata.value) {
    dialogRef_updata.value.close();
    document.body.style.overflow = ''; 
  }
};
</script>

