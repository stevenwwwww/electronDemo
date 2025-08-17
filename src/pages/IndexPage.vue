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
      <q-card class="col-12 col-md-5">
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
      </q-card>

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

      <!-- 热更新功能 -->
      <q-card class="col-12 col-md-5">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="system_update" class="q-mr-sm" />
            热更新功能
          </div>
        </q-card-section>
        <q-card-section>
          <div class="row q-gutter-sm q-mb-md">
            <q-btn
              color="primary"
              label="检查更新"
              icon="update"
              @click="checkForUpdates"
              :loading="updateLoading"
              size="sm"
            />
            <q-btn
              color="secondary"
              label="下载更新"
              icon="download"
              @click="downloadUpdate"
              :disable="!updateAvailable"
              size="sm"
            />
            <q-btn
              color="positive"
              label="查看版本"
              icon="info"
              @click="showVersionInfo"
              size="sm"
            />
          </div>
          <div v-if="updateStatus" class="q-mt-md">
            <q-banner 
              :class="updateStatus.includes('错误') || updateStatus.includes('失败') ? 'bg-red-1' : 
                     updateStatus.includes('发现新版本') ? 'bg-orange-1' :
                     updateStatus.includes('完成') || updateStatus.includes('成功') ? 'bg-green-1' : 'bg-blue-1'"
              dense
              rounded
            >
              <div style="white-space: pre-line;">{{ updateStatus }}</div>
            </q-banner>
          </div>
        </q-card-section>
      </q-card>

      <!-- 平台信息 -->
      <q-card class="col-12">
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
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar, Platform } from 'quasar';
import { dbService } from '../services/db-service';
import { apiService } from '../services/api-service';
import { printerService } from '../services/printer-service';
import { updateService } from '../services/update-service';

const $q = useQuasar();

// 定义数据库项类型
interface DbItem {
  id?: number;
  data: string;
  timestamp: number;
}

// 响应式数据
const apiData = ref<any>(null);
const weatherLoading = ref(false);
const userLoading = ref(false);
const dbTestData = ref('');
const dbResults = ref<DbItem[]>([]);
const updateLoading = ref(false);
const updateAvailable = ref(false);
const updateStatus = ref('');
const fileLoading = ref(false);

const platformInfo = ref({
  platform: Platform.is.electron ? 'Windows/Desktop' : Platform.is.cordova ? 'Android/Mobile' : 'Web',
  mode: Platform.is.electron ? 'Electron' : Platform.is.cordova ? 'Cordova' : 'Browser',
  version: '1.0.0'
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

// 热更新功能
const checkForUpdates = async () => {
  updateLoading.value = true;
  try {
    const result = await updateService.checkForUpdates();
    updateAvailable.value = result.available;
    updateStatus.value = result.message;
    
    // 如果发现新版本，显示更多详细信息
    if (result.available && result.updateInfo) {
      updateStatus.value = `发现新版本 ${result.updateInfo.version}！\n当前版本: ${platformInfo.value.version}\n更新内容: ${result.updateInfo.releaseNotes}`;
    }
  } catch (error) {
    updateStatus.value = '检查更新失败: ' + (error instanceof Error ? error.message : '未知错误');
  } finally {
    updateLoading.value = false;
  }
};

const downloadUpdate = async () => {
  try {
    updateStatus.value = '正在下载更新...';
    const result = await updateService.downloadUpdate();
    updateStatus.value = result.message;
    
    // 如果下载成功，自动安装并重启
    if (result.available) {
      updateStatus.value = '下载完成，准备安装更新...';
      
      // 延迟2秒后自动安装
      setTimeout(() => {
        updateService.installUpdateAndRestart().then(() => {
          updateStatus.value = '应用正在重启...';
        }).catch((error: Error) => {
          updateStatus.value = '自动重启失败，请手动重启应用以完成更新';
          console.error('自动重启失败:', error);
        });
      }, 2000);
    }
  } catch (error) {
    updateStatus.value = '下载更新失败: ' + (error instanceof Error ? error.message : '未知错误');
  }
};

const showVersionInfo = () => {
  $q.dialog({
    title: '当前版本信息',
    message: `平台: ${platformInfo.value.platform}\n运行环境: ${platformInfo.value.mode}\n版本: ${platformInfo.value.version}`,
    persistent: true,
    ok: true,
    cancel: false,
    color: 'primary'
  }).onOk(() => {
    // 用户点击确定后的操作
    console.log('版本信息对话框已关闭');
  });
};

// 文件操作功能
const testFileWrite = async () => {
  fileLoading.value = true;
  try {
    const testData = {
      timestamp: new Date().toISOString(),
      platform: platformInfo.value.platform,
      message: 'Hello from Electron Quasar Demo!'
    };
    
    const result = await window.electronAPI.writeFile('test-data.json', JSON.stringify(testData, null, 2));
    
    $q.notify({
      type: 'positive',
      message: `文件写入成功: ${result.path}`
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '文件写入失败: ' + (error instanceof Error ? error.message : '未知错误')
    });
  } finally {
    fileLoading.value = false;
  }
};

const testFileRead = async () => {
  fileLoading.value = true;
  try {
    const result = await window.electronAPI.readFile('test-data.json');
    
    $q.dialog({
      title: '文件内容',
      message: `文件路径: ${result.path}\n\n文件内容:\n${result.content}`,
      ok: '确定',
      cancel: false
    });
    
    $q.notify({
      type: 'positive',
      message: '文件读取成功'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '文件读取失败: ' + (error instanceof Error ? error.message : '未知错误')
    });
  } finally {
    fileLoading.value = false;
  }
};

// 组件挂载
onMounted(async () => {
  await queryFromDb();
});
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
