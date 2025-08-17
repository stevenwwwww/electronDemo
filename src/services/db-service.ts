import { openDB, type DBSchema } from 'idb';

interface AppDBSchema extends DBSchema {
  testData: {
    key: number;
    value: {
      id?: number;
      data: string;
      timestamp: number;
    };
  };
}

class DatabaseService {
  private dbName = 'ElectronQuasarApp';
  private version = 1;

  private async getDB() {
    return openDB<AppDBSchema>(this.dbName, this.version, {
      upgrade(db) {
        // 创建对象存储
        if (!db.objectStoreNames.contains('testData')) {
          db.createObjectStore('testData', {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      },
    });
  }

  async addData(data: string) {
    const db = await this.getDB();
    const item = {
      data,
      timestamp: Date.now(),
    };
    return db.add('testData', item);
  }

  async getAllData() {
    const db = await this.getDB();
    return db.getAll('testData');
  }

  async getData(id: number) {
    const db = await this.getDB();
    return db.get('testData', id);
  }

  async updateData(id: number, data: string) {
    const db = await this.getDB();
    const existing = await db.get('testData', id);
    if (existing) {
      existing.data = data;
      existing.timestamp = Date.now();
      return db.put('testData', existing);
    }
    throw new Error('数据不存在');
  }

  async deleteData(id: number) {
    const db = await this.getDB();
    return db.delete('testData', id);
  }

  async clearAll() {
    const db = await this.getDB();
    return db.clear('testData');
  }

  // 事务操作测试
  async testTransaction() {
    const db = await this.getDB();
    const tx = db.transaction('testData', 'readwrite');
    
    try {
      // 添加多条测试数据
      await tx.store.add({
        data: '事务测试数据1',
        timestamp: Date.now(),
      });
      
      await tx.store.add({
        data: '事务测试数据2',
        timestamp: Date.now() + 1,
      });
      
      await tx.store.add({
        data: '事务测试数据3',
        timestamp: Date.now() + 2,
      });
      
      // 完成事务
      await tx.done;
      
      console.log('事务操作成功完成');
    } catch (error) {
      console.error('事务操作失败，自动回滚:', error);
      throw error;
    }
  }

  // 获取数据统计
  async getStats() {
    const db = await this.getDB();
    const count = await db.count('testData');
    const allData = await db.getAll('testData');
    
    return {
      totalCount: count,
      latestTimestamp: allData.length > 0 ? Math.max(...allData.map(item => item.timestamp)) : 0,
      oldestTimestamp: allData.length > 0 ? Math.min(...allData.map(item => item.timestamp)) : 0,
    };
  }
}

export const dbService = new DatabaseService(); 