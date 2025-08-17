import axios from 'axios';

class ApiService {
  private readonly weatherApiKey = 'demo_key'; // 使用演示key或者环境变量
  private readonly weatherBaseUrl = 'https://api.openweathermap.org/data/2.5';
  private readonly randomUserUrl = 'https://jsonplaceholder.typicode.com/users/1';
  
  constructor() {
    // 配置axios默认设置
    axios.defaults.timeout = 10000;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
  }

  // 获取天气数据 (使用JSONPlaceholder作为演示API)
  async getWeather() {
    try {
      // 由于OpenWeatherMap需要API Key，我们使用一个免费的JSON API作为演示
      const response = await axios.get('https://api.github.com/users/octocat');
      
      // 模拟天气数据格式
      return {
        type: 'weather',
        data: {
          user: response.data.login,
          name: response.data.name,
          location: response.data.location || 'GitHub',
          description: response.data.bio || 'No description',
          avatar: response.data.avatar_url,
          timestamp: new Date().toISOString()
        },
        source: 'GitHub API (Demo)'
      };
    } catch (error) {
      console.error('Weather API调用失败:', error);
      const message = error instanceof Error ? error.message : '未知错误';
      throw new Error('无法获取天气数据: ' + message);
    }
  }

  // 获取随机用户数据
  async getRandomUser() {
    try {
      const response = await axios.get(this.randomUserUrl);
      
      return {
        type: 'user',
        data: {
          id: response.data.id,
          name: response.data.name,
          username: response.data.username,
          email: response.data.email,
          phone: response.data.phone,
          website: response.data.website,
          company: response.data.company.name,
          address: `${response.data.address.city}, ${response.data.address.street}`,
          timestamp: new Date().toISOString()
        },
        source: 'JSONPlaceholder API'
      };
    } catch (error) {
      console.error('Random User API调用失败:', error);
      const message = error instanceof Error ? error.message : '未知错误';
      throw new Error('无法获取用户数据: ' + message);
    }
  }

  // 获取JSON数据 (通用方法)
  async fetchJsonData(url: string) {
    try {
      const response = await axios.get(url);
      return {
        type: 'custom',
        data: response.data,
        source: url,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('API调用失败:', error);
      const message = error instanceof Error ? error.message : '未知错误';
      throw new Error('API调用失败: ' + message);
    }
  }

  // POST请求示例
  async postData(url: string, data: any) {
    try {
      const response = await axios.post(url, data);
      return {
        type: 'post_response',
        data: response.data,
        source: url,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('POST请求失败:', error);
      const message = error instanceof Error ? error.message : '未知错误';
      throw new Error('POST请求失败: ' + message);
    }
  }

  // 获取多个API数据并合并
  async fetchMultipleApis() {
    try {
      const [weatherData, userData] = await Promise.all([
        this.getWeather(),
        this.getRandomUser()
      ]);

      return {
        type: 'combined',
        data: {
          weather: weatherData,
          user: userData,
          timestamp: new Date().toISOString()
        },
        source: 'Multiple APIs'
      };
    } catch (error) {
      console.error('多API调用失败:', error);
      const message = error instanceof Error ? error.message : '未知错误';
      throw new Error('多API调用失败: ' + message);
    }
  }
}

export const apiService = new ApiService(); 