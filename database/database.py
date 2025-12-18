from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os
import logging

logger = logging.getLogger(__name__)

# 数据库配置
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todos.db")

# 数据库连接池配置
POOL_CONFIG = {
    "pool_size": 10,
    "max_overflow": 20,
    "pool_timeout": 30,
    "pool_recycle": 3600,
    "pool_pre_ping": True,  # 连接健康检查
}

# 创建数据库引擎 - 优化SQLite性能
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,  # SQLite使用静态池
        pool_pre_ping=True,
        echo=False,  # 生产环境关闭SQL日志
    )
    
    # SQLite性能优化事件
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        """设置SQLite优化参数"""
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")  # 使用WAL模式提高并发性能
        cursor.execute("PRAGMA synchronous=NORMAL")  # 平衡安全性和性能
        cursor.execute("PRAGMA cache_size=-64000")  # 64MB缓存
        cursor.execute("PRAGMA temp_store=MEMORY")  # 临时表存储在内存中
        cursor.execute("PRAGMA mmap_size=30000000000")  # 30GB内存映射
        cursor.close()
        logger.debug("SQLite优化参数已设置")
else:
    # 其他数据库使用标准连接池
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        **POOL_CONFIG,
        echo=False,
    )

# 创建会话工厂 - 优化会话配置
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,  # 提高性能，避免不必要的查询
    class_=sessionmaker,  # 使用标准会话类
)

# 获取数据库会话的依赖函数 - 添加上下文管理
def get_db():
    """获取数据库会话 - 上下文管理器"""
    db = SessionLocal()
    try:
        yield db
        db.commit()  # 自动提交事务
    except Exception as e:
        db.rollback()  # 出错时回滚
        logger.error(f"数据库会话错误: {e}")
        raise
    finally:
        db.close()