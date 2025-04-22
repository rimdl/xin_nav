import { createClient } from 'webdav';

class WebDAVService {
  private client: any = null;
  private isConnected: boolean = false;
  private syncEnabled: boolean = false;
  
  // 初始化 WebDAV 客户端
  connect(url: string, username: string, password: string): boolean {
    try {
      this.client = createClient(url, {
        username,
        password
      });
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('WebDAV 连接失败:', error);
      this.isConnected = false;
      return false;
    }
  }
  
  // 检查连接状态
  checkConnection(): boolean {
    return this.isConnected && this.client !== null;
  }
  
  // 设置是否启用同步
  setSyncEnabled(enabled: boolean): void {
    this.syncEnabled = enabled;
  }
  
  // 获取同步状态
  getSyncEnabled(): boolean {
    return this.syncEnabled;
  }
  
  // 上传配置到 WebDAV
  async uploadConfig(config: any): Promise<boolean> {
    if (!this.checkConnection() || !this.syncEnabled) return false;
    
    try {
      // 确保目录存在
      await this.ensureDirectory('/xinNav');
      
      // 尝试解锁文件（如果存在）
      try {
        await this.unlockFile('/xinNav/config.json');
      } catch (error) {
        console.log('文件未锁定或解锁失败，继续上传');
      }
      
      // 将配置转换为 JSON 字符串并上传
      const configStr = JSON.stringify(config);
      
      // 添加重试逻辑
      let retries = 3;
      while (retries > 0) {
        try {
          await this.client.putFileContents('/xinNav/config.json', configStr, {
            overwrite: true,
            contentLength: configStr.length
          });
          return true;
        } catch (error: any) {
          if (error.status === 423 && retries > 1) {
            console.log(`文件被锁定，等待重试... 剩余重试次数: ${retries - 1}`);
            // 等待一段时间后重试
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries--;
          } else {
            throw error;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('上传配置失败:', error);
      return false;
    }
  }
  
  // 尝试解锁文件
  private async unlockFile(path: string): Promise<void> {
    try {
      // 注意：这是一个简化的解锁实现，实际的 WebDAV 解锁可能需要更复杂的处理
      // 例如获取锁定令牌等，这取决于 WebDAV 服务器的实现
      await this.client.customRequest({
        url: path,
        method: 'UNLOCK',
        headers: {}
      });
    } catch (error) {
      console.error('解锁文件失败:', error);
      throw error;
    }
  }
  
  // 从 WebDAV 下载配置
  async downloadConfig(): Promise<any | null> {
    if (!this.checkConnection() || !this.syncEnabled) return null;
    
    try {
      // 检查文件是否存在
      const exists = await this.client.exists('/xinNav/config.json');
      if (!exists) return null;
      
      // 下载配置文件
      const content = await this.client.getFileContents('/xinNav/config.json', { format: 'text' });
      return JSON.parse(content as string);
    } catch (error) {
      console.error('下载配置失败:', error);
      return null;
    }
  }
  
  // 确保目录存在
  private async ensureDirectory(path: string): Promise<void> {
    try {
      const exists = await this.client.exists(path);
      if (!exists) {
        await this.client.createDirectory(path);
      }
    } catch (error) {
      console.error('创建目录失败:', error);
    }
  }
  
  // 获取远程配置的最后修改时间
  async getLastModified(): Promise<Date | null> {
    if (!this.checkConnection() || !this.syncEnabled) return null;
    
    try {
      const exists = await this.client.exists('/xinNav/config.json');
      if (!exists) return null;
      
      const stat = await this.client.stat('/xinNav/config.json');
      return new Date(stat.lastmod);
    } catch (error) {
      console.error('获取最后修改时间失败:', error);
      return null;
    }
  }
}

// 导出单例
export const webdavService = new WebDAVService();