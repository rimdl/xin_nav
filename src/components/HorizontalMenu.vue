<template>
  <div class="md:hidden w-full overflow-x-auto scrollbar-hide py-2">
    <div class="flex space-x-2 px-4">
      <button
        v-for="category in SystemStore.config.categoryList"
        :key="category.name"
        @click="SystemStore.changeNowCategory(category.name)"
        class="btn btn-sm min-w-max flex-shrink-0 relative group"
        :class="{ 'btn-primary': SystemStore.nowCategory === category.name }"
      >
        <img :src="category.icon" alt="分类图标" class="w-4 h-4 mr-1" />
        {{ category.name }}
        
        <!-- 编辑按钮 -->
        <div class="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button @click.stop="openEditModal(category)" class="btn btn-xs btn-circle btn-ghost bg-base-100/70">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
        </div>
      </button>
      
      <!-- 添加分类按钮 -->
      <button 
        @click="openAddModal" 
        class="btn btn-sm btn-outline btn-success min-w-max flex-shrink-0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-1">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        添加分类
      </button>
    </div>
  </div>
  
  <!-- 添加分类对话框 -->
  <dialog id="add_category_modal" class="modal" ref="addCategoryModal">
    <div class="modal-box bg-base-100/50 backdrop-blur-lg">
      <h3 class="font-bold text-lg mb-4">添加新分类</h3>
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">分类名称</span>
        </label>
        <input v-model="newCategory.name" type="text" placeholder="输入分类名称" class="input input-bordered w-full" />
        
        <label class="label mt-2">
          <span class="label-text">图标URL</span>
        </label>
        <input v-model="newCategory.icon" type="text" placeholder="输入图标URL" class="input input-bordered w-full" />
      </div>
      <div class="modal-action">
        <button @click="addCategoryModal.close()" class="btn btn-ghost">取消</button>
        <button @click="addCategory" class="btn btn-primary" :disabled="!newCategory.name || !newCategory.icon">添加</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>关闭</button>
    </form>
  </dialog>
  
  <!-- 编辑分类对话框 -->
  <dialog id="edit_category_modal" class="modal" ref="editCategoryModal">
    <div class="modal-box bg-base-100/50 backdrop-blur-lg">
      <h3 class="font-bold text-lg mb-4">编辑分类</h3>
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">分类名称</span>
        </label>
        <input v-model="editingCategory.name" type="text" placeholder="输入分类名称" class="input input-bordered w-full" />
        
        <label class="label mt-2">
          <span class="label-text">图标URL</span>
        </label>
        <input v-model="editingCategory.icon" type="text" placeholder="输入图标URL" class="input input-bordered w-full" />
      </div>
      <div class="modal-action flex justify-between">
        <button @click="deleteCategory" class="btn btn-error">删除</button>
        <div>
          <button @click="editCategoryModal.close()" class="btn btn-ghost">取消</button>
          <button @click="updateCategory" class="btn btn-primary" :disabled="!editingCategory.name || !editingCategory.icon">保存</button>
        </div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>关闭</button>
    </form>
  </dialog>
  
  <!-- 确认删除对话框 -->
  <dialog id="confirm_delete_modal" class="modal" ref="confirmDeleteModal">
    <div class="modal-box bg-base-100/50 backdrop-blur-lg">
      <h3 class="font-bold text-lg">确认删除</h3>
      <p class="py-4">您确定要删除分类 "{{ editingCategory.name }}" 吗？该分类下的所有收藏网站也将被移除。</p>
      <div class="modal-action">
        <button @click="confirmDeleteModal.close()" class="btn btn-ghost">取消</button>
        <button @click="confirmDelete" class="btn btn-error">确认删除</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>关闭</button>
    </form>
  </dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSystemStore } from '../store/systemStore'

const SystemStore = useSystemStore()

// 对话框引用
const addCategoryModal = ref(null)
const editCategoryModal = ref(null)
const confirmDeleteModal = ref(null)

