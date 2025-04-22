import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { webdavService } from '../utils/webdavService';

// 本地存储的键名
const STORAGE_KEY = 'xin_nav_config'

// 默认配置
const defaultConfig = {
  searchEngine: [
    {
      name: 'bing',
      url: 'https://cn.bing.com/search?q=',
      icon: 'https://cn.bing.com/sa/simg/favicon-trans-bg-blue-mg-png.png',
    },
    {
      name: 'baidu',
      url: 'https://www.baidu.com/s?wd=',
      icon: 'https://www.baidu.com/favicon.ico',
    }
  ],
  systemConfig: {
    openInNewTab: true,
    defaultEngine: 'bing'
  },
  categoryList: [
   
  ],
  favoriteList: [
   
  ],
  webdav: {
    url: '',
    username: '',
    password: '',
    enabled: false,
    lastSync: null
  }
}

// 从localStorage读取配置，如果不存在则使用默认配置
const loadConfigFromStorage = () => {
  try {
    const storedConfig = localStorage.getItem(STORAGE_KEY)
    return storedConfig ? JSON.parse(storedConfig) : defaultConfig
  } catch (error) {
    console.error('读取本地存储配置失败:', error)
    return defaultConfig
  }
}

export const useSystemStore = defineStore('system', {
  state: () => ({
    config: loadConfigFromStorage(),
    nowCategory: '',
    isSyncing: false
  }),
  
  actions: {
    // 切换当前分类
    changeNowCategory(category) {
      this.nowCategory = category
    },
    
    // 添加收藏网站
    addFavorite(favorite) {
      this.config.favoriteList.push(favorite)
      this.saveConfig() // 添加后自动保存
    },
    
    // 添加分类
    addCategory(category) {
      this.config.categoryList.push(category)
      this.saveConfig() // 添加后自动保存
    },
    
    // 设置默认搜索引擎
    setDefaultEngine(engineName) {
      this.config.systemConfig.defaultEngine = engineName
      this.saveConfig() // 修改后自动保存
    },
    
    // 添加搜索引擎
    addSearchEngine(engine) {
      this.config.searchEngine.push(engine)
      this.saveConfig() // 添加后自动保存
    },
    
    // 保存配置到本地存储
    saveConfig() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config))
        // 如果启用了 WebDAV 同步，则同步到 WebDAV
        this.syncToWebDAV()
      } catch (error) {
        console.error('保存配置失败:', error)
      }
    },
    
    // 设置 WebDAV 配置
    async setWebDAVConfig(url, username, password, enabled) {
      // 保存当前的 WebDAV 配置
      this.config.webdav = {
        url,
        username,
        password,
        enabled,
        lastSync: this.config.webdav?.lastSync || null
      }
      
      // 更新 WebDAV 服务连接
      if (enabled) {
        const connected = webdavService.connect(url, username, password)
        webdavService.setSyncEnabled(connected && enabled)
        
        if (connected) {
          // 连接成功后，先尝试从 WebDAV 同步配置
          this.isSyncing = true
          try {
            // 获取远程配置的最后修改时间
            const lastModified = await webdavService.getLastModified()
            
            if (lastModified) {
              // 如果云端存在配置，则优先下载云端配置
              console.log('检测到云端配置，正在下载...')
              const remoteConfig = await webdavService.downloadConfig()
              if (remoteConfig) {
                // 保留当前的 WebDAV 配置
                const currentWebDAV = this.config.webdav
                
                // 更新本地配置
                this.config = remoteConfig
                
                // 恢复 WebDAV 配置
                this.config.webdav = currentWebDAV
                this.config.webdav.lastSync = new Date().toISOString()
                
                // 保存到本地存储
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config))
                
                console.log('已从云端同步配置到本地')
              }
            } else {
              // 如果云端不存在配置，则上传本地配置
              console.log('云端无配置，上传本地配置...')
              await this.syncToWebDAV()
            }
          } catch (error) {
            console.error('WebDAV 同步失败:', error)
          } finally {
            this.isSyncing = false
          }
        }
      } else {
        webdavService.setSyncEnabled(false)
      }
      
      // 保存 WebDAV 配置到本地存储
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config))
      } catch (error) {
        console.error('保存配置失败:', error)
      }
    },
    
    // 同步配置到 WebDAV
    async syncToWebDAV() {
      if (!this.config.webdav.enabled) return
      
      this.isSyncing = true
      try {
        // 确保 WebDAV 客户端已连接
        if (!webdavService.checkConnection()) {
          webdavService.connect(
            this.config.webdav.url,
            this.config.webdav.username,
            this.config.webdav.password
          )
          webdavService.setSyncEnabled(this.config.webdav.enabled)
        }
        
        // 上传配置
        const success = await webdavService.uploadConfig(this.config)
        if (success) {
          this.config.webdav.lastSync = new Date().toISOString()
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config))
        }
      } catch (error) {
        console.error('同步到 WebDAV 失败:', error)
      } finally {
        this.isSyncing = false
      }
    },
    
    // 从 WebDAV 同步配置
    async syncFromWebDAV() {
      if (!this.config.webdav.enabled) return false
      
      this.isSyncing = true
      try {
        // 确保 WebDAV 客户端已连接
        if (!webdavService.checkConnection()) {
          webdavService.connect(
            this.config.webdav.url,
            this.config.webdav.username,
            this.config.webdav.password
          )
          webdavService.setSyncEnabled(this.config.webdav.enabled)
        }
        
        // 获取远程配置的最后修改时间
        const lastModified = await webdavService.getLastModified()
        
        // 如果远程配置不存在或本地配置更新，则上传本地配置
        if (!lastModified) {
          await this.syncToWebDAV()
          return false
        }
        
        // 如果远程配置比本地更新，则下载远程配置
        const localLastSync = this.config.webdav.lastSync ? new Date(this.config.webdav.lastSync) : null
        if (!localLastSync || lastModified > localLastSync) {
          const remoteConfig = await webdavService.downloadConfig()
          if (remoteConfig) {
            // 保留当前的 WebDAV 配置
            const currentWebDAV = this.config.webdav
            
            // 更新本地配置
            this.config = remoteConfig
            
            // 恢复 WebDAV 配置
            this.config.webdav = currentWebDAV
            this.config.webdav.lastSync = new Date().toISOString()
            
            // 保存到本地存储
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config))
            
            // 如果有当前分类，确保它仍然存在
            if (this.nowCategory) {
              const categoryExists = this.config.categoryList.some(
                category => category.name === this.nowCategory
              )
              if (!categoryExists && this.config.categoryList.length > 0) {
                this.changeNowCategory(this.config.categoryList[0].name)
              }
            }
            
            return true
          }
        }
        
        return false
      } catch (error) {
        console.error('从 WebDAV 同步失败:', error)
        return false
      } finally {
        this.isSyncing = false
      }
    }
  }
})