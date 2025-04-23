<template>
  <div class="p-1 h-screen flex flex-col" style="background-image: url('https://api.xsot.cn/bing?jump=true') !important; background-size: cover;background-attachment: fixed;background-position: center;">
    <NavBar />
    <div class="flex grow min-h-0">
      <div class="max-md:hidden md:w-fit">
        <Menu />
      </div>
      
      <div class="w-full max-md:pt-60 md:pt-20 md:pl-20 md:pr-20 grow flex flex-col min-h-0"> 
        <div class="grow-0">
          <SearchBar />
        </div>
        <div>
          <!-- 横向滚动菜单，仅在移动设备上显示 -->
          <HorizontalMenu />
        </div>
        <div class="p-5 flex-1 min-h-0">
          <Favorites />
        </div>
      </div>
    </div>
    
    <!-- 同步状态提示 -->
    <div v-if="SystemStore.isSyncing" class="toast toast-end">
      <div class="alert alert-info">
        <span>正在同步数据...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore 忽略 NavBar 组件的类型检查
import NavBar from './components/NavBar.vue'
// @ts-ignore
import Menu from './components/Menu.vue'
// @ts-ignore
import SearchBar from './components/SearchBar.vue'
// @ts-ignore
import Favorites from './components/Favorites.vue'
// @ts-ignore
import HorizontalMenu from './components/HorizontalMenu.vue'
import { useSystemStore } from './store/systemStore'
import { onBeforeMount, onMounted } from 'vue'

const SystemStore = useSystemStore()

onBeforeMount(() => {
  // 配置已经在store初始化时从localStorage加载
  // 只需要设置初始分类
  if (SystemStore.config.categoryList && SystemStore.config.categoryList.length > 0) {
    SystemStore.changeNowCategory(SystemStore.config.categoryList[0].name)
  }
})

onMounted(async () => {
  // 如果启用了 WebDAV 同步，尝试从 WebDAV 同步配置
  if (SystemStore.config.webdav?.enabled) {
    const updated = await SystemStore.syncFromWebDAV()
    if (updated) {
      console.log('已从 WebDAV 同步最新配置')
    }
  }
})
</script>

<style scoped>
</style>