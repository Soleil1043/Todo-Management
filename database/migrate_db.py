import sqlite3
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_database():
    """迁移数据库结构，移除旧priority字段，并确保分值字段可为空"""
    conn = sqlite3.connect('todos.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("PRAGMA foreign_keys=OFF")
        
        # 检查当前 todo_items 表结构
        cursor.execute("PRAGMA table_info(todo_items)")
        todo_columns_info = cursor.fetchall()
        todo_columns = [column[1] for column in todo_columns_info]
        todo_notnull_map = {column[1]: column[3] for column in todo_columns_info}
        
        has_final_priority = 'final_priority' in todo_columns
        
        # 情况一：老版本，仅有 priority 字段，需要完整迁移到新结构
        if not has_final_priority:
            conn.execute("BEGIN TRANSACTION")
            
            cursor.execute("""
                CREATE TABLE todo_items_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    completed INTEGER NOT NULL DEFAULT 0,
                    future_score INTEGER,
                    urgency_score INTEGER,
                    final_priority INTEGER NOT NULL DEFAULT 100,
                    start_time TEXT,
                    end_time TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP,
                    deleted INTEGER NOT NULL DEFAULT 0
                )
            """)
            
            if 'priority' in todo_columns:
                if 'future_score' in todo_columns:
                    cursor.execute("""
                        INSERT INTO todo_items_new
                        (id, title, description, completed, future_score, urgency_score,
                         final_priority, start_time, end_time, created_at, updated_at, deleted)
                        SELECT id, title, description, completed,
                               future_score, urgency_score, 100,
                               start_time, end_time, created_at, updated_at, deleted
                        FROM todo_items
                    """)
                else:
                    cursor.execute("""
                        INSERT INTO todo_items_new
                        (id, title, description, completed, future_score, urgency_score,
                         final_priority, start_time, end_time, created_at, updated_at, deleted)
                        SELECT id, title, description, completed, 0, 0, 100,
                               start_time, end_time, created_at, updated_at, deleted
                        FROM todo_items
                    """)
            else:
                if 'future_score' in todo_columns:
                    cursor.execute("""
                        INSERT INTO todo_items_new
                        (id, title, description, completed, future_score, urgency_score,
                         final_priority, start_time, end_time, created_at, updated_at, deleted)
                        SELECT id, title, description, completed,
                               future_score, urgency_score, 100,
                               start_time, end_time, created_at, updated_at, deleted
                        FROM todo_items
                    """)
                else:
                    cursor.execute("""
                        INSERT INTO todo_items_new
                        (id, title, description, completed, future_score, urgency_score,
                         final_priority, start_time, end_time, created_at, updated_at, deleted)
                        SELECT id, title, description, completed, 0, 0, 100,
                               start_time, end_time, created_at, updated_at, deleted
                        FROM todo_items
                    """)
            
            cursor.execute("PRAGMA table_info(recycle_bin_items)")
            recycle_columns_info = cursor.fetchall()
            recycle_columns = [column[1] for column in recycle_columns_info]
            
            if 'priority' in recycle_columns:
                cursor.execute("""
                    CREATE TABLE recycle_bin_items_new (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        original_id INTEGER NOT NULL UNIQUE,
                        title TEXT NOT NULL,
                        description TEXT,
                        completed INTEGER NOT NULL DEFAULT 0,
                        future_score INTEGER,
                        urgency_score INTEGER,
                        final_priority INTEGER NOT NULL DEFAULT 100,
                        start_time TEXT,
                        end_time TEXT,
                        created_at TIMESTAMP,
                        deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                if 'future_score' in recycle_columns:
                    cursor.execute("""
                        INSERT INTO recycle_bin_items_new
                        (id, original_id, title, description, completed, future_score, urgency_score,
                         final_priority, start_time, end_time, created_at, deleted_at)
                        SELECT id, original_id, title, description, completed,
                               future_score, urgency_score, 100,
                               start_time, end_time, created_at, deleted_at
                        FROM recycle_bin_items
                    """)
                else:
                    cursor.execute("""
                        INSERT INTO recycle_bin_items_new
                        (id, original_id, title, description, completed, future_score, urgency_score,
                         final_priority, start_time, end_time, created_at, deleted_at)
                        SELECT id, original_id, title, description, completed, 0, 0, 100,
                               start_time, end_time, created_at, deleted_at
                        FROM recycle_bin_items
                    """)
                
                cursor.execute("DROP TABLE recycle_bin_items")
                cursor.execute("ALTER TABLE recycle_bin_items_new RENAME TO recycle_bin_items")
            
            cursor.execute("DROP TABLE todo_items")
            cursor.execute("ALTER TABLE todo_items_new RENAME TO todo_items")
            
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_todo_items_deleted ON todo_items(deleted)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_todo_items_completed ON todo_items(completed)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_todo_items_final_priority ON todo_items(final_priority)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_recycle_bin_original_id ON recycle_bin_items(original_id)")
            
            conn.commit()
            
            logger.info("数据库迁移成功完成！")
            
            cursor.execute("SELECT id, future_score, urgency_score FROM todo_items WHERE deleted = 0")
            todos = cursor.fetchall()
            
            from utils.priority_calculator import calculate_priority
            
            for todo_id, future_score, urgency_score in todos:
                try:
                    final_priority = calculate_priority(future_score, urgency_score)
                    cursor.execute(
                        "UPDATE todo_items SET final_priority = ? WHERE id = ?",
                        (final_priority, todo_id)
                    )
                except Exception as e:
                    logger.warning(f"更新待办事项 {todo_id} 优先级失败: {e}")
            
            conn.commit()
            logger.info("优先级计算完成！")
            return
        
        # 情况二：已经有 final_priority，但 future_score / urgency_score 仍是 NOT NULL，需要放宽约束
        needs_relax = (
            todo_notnull_map.get('future_score') == 1
            or todo_notnull_map.get('urgency_score') == 1
        )
        
        if not needs_relax:
            logger.info("数据库已经是最新结构")
            return
        
        conn.execute("BEGIN TRANSACTION")
        
        cursor.execute("""
            CREATE TABLE todo_items_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                completed INTEGER NOT NULL DEFAULT 0,
                future_score INTEGER,
                urgency_score INTEGER,
                final_priority INTEGER NOT NULL DEFAULT 100,
                start_time TEXT,
                end_time TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP,
                deleted INTEGER NOT NULL DEFAULT 0
            )
        """)
        
        cursor.execute("""
            INSERT INTO todo_items_new
            (id, title, description, completed, future_score, urgency_score,
             final_priority, start_time, end_time, created_at, updated_at, deleted)
            SELECT id, title, description, completed,
                   CASE WHEN future_score = 0 AND urgency_score = 0 THEN NULL ELSE future_score END,
                   CASE WHEN future_score = 0 AND urgency_score = 0 THEN NULL ELSE urgency_score END,
                   CASE WHEN future_score = 0 AND urgency_score = 0 THEN 100 ELSE final_priority END,
                   start_time, end_time, created_at, updated_at, deleted
            FROM todo_items
        """)
        
        cursor.execute("PRAGMA table_info(recycle_bin_items)")
        recycle_columns_info = cursor.fetchall()
        recycle_columns = [column[1] for column in recycle_columns_info]
        recycle_notnull_map = {column[1]: column[3] for column in recycle_columns_info}
        
        if 'future_score' in recycle_columns and (
            recycle_notnull_map.get('future_score') == 1
            or recycle_notnull_map.get('urgency_score') == 1
        ):
            cursor.execute("""
                CREATE TABLE recycle_bin_items_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    original_id INTEGER NOT NULL UNIQUE,
                    title TEXT NOT NULL,
                    description TEXT,
                    completed INTEGER NOT NULL DEFAULT 0,
                    future_score INTEGER,
                    urgency_score INTEGER,
                    final_priority INTEGER NOT NULL DEFAULT 100,
                    start_time TEXT,
                    end_time TEXT,
                    created_at TIMESTAMP,
                    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            cursor.execute("""
                INSERT INTO recycle_bin_items_new
                (id, original_id, title, description, completed, future_score, urgency_score,
                 final_priority, start_time, end_time, created_at, deleted_at)
                SELECT id, original_id, title, description, completed,
                       CASE WHEN future_score = 0 AND urgency_score = 0 THEN NULL ELSE future_score END,
                       CASE WHEN future_score = 0 AND urgency_score = 0 THEN NULL ELSE urgency_score END,
                       CASE WHEN future_score = 0 AND urgency_score = 0 THEN 100 ELSE final_priority END,
                       start_time, end_time, created_at, deleted_at
                FROM recycle_bin_items
            """)
            
            cursor.execute("DROP TABLE recycle_bin_items")
            cursor.execute("ALTER TABLE recycle_bin_items_new RENAME TO recycle_bin_items")
        
        cursor.execute("DROP TABLE todo_items")
        cursor.execute("ALTER TABLE todo_items_new RENAME TO todo_items")
        
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_todo_items_deleted ON todo_items(deleted)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_todo_items_completed ON todo_items(completed)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_todo_items_final_priority ON todo_items(final_priority)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_recycle_bin_original_id ON recycle_bin_items(original_id)")
        
        conn.commit()
        logger.info("分值字段约束迁移完成，future_score/urgency_score 现在允许为空")
        
    except Exception as e:
        conn.rollback()
        logger.error(f"数据库迁移失败: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
