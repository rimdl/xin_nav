<template>
  <div class="relative group">
    <div :title="favorite.url" @click="openUrl(favorite.url)" class="hover:scale-105 cursor-pointer rounded-md flex flex-col items-center justify-center w-full p-5 hover:backdrop-blur-xl backdrop-blur-xl duration-200">
      <div class="avatar">
        <div class="w-15 rounded-full">
          <img
            :src="favorite.icon"
          />
        </div>
      </div>
      <div class="p-2 text-xs text-gray-300 truncate w-full text-center">
          <span class="max-w-full">{{ favorite.name }}</span>
      </div>
    </div>
    
    <!-- 编辑按钮 -->
    <button @click.stop="modalDialog.showModal()" class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-base-100/50 backdrop-blur-sm p-1 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-gray-400">
        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
      </svg>
    </button>
  </div>

  <!-- 编辑对话框 -->
  <dialog id="edit_modal" class="modal" ref="modalDialog">
    <div class="modal-box bg-base-100/50 backdrop-blur-lg backdrop-opacity-50">
      <div class="text-center">
        <h1>编辑网站</h1>
      </div>
      <div class="flex">
        <div class="p-1">
          <div class="avatar">
            <div class="w-27 rounded">
              <img :src="displayediconUrl" />
            </div>
          </div>
        </div>
        <div class="w-full p-1">
          <label class="input input-sm outline-1 w-full bg-base-100/50">
            <span>名称</span>
            <input
              v-model="siteName"
              type="text"
              class="grow"
              placeholder="网站名称"
            />
          </label>
          <label class="input input-sm outline-1 w-full bg-base-100/50 mt-1">
            <span>地址</span>
            <input
              v-model="siteUrl"
              type="text"
              class="grow"
              placeholder="https://example.com"
            />
          </label>
          <label class="input input-sm outline-1 w-full bg-base-100/50 mt-1">
            <span>图标</span>
            <input
              v-model="iconUrl"
              type="text"
              class="grow"
              placeholder="https://example.com/favicon.ico"
            />
          </label>
        
          <label class="input input-sm outline-1 w-full bg-base-100/50 mt-1">
            分类
            <input v-model="category" type="text" class="grow" placeholder="选择或输入" />
            <select v-model="categorySelect" class="bg-base-100/0 outline-0">
              <option disabled selected>请选择</option>
              <option v-for="cat in SystemStore.config.categoryList" :key="cat.name">{{ cat.name }}</option>
            </select>
          </label>

          <div class="flex justify-between gap-1 mt-2">
            <button
              @click="deleteFavorite"
              class="btn btn-sm btn-error"
            >
              删除
            </button>
            <div class="flex gap-1">
              <button
                @click="modalDialog.close()"
                class="btn btn-sm btn-ghost"
              >
                取消
              </button>
              <button class="btn btn-sm btn-primary" @click="updateFavorite">
                保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useSystemStore } from '../store/systemStore'

const SystemStore = useSystemStore()
const modalDialog = ref(null)
const props = defineProps({
    favorite:{
      url: String,
      name: String,
      icon: String,
      category: String
    }
})

// 编辑相关状态
const siteName = ref('')
const siteUrl = ref('')
const iconUrl = ref('')
const category = ref('')
const categorySelect = ref('')
const displayediconUrl = ref('')
let debounceTimer = null

// 初始化编辑表单数据
watch(() => modalDialog.value, (newVal) => {
  if (newVal) {
    siteName.value = props.favorite.name
    siteUrl.value = props.favorite.url
    iconUrl.value = props.favorite.icon
    category.value = props.favorite.category
    categorySelect.value = props.favorite.category
    displayediconUrl.value = props.favorite.icon
  }
}, { immediate: true })

// 监听分类选择
watch(categorySelect, (newVal) => {
  if (newVal) {
    category.value = newVal
  }
})

// 监听图标URL变化
watch(iconUrl, (newVal) => {
  debounceUpdate(newVal)
})

// 自定义防抖函数
const debounceUpdate = (url) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    displayediconUrl.value = url
  }, 1000)
}

// 组件卸载时清除定时器
onUnmounted(() => {
  clearTimeout(debounceTimer)
})

// 更新收藏网站
const updateFavorite = () => {
  // 查找当前收藏项在数组中的索引
  const index = SystemStore.config.favoriteList.findIndex(
    item => item.name === props.favorite.name && item.url === props.favorite.url
  )
  
  if (index !== -1) {
    // 更新收藏项
    SystemStore.config.favoriteList[index] = {
      name: siteName.value,
      url: siteUrl.value,
      icon: iconUrl.value,
      category: category.value
    }
    
    // 关闭对话框
    modalDialog.value.close()
  }
}

// 删除收藏网站
const deleteFavorite = () => {
  // 查找当前收藏项在数组中的索引
  const index = SystemStore.config.favoriteList.findIndex(
    item => item.name === props.favorite.name && item.url === props.favorite.url
  )
  
  if (index !== -1) {
    // 从数组中删除该项
    SystemStore.config.favoriteList.splice(index, 1)
    
    // 关闭对话框
    modalDialog.value.close()
  }
}

const openUrl = (url) => {
    window.open(url, '_blank')
}
</script>

<style scoped>
.group:hover .edit-button {
  opacity: 1;
}
</style>