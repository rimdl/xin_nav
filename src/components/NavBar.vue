<template>
    <div class="navbar bg-transparent bg-opacity-50 shadow-sm">
  <div class="flex-1">
    <a class="btn btn-ghost text-xl">xinNAV</a>
  </div>
  <div class="flex gap-2">
    <div class="dropdown dropdown-end">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="搜索网站" 
        class="input input-bordered w-24 md:w-auto" 
        @input="searchSites"
        @focus="showResults = true"
        @blur="hideResultsDelayed"
      />
      
      <!-- 搜索结果下拉列表 -->
      <ul v-if="showResults && filteredSites.length > 0" 
          class="dropdown-content menu p-2 shadow bg-base-100/50 backdrop-blur-xl rounded-box z-[1] mt-1 w-64">
        <li v-for="site in filteredSites" :key="site.url">
          <a @mousedown="openSite(site.url)" class="flex items-center gap-2">
            <img :src="site.icon" alt="网站图标" class="w-5 h-5" />
            <div>
              <div class="font-medium">{{ site.name }}</div>
              <div class="text-xs opacity-60 truncate">{{ site.url }}</div>
            </div>
          </a>
        </li>
      </ul>
      
      <div v-if="showResults && searchQuery && !filteredSites.length" 
           class="dropdown-content p-2 shadow bg-base-100/50 backdrop-blur-xl rounded-box z-[1] mt-1 w-64 text-center py-4">
        未找到匹配的网站
      </div>
    </div>
    
    <!-- 添加手动同步按钮 -->
    <button 
      v-if="SystemStore.config.webdav?.enabled" 
      @click="manualSync" 
      class="btn btn-ghost btn-circle"
      :class="{'loading': SystemStore.isSyncing}"
      :disabled="SystemStore.isSyncing"
      title="手动同步"
    >
      <svg v-if="!SystemStore.isSyncing" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    </button>
    
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
        <div class="w-10 rounded-full">
          <img
            alt="Tailwind CSS Navbar component"
            src="../assets/logo.png" />
        </div>
      </div>
      <ul
        tabindex="0"
        class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
        <li>
          <a @click="webdavModal.showModal()" class="justify-between">
            WebDAV 同步
            <span v-if="SystemStore.config.webdav?.enabled" class="badge badge-success">已启用</span>
            <span v-else class="badge">未启用</span>
          </a>
        </li>
        <li><a>Settings</a></li>
        <li><a>Logout</a></li>
      </ul>
    </div>
  </div>
</div>

  <!-- WebDAV 设置对话框 -->
  <dialog id="webdav_modal" class="modal" ref="webdavModal">
    <div class="modal-box bg-base-100/50 backdrop-blur-lg backdrop-opacity-50">
      <div class="text-center">
        <h1>WebDAV 同步设置</h1>
      </div>
      <div class="p-2">
        <label class="input input-sm outline-1 w-full bg-base-100/50 mt-2">
          <span>服务器地址</span>
          <input
            v-model="webdavUrl"
            type="text"
            class="grow"
            placeholder="https://example.com/webdav/"
          />
        </label>
        <label class="input input-sm outline-1 w-full bg-base-100/50 mt-2">
          <span>用户名</span>
          <input
            v-model="webdavUsername"
            type="text"
            class="grow"
            placeholder="用户名"
          />
        </label>
        <label class="input input-sm outline-1 w-full bg-base-100/50 mt-2">
          <span>密码</span>
          <input
            v-model="webdavPassword"
            type="password"
            class="grow"
            placeholder="密码"
          />
        </label>
        
        <div class="flex items-center mt-4">
          <label class="cursor-pointer label">
            <span class="label-text mr-2">启用同步</span> 
            <input type="checkbox" v-model="webdavEnabled" class="checkbox checkbox-primary checkbox-sm" />
          </label>
        </div>
        
        <div v-if="SystemStore.config.webdav?.lastSync" class="text-xs mt-2 text-gray-400">
          上次同步时间: {{ formatDate(SystemStore.config.webdav.lastSync) }}
        </div>
        
        <div class="flex justify-between gap-1 mt-4">
          <button
            @click="testConnection"
            class="btn btn-sm btn-info"
            :disabled="!webdavUrl || !webdavUsername || !webdavPassword"
          >
            测试连接
          </button>
          <div class="flex gap-1">
            <button
              @click="webdavModal.close()"
              class="btn btn-sm btn-ghost"
            >
              取消
            </button>
            <button 
              class="btn btn-sm btn-primary" 
              @click="saveWebDAVSettings"
            >
              保存
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
import { ref, computed, onMounted } from 'vue'
import { useSystemStore } from '../store/systemStore'
import { webdavService } from '../utils/webdavService'

