<template>
  <q-page class="column items-center justify-start q-pa-md">
    <div class="text-h4 q-mb-lg text-center">
      Electron + Quasar 跨平台Demo
    </div>

    <div class="row q-gutter-md full-width" style="max-width: 1200px">
      <!-- 打印机功能 -->
      <q-card class="col-12 col-md-5">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="print" class="q-mr-sm" />
            打印机功能
          </div>
        </q-card-section>
        <q-card-section>
          <q-btn
            color="primary"
            label="测试打印"
            icon="print"
            @click="testPrint"
            class="q-mr-sm"
          />
          <q-btn
            color="secondary"
            label="连接打印机"
            icon="link"
            @click="connectPrinter"
          />
        </q-card-section>
      </q-card>

      <!-- 文件操作功能 -->
      <!-- <q-card class="col-12 col-md-5">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="folder" class="q-mr-sm" />
            文件操作功能
          </div>
        </q-card-section>
        <q-card-section>
          <q-btn
            color="primary"
            label="测试文件写入"
            icon="create"
            @click="testFileWrite"
            class="q-mr-sm"
            :loading="fileLoading"
          />
          <q-btn
            color="secondary"
            label="测试文件读取"
            icon="folder_open"
            @click="testFileRead"
            :loading="fileLoading"
          />
        </q-card-section>
      </q-card> -->

      <!-- 远程API调用 -->
      <q-card class="col-12 col-md-5">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="cloud" class="q-mr-sm" />
            远程API调用
          </div>
        </q-card-section>
        <q-card-section>
          <q-btn
            color="primary"
            label="获取天气数据"
            icon="wb_sunny"
            @click="fetchWeatherData"
            class="q-mr-sm"
            :loading="weatherLoading"
          />
          <q-btn
            color="secondary"
            label="获取随机用户"
            icon="person"
            @click="fetchRandomUser"
            :loading="userLoading"
          />
          <div v-if="apiData" class="q-mt-md">
            <q-banner class="bg-light-blue-1">
              <pre>{{ JSON.stringify(apiData, null, 2) }}</pre>
            </q-banner>
          </div>
        </q-card-section>
      </q-card>

      <!-- 数据库操作 -->
      <q-card class="col-12 col-md-5">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="storage" class="q-mr-sm" />
            IndexedDB 操作
          </div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="dbTestData"
            label="测试数据"
            filled
            class="q-mb-md"
          />
          <div class="q-gutter-sm">
            <q-btn
              color="primary"
              label="存储数据"
              icon="save"
              @click="saveToDb"
              size="sm"
            />
            <q-btn
              color="secondary"
              label="查询数据"
              icon="search"
              @click="queryFromDb"
              size="sm"
            />
            <q-btn
              color="warning"
              label="事务测试"
              icon="sync"
              @click="testTransaction"
              size="sm"
            />
            <q-btn
              color="negative"
              label="清空数据"
              icon="delete"
              @click="clearDb"
              size="sm"
            />
          </div>
          <div v-if="dbResults.length > 0" class="q-mt-md">
            <q-list bordered>
              <q-item v-for="item in dbResults" :key="item.id || 0">
                <q-item-section>
                  <q-item-label>{{ item.data }}</q-item-label>
                  <q-item-label caption>ID: {{ item.id }} | 时间: {{ new Date(item.timestamp).toLocaleString() }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>
      </q-card>

      <!-- Web内容热更新功能 -->
      <q-card class="col-12 col-md-5">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="palette" class="q-mr-sm" />
            Web内容热更新
            <q-chip :color="hotUpdateTheme?.primaryColor ? 'pink' : 'primary'" text-color="white" size="sm" class="q-ml-sm">
              v{{ hotUpdateVersion }}
            </q-chip>
          </div>
        </q-card-section>
        <q-card-section>
          <div class="row q-gutter-sm q-mb-md">
            <q-btn
              color="primary"
              label="检查热更新"
              icon="refresh"
              @click="checkForHotUpdates"
              :loading="hotUpdateLoading"
              size="sm"
            />
            <q-btn
              color="secondary"
              label="应用更新"
              icon="download"
              @click="applyHotUpdate"
              :disable="!hotUpdateAvailable"
              size="sm"
            />
            <!-- <q-btn
              color="warning"
              label="重置版本"
              icon="restore"
              @click="resetToDefault"
              size="sm"
            /> -->
          </div>
          <div v-if="hotUpdateStatus" class="q-mt-md">
            <q-banner 
              :class="hotUpdateStatus.includes('错误') || hotUpdateStatus.includes('失败') ? 'bg-red-1' : 
                     hotUpdateStatus.includes('发现新版本') || hotUpdateStatus.includes('发现热更新') ? 'bg-orange-1' :
                     hotUpdateStatus.includes('成功') ? 'bg-green-1' : 'bg-blue-1'"
              dense
              rounded
            >
              <div style="white-space: pre-line;">{{ hotUpdateStatus }}</div>
            </q-banner>
          </div>
          <div v-if="hotUpdateContent?.title" class="q-mt-md">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle2">{{ hotUpdateContent.title }}</div>
                <q-list v-if="hotUpdateContent.features?.length" dense>
                  <q-item v-for="feature in hotUpdateContent.features" :key="feature">
                    <q-item-section avatar>
                      <q-icon name="star" color="primary" size="xs" />
                    </q-item-section>
                    <q-item-section>{{ feature }}</q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>



      <!-- 平台信息 -->
      <!-- <q-card class="col-12">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="info" class="q-mr-sm" />
            平台信息
          </div>
        </q-card-section>
        <q-card-section>
          <div class="row q-gutter-md">
            <div class="col">
              <q-chip icon="computer" color="primary" text-color="white">
                平台: {{ platformInfo.platform }}
              </q-chip>
            </div>
            <div class="col">
              <q-chip icon="phonelink" color="secondary" text-color="white">
                运行环境: {{ platformInfo.mode }}
              </q-chip>
            </div>
            <div class="col">
              <q-chip icon="code" color="accent" text-color="white">
                版本: {{ platformInfo.version }}
              </q-chip>
            </div>
          </div>
        </q-card-section>
      </q-card> -->
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar, Platform } from 'quasar';
import { dbService } from '../services/db-service';
import { apiService } from '../services/api-service';
import { printerService } from '../services/printer-service';

