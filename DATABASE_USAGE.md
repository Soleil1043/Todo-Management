# 数据库功能使用说明

## 概述
本项目已成功集成SQLAlchemy数据库功能，采用现代化的数据库架构设计。通过抽象存储层支持多种存储后端（内存存储和SQLite数据库），实现了完整的数据持久化、软删除机制和回收站管理系统。

## 数据库架构

### 核心组件
- **抽象存储层** (`storage.py`) - 定义存储接口规范
- **数据库存储实现** (`db_storage.py`) - SQLite数据库具体操作
- **数据库模型** (`models.py`) - SQLAlchemy ORM模型定义
- **数据库连接** (`database.py`) - 连接池和会话管理
- **数据库初始化** (`init_db.py`) - 表结构创建和迁移

### 数据表结构

#### 1. todo_items - 待办事项主表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增，索引 |
| title | VARCHAR(100) | 标题，必填 |
| description | VARCHAR(500) | 描述，可选 |
| completed | BOOLEAN | 完成状态，默认False |
| priority | ENUM | 优先级(high/medium/low) |
| start_time | VARCHAR(5) | 开始时间(HH:MM格式) |
| end_time | VARCHAR(5) | 结束时间(HH:MM格式) |
| created_at | DATETIME | 创建时间，自动设置 |
| updated_at | DATETIME | 更新时间，自动维护 |
| deleted | BOOLEAN | 软删除标记，默认False |

#### 2. recycle_bin_items - 回收站表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| original_id | INTEGER | 原始待办事项ID，索引 |
| title | VARCHAR(100) | 标题 |
| description | VARCHAR(500) | 描述 |
| completed | BOOLEAN | 完成状态 |
| priority | ENUM | 优先级 |
| start_time | VARCHAR(5) | 开始时间 |
| end_time | VARCHAR(5) | 结束时间 |
| created_at | DATETIME | 原始创建时间 |
| deleted_at | DATETIME | 删除时间，自动设置 |

## 核心功能

### 1. 抽象存储架构
```python
# 存储抽象基类定义标准接口
class TodoStorage(ABC):
    def get_all_todos(self) -> Dict[int, TodoItem]
    def add_todo(self, todo: TodoItem) -> TodoItem
    def update_todo(self, todo_id: int, **kwargs) -> bool
    def remove_todo(self, todo_id: int) -> Optional[TodoItem]
    def get_recycle_bin(self) -> Dict[int, TodoItem]
    # ... 其他方法
```

### 2. 数据库连接管理
- **SQLite数据库**: 默认使用`todos.db`文件
- **环境变量支持**: 通过`DATABASE_URL`配置其他数据库
- **连接池**: 自动管理数据库连接
- **会话管理**: 每个请求独立的数据库会话
- **自动初始化**: 应用启动时自动创建表结构

### 3. 数据操作流程
```python
# 业务逻辑层 -> 存储层 -> 数据库层
TodoService -> DatabaseTodoStorage -> SQLAlchemy -> SQLite
```

### 4. 完整API支持
| 方法 | 路径 | 数据库操作 |
|------|------|------------|
| POST | `/api/todos` | 插入新记录 |
| GET | `/api/todos` | 查询未删除记录 |
| PATCH | `/api/todos/{id}` | 更新指定记录 |
| DELETE | `/api/todos/{id}` | 软删除（标记deleted=true） |
| PATCH | `/api/todos/{id}/toggle` | 更新completed字段 |
| GET | `/api/recycle-bin` | 查询回收站表 |
| POST | `/api/recycle-bin/{id}/restore` | 从回收站恢复 |
| DELETE | `/api/recycle-bin/{id}` | 永久删除回收站记录 |
| DELETE | `/api/recycle-bin` | 清空回收站表 |
| GET | `/api/stats` | 统计查询 |

