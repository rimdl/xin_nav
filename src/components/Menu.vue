<template>
  <div class="fixed left-0 top-16 h-[calc(100%-4rem)] p-2 flex flex-col items-center backdrop-blur-xl">
    <!-- 当前分类显示 -->
    <div class="w-full text-center mb-4 text-xs text-gray-300 truncate">
      <span v-if="SystemStore.nowCategory" class="font-bold">{{ SystemStore.nowCategory }}</span>
      <span v-else>未选择分类</span>
    </div>
    
    <div class="flex flex-col items-center gap-2">
      <!-- 分类列表 -->
      <div
        v-for="(item, index) in SystemStore.config.categoryList"
        :key="index"
        @click="SystemStore.changeNowCategory(item.name)"
        class="relative group tooltip tooltip-right"
        :data-tip="item.name"
      >
        <div
          class="avatar cursor-pointer"
          :class="{ 'outline outline-primary rounded-full': SystemStore.nowCategory === item.name }"
        >
          <div class="w-10 rounded-full">
            <img :src="item.icon" />
          </div>
        </div>
        
        <!-- 编辑按钮 -->
        <button 
          @click.stop="openEditModal(item)" 
          class="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-base-100/50 backdrop-blur-sm p-1 rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 text-gray-300">
            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
          </svg>
        </button>
      </div>
      
      <!-- 添加分类按钮 -->
      <div @click="openAddModal()" class="avatar cursor-pointer">
        <div class="w-10 rounded-full flex items-center justify-center bg-base-100/50">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 编辑分类对话框 -->
  <dialog id="edit_category_modal" class="modal" ref="editModalDialog">
    <div class="modal-box bg-base-100/50 backdrop-blur-lg backdrop-opacity-50">
      <div class="text-center">
        <h1>编辑分类</h1>
      </div>
      <div class="flex">
        <div class="p-1">
          <div class="avatar">
            <div class="w-20 rounded">
              <img :src="displayedIconUrl" />
            </div>
          </div>
        </div>
        <div class="w-full p-1">
          <label class="input input-sm outline-1 w-full bg-base-100/50">
            <span>名称</span>
            <input
              v-model="categoryName"
              type="text"
              class="grow"
              placeholder="分类名称"
            />
          </label>
          <label class="input input-sm outline-1 w-full bg-base-100/50 mt-1">
            <span>图标</span>
            <input
              v-model="categoryIcon"
              type="text"
              class="grow"
              placeholder="https://example.com/favicon.ico"
            />
          </label>

          <div class="flex justify-between gap-1 mt-2">
            <button
              @click="deleteCategory"
              class="btn btn-sm btn-error"
            >
              删除
            </button>
            <div class="flex gap-1">
              <button
                @click="editModalDialog.close()"
                class="btn btn-sm btn-ghost"
              >
                取消
              </button>
              <button 
                class="btn btn-sm btn-primary" 
                @click="updateCategory"
              >
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
  
  <!-- 添加分类对话框 -->
  <dialog id="add_category_modal" class="modal" ref="addModalDialog">
    <div class="modal-box bg-base-100/50 backdrop-blur-lg backdrop-opacity-50">
      <div class="text-center">
        <h1>添加分类</h1>
      </div>
      <div class="flex">
        <div class="p-1">
          <div class="avatar">
            <div class="w-20 rounded">
              <img :src="displayedIconUrl" />
            </div>
          </div>
        </div>
        <div class="w-full p-1">
          <label class="input input-sm outline-1 w-full bg-base-100/50">
            <span>名称</span>
            <input
              v-model="categoryName"
              type="text"
              class="grow"
              placeholder="分类名称"
            />
          </label>
          <label class="input input-sm outline-1 w-full bg-base-100/50 mt-1">
            <span>图标</span>
            <input
              v-model="categoryIcon"
              type="text"
              class="grow"
              placeholder="https://example.com/favicon.ico"
            />
          </label>

          <div class="flex justify-end gap-1 mt-2">
            <button
              @click="addModalDialog.close()"
              class="btn btn-sm btn-ghost"
            >
              取消
            </button>
            <button 
              class="btn btn-sm btn-primary" 
              @click="addCategory"
            >
              添加
            </button>
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
const editModalDialog = ref(null)
const addModalDialog = ref(null)