import { hotUpdateService, type HotUpdateInfo, type ThemeConfig, type ContentConfig } from '../services/hot-update-service';

// 声明全局类型
declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<{ success: boolean; data: { version: string } }>;
      // 其他electronAPI方法可以在这里声明
    };
  }
}

const $q = useQuasar();

// 定义数据库项类型
interface DbItem {
  id?: number;
  data: string;
  timestamp: number;
}

// 响应式数据
const apiData = ref<Record<string, unknown> | null>(null);
const weatherLoading = ref(false);
const userLoading = ref(false);
const dbTestData = ref('');
const dbResults = ref<DbItem[]>([]);


// 热更新相关数据
const hotUpdateLoading = ref(false);
const hotUpdateAvailable = ref(false);
const hotUpdateStatus = ref('');
const hotUpdateVersion = ref('1.0.0');
const hotUpdateInfo = ref<HotUpdateInfo | null>(null);
const hotUpdateTheme = ref<ThemeConfig | null>(null);
const hotUpdateContent = ref<ContentConfig | null>(null);

const platformInfo = ref({
  platform: Platform.is.electron ? 'Windows/Desktop' : Platform.is.cordova ? 'Android/Mobile' : 'Web',
  mode: Platform.is.electron ? 'Electron' : Platform.is.cordova ? 'Cordova' : 'Browser',
  version: '2.0.0'
});

// 打印机功能
const testPrint = async () => {
  try {
    await printerService.testPrint();
    $q.notify({
      type: 'positive',
      message: '打印测试完成'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '打印失败: ' + (error instanceof Error ? error.message : '未知错误')
    });
  }
};

const connectPrinter = async () => {
  try {
    await printerService.connectPrinter();
    $q.notify({
      type: 'positive',
      message: '打印机连接成功'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '打印机连接失败: ' + (error instanceof Error ? error.message : '未知错误')
    });
  }
};

// API调用功能
const fetchWeatherData = async () => {
  weatherLoading.value = true;
  try {
    apiData.value = await apiService.getWeather();
    $q.notify({
      type: 'positive',
      message: '天气数据获取成功'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'API调用失败: ' + (error instanceof Error ? error.message : '未知错误')
    });
  } finally {
    weatherLoading.value = false;
  }
};

const fetchRandomUser = async () => {
  userLoading.value = true;
  try {
    apiData.value = await apiService.getRandomUser();
    $q.notify({
      type: 'positive',
      message: '用户数据获取成功'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'API调用失败: ' + (error instanceof Error ? error.message : '未知错误')
    });
  } finally {
    userLoading.value = false;
  }
};

