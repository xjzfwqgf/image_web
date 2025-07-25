<template>
    <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div class="w-full max-w-md mx-auto bg-white bg-opacity-90 rounded-2xl shadow-2xl p-8 animate-fade-in">
        <h2 class="text-3xl font-extrabold text-center mb-6 text-blue-500 drop-shadow">图片上传</h2>
        <input type="file" accept="image/*" @change="handleFileChange" class="mb-4 w-full border border-blue-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 transition-all" />
        <img v-if="base64Image" :src="base64Image" class="rounded-lg shadow mb-4 max-h-48 mx-auto" />
      </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import axios from 'axios';
const base64Image = ref('');
const fileInput = ref(null);
const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // 检查是否为图片
  if (!file.type.startsWith('image/')) {
    alert('请上传有效的图片文件');
    event.target.value = ''; // 重置文件输入
    return;
  }
  
  try {
    // 压缩图片（最大宽度 1200px，质量 75%）
    const compressedFile = await compressImage(file, 1200, 0.75);
    
    // 将压缩后的图片转为 base64
    const base64Image = await fileToBase64(compressedFile);
    
    // 调用上传函数
    uploadImage(compressedFile, base64Image);
    
  } catch (error) {
    console.error('图片处理失败:', error);
    alert('图片处理失败，请重试');
    event.target.value = ''; // 重置文件输入
  }
};
async function compressImage(file, maxWidth = 1200, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      // 只缩小，不放大，保持长宽比
      const scale = Math.min(1, maxWidth / img.width);
      const newWidth = Math.round(img.width * scale);
      const newHeight = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('压缩失败'));
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = (err) => reject(err);
  });
}
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
const uploadImage = (file, base64) => {
  // 获取当前登录用户信息（如用户名和ID）
  const user_id = localStorage.getItem('user_id') || 1;
  const image_maker = localStorage.getItem('username') || '匿名用户';
  const img_name = file.name;
  const img_type = file.type;
  const img_size = file.size;
  const image_hx = base64;
  const token = localStorage.getItem('token');
  axios.post('/updata', {
    img_name,
    image_maker,
    img_size,
    img_type,
    user_id,
    image_hx
  }, {
    headers: {
      'Authorization': token ? 'Bearer ' + token : ''
    }
  })
    .then(response => {
      console.log('上传成功:', response.data);
      alert('上传成功！');
    })
    .catch(error => {
      console.error('上传失败:', error);
      alert('上传失败！');
    });
};
</script>