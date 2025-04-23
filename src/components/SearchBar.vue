<template>
  <div class="flex flex-col items-center">
    <div class="flex items-center w-full max-w-3xl">
      <!-- 搜索引擎选择器 -->
      <div class="dropdown dropdown-bottom bg-base-100/30 rounded-full">
        <div tabindex="0" role="button" class="btn-xl btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full">
            <img :src="currentEngine.icon" alt="搜索引擎" />
          </div>
        </div>
        <ul tabindex="0" class="dropdown-content z-[10] menu p-2 shadow bg-base-100 backdrop-blur-xl rounded-box w-52">
          <li v-for="(engine, index) in SystemStore.config.searchEngine" :key="index">
            <a @click="changeEngine(engine)">
              <div class="flex items-center">
                <img :src="engine.icon" alt="搜索引擎图标" class="w-6 h-6 mr-2" />
                <span>{{ engine.name }}</span>
              </div>
            </a>
          </li>
          <li>
            <a @click="openAddEngineModal" class="text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              添加搜索引擎
            </a>
          </li>
          <li>
            <a @click="openEditEngineModal(currentEngine)" class="text-warning">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
              </svg>
              编辑当前引擎
            </a>
          </li>
        </ul>
      </div>
      
      <!-- 搜索输入框 -->
      <input
        type="text"
        v-model="searchText"
        @keyup.enter="search"
        :placeholder="'使用'+currentEngine.name+'搜索...'"
        class="ml-1 input input-bordered rounded-full w-full h-15 text-xl bg-base-100/50 backdrop-blur-xl"
      />
      
      <!-- 搜索按钮 -->
      <button @click="search" class="btn btn-primary btn-xl ml-1 btn-circle">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </div>
  </div>
  
  <!-- 添加搜索引擎对话框 -->
  <dialog id="add_engine_modal" class="modal" ref="addEngineModal">
    <div class="modal-box bg-base-100/50 backdrop-blur-lg backdrop-opacity-50">
      <div class="text-center">
        <h1>添加搜索引擎</h1>
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
              v-model="engineName"
              type="text"
              class="grow"
              placeholder="搜索引擎名称"
            />
          </label>
          <label class="input input-sm outline-1 w-full bg-base-100/50 mt-1">
            <span>搜索URL</span>
            <input
              v-model="engineUrl"
              type="text"
              class="grow"
              placeholder="https://example.com/search?q="
            />
          </label>
          <label class="input input-sm outline-1 w-full bg-base-100/50 mt-1">
            <span>图标</span>
            <input
              v-model="engineIcon"
              type="text"
              class="grow"
              placeholder="https://example.com/favicon.ico"
            />
          </label>

          <div class="flex justify-end gap-1 mt-2">
            <button
              @click="addEngineModal.close()"
              class="btn btn-sm btn-ghost"
            >
              取消
            </button>
            <button 
              class="btn btn-sm btn-primary" 
              @click="addEngine"
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
  
  <!-- 编辑搜索引擎对话框 -->
  <dialog id="edit_engine_modal" class="modal" ref="editEngineModal">
    <div class="modal-box bg-base-100/50 backdrop-blur-lg backdrop-opacity-50">
      <div class="text-center">
        <h1>编辑搜索引擎</h1>
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
              v-model="engineName"
              type="text"
              class="grow"
              placeholder="搜索引擎名称"
            />
          </label>
          <label class="input input-sm outline-1 w-full bg-base-100/50 mt-1">
            <span>搜索URL</span>
            <input
              v-model="engineUrl"
              type="text"
              class="grow"
              placeholder="https://example.com/search?q="
            />
          </label>
          <label class="input input-sm outline-1 w-full bg-base-100/50 mt-1">
            <span>图标</span>
            <input
              v-model="engineIcon"
              type="text"
              class="grow"
              placeholder="https://example.com/favicon.ico"
            />
          </label>
          
          <div class="flex items-center mt-2">
            <label class="cursor-pointer label">
              <span class="label-text mr-2">设为默认</span> 
              <input type="checkbox" v-model="isDefault" class="checkbox checkbox-primary checkbox-sm" />
            </label>
          </div>

          <div class="flex justify-between gap-1 mt-2">
            <button
              @click="deleteEngine"
              class="btn btn-sm btn-error"
              :disabled="SystemStore.config.searchEngine.length <= 1"
            >
              删除
            </button>
            <div class="flex gap-1">
              <button
                @click="editEngineModal.close()"
                class="btn btn-sm btn-ghost"
              >
                取消
              </button>
              <button 
                class="btn btn-sm btn-primary" 
                @click="updateEngine"
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
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useSystemStore } from '../store/systemStore'

const SystemStore = useSystemStore()
const searchText = ref('')
const addEngineModal = ref(null)
const editEngineModal = ref(null)