// 数据库操作
const saveToDb = async () => {
  if (!dbTestData.value.trim()) {
    $q.notify({
      type: 'warning',
      message: '请输入测试数据'
    });
    return;
  }

  try {
    await dbService.addData(dbTestData.value);
    dbTestData.value = '';
    await queryFromDb();
    $q.notify({
      type: 'positive',
      message: '数据保存成功'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '数据保存失败: ' + (error instanceof Error ? error.message : '未知错误')
    });
  }
};

const queryFromDb = async () => {
  try {
    dbResults.value = await dbService.getAllData();
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '数据查询失败: ' + (error instanceof Error ? error.message : '未知错误')
    });
  }
};

const testTransaction = async () => {
  try {
    await dbService.testTransaction();
    await queryFromDb();
    $q.notify({
      type: 'positive',
      message: '事务操作完成'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '事务操作失败: ' + (error instanceof Error ? error.message : '未知错误')
    });
  }
};

const clearDb = async () => {
  try {
    await dbService.clearAll();
    dbResults.value = [];
    $q.notify({
      type: 'positive',
      message: '数据清空成功'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '数据清空失败: ' + (error instanceof Error ? error.message : '未知错误')
    });
  }
};

// Web内容热更新功能
const checkForHotUpdates = async () => {
  hotUpdateLoading.value = true;
  try {
    const result = await hotUpdateService.checkForHotUpdates();
    hotUpdateAvailable.value = result.available;
    
    if (result.available && result.updateInfo) {
      hotUpdateInfo.value = result.updateInfo;
      hotUpdateStatus.value = `发现热更新 v${result.updateInfo.version}！\n${result.updateInfo.description}`;
    } else {
      hotUpdateStatus.value = '已经是最新版本，无需更新';
      $q.notify({
        type: 'info',
        message: '已经是最新版本，无需更新'
      });
    }
  } catch (error) {
    hotUpdateStatus.value = '检查热更新失败: 已经是最新版本 ';
    // $q.notify({
    //   type: 'negative',
    //   message: '检查热更新失败'
    // });
  } finally {
    hotUpdateLoading.value = false;
  }
};

const applyHotUpdate = async () => {
  if (!hotUpdateInfo.value) return;
  
  try {
    hotUpdateStatus.value = '正在应用热更新...';
    const result = await hotUpdateService.applyHotUpdate(hotUpdateInfo.value);
    
    if (result.success) {
      hotUpdateStatus.value = result.message;
      // 更新本地状态
      hotUpdateVersion.value = result.newVersion || hotUpdateVersion.value;
      hotUpdateAvailable.value = false;
    } else {
      hotUpdateStatus.value = result.message;
    }
  } catch (error) {
    hotUpdateStatus.value = '应用热更新失败: ' + (error instanceof Error ? error.message : '未知错误');
  }
};

const resetToDefault = async () => {
  try {
    hotUpdateStatus.value = '正在重置主题...';
    await hotUpdateService.resetToDefault();
    hotUpdateStatus.value = '已重置到默认主题';
    hotUpdateVersion.value = '1.0.0';
    hotUpdateAvailable.value = false;
    hotUpdateTheme.value = null;
    hotUpdateContent.value = null;
  } catch (error) {
    hotUpdateStatus.value = '重置失败: ' + (error instanceof Error ? error.message : '未知错误');
  }
};



// 组件挂载
onMounted(async () => {
  await queryFromDb();
  await loadVersionInfo();
  loadHotUpdateInfo();
});

// 获取版本信息
const loadVersionInfo = async () => {
  try {
    if (Platform.is.electron && window.electronAPI) {
      const result = await window.electronAPI.getAppVersion();
      if (result.success) {
        platformInfo.value.version = result.data.version;
      }
    }
  } catch (error) {
    console.error('获取版本信息失败:', error);
  }
};

// 加载热更新信息
const loadHotUpdateInfo = () => {
  try {
    // 获取当前热更新版本
    hotUpdateVersion.value = hotUpdateService.getCurrentVersion();
    
    // 获取当前主题配置
    hotUpdateTheme.value = hotUpdateService.getCurrentTheme();
    
    // 获取当前内容配置
    hotUpdateContent.value = hotUpdateService.getCurrentContent();
    
    // 如果有主题配置，应用到页面
    if (hotUpdateTheme.value) {
      document.documentElement.style.setProperty('--q-primary', hotUpdateTheme.value.primaryColor);
      document.documentElement.style.setProperty('--q-secondary', hotUpdateTheme.value.secondaryColor);
    }
  } catch (error) {
    console.error('加载热更新信息失败:', error);
  }
};
</script>

<style scoped>
.q-card {
  min-height: 200px;
}

pre {
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
}
</style>