### 5. 软删除和回收站机制
- **安全删除**: 删除操作只标记`deleted=true`，不物理删除
- **自动备份**: 删除时自动复制数据到回收站表
- **完整恢复**: 从回收站恢复时重建原始记录
- **永久删除**: 可选择性永久删除回收站中的项目

## 使用方法

### 基本操作
```bash
# 启动应用
python main.py
# 应用将在 http://localhost:8000 启动

# 测试数据库功能
python test_db.py

# 查看API文档
# 访问 http://localhost:8000/docs
```

### 数据库初始化
```python
# 自动初始化过程
from database.init_db import init_db
init_db()  # 创建所有表结构
```

### 存储层使用
```python
# 获取数据库存储实例
from database.db_storage import DatabaseTodoStorage
from database.database import get_db

storage = DatabaseTodoStorage(db_session)
todos = storage.get_all_todos()  # 获取所有待办事项
```

### 事务处理
```python
# 自动事务管理
def create_todo(self, todo: TodoItem) -> TodoItem:
    try:
        self.db.add(db_todo)
        self.db.commit()  # 提交事务
        self.db.refresh(db_todo)
        return result
    except Exception as e:
        self.db.rollback()  # 出错时回滚
        raise

## 高级功能

### 数据转换
```python
# 数据库模型转Pydantic模型
def _db_to_pydantic(self, db_todo: TodoItemDB) -> TodoItem:
    return TodoItem(
        id=db_todo.id,
        title=db_todo.title,
        description=db_todo.description,
        completed=db_todo.completed,
        priority=db_todo.priority.value,
        start_time=db_todo.start_time,
        end_time=db_todo.end_time
    )
```

### 统计查询
```python
# 实时统计信息
def get_stats(self) -> dict:
    total = self.db.query(TodoItemDB).filter(TodoItemDB.deleted == False).count()
    completed = self.db.query(TodoItemDB).filter(
        TodoItemDB.deleted == False,
        TodoItemDB.completed == True
    ).count()
    recycle_bin = self.db.query(RecycleBinItemDB).count()
    
    return {
        "total": total,
        "completed": completed,
        "pending": total - completed,
        "recycle_bin": recycle_bin
    }
```

## 数据库迁移

支持使用Alembic进行数据库结构迁移：

```bash
# 初始化迁移环境
alembic init alembic

# 创建迁移脚本
alembic revision --autogenerate -m "添加新字段"

# 应用迁移
alembic upgrade head

# 回滚迁移
alembic downgrade -1
```

## 架构优势

### 1. 抽象层设计
- **接口隔离**: 业务逻辑与数据存储解耦
- **易于测试**: 可以轻松mock存储层
- **灵活扩展**: 支持添加新的存储后端
- **维护简单**: 修改存储实现不影响业务逻辑

### 2. 数据库特性
- **ACID特性**: 支持事务的原子性、一致性、隔离性、持久性
- **数据完整性**: 外键约束和字段验证
- **并发安全**: 数据库级别的锁机制
- **备份恢复**: 简单的文件级备份

### 3. 性能优化
- **索引优化**: 主键和常用查询字段建立索引
- **查询优化**: SQLAlchemy自动优化SQL查询
- **连接池**: 重用数据库连接，减少开销
- **懒加载**: 按需加载关联数据

## 注意事项

1. **文件位置**: 数据库文件`todos.db`自动创建在项目根目录
2. **API兼容**: 所有接口保持向后兼容，前端无需修改
3. **数据安全**: 软删除机制确保数据可恢复
4. **统计准确**: 实时从数据库计算，确保数据准确性
5. **事务安全**: 所有写操作都在事务中执行
6. **错误处理**: 完善的异常捕获和日志记录
7. **性能监控**: 内置性能日志和错误追踪

## 故障排除

### 常见问题
```python
# 数据库连接失败
检查数据库文件权限和路径

# 表结构不一致
执行数据库迁移或重新初始化

# 性能问题
查看SQL日志，优化查询语句
```

数据库功能已完全集成并生产就绪！🎉