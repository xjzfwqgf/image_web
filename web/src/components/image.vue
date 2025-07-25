<template>
  <div class="card"
    :style="{
'--image_height': nb(400*cl(props.image_width,props.image_height))+'px'
    }"
  >
    <div
      class="card-inner"
      :class="{ 'no-rotate': isCommenting && isFlipped }"
      :style="{
        transform: isFlipped ? 'rotateY(180deg)' : 'none'
      }"
    >
      <div class="card-front">
        <img 
          :src="props.image_url" 
          :alt="props.image_maker" 
          class="p-1 w-full h-full object-contain"
          style="border-radius: 10px;" 
          @click="flipCard"

        />
      </div>
      <div class="card-back">
        <h2 class="text-lg font-bold text-gray-800 mt-2 mb-1">XXX设计PPT模板</h2>
    
        <!-- 底部信息 -->
        <div class="justify-between items-center text-xs text-gray-400">
          <span>{{props.image_time}}</span>
          <span class="flex items-center">
            <span class="mr-1">发布者👩</span>{{ props.image_maker }}
          </span>
        </div>
        
        <!-- 点赞和评论区 -->
        <div class="flex items-center gap-4 mt-2">
          <button 
            @click="toggleLike" 
            :class="['px-2 py-1 rounded', liked ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700']"
          >
            👍 {{ likeCount }}
          </button>
          <span class="text-xs text-gray-500">评论 {{ comments.length }}</span>
        </div>
        
        <!-- 评论列表 -->
        <div class="mt-2 max-h-32 overflow-y-auto bg-gray-50 rounded p-2 border border-gray-200">
          <div v-if="comments.length === 0" class="text-gray-400 text-xs">暂无评论</div>
          <div 
            v-for="comment in comments" 
            :key="comment.comment_id" 
            class="mb-1 text-xs"
          >
            <span class="font-bold text-gray-700">{{ comment.username }}：</span>
            <span>{{ comment.content }}</span>
          </div>
        </div>
        
        <!-- 评论输入 -->
        <div class="flex gap-2 mt-2">
          <input 
            v-model="commentInput" 
            placeholder="写评论..." 
            class="flex-1 px-2 py-1 border rounded text-xs" 
            @focus="onCommentFocus"
            @blur="onCommentBlur"
          />
          <button 
            @click="submitComment" 
            class="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs"
          >
            发送
          </button>
                  <button 
          @click="flipToFront" 
          class="mt-2 bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400 text-xs"
        >返回正面</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
function flipToFront() {
  isFlipped.value = false;
}
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// 从 localStorage 获取用户信息
const user_id = localStorage.getItem('user_id') || '';
const username = localStorage.getItem('username') || '';
const token = localStorage.getItem('token') || '';

const likeCount = ref(0);
const liked = ref(false);
const comments = ref([]);
const commentInput = ref('');
const dialogRef = ref(null);
const isCommenting = ref(false);
const isFlipped = ref(false);

function flipCard() {
  isFlipped.value = !isFlipped.value;
}

function onCommentFocus() {
  // 只有卡片已翻转时才允许输入框阻止旋转
 
    isFlipped.value = true;
    isCommenting.value = true;
}

function onCommentBlur() {
  isCommenting.value = false;
}
// 从 props 获取图片信息
const props = defineProps({
  image_url: {
    type: String,
    default: ''
  },
  image_text: {
    type: String,
    default: 'tp'
  },
  image_time: {
    type: String,
    default: '3天前'
  },
  image_maker: {
    type: String,
    default: 'XXX设计'
  },
  image_height: {
    type: [String, Number],
    default: 200
  },
  image_width: {
    type: [String, Number],
    default: 200
  },
  image_size: {
    type: [String, Number],
    default: 0
  },
  img_uuid: {
    type: [String, Number],
    required: true // 确保 UUID 是必需的
  }
});

// 获取点赞数
const fetchLikes = async () => {
  try {
    const res = await axios.get('/likes', { 
      params: { img_uuid: props.img_uuid } 
    });
    if (res.data.code === 200) {
      likeCount.value = res.data.count;
    }
  } catch (e) {
    console.error('获取点赞数失败:', e);
  }
};

// 检查用户是否已点赞
const checkUserLike = async () => {
  if (!user_id) return;
  
  try {
    const res = await axios.get('/likes/check', {
      params: { 
        img_uuid: props.img_uuid,
        user_id
      }
    });
    liked.value = res.data.liked;
  } catch (e) {
    console.error('检查点赞状态失败:', e);
  }
};

// 点赞/取消点赞
const toggleLike = async () => {
  if (!user_id || !username) {
    alert('请先登录');
    return;
  }
  
  try {
    if (!liked.value) {
      // 点赞
      await axios.post('/like', 
        { 
          img_uuid: props.img_uuid, 
          user_id, 
          username 
        }, 
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          } 
        }
      );
      liked.value = true;
      likeCount.value++;
    } else {
      // 取消点赞
      await axios.post('/unlike', 
        { 
          img_uuid: props.img_uuid, 
          user_id 
        }, 
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          } 
        }
      );
      liked.value = false;
      likeCount.value--;
    }
  } catch (e) {
    console.error('操作点赞失败:', e);
  }
};

// 获取评论列表
const fetchComments = async () => {
  try {
    const res = await axios.get('/comments', { 
      params: { img_uuid: props.img_uuid } 
    });
    if (res.data.code === 200) {
      comments.value = res.data.comments;
    }
  } catch (e) {
    console.error('获取评论失败:', e);
  }
};

// 发表评论
const submitComment = async () => {
  if (!user_id || !username) {
    alert('请先登录');
    return;
  }
  
  if (!commentInput.value.trim()) return;
  
  try {
    const res = await axios.post('/comment', 
      { 
        img_uuid: props.img_uuid, 
        user_id, 
        username, 
        content: commentInput.value 
      }, 
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        } 
      }
    );
    
    if (res.data.code === 201) {
      commentInput.value = '';
      fetchComments();
    }
  } catch (e) {
    console.error('发表评论失败:', e);
  }
};

// 打开对话框
const openDialog = () => {
  if (dialogRef.value) {
    dialogRef.value.showModal();
    document.body.style.overflow = 'hidden';
  }
};

// 关闭对话框
const closeDialog = () => {
  if (dialogRef.value) {
    dialogRef.value.close();
    document.body.style.overflow = '';
  }
};
function cl(width,height){
  const w_h=height/width;
  return w_h;
}
//console.log('计算高宽比:', cl(props.image_width, props.image_height));
function nb(nb){
  //保留两位小数
  return Math.floor(nb * 100) / 100;
}

// 计算高宽比 (高度/宽度)
const aspectRatio = computed(() => {
  const width = props.image_width
  const height = props.image_height;
  return height / width;
});

onMounted(() => {
  fetchLikes();
  fetchComments();
  checkUserLike();
});
</script>

<style>
.card {
  width: 400px; /* 使用 CSS 变量控制宽度 */
  height: var(--image_height); /* 使用 CSS 变量控制高度 */
  perspective: 1000px;
}

.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.5s;
}

.card-inner {
  /* 由isFlipped控制旋转，不再受hover影响 */
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 10px;
  overflow: hidden;
}

.card-front {
  background-color: #e3c4ec;
  transform: rotateY(0deg);
}

.card-back {
  background-color: #e3c4ec;
  transform: rotateY(180deg);
  padding: 10px;
  display: flex;
  flex-direction: column;
}

/* 确保图片在容器内完整显示 */
.card-front img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>