// 新分类数据
const newCategory = ref({
  name: '',
  icon: ''
})

// 正在编辑的分类
const editingCategory = ref({
  name: '',
  icon: '',
  originalName: '' // 用于存储原始名称，以便更新
})

// 打开添加分类对话框
const openAddModal = () => {
  newCategory.value = {
    name: '',
    icon: ''
  }
  addCategoryModal.value.showModal()
}

// 添加分类
const addCategory = () => {
  if (!newCategory.value.name || !newCategory.value.icon) return
  
  // 检查分类名称是否已存在
  const exists = SystemStore.config.categoryList.some(cat => cat.name === newCategory.value.name)
  if (exists) {
    alert('分类名称已存在，请使用其他名称')
    return
  }
  
  // 添加新分类
  SystemStore.addCategory({
    name: newCategory.value.name,
    icon: newCategory.value.icon
  })
  
  // 如果这是第一个分类，则设置为当前分类
  if (SystemStore.config.categoryList.length === 1) {
    SystemStore.changeNowCategory(newCategory.value.name)
  }
  
  // 关闭对话框
  addCategoryModal.value.close()
}

// 打开编辑分类对话框
const openEditModal = (category) => {
  editingCategory.value = {
    name: category.name,
    icon: category.icon,
    originalName: category.name
  }
  editCategoryModal.value.showModal()
}

// 更新分类
const updateCategory = () => {
  if (!editingCategory.value.name || !editingCategory.value.icon) return
  
  // 如果名称已更改，检查是否与其他分类冲突
  if (editingCategory.value.name !== editingCategory.value.originalName) {
    const exists = SystemStore.config.categoryList.some(cat => 
      cat.name === editingCategory.value.name && cat.name !== editingCategory.value.originalName
    )
    if (exists) {
      alert('分类名称已存在，请使用其他名称')
      return
    }
  }
  
  // 更新分类
  const index = SystemStore.config.categoryList.findIndex(cat => cat.name === editingCategory.value.originalName)
  if (index !== -1) {
    // 更新分类信息
    SystemStore.config.categoryList[index] = {
      name: editingCategory.value.name,
      icon: editingCategory.value.icon
    }
    
    // 如果当前选中的分类名称被修改，更新当前分类
    if (SystemStore.nowCategory === editingCategory.value.originalName) {
      SystemStore.changeNowCategory(editingCategory.value.name)
    }
    
    // 更新该分类下所有收藏网站的分类名称
    SystemStore.config.favoriteList.forEach(site => {
      if (site.category === editingCategory.value.originalName) {
        site.category = editingCategory.value.name
      }
    })
    
    // 保存更改
    SystemStore.saveConfig()
  }
  
  // 关闭对话框
  editCategoryModal.value.close()
}

// 删除分类
const deleteCategory = () => {
  // 打开确认对话框
  confirmDeleteModal.value.showModal()
}

// 确认删除分类
const confirmDelete = () => {
  // 删除分类
  const index = SystemStore.config.categoryList.findIndex(cat => cat.name === editingCategory.value.originalName)
  if (index !== -1) {
    SystemStore.config.categoryList.splice(index, 1)
    
    // 删除该分类下的所有收藏网站
    SystemStore.config.favoriteList = SystemStore.config.favoriteList.filter(
      site => site.category !== editingCategory.value.originalName
    )
    
    // 如果删除的是当前选中的分类，则切换到第一个分类（如果有）
    if (SystemStore.nowCategory === editingCategory.value.originalName) {
      if (SystemStore.config.categoryList.length > 0) {
        SystemStore.changeNowCategory(SystemStore.config.categoryList[0].name)
      } else {
        SystemStore.nowCategory = ''
      }
    }
    
    // 保存更改
    SystemStore.saveConfig()
  }
  
  // 关闭对话框
  confirmDeleteModal.value.close()
  editCategoryModal.value.close()
}
</script>

<style scoped>
/* 隐藏滚动条但保留滚动功能 */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>