const SystemStore = useSystemStore()
const searchQuery = ref('')
const showResults = ref(false)
let hideTimeout = null
const webdavModal = ref(null)

// WebDAV 设置
const webdavUrl = ref('')
const webdavUsername = ref('')
const webdavPassword = ref('')
const webdavEnabled = ref(false)

// 从所有分类中获取所有收藏的网站
const allFavorites = computed(() => {
  return SystemStore.config.favoriteList || []
})

// 根据搜索关键词过滤网站
const filteredSites = ref([])

// 搜索网站方法
const searchSites = () => {
  if (!searchQuery.value.trim()) {
    filteredSites.value = []
    return
  }
  
  const query = searchQuery.value.toLowerCase()
  filteredSites.value = allFavorites.value.filter(site => 
    site.name.toLowerCase().includes(query) || 
    site.url.toLowerCase().includes(query)
  ).slice(0, 10) // 限制最多显示10个结果
}

// 打开网站
const openSite = (url) => {
  window.open(url, '_blank')
  searchQuery.value = ''
  filteredSites.value = []
}

// 延迟隐藏结果，以便用户可以点击结果
const hideResultsDelayed = () => {
  hideTimeout = setTimeout(() => {
    showResults.value = false
  }, 200)
}

// 当用户重新聚焦搜索框时，清除隐藏超时
const clearHideTimeout = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 测试 WebDAV 连接
const testConnection = async () => {
  if (!webdavUrl.value || !webdavUsername.value || !webdavPassword.value) return
  
  const connected = webdavService.connect(webdavUrl.value, webdavUsername.value, webdavPassword.value)
  if (connected) {
    alert('连接成功！')
  } else {
    alert('连接失败，请检查服务器地址和凭据。')
  }
}

// 保存 WebDAV 设置
const saveWebDAVSettings = () => {
  SystemStore.setWebDAVConfig(
    webdavUrl.value,
    webdavUsername.value,
    webdavPassword.value,
    webdavEnabled.value
  )
  webdavModal.value.close()
}

// 组件挂载时初始化 WebDAV 设置
onMounted(() => {
  // 初始化 WebDAV 设置表单
  webdavUrl.value = SystemStore.config.webdav?.url || ''
  webdavUsername.value = SystemStore.config.webdav?.username || ''
  webdavPassword.value = SystemStore.config.webdav?.password || ''
  webdavEnabled.value = SystemStore.config.webdav?.enabled || false
  
  // 如果启用了 WebDAV 同步，尝试从 WebDAV 同步配置
  if (SystemStore.config.webdav?.enabled) {
    SystemStore.syncFromWebDAV()
  }
})

// 手动同步方法
const manualSync = async () => {
  if (!SystemStore.config.webdav?.enabled || SystemStore.isSyncing) return
  
  try {
    // 先尝试从 WebDAV 同步配置
    const updated = await SystemStore.syncFromWebDAV()
    if (updated) {
      alert('已从云端同步最新配置')
    } else {
      // 如果没有更新，则上传本地配置
      await SystemStore.syncToWebDAV()
      alert('已将本地配置同步到云端')
    }
  } catch (error) {
    console.error('手动同步失败:', error)
    alert('同步失败，请检查网络连接和 WebDAV 设置')
  }
}
</script>

<style scoped>
.dropdown-content {
  width: 100%;
  min-width: 250px;
}
</style>