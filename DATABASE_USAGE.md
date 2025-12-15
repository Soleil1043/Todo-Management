# 数据库功能使用说明

## 概述
本项目已成功集成SQLAlchemy数据库功能，将原有的内存存储替换为SQLite数据库持久化存储。

## 数据库结构

### 数据表
1. **todo_items** - 待办事项表
   - id: 主键，自增
   - title: 标题，最大100字符
   - description: 描述，最大500字符
   - completed: 完成状态，布尔值
   - priority: 优先级枚举 (high/medium/low)
   - start_time: 开始时间 (HH:MM格式)
   - end_time: 结束时间 (HH:MM格式)
   - created_at: 创建时间
   - updated_at: 更新时间
   - deleted: 软删除标记

2. **recycle_bin_items** - 回收站表
   - id: 主键，自增
   - original_id: 原始待办事项ID
   - title: 标题
   - description: 描述
   - completed: 完成状态
   - priority: 优先级
   - start_time: 开始时间
   - end_time: 结束时间
   - created_at: 原始创建时间
   - deleted_at: 删除时间

## 主要功能

### 1. 数据库连接
- 使用SQLite数据库，文件名为`todos.db`
- 支持通过环境变量`DATABASE_URL`配置其他数据库
- 自动创建数据库表结构

### 2. 数据操作
- **创建待办事项**: POST `/api/v2.0.0/todos`
- **获取所有待办事项**: GET `/api/v2.0.0/todos`
- **更新待办事项**: PATCH `/api/v2.0.0/todos/{id}`
- **删除待办事项**: DELETE `/api/v2.0.0/todos/{id}` (软删除)
- **切换完成状态**: PATCH `/api/v2.0.0/todos/{id}/toggle`
- **获取回收站**: GET `/api/v2.0.0/recycle-bin`
- **恢复待办事项**: POST `/api/v2.0.0/recycle-bin/{id}/restore`
- **永久删除**: DELETE `/api/v2.0.0/recycle-bin/{id}`
- **清空回收站**: DELETE `/api/v2.0.0/recycle-bin`
- **获取统计信息**: GET `/api/v2.0.0/stats`

### 3. 数据持久化
- 所有数据变更都会立即保存到数据库
- 支持事务处理，确保数据一致性
- 软删除机制，避免误删数据

## 使用方法

### 启动应用
```bash
python main.py
```
应用将在 http://localhost:8000 启动

### 测试数据库功能
```bash
python test_db.py
```

### API文档
访问 http://localhost:8000/docs 查看完整的API文档

## 数据库迁移

如果需要修改数据库结构，可以使用Alembic进行数据库迁移：

```bash
# 初始化迁移环境
alembic init alembic

# 创建迁移脚本
alembic revision --autogenerate -m "描述"

# 应用迁移
alembic upgrade head
```

## 注意事项

1. 数据库文件`todos.db`会自动创建在项目根目录
2. 所有API都保持向后兼容，前端无需修改
3. 回收站功能通过软删除和单独的回收站表实现
4. 统计信息实时从数据库计算，确保准确性

## 性能优化

- 使用SQLAlchemy的ORM机制，自动优化查询
- 支持数据库索引，提高查询效率
- 连接池管理，提高并发处理能力

数据库功能已成功集成，所有测试通过！🎉