// 编辑相关状态
const categoryName = ref('')
const categoryIcon = ref('')
const displayedIconUrl = ref('')
const currentCategory = ref(null)
let debounceTimer = null

// 监听图标URL变化
watch(categoryIcon, (newVal) => {
  debounceUpdate(newVal)
})

// 自定义防抖函数
const debounceUpdate = (url) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    displayedIconUrl.value = url
  }, 1000)
}

// 组件卸载时清除定时器
onUnmounted(() => {
  clearTimeout(debounceTimer)
})

// 打开编辑对话框
const openEditModal = (category) => {
  currentCategory.value = category
  categoryName.value = category.name
  categoryIcon.value = category.icon
  displayedIconUrl.value = category.icon
  editModalDialog.value.showModal()
}

// 打开添加对话框
const openAddModal = () => {
  categoryName.value = ''
  categoryIcon.value = ''
  displayedIconUrl.value = ''
  addModalDialog.value.showModal()
}

// 更新分类
const updateCategory = () => {
  if (!currentCategory.value) return
  
  // 查找当前分类在数组中的索引
  const index = SystemStore.config.categoryList.findIndex(
    item => item.name === currentCategory.value.name
  )
  
  if (index !== -1) {
    const oldName = SystemStore.config.categoryList[index].name
    const newName = categoryName.value
    
    // 更新分类
    SystemStore.config.categoryList[index] = {
      name: newName,
      icon: categoryIcon.value
    }
    
    // 如果分类名称改变，需要更新所有使用该分类的收藏项
    if (oldName !== newName) {
      SystemStore.config.favoriteList.forEach(item => {
        if (item.category === oldName) {
          item.category = newName
        }
      })
      
      // 如果当前选中的分类是被修改的分类，更新当前分类
      if (SystemStore.nowCategory === oldName) {
        SystemStore.changeNowCategory(newName)
      }
    }
    
    // 关闭对话框
    editModalDialog.value.close()
  }
}

// 删除分类
const deleteCategory = () => {
  if (!currentCategory.value) return
  
  // 查找当前分类在数组中的索引
  const index = SystemStore.config.categoryList.findIndex(
    item => item.name === currentCategory.value.name
  )
  
  if (index !== -1) {
    const categoryName = SystemStore.config.categoryList[index].name
    
    // 从数组中删除该项
    SystemStore.config.categoryList.splice(index, 1)
    
    // 如果删除的是当前选中的分类，切换到第一个分类（如果有）
    if (SystemStore.nowCategory === categoryName) {
      if (SystemStore.config.categoryList.length > 0) {
        SystemStore.changeNowCategory(SystemStore.config.categoryList[0].name)
      } else {
        SystemStore.changeNowCategory('')
      }
    }
    
    // 关闭对话框
    editModalDialog.value.close()
  }
}

// 添加分类
const addCategory = () => {
  // 检查分类名是否已存在
  const exists = SystemStore.config.categoryList.some(
    item => item.name === categoryName.value
  )
  
  if (!exists && categoryName.value.trim() !== '') {
    // 使用 store 中的 addCategory 方法添加分类
    SystemStore.addCategory({
      name: categoryName.value,
      icon: categoryIcon.value || 'https://via.placeholder.com/150'
    })
    
    // 如果这是第一个分类，自动选中它
    if (SystemStore.config.categoryList.length === 1) {
      SystemStore.changeNowCategory(categoryName.value)
    }
    
    // 关闭对话框
    addModalDialog.value.close()
  }
}
</script>

<style scoped>
.group:hover .edit-button {
  opacity: 1;
}
</style>