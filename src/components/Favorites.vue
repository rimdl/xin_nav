<template>
  <div
    class="flex flex-wrap w-full overflow-y-auto overflow-x-hidden no-scrollbar"
    style="max-height: calc(100%)"
  >
    <div
      class="p-1 md:w-1/6 max-md:w-1/2"
      v-for="favorite in favorites"
      :key="favorite.name"
    >
      <FavoriteItem :favorite="favorite" />
    </div>
    <div @click="modalDialog.showModal()" class="p-1 md:w-1/6 max-md:w-1/2">
      <div
        class="hover:scale-105 cursor-pointer rounded-md flex flex-col items-center justify-center w-full p-5 hover:backdrop-blur-xl backdrop-blur-xl duration-200"
      >
        <div class="w-15 h-15 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </div>
        <div class="p-2 text-xs text-gray-300">
          <span>添加</span>
        </div>
      </div>
    </div>
  </div>

  <dialog id="my_modal_2" class="modal" ref="modalDialog">
    <div class="modal-box bg-base-100/50 backdrop-blur-lg backdrop-opacity-50">
      <div class="text-center">
        <h1>添加网站</h1>
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
              placeholder="bing"
            />
          </label>
          <label class="input input-sm outline-1 w-full bg-base-100/50 mt-1">
            <span>地址</span>
            <input
              v-model="siteUrl"
              type="text"
              class="grow"
              placeholder="https://cn.bing.com/search?q="
            />
          </label>
          <label class="input input-sm outline-1 w-full bg-base-100/50 mt-1">
            <span>图标</span>
            <input
              v-model="iconUrl"
              type="text"
              class="grow"
              placeholder="https://cn.bing.com/sa/simg/favicon-trans-bg-blue-mg-png.png"
            />
          </label>
        
          <label class="input input-sm outline-1 w-full bg-base-100/50 mt-1">
            分类
            <input v-model="category" type="text" class="grow" placeholder="选择或输入" />
            <select v-model="categorySelect" class="bg-base-100/0 outline-0">
              <option selected>选择或输入</option>
              <option v-for="category in SystemStore.config.categoryList" :key="category.name">{{ category.name }}</option>
            </select>
          </label>

          <div class="flex justify-end gap-1">
            <button
              @click="modalDialog.close()"
              class="btn btn-sm btn-error mt-2"
            >
              取消
            </button>
            <button class="btn btn-sm btn-primary mt-2" @click="addWebsite">
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

<script setup lang="ts">
// @ts-ignore
import FavoriteItem from "./FavoriteItem.vue";
import { ref, computed, onUnmounted, watch } from "vue";
import { useSystemStore } from "../store/systemStore";
const SystemStore = useSystemStore();
const modalDialog = ref();
let debounceTimer: number | null = null;
const displayediconUrl = ref("");
const siteName = ref("");
const iconUrl = ref("");
const siteUrl = ref("");
const category = ref("");
const categorySelect = ref("");

watch(
    categorySelect ,
    (newVal) => {
      category.value = newVal;
    }
)

const favorites = computed(() => {
  let favorites: any = [];
  for (let i = 0; i < SystemStore.config.favoriteList.length; i++) {
    if (
      SystemStore.config.favoriteList[i].category === SystemStore.nowCategory
    ) {
      favorites.push(SystemStore.config.favoriteList[i]);
    }
  }
  return favorites;
});

const addWebsite = () => {
    const exists = SystemStore.config.categoryList.find(item => item.name === category.value) !== undefined;
    if (!exists) {
        SystemStore.addCategory({
            name: category.value,
            icon: '',
        })
    }
    SystemStore.addFavorite({
        url: siteUrl.value,
        name: siteName.value,
        icon: iconUrl.value,
        category: category.value,
    });
    modalDialog.value.close();
    siteUrl.value = '';
    siteName.value = '';
    iconUrl.value = '';
    category.value = '';
    categorySelect.value = '选择或输入'; // 添加这一行，重置下拉选择框的值
    
};


const debounceUpdate = (url: string) => {
if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    displayediconUrl.value = url;
  }, 1000);
}

watch(siteUrl, (newVal) => {
  debounceUpdate(newVal);
});
watch(iconUrl, (newVal) => {
  displayediconUrl.value = newVal;
});

// 组件卸载时清除定时器
onUnmounted(() => {
if (debounceTimer) {
  clearTimeout(debounceTimer as number);
}
});
</script>

<style scoped>
/* 全局或组件内样式 */
.no-scrollbar {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}
.no-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Opera */
}
</style>