// 搜索引擎相关状态
const engineName = ref('')
const engineUrl = ref('')
const engineIcon = ref('')
const displayedIconUrl = ref('')
const isDefault = ref(false)
const currentEditEngine = ref(null)
let debounceTimer = null

// 获取当前搜索引擎
const currentEngine = computed(() => {
  const defaultEngineName = SystemStore.config.systemConfig.defaultEngine
  const defaultEngine = SystemStore.config.searchEngine.find(
    engine => engine.name === defaultEngineName
  )
  return defaultEngine || SystemStore.config.searchEngine[0]
})

// 监听图标URL变化
watch(engineIcon, (newVal) => {
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

// 切换搜索引擎
const changeEngine = (engine) => {
  SystemStore.setDefaultEngine(engine.name)
}

// 执行搜索
const search = () => {
  if (!searchText.value.trim()) return
  
  const url = currentEngine.value.url + encodeURIComponent(searchText.value)
  window.open(url, '_blank')
  searchText.value = ''
}

// 打开添加搜索引擎对话框
const openAddEngineModal = () => {
  engineName.value = ''
  engineUrl.value = ''
  engineIcon.value = ''
  displayedIconUrl.value = 'https://via.placeholder.com/150'
  isDefault.value = false
  addEngineModal.value.showModal()
}

// 打开编辑搜索引擎对话框
const openEditEngineModal = (engine) => {
  currentEditEngine.value = engine
  engineName.value = engine.name
  engineUrl.value = engine.url
  engineIcon.value = engine.icon
  displayedIconUrl.value = engine.icon
  isDefault.value = SystemStore.config.systemConfig.defaultEngine === engine.name
  editEngineModal.value.showModal()
}

// 添加搜索引擎
const addEngine = () => {
  if (!engineName.value.trim() || !engineUrl.value.trim()) return
  
  // 检查名称是否已存在
  const exists = SystemStore.config.searchEngine.some(
    engine => engine.name === engineName.value
  )
  
  if (!exists) {
    const newEngine = {
      name: engineName.value,
      url: engineUrl.value,
      icon: engineIcon.value || 'https://via.placeholder.com/150'
    }
    
    SystemStore.addSearchEngine(newEngine)
    
    // 如果设置为默认
    if (isDefault.value) {
      SystemStore.setDefaultEngine(engineName.value)
    }
    
    // 关闭对话框
    addEngineModal.value.close()
  }
}

// 更新搜索引擎
const updateEngine = () => {
  if (!currentEditEngine.value || !engineName.value.trim() || !engineUrl.value.trim()) return
  
  // 查找当前引擎在数组中的索引
  const index = SystemStore.config.searchEngine.findIndex(
    engine => engine.name === currentEditEngine.value.name
  )
  
  if (index !== -1) {
    const oldName = SystemStore.config.searchEngine[index].name
    const newName = engineName.value
    
    // 更新引擎
    SystemStore.config.searchEngine[index] = {
      name: newName,
      url: engineUrl.value,
      icon: engineIcon.value
    }
    
    // 如果引擎名称改变且它是默认引擎，更新默认引擎名称
    if (oldName !== newName && SystemStore.config.systemConfig.defaultEngine === oldName) {
      SystemStore.setDefaultEngine(newName)
    }
    
    // 如果设置为默认
    if (isDefault.value) {
      SystemStore.setDefaultEngine(newName)
    }
    
    // 关闭对话框
    editEngineModal.value.close()
  }
}

// 删除搜索引擎
const deleteEngine = () => {
  if (!currentEditEngine.value) return
  
  // 不允许删除最后一个搜索引擎
  if (SystemStore.config.searchEngine.length <= 1) return
  
  // 查找当前引擎在数组中的索引
  const index = SystemStore.config.searchEngine.findIndex(
    engine => engine.name === currentEditEngine.value.name
  )
  
  if (index !== -1) {
    const engineName = SystemStore.config.searchEngine[index].name
    
    // 从数组中删除该项
    SystemStore.config.searchEngine.splice(index, 1)
    
    // 如果删除的是当前默认引擎，切换到第一个引擎
    if (SystemStore.config.systemConfig.defaultEngine === engineName) {
      SystemStore.setDefaultEngine(SystemStore.config.searchEngine[0].name)
    }
    
    // 关闭对话框
    editEngineModal.value.close()
  }
}

// 组件挂载时初始化
onMounted(() => {
  // 如果没有设置默认引擎，设置第一个为默认
  if (!SystemStore.config.systemConfig.defaultEngine && SystemStore.config.searchEngine.length > 0) {
    SystemStore.setDefaultEngine(SystemStore.config.searchEngine[0].name)
  }
})
</script>

<style scoped>
</style>